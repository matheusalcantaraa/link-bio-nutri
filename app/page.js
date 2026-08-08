"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [links, setLinks] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  useEffect(() => {
    async function fetchLinks() {
      const { data } = await supabase
        .from('links_pdf')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setLinks(data);
    }
    fetchLinks();
  }, []);

  const linksPorCategoria = links.reduce((grupos, link) => {
    const categoria = link.categoria || 'Geral';

    if (!grupos[categoria]) grupos[categoria] = [];
    grupos[categoria].push(link);

    return grupos;
  }, {});

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center py-12 px-4 font-sans relative">
      
      {/* MARCA D'ÁGUA NO FUNDO */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]" 
        style={{
          backgroundImage: "url('/marcadagua.png')", 
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover', 
        }}
      />

      {/* Conteúdo principal com z-10 para ficar em cima da marca d'água */}
      <div className="z-10 flex flex-col items-center w-full max-w-md flex-grow">
        
        {/* Perfil */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-28 h-28 mb-4 flex items-center justify-center overflow-hidden rounded-full border-4 border-green-500 shadow-lg bg-white">
            <img 
              src="/perfil.png" 
              alt="Foto da Nutri" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Erica Marculina</h1>
          <p className="text-green-700 font-bold mt-1">@erica_e_nutricao</p>
          
          <p className="text-gray-600 text-sm mt-3 max-w-xs">
            Acadêmica de Nutrição.<br />
             Baixe meus materiais gratuitos abaixo:
          </p>
        </div>

        {/* Lista de PDFs */}
        <div className="w-full flex flex-col gap-4 mb-12">
          {categoriaSelecionada ? (
            <>
              <button
                type="button"
                onClick={() => setCategoriaSelecionada(null)}
                className="self-start ml-3 text-sm font-bold text-green-700 hover:text-green-900"
              >
                ← Voltar para as pastas
              </button>

              <h2 className="ml-3 text-xl font-extrabold text-green-800">{categoriaSelecionada}</h2>

              {linksPorCategoria[categoriaSelecionada]?.map((link) => (
                <a
                  key={link.id}
                  href={link.arquivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white text-green-800 font-bold text-center p-4 rounded-full shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] border border-green-100 hover:bg-green-600 hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out flex items-center justify-center"
                >
                  {link.titulo}
                </a>
              ))}
            </>
          ) : (
            Object.entries(linksPorCategoria).map(([categoria, itens]) => (
              <button
                key={categoria}
                type="button"
                onClick={() => setCategoriaSelecionada(categoria)}
                className="w-full bg-white text-green-800 font-bold text-left p-4 rounded-2xl shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] border border-green-100 hover:bg-green-600 hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-300 ease-out flex items-center justify-between"
              >
                <span>{categoria}</span>
                <span className="text-sm opacity-70">{itens.length} material{itens.length === 1 ? '' : 'is'} →</span>
              </button>
            ))
          )}
          
          {links.length === 0 && (
            <p className="text-center text-gray-500 mt-8">Nenhum material disponível no momento.</p>
          )}
        </div>

        {/* Redes Sociais no Rodapé */}
        <div className="mt-auto flex gap-5 items-center justify-center mb-10">
          
          {/* Botão Instagram */}
          <a 
            href="https://instagram.com/erica_e_nutricao" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-700 hover:text-green-500 transition-colors hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>

          {/* Botão TikTok */}
          <a 
            href="https://tiktok.com/@erica_e_nutricao" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-700 hover:text-green-500 transition-colors hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
            </svg>
          </a>

          {/* Botão Telegram (Grupo) */}
          <a 
            href="https://t.me/+oAWxrA6mPnM0ZmEx" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-700 hover:text-green-500 transition-colors hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </a>

          {/* Botão E-mail */}
          <a 
            href="mailto:ericamnutri28@gmail.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-700 hover:text-green-500 transition-colors hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </a>

        </div>

        {/* Créditos da Criação do Site */}
        <a 
          href="https://instagram.com/matheusalcantar" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[11px] font-bold text-green-600/70 hover:text-green-800 transition-colors tracking-wide uppercase mt-4 mb-2"
        >
          Desenvolvido por Matheus Alcântara
        </a>

      </div>
    </main>
  );
}
