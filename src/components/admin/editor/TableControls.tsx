// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';
import { Editor } from '@tiptap/react';
import { Table, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface TableControlsProps {
  editor: Editor | null;
}

export const TableControls: React.FC<TableControlsProps> = ({ editor }) => {
  if (!editor || !editor.isActive('table')) return null;

  return (
    <div className="flex items-center gap-1.5 p-2 bg-[#052E2B] border border-white/15 rounded-xl text-xs text-[#ECFEFF] flex-wrap">
      <div className="flex items-center gap-1 text-[#2DD4BF] font-bold mr-2">
        <Table size={14} />
        <span>Tabel:</span>
      </div>
      <button
        type="button"
        onClick={() => editor.chain().focus().addRowAfter().run()}
        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 cursor-pointer flex items-center gap-1"
      >
        <Plus size={12} /> Baris Bawah
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteRow().run()}
        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 cursor-pointer flex items-center gap-1 text-red-300"
      >
        <Trash2 size={12} /> Hapus Baris
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 cursor-pointer flex items-center gap-1"
      >
        <Plus size={12} /> Kolom Kanan
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteColumn().run()}
        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 cursor-pointer flex items-center gap-1 text-red-300"
      >
        <Trash2 size={12} /> Hapus Kolom
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 cursor-pointer"
      >
        Baris Judul
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().deleteTable().run()}
        className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 cursor-pointer"
      >
        Hapus Tabel
      </button>
    </div>
  );
};
