import React, { useEffect, useState, useMemo } from "react";
import { Item } from "./types";
import { api } from "./api";
import { ItemTable } from "./components/ItemTable";
import { ItemModal } from "./components/ItemModal";
import { DeleteModal } from "./components/DeleteModal";
import { ReportModal } from "./components/ReportModal";
import { Sun, Moon, Search, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");


  // Modal states
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  useEffect(() => {
    loadItems();
  }, []);

  // Limpar busca ao clicar em qualquer botão (exceto o próprio botão de limpar busca)
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Verifica se o elemento clicado (ou um pai dele) é um botão e não é o botão de limpar busca
      if (
        target.closest("button") &&
        !target.closest(".search-clear-btn") &&
        !target.closest(".ignore-search-clear")
      ) {
        setSearch("");
      }
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  const loadItems = async () => {
    try {
      const data = await api.getItems();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async (newItemData: Partial<Item>) => {
    try {
      const newItem = await api.createItem({
        nome: newItemData.nome!,
        quantidade: newItemData.quantidade!,
      });
      setItems([...items, newItem]);
      setIsAddingItem(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEdit = async (updatedItem: Item) => {
    try {
      setItems((prev) =>
        prev.map((it) => (it.id === updatedItem.id ? updatedItem : it)),
      );
      setEditingItem(null);
      await api.updateItem(updatedItem.id, updatedItem);
    } catch (e) {
      console.error(e);
      loadItems(); // Rollback em caso de erro
    }
  };

  const handleIncrement = async (item: Item) => {
    const updated = { ...item, quantidade: item.quantidade + 1 };
    setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
    try {
      await api.updateItem(updated.id, { quantidade: updated.quantidade });
    } catch (e) {
      loadItems(); // Rollback
    }
  };

  const handleDecrement = async (item: Item) => {
    const updated = { ...item, quantidade: Math.max(0, item.quantidade - 1) };
    setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
    try {
      await api.updateItem(updated.id, { quantidade: updated.quantidade });
    } catch (e) {
      loadItems(); // Rollback
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    const id = deletingItem.id;
    setDeletingItem(null);
    setItems((prev) => prev.filter((it) => it.id !== id));
    try {
      await api.deleteItem(id);
    } catch (e) {
      loadItems(); // Rollback
    }
  };

  const filteredItems = useMemo(() => {
    const term = search.trim();
    let result = items;
    
    if (term.length >= 4) {
      const normalizeString = (str: string) =>
        str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

      const normalizedSearch = normalizeString(term);

      result = items.filter((item) =>
        normalizeString(item.nome).includes(normalizedSearch),
      );
    }

    return [...result].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
  }, [items, search]);

  const handleGenerateReport = (instituicao: string, descricao: string) => {
    const doc = new jsPDF();
    const dateStr = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
    }).format(new Date());

    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Headers
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const titleWidth = doc.getTextWidth(instituicao);
    doc.text(instituicao, (pageWidth - titleWidth) / 2, 20);

    let startY = 35;

    // Descrição
    if (descricao.trim()) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(descricao, pageWidth - 28);
      // 'justify' is natively supported in advanced usage, we'll try 'justify'
      doc.text(descLines, 14, startY, {
        align: "justify",
        maxWidth: pageWidth - 28,
      });
      startY += descLines.length * 6 + 10;
    }

    autoTable(doc, {
      startY,
      head: [["Nome do Item", "Quantidade"]],
      body: items.map((item) => [item.nome, item.quantidade.toString()]),
      margin: { bottom: 20 },
      didDrawPage: (data) => {
        // Render Footer
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(dateStr, pageWidth / 2, pageHeight - 10, { align: "center" });
      },
    });

    doc.save("relatorio_estoque.pdf");
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans text-slate-900 dark:text-slate-100 overflow-hidden relative transition-colors duration-200">
      {/* Header Section */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4 flex flex-col md:flex-row gap-4 justify-between md:items-center shrink-0 transition-colors duration-200">
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">
              Gestor de Estoque
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors md:hidden"
            title="Alternar Tema"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-100 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="search-clear-btn absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-100 dark:bg-slate-800 rounded-full"
                title="Limpar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors hidden md:block"
            title="Alternar Tema"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={() => setIsAddingItem(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm"
          >
            Novo Item
          </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 px-8 pt-8 pb-4 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex items-center justify-center transition-colors duration-200">
            <div className="animate-pulse flex items-center space-x-2">
              <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
              <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
              <div className="w-4 h-4 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            </div>
          </div>
        ) : (
          <ItemTable
            items={filteredItems}
            onEdit={(item) => setEditingItem(item)}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            onDelete={(item) => setDeletingItem(item)}
          />
        )}

        <div className="mt-4 flex justify-end shrink-0">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors underline underline-offset-4 decoration-slate-300 dark:decoration-slate-600 hover:decoration-blue-600 dark:hover:decoration-blue-400"
          >
            Gerar Relatório
          </button>
        </div>
      </main>

      {editingItem && (
        <ItemModal
          item={editingItem}
          items={items}
          onSave={handleSaveEdit}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {isAddingItem && (
        <ItemModal
          item={null} // Null triggers "Add" mode
          items={items}
          onSave={handleCreateNew}
          onCancel={() => setIsAddingItem(false)}
        />
      )}

      {deletingItem && (
        <DeleteModal
          item={deletingItem}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}

      {isReportModalOpen && (
        <ReportModal
          onClose={() => setIsReportModalOpen(false)}
          onGenerate={handleGenerateReport}
        />
      )}
    </div>
  );
}
