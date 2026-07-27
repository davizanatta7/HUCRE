import { createBrowserRouter } from 'react-router-dom'
import { App } from './App'
import { Home } from './pages/Home'
import { ProductDetails } from './pages/ProductDetails'
import { Checkout } from './pages/Checkout'
import { Success } from './pages/Success'
import { SobreNos } from './pages/sobre-nos'
import { AdminRoute } from './components/AdminRoute';
import { Admin } from './pages/Admin';
import { Pedidos } from "./pages/Pedidos";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // O App renderiza o Header e o Outlet
    errorElement: <div style={{color: 'black', padding: '50px'}}><h1>Erro no App</h1></div>,
    children: [
      {
        path: "/",
        element: <Home />

      },
      { 
        path: "/admin", 
        element: (
          <AdminRoute>
            <Admin />
          </AdminRoute>
        ) 
      },
      {
      path: "pedidos",
      element: <Pedidos />
      },
      {
        path: "/product/:id",
        element: <ProductDetails />
      },
      {
        path: "/checkout",
        element: <Checkout />
      },
      {
        path: "/success",
        element: <Success />
      },
      {
        path: '/sobre-nos',     
        element: <SobreNos />
      }
    ]
  }
])