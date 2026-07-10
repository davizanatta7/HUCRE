import { useOutletContext, Link, useNavigate } from 'react-router-dom'
import { useAuth, useUser } from "@clerk/clerk-react" // Adicionado para autenticação
import { getSupabaseClientWithAuth } from "../supabaseClient" // Cliente seguro do Supabase
import { useState } from "react" // Para gerenciar o estado do botão

export function Checkout() {
  // Adicionamos o clearCart aqui para limpar o carrinho após a compra
  const { cart, removeFromCart, clearCart } = useOutletContext()
  const navigate = useNavigate()
  
  // Hooks do Clerk e estado de processamento
  const { getToken } = useAuth()
  const { user } = useUser()
  const [isProcessing, setIsProcessing] = useState(false)

  // Mantive sua lógica original de cálculo de preço
  const totalValue = cart.reduce((acc, item) => acc + (item.price * 5 * item.quantity), 0)

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(totalValue)

  // Função que faz a comunicação com o banco de dados
  const handleFinalizeCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    try {
      // 1. Pede o crachá de acesso para o Clerk
      const token = await getToken({ template: "supabase" });

      if (!token) {
        alert("Você precisa fazer login para finalizar o seu pedido.");
        setIsProcessing(false);
        return;
      }

      // 2. Cria a conexão segura
      const supabaseAuth = getSupabaseClientWithAuth(token);

      // 3. Salva o pedido principal
      const { data: pedidoCriado, error: pedidoError } = await supabaseAuth
        .from("pedidos")
        .insert([{
            user_id: user.id,
            total: totalValue, 
            status: "pago",
        }])
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // 4. Salva os itens do pedido vinculados ao ID recém-criado
      const itensParaInserir = cart.map((item) => ({
        pedido_id: pedidoCriado.id,
        product_id: item.id,
        quantidade: item.quantity,
        preco_unitario: item.price * 5, // Mantendo sua regra matemática
      }));

      const { error: itensError } = await supabaseAuth
        .from("itens_pedido")
        .insert(itensParaInserir);

      if (itensError) throw itensError;

      // 5. Deu tudo certo! Limpa o carrinho e envia para a tela de sucesso
      clearCart();
      navigate("/success");

    } catch (error) {
      console.error("Erro crítico no checkout:", error);
      alert("Houve um problema ao salvar seu pedido. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-['Saint'] text-gray-100 mb-4">Seu carrinho esta vazio.</h2>
        <p className="font-saint text-gray-500 mb-8">Explore nosso catálogo e adicione produtos.</p>
        <Link to="/" className="bg-red-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors">
          Ver produtos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-['Saint'] text-gray-100 mb-8">Finalizar Compra</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-6 py-6 border-b border-gray-100 last:border-0">
            <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center p-2 border border-gray-100">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 line-clamp-1">{item.title}</h3>
              <p className="text-gray-500 text-sm mt-1">Quantidade: {item.quantity}</p>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-gray-950">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price * 5)}
              </p>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 text-sm font-medium hover:text-red-700 mt-2 cursor-pointer transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-950 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between">
        <div>
          <p className="text-gray-400 mb-1">Total da compra</p>
          <p className="text-4xl font-black">{formattedTotal}</p>
        </div>
        
        {/* Botão atualizado com a função e estado de desabilitado */}
        <button 
          onClick={handleFinalizeCheckout}
          disabled={isProcessing}
          className={`mt-6 md:mt-0 bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors w-full md:w-auto cursor-pointer ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-600'}`}
        >
          {isProcessing ? 'Processando...' : 'Confirmar Pagamento'}
        </button>
      </div>
    </div>
  )
}