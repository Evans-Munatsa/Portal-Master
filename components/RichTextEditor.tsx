'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useEffect, useCallback, useRef } from 'react';
import { Bold, Italic, List, ImageIcon } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const EditorMenuBar = ({ editor }: { editor: any }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result;
          if (typeof base64 === 'string') {
            editor.chain().focus().setImage({ src: base64 }).run();
          }
        };
        reader.readAsDataURL(file);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    if (!editor) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2 border-b border-slate-200 p-3 bg-slate-50 rounded-t-lg">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('bold') ? 'bg-slate-300 text-slate-800' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('italic') ? 'bg-slate-300 text-slate-800' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded transition-colors ${
            editor.isActive('bulletList') ? 'bg-slate-300 text-slate-800' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-slate-300 my-auto mx-1" />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded transition-colors bg-slate-200 text-slate-700 hover:bg-slate-300"
          title="Upload Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
    );
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full min-w-[200px] h-auto my-4 border border-slate-200 shadow-sm mx-auto',
        },
        allowBase64: true,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none p-5 min-h-[250px] bg-white text-slate-700 prose-img:rounded-xl',
      },
    },
  });

  // Update editor content when ai sets it
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 shadow-sm transition-all bg-white">
      <EditorMenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
