import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'


export function Header({ totalItems }) {
  return (
    <header className="bg-gray-950 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center">
        <Link to="/" className="text-2xl font-saint text-gray-100 tracking-tighter mx-auto">
        <img 
          src="/Logo.png" 
          alt="Logo HUCRE" 
          className="w-24 h-20 object-contain" 
              />
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-gray-100 hover:text-red-700 transition-colors">
            Catálogo
          </Link>
          
          <Link 
            to="/checkout" 
            className="relative p-2 text-gray-100 hover:text-red-700 transition-colors flex items-center justify-center"
            aria-label="Carrinho de compras"
          >
            <ShoppingCart className="w-6 h-6" />
            
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-700 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  )
}