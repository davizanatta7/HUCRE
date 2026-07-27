import { useOutletContext, Link, useNavigate } from 'react-router-dom'
import { useAuth, useUser } from "@clerk/clerk-react" 
import { getSupabaseClientWithAuth } from "../supabaseClient" 
import { useState } from "react" 

export function Checkout() {
  const { cart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } = useOutletContext()
  const navigate = useNavigate()
  
  const { getToken } = useAuth()
  const { user } = useUser()
  const [isProcessing, setIsProcessing] = useState(false)

  const totalValue = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(totalValue)

  const handleFinalizeCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      const token = await getToken({ template: "supabase" });

      if (!token) {
        alert("Você precisa fazer login para finalizar o seu pedido.");
        setIsProcessing(false);
        return;
      }

      const supabaseAuth = getSupabaseClientWithAuth(token);

      // 1. Salva o pedido no Supabase com status pendente
      const { data: pedidoCriado, error: pedidoError } = await supabaseAuth
        .from("orders")
        .insert([{
            user_id: user.id,
            total_amount: totalValue, 
            status: "pendente",
        }])
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // 2. Salva os itens do pedido
      const itensParaInserir = cart.map((item) => ({
        order_id: pedidoCriado.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price, 
      }));

      const { error: itensError } = await supabaseAuth
        .from("order_items")
        .insert(itensParaInserir);

      if (itensError) throw itensError;

      // 3. Envia o carrinho E o ID do pedido para a API do Stripe Checkout
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cart, 
          pedidoId: pedidoCriado.id // Enviado para o backend configurar o metadata da Stripe
        }),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`Erro na API (${response.status}): ${responseText || 'Sem detalhes'}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`A API não retornou um JSON válido. Resposta: ${responseText}`);
      }

      if (data.url) {
        clearCart();
        window.location.href = data.url; 
      } else {
        throw new Error("Não foi possível gerar o link de pagamento.");
      }

    } catch (error) {
      console.error("Erro crítico no checkout:", error);
      alert(`Erro: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl text-gray-100 mb-4">Seu carrinho está vazio.</h2>
        <p className="text-gray-500 mb-8">Explore nosso catálogo e adicione produtos.</p>
        <Link to="/" className="bg-red-900 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
          Ver produtos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto text-zinc-300 p-4">
      <h1 className="text-3xl text-gray-100 mb-8 font-bold">Finalizar Compra</h1>

      <div className="bg-zinc-950 rounded-2xl shadow-sm border border-zinc-900 p-6 mb-8">
        {cart.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-b border-zinc-900 last:border-0">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center p-2 border border-zinc-900 shrink-0">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
              
              <div>
                <h3 className="font-medium text-white line-clamp-1">{item.title}</h3>
                <p className="text-zinc-500 text-sm mt-1">
                  Unitário: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                </p>
              </div>
            </div>
            
            {/* Controles de Quantidade (+ e -) */}
            <div className="flex items-center gap-3 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
              <button 
                onClick={() => decreaseQuantity(item.id)}
                className="text-zinc-400 hover:text-white font-bold px-2 py-0.5 transition-colors cursor-pointer"
                type="button"
                title="Diminuir quantidade"
              >
                -
              </button>
              <span className="text-white font-semibold text-sm w-6 text-center">{item.quantity}</span>
              <button 
                onClick={() => increaseQuantity(item.id)}
                className="text-zinc-400 hover:text-white font-bold px-2 py-0.5 transition-colors cursor-pointer"
                type="button"
                title="Aumentar quantidade"
              >
                +
              </button>
            </div>

            <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
              <p className="font-bold text-white text-lg">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * item.quantity)}
              </p>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 text-sm font-medium hover:text-red-700 mt-1 cursor-pointer transition-colors"
                type="button"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-950 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between border border-zinc-900">
        <div>
          <p className="text-zinc-400 mb-1">Total da compra</p>
          <p className="text-4xl font-black">{formattedTotal}</p>
        </div>
        
        <button 
          onClick={handleFinalizeCheckout}
          disabled={isProcessing}
          type="button"
          className={`mt-6 md:mt-0 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors w-full md:w-auto cursor-pointer ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-500'}`}
        >
          {isProcessing ? 'Processando...' : 'Pagar com Stripe'}
        </button>
      </div>
    </div>
  )
}