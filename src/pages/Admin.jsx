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
  X 
} from 'lucide-react';

export function Admin() {
  const { session } = useSession();

  // Controle de Abas: 'cadastrar' | 'listar'
  const [abaAtiva, setAbaAtiva] = useState('cadastrar');

  // Lista de produtos para Edição/Exclusão
  const [produtos, setProdutos] = useState([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);

  // Estados do Formulário de Cadastro / Edição
  const [produtoEditandoId, setProdutoEditandoId] = useState(null); // null = Modo Cadastro
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

  useEffect(() => {
    if (abaAtiva === 'listar') {
      carregarProdutos();
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
  // SALVAR (CADASTRAR OU EDITAR)
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

      // 1. Se o usuário selecionou uma NOVA imagem, faz o upload
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

      // Validar se há imagem ao cadastrar produto novo
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
        // MODO ATUALIZAR (EDITAR)
        const { error: updateError } = await supabase
          .from('produtos')
          .update(payload)
          .eq('id', produtoEditandoId);

        if (updateError) throw updateError;
        setMensagemSucesso('Produto atualizado com sucesso!');
      } else {
        // MODO INSERIR (CADASTRAR)
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
    setAbaAtiva('cadastrar'); // Muda para o formulário
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-zinc-900/40 border border-zinc-800 p-6 md:p-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-3">
            <PackagePlus className="w-6 h-6 text-red-600" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Painel Admin // HUCRE
            </h1>
          </div>

          {/* MENUS DE NAVEGAÇÃO (TABS) */}
          <div className="flex items-center gap-2">
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
              <span>Gerenciar ({produtos.length})</span>
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
            
            {/* Aviso de Modo Edição */}
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

            {/* Nome do Produto */}
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
              {/* Preço */}
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

              {/* Estoque */}
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

            {/* Descrição */}
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

            {/* Upload de Imagem */}
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

            {/* Botão de Envio */}
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

                    {/* BOTÕES DE AÇÃO: EDITAR E EXCLUIR */}
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

      </div>
    </div>
  );
}