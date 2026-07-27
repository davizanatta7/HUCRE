import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { cart, pedidoId } = req.body; // Pega o carrinho e o ID do pedido enviados pelo frontend

    // Mapeia os produtos para o formato da Stripe
    const line_items = cart.map((item) => ({
      price_data: {
        currency: 'brl',
        product_data: {
          name: item.title,
          images: [item.image],
        },
        unit_amount: Math.round(item.price * 100), // Valor em centavos
      },
      quantity: item.quantity,
    }));

    // Cria a sessão de Checkout na Stripe
   const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items,
  mode: 'payment',
  shipping_address_collection: {
    allowed_countries: ['BR'], // Defina os países permitidos (ex: Brasil)
  },
  success_url: `${req.headers.origin}/pedidos`,
  cancel_url: `${req.headers.origin}/checkout`,
  metadata: {
    pedidoId: pedidoId,
  },
});

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Erro na API checkout:', err);
    return res.status(500).json({ error: err.message });
  }
}