import { buffer } from 'micro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// O Supabase precisa da Service Role Key (ou chave com permissão de admin) 
// para atualizar tabelas protegidas pelo webhook em segundo plano
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Chave secreta de admin do Supabase
);

// Desativa o bodyParser padrão da Vercel para validarmos a assinatura da Stripe
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // AQUI ESTÁ O SEGREDO: O evento correto é o checkout.session.completed
  if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  const pedidoId = session.metadata?.pedidoId;

  if (pedidoId) {
    const shipping = session.shipping_details;
    const enderecoFormatado = shipping && shipping.address ? 
      `${shipping.address.line1}, ${shipping.address.city} - ${shipping.address.state}, ${shipping.address.postal_code}` 
      : 'Endereço não informado';

    // Atualiza o pedido no Supabase para 'pago'
    await supabase
      .from('orders')
      .update({ 
        status: 'pago',
        shipping_address: 'Aguardando endereço da Stripe', // Pode ser atualizado com o endereço real se necessário
      })
      .eq('id', pedidoId);

      // 2. Busca os itens e dá baixa no estoque (tabela produtos / stock_quantity)
      const { data: itensPedido } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', pedidoId);

      if (itensPedido) {
        for (const item of itensPedido) {
          const { data: produto } = await supabase
            .from('produtos')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

          if (produto) {
            const novoEstoque = Math.max(0, produto.stock_quantity - item.quantity);
            await supabase
              .from('produtos')
              .update({ stock_quantity: novoEstoque })
              .eq('id', item.product_id);
          }
        }
      }
    }
  }

  return res.status(200).json({ received: true });
}