'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useEffect, useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo2,
  Redo2,
  Eraser,
  Sparkles,
  Wand2,
  FileText,
  Code,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  showAIAssistant?: boolean;
}

export default function RichTextEditor({ content, onChange, showAIAssistant = false }: RichTextEditorProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full min-w-[200px] h-auto my-4 border border-slate-800 shadow-md mx-auto',
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
        class: 'prose prose-invert prose-sm sm:prose-base max-w-none focus:outline-none p-5 min-h-[300px] bg-slate-900 text-slate-100 prose-img:rounded-xl leading-relaxed',
      },
    },
  });

  // Update editor content when external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-xl">
        <Loader2 className="w-6 h-6 text-[#7145FF] animate-spin" />
      </div>
    );
  }

  const handleAIRewrite = async (mode: 'proofread' | 'expand' | 'summarize') => {
    const currentHtml = editor.getHTML();
    if (!currentHtml || currentHtml === '<p></p>') {
      setAiError('Please write some content first so the AI model has text to analyze.');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    setAiSuccess(null);

    try {
      const response = await fetch('/api/superadmin/ai-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlContent: currentHtml, mode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to polish text.');
      }

      if (data.rewritten) {
        editor.commands.setContent(data.rewritten);
        onChange(data.rewritten);
        setAiSuccess(
          mode === 'proofread'
            ? '✨ Spelling and grammar corrected perfectly!'
            : mode === 'expand'
            ? '🚀 Job description expanded professionally!'
            : '📝 Summarized into structured bullet points!'
        );
        setTimeout(() => setAiSuccess(null), 4000);
      } else {
        throw new Error('No rewritten content returned from Gemini.');
      }
    } catch (err: any) {
      console.error('[RichTextEditor AI] error:', err);
      setAiError(err.message || 'Connecting to Gemini failed. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#7145FF]/40 focus-within:border-[#7145FF]/80 shadow-2xl transition-all bg-slate-950">
      
      {/* WordPress-Inspired Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 p-2.5 bg-slate-900/60 rounded-t-xl select-none">
        
        {/* Basic Texts */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('bold')
              ? 'bg-[#7145FF] text-white font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('italic')
              ? 'bg-[#7145FF] text-white font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('strike')
              ? 'bg-[#7145FF] text-white font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-[#7145FF] text-white font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-[#7145FF] text-white font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('bulletList')
              ? 'bg-[#7145FF] text-white font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('orderedList')
              ? 'bg-[#7145FF] text-white font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Ordered list"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Quotes, Codes, Hr */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('blockquote')
              ? 'bg-[#7145FF] text-white font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Blockquote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('codeBlock')
              ? 'bg-[#7145FF] text-white font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Code Block"
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Horizontal Rule"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Clear formatting, Undo, Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Clear formatting"
        >
          <Eraser className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Undo"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Redo"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* AI Assistant Ribbon - ONLY if enabled */}
      {showAIAssistant && (
        <div className="bg-slate-900 border-b border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Sparkles className="w-4 h-4 text-[#7145FF] animate-pulse" />
            <span>Gemini HR Co-Writer</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={aiLoading}
              onClick={() => handleAIRewrite('proofread')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700 disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer font-semibold shadow-sm"
            >
              <Wand2 className="w-3.5 h-3.5 text-[#7145FF]" />
              <span>Fix Grammar & Autocorrect</span>
            </button>

            <button
              type="button"
              disabled={aiLoading}
              onClick={() => handleAIRewrite('expand')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700 disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer font-semibold shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Expand & Elevate</span>
            </button>

            <button
              type="button"
              disabled={aiLoading}
              onClick={() => handleAIRewrite('summarize')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-700 disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer font-semibold shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Format Checklist</span>
            </button>
          </div>
        </div>
      )}

      {/* Error & Success indicators */}
      {aiError && (
        <div className="px-4 py-2 border-b border-rose-950 bg-rose-950/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{aiError}</p>
        </div>
      )}

      {aiSuccess && (
        <div className="px-4 py-2 border-b border-[#7145FF]/20 bg-[#7145FF]/10 text-slate-100 text-xs flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            ✓
          </div>
          <p>{aiSuccess}</p>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="relative min-h-[300px]">
        {aiLoading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 z-10 transition">
            <Loader2 className="w-7 h-7 text-[#7145FF] animate-spin" />
            <p className="text-xs text-slate-400 font-mono">Gemini is rewriting, polishing & correcting grammar...</p>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>

    </div>
  );
}
