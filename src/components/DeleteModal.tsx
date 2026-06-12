import React from "react";
import { Item } from "../types";

interface DeleteModalProps {
  item: Item;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({ item, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="ignore-search-clear bg-white dark:bg-slate-900 text-slate-800 dark:text-white p-6 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Deseja apagar este item?
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {item.nome}
              </span>{" "}
              será apagado permanentemente.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-2">
          <button
            onClick={onCancel}
            className="text-sm font-bold px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:text-slate-200 dark:bg-white/10 dark:hover:bg-white/20 rounded-lg transition-colors flex-1 sm:flex-none text-center"
          >
            Não
          </button>
          <button
            onClick={onConfirm}
            className="text-sm font-bold px-4 py-2 bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors flex-1 sm:flex-none text-center shadow-sm"
          >
            Sim, Apagar
          </button>
        </div>
      </div>
    </div>
  );
}
