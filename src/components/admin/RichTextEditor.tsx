import { useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Italic, Underline, Link2, List, ListOrdered, Heading3, Heading4, Quote, Code, ImagePlus, Loader2 } from "lucide-react";
import { uploadImageFile, type UploadImageType } from "../../lib/admin/uploadImage.ts";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** Needed to upload images through the Insert Image button. */
  token: string;
  imageType: UploadImageType;
}

const toolbarButtonClass =
  "rounded-md border border-border p-2 text-text-secondary transition-colors duration-150 hover:border-border-strong hover:text-text-primary data-[active=true]:border-accent data-[active=true]:text-accent disabled:cursor-not-allowed disabled:opacity-40";

export default function RichTextEditor({ value, onChange, token, imageType }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [3, 4] },
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        gapcursor: false,
        dropcursor: false,
      }),
      Image.configure({ allowBase64: false, HTMLAttributes: { class: "rounded-md" } }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[120px] w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent [&_a]:text-accent [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border-strong [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-surface-raised [&_code]:px-1 [&_h3]:text-h4 [&_h4]:text-body [&_h4]:font-medium [&_img]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5",
      },
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { publicUrl } = await uploadImageFile(token, imageType, file);
      const alt = window.prompt("Alt text (required for accessibility)", "") ?? "";
      editor.chain().focus().setImage({ src: publicUrl, alt: alt.trim() || file.name }).run();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
      <div className="mb-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive("bold")}
          className={toolbarButtonClass}
          aria-label="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive("italic")}
          className={toolbarButtonClass}
          aria-label="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          data-active={editor.isActive("underline")}
          className={toolbarButtonClass}
          aria-label="Underline"
        >
          <Underline size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          data-active={editor.isActive("heading", { level: 3 })}
          className={toolbarButtonClass}
          aria-label="Heading 3"
        >
          <Heading3 size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          data-active={editor.isActive("heading", { level: 4 })}
          className={toolbarButtonClass}
          aria-label="Heading 4"
        >
          <Heading4 size={14} />
        </button>
        <button
          type="button"
          onClick={setLink}
          data-active={editor.isActive("link")}
          className={toolbarButtonClass}
          aria-label="Link"
        >
          <Link2 size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive("bulletList")}
          className={toolbarButtonClass}
          aria-label="Bullet list"
        >
          <List size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive("orderedList")}
          className={toolbarButtonClass}
          aria-label="Numbered list"
        >
          <ListOrdered size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          data-active={editor.isActive("blockquote")}
          className={toolbarButtonClass}
          aria-label="Blockquote"
        >
          <Quote size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          data-active={editor.isActive("code")}
          className={toolbarButtonClass}
          aria-label="Inline code"
        >
          <Code size={14} />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={toolbarButtonClass}
          aria-label="Insert image"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
