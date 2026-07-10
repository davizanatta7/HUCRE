import { useState, useEffect } from 'react'
import { useParams, Link, useOutletContext } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from "@clerk/clerk-react"

export function ProductDetails() {
  const { id } = useParams()
  const { addToCart: addToCartGlobal } = useOutletContext();
  const { isSignedIn } = useAuth();
  
  const [showToast, setShowToast] = useState(false)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  const addToCart = (product) => {
    addToCartGlobal(product)
    if (isSignedIn) {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      }
    }

  useEffect(() => {
    const fetchProduct = async () => {
      try {const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id) // Busca especificamente o produto com o ID da URL
          .single()     // Diz pro Supabase que esperamos só 1 produto (não um array)

        if (error) throw error
        setProduct(data)
      } catch (error) {
        console.error("MENSAGEM:", error.message)
        console.error("DETALHES:", error.details)
        console.error("DICA:", error.hint)
      } finally {
        setLoading(false)
      }
    }

  // Só busca se existir um ID na URL
    if (id) {
      fetchProduct()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg font-medium text-gray-500">Carregando detalhes do produto...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-red-500 font-medium">
        Produto não encontrado.
      </div>
    )
  }

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(product.price)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <Link to="/" className="text-gray-800 hover:text-red-700 font-medium text-sm transition-colors">
          &larr; Voltar para a loja
        </Link>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-8 lg:p-12 bg-white flex items-center justify-center">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="max-w-full max-h-96 object-contain mix-blend-multiply"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 lg:p-12 bg-gray-50 flex flex-col justify-center">
          <span className="text-sm font-bold text-red-700 uppercase tracking-widest mb-2">
            {product.category}
          </span>
          
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight mx-32">
            {product.name}
          </h1>
          
          <div className="flex items-center mb-6">
            <div className="flex text-amber-400 text-lg">
              ★★★★<span className="text-gray-300">★</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-base leading-relaxed mb-8">
            {product.description}
          </p>
          
          <div className="mt-auto pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Preço final</p>
                <p className="text-4xl font-black text-gray-900">{formattedPrice}</p>
              </div>
              <button 
                onClick={() => addToCart(product)}
                className="bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-black transition-colors shadow-lg shadow-red-200 cursor-pointer"
              >
                Adicionar ao Carrinho
              </button>
              {showToast && (
                <div className="fixed bottom-5 right-5 bg-white text-black px-4 py-3 border-l-4 border-red-600 shadow-lg z-50">
                  Adicionado ao carrinho!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}