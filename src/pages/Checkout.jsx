import { useOutletContext, Link, useNavigate } from 'react-router-dom'

export function Checkout() {
  const { cart, removeFromCart } = useOutletContext()
  const navigate = useNavigate()

  const totalValue = cart.reduce((acc, item) => acc + (item.price * 5 * item.quantity), 0)

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(totalValue)

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Seu carrinho está vazio.</h2>
        <p className="text-gray-500 mb-8">Explore nosso catálogo e adicione produtos.</p>
        <Link to="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
          Ver produtos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-['Saint'] text-gray-100 mb-8">Finalizar     Compra</h1>

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
        <button 
          onClick={() => navigate('/success')}
          className="mt-6 md:mt-0 bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition-colors w-full md:w-auto cursor-pointer"
        >
          Confirmar Pagamento
        </button>
      </div>
    </div>
  )
}