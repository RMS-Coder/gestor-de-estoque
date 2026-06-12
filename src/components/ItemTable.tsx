import React from 'react';
import { Item } from '../types';

interface ItemTableProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onIncrement: (item: Item) => void;
  onDecrement: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export function ItemTable({ items, onEdit, onIncrement, onDecrement, onDelete }: ItemTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm h-full flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors duration-200">
        Nenhum item encontrado.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm h-full overflow-y-auto flex flex-col transition-colors duration-200">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 border-b border-slate-200 dark:border-slate-700 transition-colors duration-200">
          <tr>
            <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16 text-center">Ações</th>
            <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nome do Item</th>
            <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center w-48">Quantidade</th>
            <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16 text-center">Apagar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-150">
              <td className="p-4 text-center">
                <button
                  onClick={() => onEdit(item)}
                  className="ignore-search-clear p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Editar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
              </td>
              <td className="p-4 font-medium text-slate-700 dark:text-slate-200">{item.nome}</td>
              <td className="p-4">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => onDecrement(item)}
                    className="ignore-search-clear w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold w-12 text-center dark:text-slate-100">{item.quantidade}</span>
                  <button
                    onClick={() => onIncrement(item)}
                    className="ignore-search-clear w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    +
                  </button>
                </div>
              </td>
              <td className="p-4 text-center">
                <button
                  onClick={() => onDelete(item)}
                  className="p-2 text-slate-300 dark:text-slate-500 hover:text-red-500 transition-colors"
                  title="Apagar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
