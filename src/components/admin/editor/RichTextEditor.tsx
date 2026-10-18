// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';

import { EditorToolbar } from './EditorToolbar';
import { LinkModal } from './LinkModal';
import { ImageModal } from './ImageModal';
import { VideoModal } from './VideoModal';
import { TableControls } from './TableControls';
import { sanitizeHtml, calculateStats, compressAndUploadImage } from './editorUtils';
import { Minimize } from 'lucide-react';

interface RichTextEditorProps {
  contentHtml: string;
  onChange: (html: string, stats: { words: number; characters: number; readMinutes: number }, plainText: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  contentHtml,
  onChange,
  placeholder = 'Tulis isi materi pembelajaran di sini...',
}) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable heading and blockquote as per revision requirement
        heading: false,
        blockquote: false,
      }),
      Underline,
      Subscript,
      Superscript,
      TextAlign.configure({ types: ['paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      HorizontalRule,
      CharacterCount,
      Placeholder.configure({ placeholder }),
    ],
    content: contentHtml || '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[300px] outline-none border-none ring-0 focus:outline-none focus:ring-0 focus:border-none focus-within:outline-none text-base leading-relaxed',
      },
      handlePaste: (view, event, slice) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              event.preventDefault();
              compressAndUploadImage(file)
                .then((url) => {
                  const html = `<figure style="text-align: center; margin: 1.5em 0;"><img src="${url}" alt="Gambar" style="max-width: 100%; height: auto; border-radius: 0.75rem; display: inline-block; margin-left: auto; margin-right: auto;" /><figcaption style="font-size: 0.875rem; color: #64748b; margin-top: 0.5rem;"></figcaption></figure>`;
                  editor?.chain().focus().insertContent(html).run();
                })
                .catch((err) => {
                  console.warn('Paste image upload failed', err);
                });
              return true;
            }
          }
        }
        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        for (let i = 0; i < files.length; i++) {
          if (files[i].type.startsWith('image/')) {
            event.preventDefault();
            compressAndUploadImage(files[i])
              .then((url) => {
                const html = `<figure style="text-align: center; margin: 1.5em 0;"><img src="${url}" alt="Gambar" style="max-width: 100%; height: auto; border-radius: 0.75rem; display: inline-block; margin-left: auto; margin-right: auto;" /><figcaption style="font-size: 0.875rem; color: #64748b; margin-top: 0.5rem;"></figcaption></figure>`;
                editor?.chain().focus().insertContent(html).run();
              })
              .catch((err) => {
                console.warn('Drop image upload failed', err);
              });
            return true;
          }
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const sanitized = sanitizeHtml(html);
      const stats = calculateStats(sanitized);

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = sanitized;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';

      onChange(sanitized, stats, plainText);
    },
  });

  // Sync content if prop changes externally
  useEffect(() => {
    if (editor && contentHtml !== editor.getHTML()) {
      editor.commands.setContent(contentHtml || '');
    }
  }, [contentHtml, editor]);

  // Handle escape key for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const currentStats = calculateStats(editor?.getHTML() || contentHtml);

  return (
    <div
      className={`flex flex-col rounded-2xl bg-black/25 border border-white/15 overflow-hidden transition-all shadow-lg ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none bg-[#073D39] p-4 max-w-none h-screen'
          : 'w-full min-h-[360px]'
      }`}
    >
      {/* Sticky Toolbar */}
      <div className="flex items-center justify-between border-b border-white/15 bg-[#073D39]/95">
        <EditorToolbar
          editor={editor}
          onOpenLinkModal={() => setIsLinkModalOpen(true)}
          onOpenImageModal={() => setIsImageModalOpen(true)}
          onOpenVideoModal={() => setIsVideoModalOpen(true)}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        />
        {isFullscreen && (
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="mr-3 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#ECFEFF] flex items-center gap-1.5 cursor-pointer"
          >
            <Minimize size={14} />
            <span>Keluar Layar Penuh</span>
          </button>
        )}
      </div>

      {/* Table Controls (if table active) */}
      <div className="px-3 pt-2">
        <TableControls editor={editor} />
      </div>

      {/* Editor Content Area - Clean with NO focus outline/box around text */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white text-slate-900 outline-none border-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:border-none focus-within:outline-none">
        <EditorContent editor={editor} />
      </div>

      {/* Footer Stats Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#052E2B] border-t border-white/15 text-xs text-[#A5D8D3]">
        <div className="flex items-center gap-4">
          <span>Kata: <strong className="text-[#ECFEFF]">{currentStats.words}</strong></span>
          <span>Karakter: <strong className="text-[#ECFEFF]">{currentStats.characters}</strong></span>
          <span>Waktu Baca: <strong className="text-[#ECFEFF]">{currentStats.readMinutes} min</strong></span>
        </div>
        <span className="text-[10px] text-[#A5D8D3]/70">Editor WYSIWYG</span>
      </div>

      {/* Modals */}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onInsert={(url, text, openInNewTab) => {
          if (!editor) return;
          const target = openInNewTab ? '_blank' : '_self';
          editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url, target })
            .insertContent(text)
            .run();
        }}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={(url, caption, align) => {
          if (!editor) return;
          let styleAttr = 'max-width: 100%; height: auto; border-radius: 0.75rem;';
          let containerStyle = 'margin: 1.5em 0;';

          if (align === 'left') {
            containerStyle += ' text-align: left;';
            styleAttr += ' display: inline-block;';
          } else if (align === 'center') {
            containerStyle += ' text-align: center;';
            styleAttr += ' display: inline-block; margin-left: auto; margin-right: auto;';
          } else {
            containerStyle += ' text-align: center;';
            styleAttr += ' width: 100%; display: block;';
          }

          const html = `<figure style="${containerStyle}"><img src="${url}" alt="${caption || 'Gambar'}" style="${styleAttr}" /><figcaption style="font-size: 0.875rem; color: #64748b; margin-top: 0.5rem;">${caption}</figcaption></figure>`;
          editor.chain().focus().insertContent(html).run();
        }}
      />

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onInsert={(embedHtml) => {
          if (!editor) return;
          editor.chain().focus().insertContent(embedHtml).run();
        }}
      />
    </div>
  );
};
