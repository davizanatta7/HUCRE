import { Outlet } from "react-router-dom";
import { Header } from "./components/Header";
import { useState } from "react";
// 1. Adicionamos as ferramentas do Clerk aqui no topo
import { useAuth, useClerk } from "@clerk/clerk-react";

export function App() {
  const [cart, setCart] = useState([]);
  
  // 2. Chamamos o Clerk para dentro do App
  const { isSignedIn } = useAuth();
  const clerk = useClerk();

  const addToCart = (product) => {
    if (!isSignedIn) {
      clerk.openSignIn();
      return; 
    }

    setCart((prevCart) => {
      const newItem = {
        ...product,
        image: product.image || product.image_url, 
        title: product.title || product.name // Também padronizamos o nome
      };

      const itemExists = prevCart.find((item) => item.id === newItem.id);

      if (itemExists) {
        return prevCart.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...prevCart, { ...newItem, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header totalItems={totalItems} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet context={{ cart, addToCart, removeFromCart, clearCart }} />
      </main>

      <footer className="bg-black border-t border-red-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-white text-sm">
          © 2026 HUCRE STUDIO. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}