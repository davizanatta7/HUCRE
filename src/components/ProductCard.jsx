import { Link } from 'react-router-dom'

export function ProductCard({ product }) {
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(product.price) 

  return (
    <Link 
      to={`/product/${product.id}`}
      className="bg-white rounded-xl p-4 flex flex-col group hover:shadow-xl transition-shadow duration-300 border border-gray-100 cursor-pointer"
    >
      <div className="aspect-square w-full overflow-hidden bg-white mb-4 flex items-center justify-center">
        <img
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="flex flex-col flex-1">
        <span className="text-xs font-semibold text-black uppercase tracking-wider mb-1">
          {product.category}
        </span>
        <h2 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 flex-1">
          {product.name}
        </h2>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <span className="text-lg font-bold text-gray-900">
            {formattedPrice}
          </span>
          <div className="flex items-center text-sm text-amber-500">
            <span>★</span>
            <span className="ml-2 text-gray-600 font-medium text-base">
                {product.rating_rate ? Number(product.rating_rate).toFixed(1) : '0.0'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}