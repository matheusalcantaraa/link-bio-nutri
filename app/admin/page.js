"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Admin() {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Geral');
  const [arquivo, setArquivo] = useState(null);
  const [linkExterno, setLinkExterno] = useState('');
  const [senha, setSenha] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState([]); // Estado que guarda a lista de PDFs

  // Assim que a página carrega, ele busca os PDFs que já existem
  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    const { data } = await supabase
      .from('links_pdf')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setLinks(data);
  }

  // Função para ADICIONAR PDF
  const handleUpload = async (e) => {
    e.preventDefault();
    if (senha !== '210806') return setStatus('Senha incorreta!');
    if (!arquivo && !linkExterno.trim()) {
      return setStatus('Envie um arquivo ou informe um link.');
    }
    
    setLoading(true);
    setStatus('Fazendo upload... Aguarde.');

    try {
      let publicUrl = linkExterno.trim();

      if (arquivo) {
        const fileExt = arquivo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(fileName, arquivo);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('pdfs')
          .getPublicUrl(fileName);

        publicUrl = data.publicUrl;
      }

      const { error: dbError } = await supabase
        .from('links_pdf')
        .insert([{ titulo, categoria, arquivo_url: publicUrl }]);

      if (dbError) throw dbError;

      setStatus('Sucesso! O material já está disponível no site.');
      setTitulo('');
      setCategoria('Geral');
      setArquivo(null);
      setLinkExterno('');
      fetchLinks(); // Atualiza a lista na mesma hora
    } catch (error) {
      setStatus(`Erro ao enviar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para EXCLUIR PDF
  const handleDelete = async (id, url) => {
    // Pede a senha em um alerta na tela
    const senhaConfirmacao = window.prompt("Digite a senha de segurança para excluir este material:");
    
    if (senhaConfirmacao !== '210806') {
      alert("Senha incorreta! Exclusão cancelada.");
      return;
    }

    try {
      // 1. Descobre o nome do arquivo pelo link
      const fileName = url.split('/').pop();
      
      // 2. Apaga fisicamente da pasta do Supabase
      await supabase.storage.from('pdfs').remove([fileName]);

      // 3. Apaga o botão do banco de dados
      const { error } = await supabase.from('links_pdf').delete().eq('id', id);
      if (error) throw error;

      alert("Material excluído com sucesso!");
      fetchLinks(); // Atualiza a lista na tela sumindo com o item
    } catch (error) {
      alert(`Erro ao excluir: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      
      {/* Formulário de Envio (Parte de Cima) */}
      <form onSubmit={handleUpload} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-5 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Painel da Nutri</h2>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Botão no Site</label>
          <input 
            type="text" 
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
            placeholder="Ex: E-book Receitas Low Carb"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Arquivo PDF (opcional)</label>
          <input 
            type="file" 
            accept=".pdf"
            onChange={(e) => setArquivo(e.target.files[0])}
            className="w-full border rounded-lg p-3 bg-gray-50 cursor-pointer text-sm"
          />
        </div>

        <p className="text-center text-xs font-semibold text-gray-500 -my-2">OU</p>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Link externo</label>
          <input
            type="url"
            value={linkExterno}
            onChange={(e) => setLinkExterno(e.target.value)}
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
            placeholder="https://..."
          />
          <p className="mt-1 text-xs text-gray-500">Use para links do Google Drive, YouTube, sites e outros materiais.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Senha de Segurança</label>
          <input 
            type="password" 
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
            placeholder="Digite a senha para autorizar"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
          <input
            type="text"
            required
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
            placeholder="Ex: Livros"
          />
          <p className="mt-1 text-xs text-gray-500">Materiais com a mesma categoria ficam juntos no site.</p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-green-600 text-white font-bold p-4 rounded-lg hover:bg-green-700 transition-all disabled:bg-gray-400 mt-2 shadow-md"
        >
          {loading ? 'Enviando arquivo...' : 'Publicar Material'}
        </button>

        {status && <p className="text-center font-bold text-green-700 mt-2">{status}</p>}
      </form>

      {/* Gerenciador de PDFs (Parte de Baixo) */}
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Materiais Publicados</h3>
        
        <div className="flex flex-col gap-3">
          {links.map((link) => (
            <div key={link.id} className="flex justify-between items-center border border-gray-200 p-3 rounded-lg bg-gray-50">
              <div className="min-w-0 mr-3">
                <p className="font-medium text-gray-700 truncate" title={link.titulo}>{link.titulo}</p>
                <p className="text-xs text-green-700">{link.categoria || 'Geral'}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(link.id, link.arquivo_url)}
                className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 text-sm font-bold transition-colors"
              >
                Excluir
              </button>
            </div>
          ))}
          
          {links.length === 0 && (
            <p className="text-center text-gray-500 text-sm">Nenhum material publicado ainda.</p>
          )}
        </div>
      </div>

    </div>
  );
}
