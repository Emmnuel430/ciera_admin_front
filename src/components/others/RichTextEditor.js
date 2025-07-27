// components/RichTextEditor.js
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export default function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const addLink = () => {
    const url = window.prompt("Entrez l'URL");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  const clearFormatting = () => {
    editor.chain().focus().clearNodes().unsetAllMarks().run();
  };

  return (
    <div className="border rounded p-2">
      {/* Barre d'outils */}
      <div className="mb-3 d-flex flex-wrap gap-4">
        <button
          type="button"
          className={`btn btn-sm ${
            editor.isActive("bold") ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>Gras</strong>
        </button>

        <button
          type="button"
          className={`btn btn-sm ${
            editor.isActive("italic") ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>Italique</em>
        </button>

        <button
          type="button"
          className={`btn btn-sm ${
            editor.isActive("underline") ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>Souligné</u>
        </button>

        <button
          type="button"
          className={`btn btn-sm ${
            editor.isActive("bulletList")
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • Liste (puces)
        </button>

        <button
          type="button"
          className={`btn btn-sm ${
            editor.isActive("orderedList")
              ? "btn-primary"
              : "btn-outline-primary"
          }`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. Liste (1,2,3)
        </button>

        <button
          type="button"
          onClick={addLink}
          className="btn btn-outline-primary"
        >
          🔗 Lien
        </button>
        <button
          type="button"
          onClick={clearFormatting}
          className="btn btn-outline-danger"
        >
          ✖ Nettoyer (style)
        </button>
      </div>

      {/* Contenu de l'éditeur */}
      <div className="border rounded p-2" style={{ minHeight: "250px" }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
