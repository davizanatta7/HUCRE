import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, ShieldCheck, CreditCard } from 'lucide-react'

export function Footer() {
  return (
    <footer className="w-full bg-zinc-950 text-zinc-400 border-t border-zinc-900 pt-12 pb-8 font-mono">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        
        {/* COLUNA 1: MARCA & SOBRE */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-dubell text-white uppercase tracking-widest">
            HUCRE
          </h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Streetwear autêntico e atemporal. Desenvolvido para transformar o cotidiano em expressão através do design e da cultura urbana.
          </p>
          <div className="flex items-center gap-4 text-white mt-2">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer"
              className="p-2 bg-zinc-900 rounded-full hover:bg-red-700 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              {/* SVG nativo do Instagram - Não depende do lucide-react */}
              <svg 
                className="w-4 h-4 fill-current" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a 
              href="mailto:contato@hucre.com" 
              className="p-2 bg-zinc-900 rounded-full hover:bg-red-700 hover:text-white transition-colors"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* COLUNA 2: NAVEGAÇÃO RÁPIDA */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-2">
            Navegação
          </h3>
          <ul className="flex flex-col gap-2 text-xs">
            <li>
              <Link to="/lookbook" className="hover:text-red-600 transition-colors">Lookbook</Link>
            </li>
            <li>
              <Link to="/contato" className="hover:text-red-600 transition-colors">Fale Conosco</Link>
            </li>
          </ul>
        </div>

        {/* COLUNA 3: SUPORTE & POLÍTICAS */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-2">
            Ajuda & Suporte
          </h3>
          <ul className="flex flex-col gap-2 text-xs">
            <li>
              <a href="#trocas" className="hover:text-red-600 transition-colors">Trocas e Devoluções</a>
            </li>
            <li>
              <a href="#envio" className="hover:text-red-600 transition-colors">Prazos e Entregas</a>
            </li>
            <li>
              <a href="#guia-tamanhos" className="hover:text-red-600 transition-colors">Guia de Tamanhos</a>
            </li>
            <li>
              <a href="#privacidade" className="hover:text-red-600 transition-colors">Política de Privacidade</a>
            </li>
          </ul>
        </div>

        {/* COLUNA 4: DADOS DA EMPRESA & ATENDIMENTO */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-900 pb-2">
            Atendimento
          </h3>
          <ul className="flex flex-col gap-3 text-xs">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <span>Rua Exemplo Urbana, 123 - Bairro Alto, São Paulo - SP</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-red-700 shrink-0" />
              <span>(11) 99999-9999</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-700 shrink-0" />
              <span>suporte@hucre.com.br</span>
            </li>
          </ul>
        </div>

      </div>

      {/* LINHA SEPARADORA */}
      <div className="max-w-7xl mx-auto px-6 border-t border-zinc-900 pt-8">
        
        {/* PAGAMENTOS & SEGURANÇA */}
        <div className="flex flex-wrap justify-between items-center gap-6 mb-8 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-zinc-400" />
            <span>Cartões de Crédito, PIX e Boleto Bancário</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Site Seguro com Criptografia SSL</span>
          </div>
        </div>

        {/* DADOS LEGAIS / CNPJ (DIREITOS AUTORAIS) */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-zinc-600 text-center md:text-left border-t border-zinc-900/60 pt-6">
          <div>
            <p className="font-semibold text-zinc-500">HUCRE STREETWEAR LTDA</p>
            <p>CNPJ: 00.000.000/0001-00 • Todos os direitos reservados. © 2026</p>
          </div>
          <p className="text-zinc-600">
            Desenvolvido com foco em alta performance.
          </p>
        </div>

      </div>
    </footer>
  )
}