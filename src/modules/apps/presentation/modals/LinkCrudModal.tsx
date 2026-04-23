"use client";

import { useState } from 'react';
import { FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import type { AppLink } from '@/modules/apps/infrastructure/local-db';

interface Props {
  links: AppLink[];
  categories: string[];
  categoryColors: Record<string, string>;
  onSave: (links: AppLink[]) => void;
  onClose: () => void;
}

const EMPTY_FORM: Omit<AppLink, 'name'> & { name: string } = {
  name: '',
  title: '',
  link: '',
  category: '',
};

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

function validateLink(form: typeof EMPTY_FORM, existing: AppLink[], editingName?: string): string | null {
  if (!form.name.trim()) return 'ID obrigatório.';
  if (!form.title.trim()) return 'Título obrigatório.';
  if (!form.link.trim()) return 'URL obrigatória.';
  try { new URL(form.link.trim()); } catch { return 'URL inválida.'; }
  const slug = normalizeSlug(form.name);
  const duplicate = existing.some(l => normalizeSlug(l.name) === slug && l.name !== editingName);
  if (duplicate) return 'Já existe um link com este ID.';
  return null;
}


export function LinkCrudModal({ links, categories, categoryColors, onSave, onClose }: Props) {
  const [list, setList] = useState<AppLink[]>(links);
  const [form, setForm] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [editingName, setEditingName] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // UX igual ao de categorias
  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingName(null);
    setFormError(null);
  };

  const handleAdd = () => {
    const error = validateLink(form, list);
    if (error) { setFormError(error); return; }
    const entry: AppLink = {
      name: normalizeSlug(form.name),
      title: form.title.trim(),
      link: form.link.trim(),
      category: form.category?.trim() || undefined,
    };
    setList(prev => [...prev, entry]);
    resetForm();
  };

  const startEdit = (item: AppLink) => {
    setForm({ name: item.name, title: item.title, link: item.link, category: item.category ?? '' });
    setEditingName(item.name);
    setFormError(null);
  };

  const confirmEdit = () => {
    if (!editingName) return;
    const error = validateLink(form, list, editingName);
    if (error) { setFormError(error); return; }
    const entry: AppLink = {
      name: normalizeSlug(form.name),
      title: form.title.trim(),
      link: form.link.trim(),
      category: form.category?.trim() || undefined,
    };
    setList(prev => prev.map(l => (l.name === editingName ? entry : l)));
    resetForm();
  };

  const handleDelete = (name: string) => {
    setList(prev => prev.filter(l => l.name !== name));
    if (editingName === name) resetForm();
  };

  const handleSave = () => {
    onSave(list);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fadeIn overflow-y-auto p-4 sm:p-6 flex items-center justify-center">
      <div className="mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col border border-gray-200 dark:border-gray-700 max-h-[90vh]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Gerenciar Links</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"><FaTimes /></button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Título *"
              value={form.title}
              onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setFormError(null); }}
              className="flex-1 min-w-0 px-4 py-2 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-200 text-sm"
            />
            <input
              type="text"
              placeholder="ID (slug) *"
              value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormError(null); }}
              className="flex-1 min-w-0 px-4 py-2 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-200 text-sm"
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
          {formError && <p className="text-xs text-red-600 mt-1">{formError}</p>}
        </div>
        {/* Lista de links */}
        <ul className="mt-6 flex-1 overflow-y-auto flex flex-col gap-2 pr-1 min-h-[180px]">
          {list.length === 0 && (
            <li className="text-sm text-gray-400 text-center py-4">Nenhum link cadastrado.</li>
          )}
          {list.map((item, index) => {
            const rowColor = item.category && categoryColors[item.category] ? categoryColors[item.category] : '#6366F1';
            return (
              <li
                key={item.name}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border"
                style={{ backgroundColor: `${rowColor}22`, borderColor: `${rowColor}66` }}
              >
                {editingName === item.name ? (
                  <>
                    <input
                      autoFocus
                      type="text"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="flex-1 px-5 py-2 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-200 text-sm"
                    />
                    <input
                      type="url"
                      value={form.link}
                      onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                      className="flex-1 px-5 py-2 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-200 text-sm"
                    />
                    <select
                      value={form.category ?? ''}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="flex-1 pl-3 pr-4 py-2 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-200 text-sm"
                    >
                      <option value="">Sem categoria</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat} style={{ color: categoryColors[cat] || '#111827' }}>{cat}</option>
                      ))}
                    </select>
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
                      onClick={e => { e.preventDefault(); resetForm(); }}
                      className="text-sm px-2 transition hover:underline focus:underline"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                      title="Cancelar"
                    >
                      cancelar
                    </a>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-gray-800 dark:text-gray-100 pr-6">{item.title}</span>
                    <span className="select-none text-gray-400 dark:text-gray-500 px-1">|</span>
                    <a
                      href="#"
                      onClick={e => { e.preventDefault(); startEdit(item); }}
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
                        if (window.confirm('Tem certeza que deseja excluir este link?')) handleDelete(item.name);
                      }}
                      className="text-sm px-2 transition hover:underline focus:underline"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                      title="Excluir"
                    >
                      excluir
                    </a>
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
