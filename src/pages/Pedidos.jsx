import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { getSupabaseClientWithAuth } from '../supabaseClient';
import { Link } from 'react-router-dom';

export function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    async function fetchPedidos() {
      try {
        const token = await getToken({ template: "supabase" });
        if (!token) return;

        const supabaseAuth = getSupabaseClientWithAuth(token);

        // Busca os pedidos do usuário ordenados do mais recente para o mais antigo
        const { data, error } = await supabaseAuth
          .from('orders')
          .select(`
            id,
            created_at,
            status,
            total_amount,
            shipping_address,
            order_items (
              id,
              quantity,
              price_at_purchase,
              produtos (
                name,
                image_url
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

          console.log('Pedidos recebidos do Supabase:', data);

        if (error) throw error;
        setPedidos(data || []);
      } catch (err) {
        console.error('Erro ao buscar pedidos:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchPedidos();
    }
  }, [user, getToken]);

  if (loading) {
    return (
      <div className="text-center py-20 text-zinc-400">
        <p>Carregando seus pedidos...</p>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 px-4">
        <h2 className="text-2xl text-white font-bold mb-3">Você ainda não tem pedidos</h2>
        <p className="text-zinc-400 mb-8">Explore nosso catálogo e faça sua primeira compra.</p>
        <Link to="/" className="bg-red-900 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium">
          Ver Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-zinc-300 p-4">
      <h1 className="text-3xl text-white font-bold mb-8">Meus Pedidos</h1>

      <div className="space-y-6">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-zinc-900 gap-2">
              <div>
                <p className="text-xs text-zinc-500">ID DO PEDIDO</p>
                <p className="text-sm font-mono text-zinc-300">{pedido.id}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {new Date(pedido.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  pedido.status === 'pago' 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' 
                    : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                }`}>
                  {pedido.status}
                </span>
                <span className="text-white font-bold text-lg">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.total_amount)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Itens do Pedido</p>
              {pedido.order_items?.map((item, index) => (
                <div key={index} className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-xl border border-zinc-900">
                  {item.produtos?.image_url && (
                    <img 
                      src={item.produtos.image_url} 
                      alt={item.produtos.name} 
                      className="w-12 h-12 object-contain bg-white rounded-lg p-1 shrink-0 mix-blend-multiply"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">{item.produtos?.name || 'Produto'}</p>
                    <p className="text-xs text-zinc-400">Quantidade: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price_at_purchase * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}