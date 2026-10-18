// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare,
  Link as LinkIcon, Image as ImageIcon, Video, Table as TableIcon,
  Minus, Undo, Redo, RemoveFormatting, Maximize
} from 'lucide-react';
import { ColorPicker } from './ColorPicker';

interface EditorToolbarProps {
  editor: Editor | null;
  onOpenLinkModal: () => void;
  onOpenImageModal: () => void;
  onOpenVideoModal: () => void;
  onToggleFullscreen: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  onOpenLinkModal,
  onOpenImageModal,
  onOpenVideoModal,
  onToggleFullscreen,
}) => {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2 px-3 bg-[#073D39]/90 backdrop-blur-md border-b border-white/15 scrollbar-none sticky top-0 z-20 rounded-t-2xl">
      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 border-r border-white/15 pr-1.5 shrink-0">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-40 text-[#A5D8D3] hover:text-[#ECFEFF] cursor-pointer"
          title="Urungkan"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-40 text-[#A5D8D3] hover:text-[#ECFEFF] cursor-pointer"
          title="Ulangi"
        >
          <Redo size={16} />
        </button>
      </div>



      {/* Formatting Marks */}
      <div className="flex items-center gap-0.5 border-r border-white/15 pr-1.5 shrink-0">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg cursor-pointer ${
            editor.isActive('bold') ? 'bg-[#2DD4BF]/40 text-[#ECFEFF]' : 'hover:bg-white/10 text-[#A5D8D3]'
          }`}
          title="Tebal"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg cursor-pointer ${
            editor.isActive('italic') ? 'bg-[#2DD4BF]/40 text-[#ECFEFF]' : 'hover:bg-white/10 text-[#A5D8D3]'
          }`}
          title="Miring"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-lg cursor-pointer ${
            editor.isActive('underline') ? 'bg-[#2DD4BF]/40 text-[#ECFEFF]' : 'hover:bg-white/10 text-[#A5D8D3]'
          }`}
          title="Garis Bawah"
        >
          <UnderlineIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg cursor-pointer ${
            editor.isActive('strike') ? 'bg-[#2DD4BF]/40 text-[#ECFEFF]' : 'hover:bg-white/10 text-[#A5D8D3]'
          }`}
          title="Coret"
        >
          <Strikethrough size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          className={`p-1.5 rounded-lg cursor-pointer ${
            editor.isActive('subscript') ? 'bg-[#2DD4BF]/40 text-[#ECFEFF]' : 'hover:bg-white/10 text-[#A5D8D3]'
          }`}
          title="Subskrip"
        >
          <Subscript size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          className={`p-1.5 rounded-lg cursor-pointer ${
            editor.isActive('superscript') ? 'bg-[#2DD4BF]/40 text-[#ECFEFF]' : 'hover:bg-white/10 text-[#A5D8D3]'
          }`}
          title="Superskrip"
        >
          <Superscript size={16} />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-0.5 border-r border-white/15 pr-1.5 shrink-0">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded-lg cursor-pointer ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-[#2DD4BF]/40 text-[#ECFEFF]' : 'hover:bg-white/10 text-[#A5D8D3]'
          }`}
          title="Rata Kiri"
        >
          <AlignLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded-lg cursor-pointer ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-[#2DD4BF]/40 text-[#ECFEFF]' : 'hover:bg-white/10 text-[#A5D8D3]'
          }`}
          title="Tengah"
        >
          <AlignCenter size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded-lg cursor-pointer ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-[#2DD4BF]/40 text-[#ECFEFF]' : 'hover:bg-white/10 text-[#A5D8D3]'
          }`}
          title="Rata Kanan"
        >
          <AlignRight size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-1.5 rounded-lg cursor-pointer ${
            editor.isActive({ textAlign: 'justify' }) ? 'bg-[#2DD4BF]/40 text-[#ECFEFF]' : 'hover:bg-white/10 text-[#A5D8D3]'
          }`}
          title="Rata Kanan-Kiri"
        >
          <AlignJustify size={16} />
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-0.5 border-r border-white/15 pr-1.5 shrink-0">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg cursor-pointer ${
            editor.isActive('bulletList') ? 'bg-[#2DD4BF]/40 text-[#ECFEFF]' : 'hover:bg-white/10 text-[#A5D8D3]'
          }`}
          title="Daftar Berpoin"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg cursor-pointer ${
            editor.isActive('orderedList') ? 'bg-[#2DD4BF]/40 text-[#ECFEFF]' : 'hover:bg-white/10 text-[#A5D8D3]'
          }`}
          title="Daftar Bernomor"
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1.5 rounded-lg cursor-pointer ${
            editor.isActive('taskList') ? 'bg-[#2DD4BF]/40 text-[#ECFEFF]' : 'hover:bg-white/10 text-[#A5D8D3]'
          }`}
          title="Daftar Centang"
        >
          <CheckSquare size={16} />
        </button>
      </div>

      {/* Colors */}
      <div className="flex items-center gap-1 border-r border-white/15 pr-1.5 shrink-0">
        <ColorPicker
          label="Warna"
          onSelectColor={(color) => editor.chain().focus().setColor(color).run()}
          onClearColor={() => editor.chain().focus().unsetColor().run()}
        />
        <ColorPicker
          label="Sorot"
          onSelectColor={(color) => editor.chain().focus().setHighlight({ color }).run()}
          onClearColor={() => editor.chain().focus().unsetHighlight().run()}
        />
      </div>

      {/* Inserts & Table & Divider */}
      <div className="flex items-center gap-0.5 border-r border-white/15 pr-1.5 shrink-0">
        <button
          type="button"
          onClick={onOpenLinkModal}
          className={`p-1.5 rounded-lg cursor-pointer ${
            editor.isActive('link') ? 'bg-[#2DD4BF]/40 text-[#ECFEFF]' : 'hover:bg-white/10 text-[#A5D8D3]'
          }`}
          title="Tautan"
        >
          <LinkIcon size={16} />
        </button>
        <button
          type="button"
          onClick={onOpenImageModal}
          className="p-1.5 rounded-lg hover:bg-white/10 text-[#A5D8D3] hover:text-[#ECFEFF] cursor-pointer"
          title="Gambar"
        >
          <ImageIcon size={16} />
        </button>
        <button
          type="button"
          onClick={onOpenVideoModal}
          className="p-1.5 rounded-lg hover:bg-white/10 text-[#A5D8D3] hover:text-[#ECFEFF] cursor-pointer"
          title="Video"
        >
          <Video size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="p-1.5 rounded-lg hover:bg-white/10 text-[#A5D8D3] hover:text-[#ECFEFF] cursor-pointer"
          title="Tabel"
        >
          <TableIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-lg hover:bg-white/10 text-[#A5D8D3] hover:text-[#ECFEFF] cursor-pointer"
          title="Garis Pemisah"
        >
          <Minus size={16} />
        </button>
      </div>

      {/* Clear Formatting & Fullscreen */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="p-1.5 rounded-lg hover:bg-white/10 text-[#A5D8D3] hover:text-[#ECFEFF] cursor-pointer"
          title="Hapus Format"
        >
          <RemoveFormatting size={16} />
        </button>
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-lg hover:bg-white/10 text-[#A5D8D3] hover:text-[#ECFEFF] cursor-pointer"
          title="Layar Penuh"
        >
          <Maximize size={16} />
        </button>
      </div>
    </div>
  );
};
