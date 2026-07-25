import { useState, useEffect } from 'react'
import { ProductCard } from '../components/ProductCard'
import { supabase } from '../supabaseClient'

export function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)

    if (error) throw error
    
    console.log("DADOS VINDOS DO SUPABASE:", data)

    setProducts(data)
 } catch (error) {
  console.error("MENSAGEM:", error.message)
  console.error("DETALHES:", error.details)
  console.error("DICA:", error.hint)
}finally {
    setLoading(false)
  }
}

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-100 animate-pulse">Carregando catálogo de produtos...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-dubell text-red-700">Novidades</h1>
        <p className=" text-gray-100 mt-2">Streetwear Original. Contra Artificial.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}