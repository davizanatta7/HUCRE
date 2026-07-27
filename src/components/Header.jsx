import { Link } from 'react-router-dom';
import { Menu, ShoppingBag, X, User } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

export function Header(props) {
  // Desestruturação segura com valores padrão para NUNCA dar ReferenceError
  const {
    activeTab = 'catalogo',
    setActiveTab = () => {},
    carrinho = [],
    cart = [],
    totalItems,
    isMenuOpen = false,
    setIsMenuOpen = () => {},
    setIsCarrinhoOpen = () => {},
    isAdmin = false
  } = props;

  // Lógica inteligente para calcular o total sem quebrar o código
  const lista = carrinho.length > 0 ? carrinho : cart;
  const contadorTotal = totalItems !== undefined 
    ? totalItems 
    : lista.reduce((acc, item) => acc + (item.quantity || item.quantidade || 1), 0);

  return (
    <header className="sticky top-0 z-40 w-full bg-black/90 backdrop-blur-md border-b border-zinc-900 font-dubell">
      
      {/* GRID DE 3 COLUNAS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 sm:h-24 grid grid-cols-3 items-center">

        {/* LADO ESQUERDO: Botão do Menu Mobile + Links do Desktop */}
        <div className="flex items-center justify-start gap-4">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden text-gray-400 hover:text-white cursor-pointer p-1"
            type="button"
          >
            <Menu className="w-6 h-6" />
          </button>

          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              onClick={() => setActiveTab('catalogo')}
              className={` text-sm tracking-widest uppercase transition-colors ${activeTab === 'catalogo' ? 'text-white font-dubell border-b-2 border-red-700 pb-1' : 'text-gray-400 hover:text-white'}`}
            >
              Lookbook
            </Link>
            <Link 
              to="/sobre-nos" 
              onClick={() => setActiveTab('sobre-nos')}
              className={` text-sm tracking-widest uppercase transition-colors ${activeTab === 'sobre-nos' ? 'text-white font-dubell border-b-2 border-red-700 pb-1' : 'text-gray-400 hover:text-white'}`}
            >
              Sobre Nós
            </Link>
            {isAdmin && (
              <Link 
                to="/admin"
                onClick={() => setActiveTab('admin')}
                className={` text-sm tracking-widest uppercase transition-colors ${activeTab === 'admin' ? 'text-white font-dubell border-b-2 border-red-700 pb-1' : 'text-gray-400 hover:text-white'}`}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* CENTRO PERFEITO: Logo MP4 em Vídeo */}
        <div className="flex items-center justify-center">
          <Link 
            to="/" 
            onClick={() => setActiveTab('catalogo')} 
            className="flex items-center justify-center cursor-pointer group"
          >
            <div className="relative w-24 h-16 sm:w-28 sm:h-20 flex items-center justify-center">
              <video 
                src="/logo360.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(189,0,0,0.4)]"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[3px] bg-red-650/40 rounded-full blur-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>
        </div>

       {/* 3. LADO DIREITO: Ícone do Usuário e Carrinho */}
        <div className="flex items-center justify-end gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1" type="button">
                <User className="w-6 h-6" />
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 border border-zinc-800"
                }
              }}
            />
          </SignedIn>

          <SignedIn>
            <Link 
              to="/checkout"
              onClick={() => {
                if (setActiveTab) setActiveTab('checkout');
              }}
              className="relative text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
            >
              <ShoppingBag className="w-6 h-6" />
              
              {contadorTotal > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {contadorTotal}
                </span>
              )}
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal" fallbackRedirectUrl="/checkout">
              <button 
                type="button"
                className="relative text-gray-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                <ShoppingBag className="w-6 h-6" />
                
                {contadorTotal > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {contadorTotal}
                  </span>
                )}
              </button>
            </SignInButton>
          </SignedOut>

        </div>

      </div>

      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black backdrop-blur-md transition-all duration-300"
          onClick={() => setIsMenuOpen(false)}
        >
          {/* PAINEL DO MENU COM FUNDO SÓLIDO */}
          <div 
            className="fixed top-0 left-0 w-72 max-w-[85vw] h-screen bg-black border-r border-black p-6 flex flex-col justify-between shadow-[20px_0_50px_rgba(0,0,0,0.9)] z-[101] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Topo do Menu Lateral */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                <span className="text-2xl font-bold text-red-600 tracking-wider">HUCRE</span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
                  type="button"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Links do Menu Lateral */}
              <nav className="flex flex-col gap-2">
                <Link 
                  to="/" 
                  onClick={() => { setActiveTab('catalogo'); setIsMenuOpen(false); }}
                  className={`
                    text-base tracking-widest uppercase py-3 px-4 flex items-center transition-all
                    ${activeTab === 'catalogo' 
                      ? 'text-white font-bold bg-zinc-900 border-l-4 border-red-700' 
                      : 'text-zinc-400 hover:text-red-600 hover:bg-zinc-900/50'}
                  `}
                >
                  Lookbook
                </Link>

                <Link 
                  to="/sobre-nos" 
                  onClick={() => { setActiveTab('sobre-nos'); setIsMenuOpen(false); }}
                  className={`
                    text-base tracking-widest uppercase py-3 px-4 flex items-center transition-all
                    ${activeTab === 'sobre-nos' 
                      ? 'text-white font-bold bg-zinc-900 border-l-4 border-red-700' 
                      : 'text-zinc-400 hover:text-red-600 hover:bg-zinc-900/50'}
                  `}
                >
                  Sobre Nós
                </Link>

                {/* ABA ADMIN EXCLUSIVA */}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => { setActiveTab('admin'); setIsMenuOpen(false); }}
                    className={`
                      text-base tracking-widest uppercase py-3 px-4 flex items-center transition-all text-red-500 font-mono border border-red-900/40 bg-red-950/20 hover:bg-red-900/30 hover:text-red-400 mt-2
                      ${activeTab === 'admin' 
                        ? 'bg-black border-l-4 border-red-600 text-white font-bold' 
                        : ''}
                    `}
                  >
                    Painel de Admin
                  </Link>
                )}

                <SignedOut>
                  <SignInButton mode="modal">
                    <button 
                      type="button"
                      className="text-left text-base tracking-widest uppercase py-3 px-4 flex items-center text-zinc-400 hover:text-red-600 hover:bg-zinc-900/50 transition-all mt-4 border-t border-zinc-800 w-full cursor-pointer"
                    >
                      Login / Registrar
                    </button>
                  </SignInButton>
                </SignedOut>
              </nav>
            </div>

            <div className="text-[10px] font-mono text-zinc-600 tracking-tighter uppercase mt-8">
              © 2026 HUCRE STUDIO.
            </div>
          </div>
        </div>
      )}
    </header>
  );
}