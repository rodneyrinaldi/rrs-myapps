"use client";

import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

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

export function CategoryCrudModal({ categories, categoryColors, availableColors, onSave, onClose }: Props) {
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

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) { setFormError('Nome obrigatório.'); return; }
    if (isDuplicate(trimmed)) { setFormError('Categoria já existe.'); return; }
    setList(prev => [...prev, trimmed]);
    setColorsMap(prev => ({ ...prev, [trimmed]: newColor }));
    setNewName('');
    setNewColor(availableColors[0] ?? DEFAULT_COLOR);
    setFormError(null);
  };

  const handleDelete = (index: number) => {
    const categoryToRemove = list[index];
    setList(prev => prev.filter((_, i) => i !== index));
    setColorsMap(prev => {
      const next = { ...prev };
      delete next[categoryToRemove];
      return next;
    });
    if (editingIndex === index) { setEditingIndex(null); setEditingValue(''); }
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingValue(list[index]);
    setEditingColor(colorsMap[list[index]] || availableColors[0] || DEFAULT_COLOR);
    setFormError(null);
  };

  const confirmEdit = () => {
    if (editingIndex === null) return;
    const trimmed = editingValue.trim();
    if (!trimmed) { setFormError('Nome obrigatório.'); return; }
    if (isDuplicate(trimmed, editingIndex)) { setFormError('Categoria já existe.'); return; }
    const oldName = list[editingIndex];
    setList(prev => prev.map((c, i) => (i === editingIndex ? trimmed : c)));
    setColorsMap(prev => {
      const next = { ...prev };
      delete next[oldName];
      next[trimmed] = editingColor;
      return next;
    });
    setEditingIndex(null);
    setEditingValue('');
    setEditingColor(availableColors[0] ?? DEFAULT_COLOR);
    setFormError(null);
  };

  const handleSave = () => {
    const filteredColors = Object.fromEntries(
      Object.entries(colorsMap).filter(([category]) => list.includes(category))
    );
    onSave({ categories: list, categoryColors: filteredColors });
    onClose();
  };

  function resetEdit() {
    setEditingIndex(null);
    setEditingValue('');
    setEditingColor(availableColors[0] ?? DEFAULT_COLOR);
    setFormError(null);
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fadeIn overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
      <div className="mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col border border-gray-200 dark:border-gray-700 max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Gerenciar Categorias</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"><FaTimes /></button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Nova categoria..."
              value={newName}
              onChange={e => { setNewName(e.target.value); setFormError(null); }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1 min-w-0 px-4 py-2 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-200 text-sm"
              style={{ backgroundColor: colorBg(newColor), borderColor: colorBorder(newColor) }}
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition shadow border"
              style={{
                backgroundColor: 'rgba(99,102,241,0.13)',
                color: '#6366F1',
                borderColor: '#6366F1',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = '#6366F1';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.13)';
                e.currentTarget.style.color = '#6366F1';
              }}
              title="Adicionar"
            >
              Adicionar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition shadow border"
              style={{
                backgroundColor: 'rgba(16,185,129,0.13)',
                color: '#10B981',
                borderColor: '#10B981',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = '#10B981';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.13)';
                e.currentTarget.style.color = '#10B981';
              }}
              title="Salvar"
            >
              Salvar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition shadow border"
              style={{
                backgroundColor: 'rgba(209,213,219,0.13)',
                color: '#D1D5DB',
                borderColor: '#D1D5DB',
                transition: 'background 0.2s, color 0.2s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = '#D1D5DB';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = 'rgba(209,213,219,0.13)';
                e.currentTarget.style.color = '#D1D5DB';
              }}
              title="Voltar"
            >
              Voltar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableColors.map(color => (
              <button
                key={color}
                onClick={() => setNewColor(color)}
                className={`w-7 h-7 rounded-full border-2 transition ${newColor === color ? 'border-indigo-700' : 'border-white'}`}
                style={{ backgroundColor: color }}
                title={`Selecionar cor ${color}`}
              />
            ))}
          </div>
          {/* Botão Voltar duplicado removido */}
          {formError && <p className="text-xs text-red-600 mt-1">{formError}</p>}
        </div>
        <ul className="mt-6 flex-1 overflow-y-auto flex flex-col gap-2 pr-1 min-h-[180px]">
          {list.length === 0 && (
            <li className="text-sm text-gray-400 text-center py-4">Nenhuma categoria.</li>
          )}
          {list.map((cat, index) => {
            const rowColor = colorsMap[cat] || availableColors[index % availableColors.length] || DEFAULT_COLOR;
            return (
              <li
                key={index}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border"
                style={{ backgroundColor: colorBg(rowColor), borderColor: colorBorder(rowColor) }}
              >
                {editingIndex === index ? (
                  <>
                    <input
                      autoFocus
                      type="text"
                      value={editingValue}
                      onChange={e => { setEditingValue(e.target.value); setFormError(null); }}
                      onKeyDown={e => e.key === 'Enter' && confirmEdit()}
                      className="flex-1 px-5 py-2 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-200 text-sm"
                    />
                    <div className="flex gap-1">
                      {availableColors.map(color => (
                        <button
                          key={color}
                          onClick={() => setEditingColor(color)}
                          className={`w-5 h-5 rounded-full border ${editingColor === color ? 'border-indigo-700' : 'border-white'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <a
                      href="#"
                      onClick={e => { e.preventDefault(); confirmEdit(); }}
                      className="text-sm px-2 transition hover:underline focus:underline"
                      style={{ color: 'rgba(255,255,255,0.75)' }}
                      title="Confirmar"
                    >
                      confirmar
                    </a>
                    <a
                      href="#"
                      onClick={e => { e.preventDefault(); resetEdit(); }}
                      className="text-sm px-2 transition hover:underline focus:underline"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                      title="Cancelar"
                    >
                      cancelar
                    </a>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-gray-800 dark:text-gray-100 pr-6">{cat}</span>
                    <span className="select-none text-gray-400 dark:text-gray-500 px-1">|</span>
                    <a
                      href="#"
                      onClick={e => { e.preventDefault(); startEdit(index); }}
                      className="text-sm px-2 transition hover:underline focus:underline"
                      style={{ color: 'rgba(255,255,255,0.75)' }}
                      title="Editar"
                    >
                      editar
                    </a>
                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        if (window.confirm('Tem certeza que deseja excluir esta categoria?')) handleDelete(index);
                      }}
                      className="text-sm px-2 transition hover:underline focus:underline"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                      title="Excluir"
                    >
                      excluir
                    </a>
                    <span className="w-5 h-5 rounded-full border ml-2" style={{ backgroundColor: rowColor, borderColor: colorBorder(rowColor) }} />
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
