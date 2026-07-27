import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { cart } = req.body;

    const lineItems = cart.map((item) => ({
      price_data: {
        currency: 'brl',
        product_data: {
          name: item.title,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || item.quantidade || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/checkout`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Erro interno na Stripe API:", error);
    return res.status(500).json({ error: error.message || 'Erro ao criar sessão de pagamento' });
  }
}