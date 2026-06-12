import React, { useState, useEffect, useRef } from "react";
import { Item } from "../types";

interface ItemModalProps {
  item: Item | null; // null for add mode, Item for edit mode
  items: Item[];
  onSave: (item: Partial<Item>) => void;
  onCancel: () => void;
}

export function ItemModal({ item, items, onSave, onCancel }: ItemModalProps) {
  const isEdit = !!item;
  const [nome, setNome] = useState(item?.nome || "");
  const [quantidade, setQuantidade] = useState<number | "">(
    item?.quantidade ?? "",
  );
  const [showSumInput, setShowSumInput] = useState(false);
  const [sumAmount, setSumAmount] = useState("");
  const [error, setError] = useState("");

  const nomeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Foco automático no campo NOME
    const timer = setTimeout(() => {
      nomeInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    if (!nome.trim() || quantidade === "") {
      return; // Campos obrigatórios
    }

    // Check if duplicate name exists
    const normalizeString = (str: string) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const normalizedNome = normalizeString(nome);
    const isDuplicate = items.some(
      (it) => it.id !== item?.id && normalizeString(it.nome) === normalizedNome,
    );

    if (isDuplicate) {
      setError("Item já cadastrado com este nome.");
      return;
    }

    setError("");

    onSave({
      ...(item ? { id: item.id } : {}),
      nome,
      quantidade: Number(quantidade),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!showSumInput) {
        e.preventDefault();
        handleSave();
      }
    }
  };

  const handleSum = () => {
    const num = parseInt(sumAmount, 10);
    if (!isNaN(num)) {
      setQuantidade((prev) => (prev === "" ? 0 : prev) + num);
      setSumAmount("");
      setShowSumInput(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-40 dark:bg-black/60"
      onKeyDown={handleKeyDown}
    >
      <div className="ignore-search-clear bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {isEdit ? "Editar Item" : "Adicionar Item"}
          </h2>
          <button
            onClick={onCancel}
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

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
              Nome
            </label>
            <input
              type="text"
              ref={nomeInputRef}
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (error) setError("");
              }}
              placeholder="Digite o nome do item..."
              className={`w-full p-3 bg-slate-50 dark:bg-slate-900 border ${error ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500"} dark:text-slate-100 rounded-lg text-sm outline-none transition-all`}
            />
            {error && (
              <p className="text-xs font-medium text-red-500">{error}</p>
            )}
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                Quantidade
              </label>
              <input
                type="number"
                value={quantidade}
                onChange={(e) =>
                  setQuantidade(
                    e.target.value === "" ? "" : parseInt(e.target.value),
                  )
                }
                placeholder="Ex: 10"
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            {isEdit && (
              <div className="flex-none">
                <button
                  type="button"
                  onClick={() => setShowSumInput(!showSumInput)}
                  className={`p-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border ${
                    showSumInput
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                      : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Adicionar
                </button>
              </div>
            )}
          </div>

          {/* SUB-MODAL AREA (The "Somar" input state) */}
          {showSumInput && (
            <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                  Acrescentar a quantidade de:
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Valor a somar..."
                  value={sumAmount}
                  onChange={(e) => setSumAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSum();
                    }
                  }}
                  autoFocus
                  className="flex-1 p-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 dark:text-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={handleSum}
                  disabled={!sumAmount}
                  className="bg-blue-600 text-white px-4 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-auto border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!nome.trim() || quantidade === ""}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-shadow"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
