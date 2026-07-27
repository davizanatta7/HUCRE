import { Outlet } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { useState } from "react";
import { useAuth, useClerk, useUser } from "@clerk/clerk-react";

export function App() {
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState('catalogo');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCarrinhoOpen, setIsCarrinhoOpen] = useState(false);

  // Autenticação do Clerk
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  // Verifica se o usuário logado tem a tag 'admin' no publicMetadata
  const isAdmin = user?.publicMetadata?.role === 'admin';

  const addToCart = (product) => {
    if (!isSignedIn) {
      clerk.openSignIn();
      return;
    }

    setCart((prevCart) => {
      const newItem = {
        ...product,
        image: product.image || product.image_url,
        title: product.title || product.name,
      };

      const itemExists = prevCart.find((item) => item.id === newItem.id);
      if (itemExists) {
        return prevCart.map((item) =>
          item.id === newItem.id
            ? {
                ...item,
                quantity: (item.quantity || item.quantidade || 1) + 1,
                quantidade: (item.quantidade || item.quantity || 1) + 1,
              }
            : item
        );
      }

      return [...prevCart, { ...newItem, quantity: 1, quantidade: 1 }];
    });
  };

  const increaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: (item.quantity || item.quantidade || 1) + 1,
              quantidade: (item.quantidade || item.quantity || 1) + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const currentQty = item.quantity || item.quantidade || 1;
            const newQty = currentQty > 1 ? currentQty - 1 : 1;
            return {
              ...item,
              quantity: newQty,
              quantidade: newQty,
            };
          }
          return item;
        })
        .filter((item) => (item.quantity || item.quantidade || 0) > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        carrinho={cart}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        setIsCarrinhoOpen={setIsCarrinhoOpen}
        isAdmin={isAdmin}
      />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet context={{ 
          cart, 
          addToCart, 
          removeFromCart, 
          clearCart, 
          increaseQuantity, 
          decreaseQuantity,
          isCarrinhoOpen, 
          setIsCarrinhoOpen 
        }} />
      </main>

      <footer className="bg-black border-t border-red-700 mt-auto">
        <Footer />
      </footer>
    </div>
  );
}