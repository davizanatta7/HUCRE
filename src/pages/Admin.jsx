import { useState, useEffect } from 'react';
import { useSession } from '@clerk/clerk-react';
import { getSupabaseClient } from '../supabaseClient';
import { 
  PackagePlus, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Pencil, 
  Trash2, 
  List, 
  X,
  ClipboardList
} from 'lucide-react';

export function Admin() {
  const { session } = useSession();

  // Controle de Abas: 'cadastrar' | 'listar' | 'pedidos'
  const [abaAtiva, setAbaAtiva] = useState('cadastrar');

  // Lista de produtos para Edição/Exclusão
  const [produtos, setProdutos] = useState([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);

  // Lista de pedidos para o Painel Admin de Envios
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Estados do Formulário de Cadastro / Edição de Produtos
  const [produtoEditandoId, setProdutoEditandoId] = useState(null);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [estoque, setEstoque] = useState('');
  const [imagemFile, setImagemFile] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);

  // Feedback de Interface
  const [loading, setLoading] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [erro, setErro] = useState('');

  // -------------------------------------------------------------
  // CARREGAR PRODUTOS DO SUPABASE
  // -------------------------------------------------------------
  const carregarProdutos = async () => {
    setLoadingProdutos(true);
    try {
      const token = await session?.getToken({ template: 'supabase' });
      const supabase = getSupabaseClient(token);

      const { data, error: fetchError } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProdutos(data || []);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoadingProdutos(false);
    }
  };

  // -------------------------------------------------------------
  // CARREGAR PEDIDOS DO SUPABASE (PAINEL ADMIN)
  // -------------------------------------------------------------
  const carregarPedidos = async () => {
    setLoadingPedidos(true);
    try {
      const token = await session?.getToken({ template: 'supabase' });
      const supabase = getSupabaseClient(token);

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          total_amount,
          shipping_address,
          user_id,
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
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPedidos(data || []);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoadingPedidos(false);
    }
  };

  useEffect(() => {
    if (abaAtiva === 'listar') {
      carregarProdutos();
    } else if (abaAtiva === 'pedidos') {
      carregarPedidos();
    }
  }, [abaAtiva]);

  // Limpar formulário
  const resetFormulario = () => {
    setProdutoEditandoId(null);
    setNome('');
    setPreco('');
    setDescricao('');
    setEstoque('');
    setImagemFile(null);
    setImagemPreview(null);
  };

  // Tratar seleção de arquivo
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagemFile(file);
      setImagemPreview(URL.createObjectURL(file));
    }
  };

  // -------------------------------------------------------------
  // SALVAR (CADASTRAR OU EDITAR PRODUTO)
  // -------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setMensagemSucesso('');

    try {
      const token = await session.getToken({ template: 'supabase' });
      const supabase = getSupabaseClient(token);

      let imagemUrl = imagemPreview;

      if (imagemFile) {
        const fileExt = imagemFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `catalogo/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('produtos')
          .upload(filePath, imagemFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('produtos')
          .getPublicUrl(filePath);

        imagemUrl = publicUrlData.publicUrl;
      }

      if (!produtoEditandoId && !imagemUrl) {
        throw new Error('Selecione uma imagem para o produto.');
      }

      const payload = {
        name: nome,
        price: parseFloat(preco),
        description: descricao,
        stock_quantity: parseInt(estoque, 10),
        image_url: imagemUrl,
        is_active: true,
      };

      if (produtoEditandoId) {
        const { error: updateError } = await supabase
          .from('produtos')
          .update(payload)
          .eq('id', produtoEditandoId);

        if (updateError) throw updateError;
        setMensagemSucesso('Produto atualizado com sucesso!');
      } else {
        const { error: insertError } = await supabase
          .from('produtos')
          .insert([payload]);

        if (insertError) throw insertError;
        setMensagemSucesso('Produto cadastrado com sucesso!');
      }

      resetFormulario();
      if (abaAtiva === 'listar') carregarProdutos();
    } catch (err) {
      console.error('Erro ao salvar produto:', err);
      setErro(err.message || 'Ocorreu um erro ao salvar o produto.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // INICIAR EDIÇÃO DE UM PRODUTO
  // -------------------------------------------------------------
  const handleIniciarEdicao = (produto) => {
    setProdutoEditandoId(produto.id);
    setNome(produto.name || '');
    setPreco(produto.price || '');
    setDescricao(produto.description || '');
    setEstoque(produto.stock_quantity || '');
    setImagemPreview(produto.image_url || null);
    setImagemFile(null);
    setAbaAtiva('cadastrar');
  };

  // -------------------------------------------------------------
  // EXCLUIR PRODUTO
  // -------------------------------------------------------------
  const handleExcluirProduto = async (id, name) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) {
      return;
    }

    try {
      const token = await session.getToken({ template: 'supabase' });
      const supabase = getSupabaseClient(token);

      const { error: deleteError } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setMensagemSucesso(`Produto "${name}" excluído com sucesso!`);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      setErro(err.message || 'Erro ao tentar excluir produto.');
    }
  };

  // -------------------------------------------------------------
  // ATUALIZAR STATUS DO PEDIDO (ADMIN)
  // -------------------------------------------------------------
  const handleUpdateStatus = async (pedidoId, novoStatus) => {
    try {
      const token = await session.getToken({ template: 'supabase' });
      const supabase = getSupabaseClient(token);

      const { error } = await supabase
        .from('orders')
        .update({ status: novoStatus })
        .eq('id', pedidoId);

      if (error) throw error;

      setPedidos(pedidos.map(p => p.id === pedidoId ? { ...p, status: novoStatus } : p));
      setMensagemSucesso(`Status do pedido atualizado para: ${novoStatus}`);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setErro('Não foi possível atualizar o status do pedido.');
    }
  };

  // Filtragem dos pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroStatus === 'todos') return true;
    return pedido.status === filtroStatus;
  });

  // Métricas rápidas
  const totalVendas = pedidos.reduce((acc, p) => p.status === 'pago' || p.status === 'enviado' ? acc + Number(p.total_amount) : acc, 0);
  const qtdPendentes = pedidos.filter(p => p.status === 'pendente').length;
  const qtdPagos = pedidos.filter(p => p.status === 'pago').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono p-6 md:p-12">
      <div className="max-w-6xl mx-auto bg-zinc-900/40 border border-zinc-800 p-6 md:p-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-3">
            <PackagePlus className="w-6 h-6 text-red-600" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Painel Admin // HUCRE
            </h1>
          </div>

          {/* MENUS DE NAVEGAÇÃO (TABS) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                resetFormulario();
                setAbaAtiva('cadastrar');
              }}
              className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
                abaAtiva === 'cadastrar' && !produtoEditandoId
                  ? 'bg-red-700 text-white font-bold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <PackagePlus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>

            <button
              onClick={() => setAbaAtiva('listar')}
              className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
                abaAtiva === 'listar'
                  ? 'bg-red-700 text-white font-bold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Gerenciar Produtos</span>
            </button>

            <button
              onClick={() => setAbaAtiva('pedidos')}
              className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
                abaAtiva === 'pedidos'
                  ? 'bg-red-700 text-white font-bold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Controle de Envios ({pedidos.length})</span>
            </button>
          </div>
        </div>

        {/* Mensagens de Feedback */}
        {mensagemSucesso && (
          <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-400 flex items-center gap-3 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {erro && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-800 text-red-400 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 1: FORMULÁRIO (CADASTRAR OU EDITAR) */}
        {/* ========================================================= */}
        {abaAtiva === 'cadastrar' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {produtoEditandoId && (
              <div className="p-3 bg-red-950/30 border border-red-800 text-red-400 flex items-center justify-between text-xs">
                <span>Modo de Edição Ativo (ID: {produtoEditandoId})</span>
                <button
                  type="button"
                  onClick={resetFormulario}
                  className="flex items-center gap-1 text-zinc-300 hover:text-white underline cursor-pointer"
                >
                  <X className="w-4 h-4" /> Cancelar Edição
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                placeholder="EX: CAMISETA HUCRE BOXY OVERSIZED"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="189.90"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                  Quantidade em Estoque *
                </label>
                <input
                  type="number"
                  required
                  placeholder="20"
                  value={estoque}
                  onChange={(e) => setEstoque(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                Descrição do Produto
              </label>
              <textarea
                rows={4}
                placeholder="Algodão 100% heavyweight 260g, modelagem street..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                Imagem do Produto {produtoEditandoId ? '(Opcional se mantiver a atual)' : '*'}
              </label>
              <div className="border border-dashed border-zinc-800 p-6 bg-zinc-950/50 text-center flex flex-col items-center justify-center cursor-pointer hover:border-zinc-700 transition-colors relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {imagemPreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={imagemPreview}
                      alt="Pré-visualização"
                      className="w-32 h-32 object-cover border border-zinc-800"
                    />
                    <span className="text-xs text-zinc-400">Clique para alterar a imagem</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-500">
                    <Upload className="w-8 h-8 text-zinc-600" />
                    <span className="text-xs uppercase tracking-wider">
                      Arraste ou clique para selecionar a imagem
                    </span>
                    <span className="text-[10px] text-zinc-600">PNG, JPG, WEBP (Max: 5MB)</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-bold p-4 uppercase tracking-widest text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>{produtoEditandoId ? 'Atualizar Produto' : 'Salvar Produto no Catálogo'}</span>
              )}
            </button>

          </form>
        )}

        {/* ========================================================= */}
        {/* ABA 2: LISTAR / EDITAR / EXCLUIR PRODUTOS */}
        {/* ========================================================= */}
        {abaAtiva === 'listar' && (
          <div>
            {loadingProdutos ? (
              <div className="py-12 flex items-center justify-center gap-2 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Carregando inventário...</span>
              </div>
            ) : produtos.length === 0 ? (
              <p className="text-center text-zinc-500 py-12">Nenhum produto cadastrado.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {produtos.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex flex-col sm:flex-row items-center justify-between bg-zinc-950 border border-zinc-800 p-4 gap-4"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-16 h-16 object-cover bg-zinc-900 border border-zinc-800 shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase">{prod.name}</h3>
                        <p className="text-xs text-red-500 font-bold mt-1">
                          R$ {Number(prod.price).toFixed(2)}
                        </p>
                        <span className="text-[10px] text-zinc-500 block">
                          Estoque: {prod.stock_quantity} un.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-zinc-900 pt-3 sm:pt-0">
                      <button
                        onClick={() => handleIniciarEdicao(prod)}
                        className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-white flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 text-zinc-300" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleExcluirProduto(prod.id, prod.name)}
                        className="px-3 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/80 text-xs text-red-400 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 3: PAINEL DE CONTROLE DE ENVIOS (PEDIDOS) */}
        {/* ========================================================= */}
        {abaAtiva === 'pedidos' && (
          <div>
            {loadingPedidos ? (
              <div className="py-12 flex items-center justify-center gap-2 text-zinc-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Carregando painel de envios...</span>
              </div>
            ) : (
              <div>
                {/* Cards de Métricas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-zinc-950 border border-zinc-800 p-4">
                    <p className="text-[10px] uppercase text-zinc-500 font-bold">Faturamento (Pago/Enviado)</p>
                    <p className="text-xl font-bold text-emerald-400 mt-1">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalVendas)}
                    </p>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 p-4">
                    <p className="text-[10px] uppercase text-zinc-500 font-bold">Prontos p/ Envio (Pagos)</p>
                    <p className="text-xl font-bold text-blue-400 mt-1">{qtdPagos}</p>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 p-4">
                    <p className="text-[10px] uppercase text-zinc-500 font-bold">Pendentes</p>
                    <p className="text-xl font-bold text-amber-400 mt-1">{qtdPendentes}</p>
                  </div>
                </div>

                {/* Filtros de Status */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {['todos', 'pendente', 'pago', 'enviado', 'concluido'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFiltroStatus(status)}
                      className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                        filtroStatus === status 
                          ? 'bg-red-700 text-white' 
                          : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Lista de Pedidos */}
                {pedidosFiltrados.length === 0 ? (
                  <p className="text-center text-zinc-500 py-12">Nenhum pedido encontrado.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {pedidosFiltrados.map((pedido) => (
                      <div key={pedido.id} className="bg-zinc-950 border border-zinc-800 p-5 flex flex-col lg:flex-row gap-6 justify-between">
                        
                        <div className="space-y-3 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[10px] font-mono text-zinc-500">ID: {pedido.id}</span>
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              pedido.status === 'pago' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              pedido.status === 'enviado' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                              'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}>
                              {pedido.status}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-400">
                            <strong className="text-zinc-200">Data:</strong> {new Date(pedido.created_at).toLocaleString('pt-BR')}
                          </p>

                          <p className="text-xs text-zinc-400">
                            <strong className="text-zinc-200">User ID:</strong> <span className="font-mono text-zinc-500">{pedido.user_id}</span>
                          </p>

                          <div className="bg-zinc-900/60 p-3 border border-zinc-800 text-xs">
                            <p className="text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Endereço de Entrega (Stripe):</p>
                            <p className="text-zinc-200">{pedido.shipping_address || 'Aguardando preenchimento na Stripe'}</p>
                          </div>

                          <div className="space-y-2 pt-1">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase">Produtos:</p>
                            {pedido.order_items?.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-zinc-900/40 p-2 border border-zinc-800/60">
                                {item.produtos?.image_url && (
                                  <img src={item.produtos.image_url} alt="" className="w-8 h-8 object-cover bg-zinc-900 border border-zinc-800 shrink-0" />
                                )}
                                <div className="flex-1 text-xs">
                                  <span className="font-medium text-white uppercase">{item.produtos?.name || 'Produto'}</span>
                                  <span className="text-zinc-400 ml-2">(Qtd: {item.quantity})</span>
                                </div>
                                <span className="text-xs font-semibold text-red-500">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price_at_purchase * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="lg:w-64 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-800 pt-4 lg:pt-0 lg:pl-6 gap-4">
                          <div>
                            <p className="text-[10px] uppercase text-zinc-500 font-bold">Total do Pedido</p>
                            <p className="text-xl font-bold text-white mt-1">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.total_amount)}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase">Gerenciar Envio:</p>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleUpdateStatus(pedido.id, 'pago')}
                                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-[10px] uppercase py-2 px-2 font-bold transition-colors cursor-pointer"
                              >
                                Pago
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(pedido.id, 'enviado')}
                                className="bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-purple-300 text-[10px] uppercase py-2 px-2 font-bold transition-colors cursor-pointer"
                              >
                                Enviado
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}