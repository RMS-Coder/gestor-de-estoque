import React, { useState, useEffect, useRef } from "react";

interface ReportModalProps {
  onClose: () => void;
  onGenerate: (instituicao: string, descricao: string) => void;
}

export function ReportModal({ onClose, onGenerate }: ReportModalProps) {
  const [instituicao, setInstituicao] = useState("");
  const [descricao, setDescricao] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleGenerate = () => {
    if (!instituicao.trim()) return;
    onGenerate(instituicao, descricao);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 dark:bg-black/60"
      onKeyDown={handleKeyDown}
    >
      <div className="ignore-search-clear bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Gerar Relatório
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              Nome da Instituição
            </label>
            <input
              type="text"
              ref={inputRef}
              value={instituicao}
              onChange={(e) => setInstituicao(e.target.value)}
              placeholder="Digite o nome da instituição"
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              Descrição (Opcional)
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Digite uma descrição para o relatório..."
              rows={4}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-auto border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={!instituicao.trim()}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-shadow"
          >
            Gerar relatório em PDF
          </button>
        </div>
      </div>
    </div>
  );
}
