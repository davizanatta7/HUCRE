import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom' // Importe isso
import { router } from './routes' // Importe o seu roteador
import { ClerkProvider } from '@clerk/clerk-react'
import { ptBR } from "@clerk/localizations";
import './index.css' // <--- ADICIONE ESTA LINHA AQUI!

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Falta a chave VITE_CLERK_PUBLISHABLE_KEY no arquivo .env")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} localization={ptBR} afterSignOutUrl="/">
      <RouterProvider router={router} />
    </ClerkProvider>
  </React.StrictMode>
)