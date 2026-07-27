import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// O Supabase precisa da Service Role Key (chave de admin) 
// para atualizar tabelas protegidas pelo webhook em segundo plano
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Desativa o bodyParser padrão da Vercel para validarmos a assinatura da Stripe
export const config = {
  api: {
    bodyParser: false,
  },
};

// Função única para ler o stream do corpo da requisição corretamente
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
    console.error(`Erro na assinatura do Webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Trata o evento de pagamento concluído com sucesso
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const pedidoId = session.metadata?.pedidoId;

    if (pedidoId) {
      // Captura o endereço real preenchido pelo cliente na tela da Stripe
      const shipping = session.shipping_details;
      let enderecoFormatado = 'Endereço não informado';

      if (shipping && shipping.address) {
        const addr = shipping.address;
        enderecoFormatado = `${addr.line1 || ''}, ${addr.line2 ? addr.line2 + ', ' : ''}${addr.city || ''} - ${addr.state || ''}, ${addr.postal_code || ''}, ${addr.country || ''}`;
      }

      // 1. Atualiza o pedido no Supabase para 'pago' salvando o endereço real
      const { error: updateOrderError } = await supabase
        .from('orders')
        .update({ 
          status: 'pago',
          shipping_address: enderecoFormatado,
        })
        .eq('id', pedidoId);

      if (updateOrderError) {
        console.error('Erro ao atualizar o pedido no Supabase:', updateOrderError);
      }

      // 2. Busca os itens e dá baixa no estoque (tabela produtos / stock_quantity)
      const { data: itensPedido, error: fetchItemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', pedidoId);

      if (fetchItemsError) {
        console.error('Erro ao buscar itens do pedido:', fetchItemsError);
      }

      if (itensPedido) {
        for (const item of itensPedido) {
          const { data: produto, error: fetchProdError } = await supabase
            .from('produtos')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

          if (fetchProdError) {
            console.error('Erro ao buscar produto para estoque:', fetchProdError);
            continue;
          }

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