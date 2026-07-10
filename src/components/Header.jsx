import { Link } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
// 1. Mantemos a importação dos botões do Clerk
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

export function Header({ totalItems }) {
  const [activeTab, setActiveTab] = useState('catalogo');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
   
  return (
      <>
      <header className="bg-black shadow-sm sticky top-0 z-50 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* LADO ESQUERDO: Botão do Menu Hambúrguer */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="text-gray-100 hover:text-red-700 transition-colors cursor-pointer p-2"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* CENTRO: Logo com efeito 3D */}
          <Link 
            to="/" 
            onClick={() => setActiveTab('catalogo')} 
            className="flex items-center justify-center cursor-pointer group"
            style={{ perspective: '1000px' }} 
          >
            <div className="relative w-28 h-20 transition-transform duration-500 transform-style-3d animate-rotate-y-slow group">
              <div className="absolute inset-0 backface-hidden flex items-center justify-center">
                <img 
                  src="/Logo.png" 
                  alt="HUCRE FRENTE" 
                  className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(189,0,0,0.4)]" 
                />
              </div>
              <div className="absolute inset-0 rotate-y-180 backface-hidden flex items-center justify-center">
                <img 
                  src="/Logo.png" 
                  alt="HUCRE VERSO" 
                  className="w-full h-full object-contain scale-x-[-1] filter drop-shadow-[0_0_15px_rgba(189,0,0,0.4)]" 
                />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[3px] bg-red-650/40 rounded-full blur-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>
          
          {/* LADO DIREITO: Clerk Auth + Carrinho */}
          <div className="flex items-center gap-4">
            
            {/* 2. Área do Clerk */}
            <SignedOut>
              {/* Botão de Entrar (Para usuários não logados) */}
              <SignInButton mode="modal">
                <button className="text-sm font-saint text-gray-100 hover:text-red-700 transition-colors uppercase tracking-widest cursor-pointer hidden sm:block">
                  Login
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              {/* Avatar do Usuário (Para usuários logados) */}
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 border border-zinc-700 hover:border-red-700 transition-colors"
                  }
                }}
              />
            </SignedIn>

            {/* Divisor Visual (Opcional, separa o avatar do carrinho) */}
            <div className="w-px h-5 bg-zinc-800 hidden sm:block"></div>

            {/* 3. Ícone do Carrinho (Mantido idêntico ao seu) */}
            <Link 
              to="/checkout" 
              onClick={() => setActiveTab('checkout')}
              className={`
                relative p-2 transition-colors flex items-center justify-center
                ${activeTab === 'checkout' ? 'text-red-700' : 'text-gray-100 hover:text-red-700'}
              `}
              aria-label="Carrinho de compras"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-700 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

        </div>
      </header>

      {/* MENU LATERAL RETRÁTIL (SIDEBAR) - Mantido idêntico */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className="w-72 max-w-[80vw] h-full bg-black border-r border-zinc-900 p-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
                <span className="font-saint text-2xl text-red-600 tracking-wider">HUCRE</span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                <Link 
                  to="/" 
                  onClick={() => { setActiveTab('catalogo'); setIsMenuOpen(false); }}
                  className={`
                    text-base tracking-widest uppercase py-3 px-4 flex items-center relative font-saint transition-all
                    ${activeTab === 'catalogo' 
                      ? 'text-white font-bold bg-zinc-900 border-l-4 border-red-700' 
                      : 'text-gray-400 hover:text-red-700 hover:bg-zinc-900/50'}
                  `}
                >
                  Catalogo
                </Link>

                <Link 
                  to="/lookbook" 
                  onClick={() => { setActiveTab('lookbook'); setIsMenuOpen(false); }}
                  className={`
                    text-base tracking-widest uppercase py-3 px-4 flex items-center relative font-saint transition-all
                    ${activeTab === 'lookbook' 
                      ? 'text-white font-bold bg-zinc-900 border-l-4 border-red-700' 
                      : 'text-gray-400 hover:text-red-700 hover:bg-zinc-900/50'}
                  `}
                >
                  Lookbook
                </Link>

                <Link 
                  to="/sobre-nos" 
                  onClick={() => { setActiveTab('sobre-nos'); setIsMenuOpen(false); }}
                  className={`
                    text-base tracking-widest uppercase py-3 px-4 flex items-center relative font-saint transition-all
                    ${activeTab === 'sobre-nos' 
                      ? 'text-white font-bold bg-zinc-900 border-l-4 border-red-700' 
                      : 'text-gray-400 hover:text-red-700 hover:bg-zinc-900/50'}
                  `}
                >
                  Sobre Nós
                </Link>
                
                {/* 4. Opção extra: Adicionar botão de login no menu mobile também */}
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="text-left text-base tracking-widest uppercase py-3 px-4 flex items-center relative font-saint text-gray-400 hover:text-red-700 hover:bg-zinc-900/50 transition-all mt-4 border-t border-zinc-900 w-full cursor-pointer">
                      Login / Registar
                    </button>
                  </SignInButton>
                </SignedOut>

              </nav>
            </div>

            <div className="text-[10px] font-mono text-zinc-600 tracking-tighter uppercase">
              © 2026 HUCRE STUDIO.
            </div>
          </div>
        </div>
      )}
      </>
  )
}