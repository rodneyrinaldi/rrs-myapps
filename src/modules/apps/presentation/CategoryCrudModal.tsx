"use client";


import { useState } from 'react';
import { FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

interface Props {
  categories: string[];
  categoryColors: Record<string, string>;
  availableColors: string[];
  onSave: (payload: { categories: string[]; categoryColors: Record<string, string> }) => void;
  onClose: () => void;
}

const DEFAULT_COLOR = '#6366F1';

function colorBg(hex: string): string {
  return `${hex}22`;
}

function colorBorder(hex: string): string {
  return `${hex}66`;
}

export function CategoryCrudModal(props: Props) {
  const { categories, categoryColors, availableColors, onSave, onClose } = props;
  const [list, setList] = useState<string[]>(categories);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<string>(availableColors[0] ?? DEFAULT_COLOR);
  const [colorsMap, setColorsMap] = useState<Record<string, string>>(categoryColors);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingColor, setEditingColor] = useState<string>(availableColors[0] ?? DEFAULT_COLOR);
  const [formError, setFormError] = useState<string | null>(null);

  const isDuplicate = (name: string, excludeIndex?: number) =>
    list.some((c, i) => c.toLowerCase() === name.trim().toLowerCase() && i !== excludeIndex);

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) { setFormError('Nome obrigatório.'); return; }
    if (isDuplicate(trimmed)) { setFormError('Categoria já existe.'); return; }
    setList([...list, trimmed]);
    setColorsMap({ ...colorsMap, [trimmed]: newColor });
    setNewName('');
    setNewColor(availableColors[0] ?? DEFAULT_COLOR);
    setFormError(null);
  }

  function handleSave() {
    onSave({ categories: list, categoryColors: colorsMap });
    onClose();
  }

  function startEdit(index: number) {
    setEditingIndex(index);
    setEditingValue(list[index]);
    setEditingColor(colorsMap[list[index]] || (availableColors[0] ?? DEFAULT_COLOR));
    setFormError(null);
  }

  function confirmEdit() {
    if (editingIndex === null) return;
    const trimmed = editingValue.trim();
    if (!trimmed) { setFormError('Nome obrigatório.'); return; }
    if (isDuplicate(trimmed, editingIndex)) { setFormError('Categoria já existe.'); return; }
    const updatedList = [...list];
    const oldName = updatedList[editingIndex];
    updatedList[editingIndex] = trimmed;
    const updatedColors = { ...colorsMap };
    delete updatedColors[oldName];
    updatedColors[trimmed] = editingColor;
    setList(updatedList);
    setColorsMap(updatedColors);
    setEditingIndex(null);
    setEditingValue('');
    setEditingColor(availableColors[0] ?? DEFAULT_COLOR);
    setFormError(null);
  }

  function resetEdit() {
    setEditingIndex(null);
    setEditingValue('');
    setEditingColor(availableColors[0] ?? DEFAULT_COLOR);
    setFormError(null);
  }

  function handleDelete(index: number) {
    const name = list[index];
    const updatedList = list.filter((_, i) => i !== index);
    const updatedColors = { ...colorsMap };
    delete updatedColors[name];
    setList(updatedList);
    setColorsMap(updatedColors);
    resetEdit();
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fadeIn overflow-y-auto p-4 sm:p-6">
      <div className="mx-auto my-2 sm:my-6 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[80vw] p-[5vw] flex flex-col border border-gray-200 dark:border-gray-700 max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-3rem)]">
        {/* Header */}
        <div className="shrink-0 flex items-start border-b border-gray-300 dark:border-gray-700 p-5 sm:p-6 bg-white dark:bg-gray-900 rounded-t-2xl">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              {editingIndex !== null ? 'Editar Categoria' : 'Gerenciar Categorias'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Adicione, edite ou remova categorias de forma centralizada.
            </p>
          </div>
          <button onClick={onClose} className="ml-auto p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition" title="Fechar"><FaTimes size={18} /></button>
        </div>
        <div className="min-h-0 overflow-y-auto p-5 sm:p-6 flex flex-col gap-5">
          {/* Adicionar */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/60">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Nova categoria..."
                value={newName}
                onChange={e => { setNewName(e.target.value); setFormError(null); }}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                className="flex-1 min-w-0 px-4 py-2 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-200 text-sm"
                style={{ backgroundColor: colorBg(newColor), borderColor: colorBorder(newColor), color: '#374151' }}
              />
              <div className="flex gap-1">
                {availableColors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={`w-5 h-5 rounded-full border ${newColor === color ? 'border-indigo-700' : 'border-white'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button
                onClick={handleAdd}
                className="px-6 py-2 rounded-full border border-indigo-600 bg-indigo-600/80 text-white hover:bg-indigo-700 hover:border-indigo-700 hover:bg-opacity-100 transition text-sm font-semibold shadow-sm"
                style={{ minWidth: 100, backgroundColor: newColor, borderColor: colorBorder(newColor) }}
                title="Adicionar"
              >
                Adicionar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-full border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700 transition text-sm font-semibold shadow-sm"
                style={{ minWidth: 100 }}
                title="Salvar"
              >
                Salvar
              </button>
            </div>
            {formError && <div className="text-red-500 text-xs mt-1">{formError}</div>}
            {/* Lista */}
            <ul className="overflow-y-auto flex-1 flex flex-col gap-2.5 pr-1 min-h-[180px]">
              {list.length === 0 && (
                <li className="text-sm text-gray-400 text-center py-4">Nenhuma categoria.</li>
              )}
              {list.map((cat, index) => {
                const rowColor = colorsMap[cat] || availableColors[index % availableColors.length] || DEFAULT_COLOR;
                if (editingIndex === index) {
                  return (
                    <li key={index} className="flex items-center gap-2 px-4 py-3 rounded-lg border" style={{ backgroundColor: colorBg(rowColor), borderColor: colorBorder(rowColor) }}>
                      <input
                        autoFocus
                        type="text"
                        value={editingValue}
                        onChange={e => { setEditingValue(e.target.value); setFormError(null); }}
                        onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); }}
                        className="flex-1 px-3 py-2 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-200 text-sm"
                      />
                      <div className="flex gap-1">
                        {availableColors.map((color: string) => (
                          <button
                            key={color}
                            onClick={() => setEditingColor(color)}
                            className={`w-5 h-5 rounded-full border ${editingColor === color ? 'border-indigo-700' : 'border-white'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <button onClick={confirmEdit} className="w-9 h-9 flex items-center justify-center rounded-full border border-green-600 text-green-700 bg-white hover:bg-green-50 transition" title="Confirmar"><FaCheck size={13} /></button>
                      <button onClick={resetEdit} className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-400 text-gray-600 bg-white hover:bg-gray-100 transition" title="Cancelar"><FaTimes size={13} /></button>
                    </li>
                  );
                } else {
                  return (
                    <li key={index} className="flex items-center gap-2 px-4 py-3 rounded-lg border" style={{ backgroundColor: colorBg(rowColor), borderColor: colorBorder(rowColor) }}>
                      <span className="flex-1 font-medium text-gray-800 dark:text-gray-100">{cat}</span>
                      <button onClick={() => startEdit(index)} className="w-9 h-9 flex items-center justify-center rounded-full border border-blue-400 text-blue-600 bg-white hover:bg-blue-50 transition" title="Editar"><FaEdit size={13} /></button>
                      <button onClick={() => handleDelete(index)} className="w-9 h-9 flex items-center justify-center rounded-full border border-red-400 text-red-600 bg-white hover:bg-red-50 transition" title="Excluir"><FaTrash size={13} /></button>
                      <span className="w-5 h-5 rounded-full border ml-2" style={{ backgroundColor: rowColor, borderColor: colorBorder(rowColor) }} />
                    </li>
                  );
                }
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
