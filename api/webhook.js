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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Valida se o evento realmente veio da Stripe
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`Erro na assinatura do Webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Quando o pagamento for concluído com sucesso
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Se você salvou o ID do pedido do Supabase nos metadados da sessão da Stripe:
    const pedidoId = session.metadata?.pedidoId;

    if (pedidoId) {
      // 1. Atualiza o status do pedido para 'pago'
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ status: 'pago' })
        .eq('id', pedidoId);

      if (updateError) {
        console.error('Erro ao atualizar status do pedido:', updateError);
      }

      // 2. Busca os itens desse pedido para dar baixa no estoque
      const { data: itensPedido } = await supabase
        .from('itens_pedido')
        .select('product_id, quantidade')
        .eq('pedido_id', pedidoId);

      if (itensPedido) {
        for (const item of itensPedido) {
          // Busca o estoque atual usando a tabela 'produtos' e a coluna 'stock_quantity'
          const { data: produto } = await supabase
            .from('produtos')
            .select('stock_quantity')
            .eq('id', item.product_id)
            .single();

          if (produto) {
            const novoEstoque = Math.max(0, produto.stock_quantity - item.quantidade);

            // Atualiza o estoque reduzindo a quantidade comprada
            await supabase
              .from('produtos')
              .update({ stock_quantity: novoEstoque })
              .eq('id', item.product_id);
          }
        }
      }
    }
  }

  res.status(200).json({ received: true });
}