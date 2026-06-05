import { useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";

export function Success() {
  const { clearCart } = useOutletContext();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="bg-emerald-100 rounded-full p-6 mb-8 shadow-sm">
        <svg
          className="w-20 h-20 text-emerald-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlnx="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-4xl font-['Saint'] text-gray-100 mb-4 text-center">
        Pedido Confirmado
      </h1>

      <p className="text-lg text-gray-500 mb-8 text-center max-w-md">
        Sua compra foi processada com sucesso!
      </p>

      <Link
        to="/"
        className="bg-red-900 text-white px-8 py-4 rounded-xl font-saint
        text-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
      >Continuar Comprando</Link>
    </div>
  );
}
