import { Link } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Header({ totalItems }) {

  const [activeTab, setActiveTab] = useState('catalogo');

  {/*1. Estado para controlar se o menu lateral está aberto ou fechado*/}
  const [isMenuOpen, setIsMenuOpen] = useState(false);
   
  {/*(SIDEBAR)*/}
  return (
      <>
      <header className="bg-black shadow-sm sticky top-0 z-50 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* BOTÃO DO MENU LATERAL (Hambúrguer) */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="text-gray-100 hover:text-red-700 transition-colors cursor-pointer p-2"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>

        {/* ==========================================================================
   LOGO GIRANDO EM 3D: Substitua o bloco antigo por este
   ========================================================================== */}
<Link 
  to="/" 
  onClick={() => setActiveTab('catalogo')} 
  className="flex items-center justify-center cursor-pointer group"
  /* 1. Ativa a perspectiva 3D no container pai */
  style={{ perspective: '1000px' }} 
>
  {/* 2. Container interno que realmente sofre a animação (giro) */}
  <div className="relative w-28 h-20 transition-transform duration-500 transform-style-3d animate-rotate-y-slow group">
    
    {/* 3. Lado da FRENTE do Logotipo */}
    <div className="absolute inset-0 backface-hidden flex items-center justify-center">
      <img 
        src="/Logo.png" 
        alt="HUCRE FRENTE" 
        className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(189,0,0,0.4)]" 
      />
    </div>

    {/* 4. Lado do VERSO do Logotipo */}
    {/* Ele começa espelhado (rotate-y-180) para dar o efeito de virar um objeto físico */}
    <div className="absolute inset-0 rotate-y-180 backface-hidden flex items-center justify-center">
      <img 
        src="/Logo.png" 
        alt="HUCRE VERSO" 
        className="w-full h-full object-contain scale-x-[-1] filter drop-shadow-[0_0_15px_rgba(189,0,0,0.4)]" 
      />
    </div>

    {/* Efeito de Brilho Vermelho na Lateral (Sutil) */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[3px] bg-red-650/40 rounded-full blur-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  </div>
</Link>
          
          {/* ÍCONE DO CARRINHO: No canto direito */}
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
      </header>

      
         {/*MENU LATERAL RETRÁTIL (SIDEBAR)*/}
       {/*Fundo escurecido atrás da barra (Overlay) - Só aparece se isMenuOpen for true */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setIsMenuOpen(false)} // Fecha o menu se clicar fora dele
        >
          {/* Caixa da Barra Lateral (Desliza da esquerda) */}
          <div 
            className="w-72 max-w-[80vw] h-full bg-black border-r border-zinc-900 p-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()} // Impede que clique dentro do menu feche ele
          >
            <div>
              {/* Topo do Menu Lateral: Título e botão de fechar */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
                <span className="font-saint text-2xl text-red-600 tracking-wider">HUCRE</span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* AS ABAS EM FORMATO VERTICAL */}
              <nav className="flex flex-col gap-2">
                
                {/* ABA: Sobre Nós */}
                <Link 
                  to="/" 
                  onClick={() => { setActiveTab('catalogo'); setIsMenuOpen(false); }}
                  className={`
                    text-base tracking-widest uppercase py-3 px-4 flex items-center relative font-saint transition-all
                    /* Efeito visual: se estiver ativa ganha fundo cinza escuro e borda vermelha na esquerda */
                    ${activeTab === 'catalogo' 
                      ? 'text-white font-bold bg-zinc-900 border-l-4 border-red-700' 
                      : 'text-gray-400 hover:text-red-700 hover:bg-zinc-900/50'}
                  `}
                >
                  Catalogo
                </Link>

                {/* ABA: Lookbook */}
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

                {/* ABA: Sobre Nós */}
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

              </nav>
            </div>

            {/* Rodapé do Menu Lateral (Opcional, bom para redes sociais ou copyright) */}
            <div className="text-[10px] font-mono text-zinc-600 tracking-tighter uppercase">
              © 2026 HUCRE STUDIO.
            </div>
            </div>
        </div>
      )}
      </>
  )
}



  // ABAS NO CABEÇALHO!!!
  {/*return (
    <header className="bg-gray-950 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center">
        <Link to="/" className="text-2xl font-saint text-gray-100 tracking-tighter mx-auto">
        <img 
          src="/Logo.png" 
          alt="Logo HUCRE" 
          className="w-24 h-20 object-contain" 
              />
        </Link>
        
        // MENU E CARRINHO: No canto direito 
        <nav className="flex items-center gap-6 h-full">
          
          // ABA: Catálogo 
          <Link 
            to="/" 
            onClick={() => setActiveTab('catalogo')}
            className={`
              text-sm tracking-widest uppercase transition-colors h-full flex items-center relative font-mono
              ${activeTab === 'catalogo' ? 'text-white font-bold' : 'text-gray-400 hover:text-red-700'}
            `}
          >
            Catálogo
            //{/* Linha vermelha indicadora na aba ativa }
            {activeTab === 'catalogo' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-red-700" />
            )}
          </Link>


          <Link 
            to="/sobreNos"
            onClick={() => setActiveTab('sobre nos')}
            className={`
              text-sm tracking-widest uppercase transition-colors h-full flex items-center relative font-mono
              ${activeTab === 'sobre nos' ? 'text-white font-bold' : 'text-gray-400 hover:text-red-700'}
            `}
          >
            Sobre Nós
            {activeTab === 'sobre nos' && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-red-700" />
            )}
          </Link>

          //Se você quiser adicionar mais abas no futuro, basta copiar o bloco acima mudando o ID 

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
  )*/}