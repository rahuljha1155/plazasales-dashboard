"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Pilcrow,
  LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCallback } from "react";

type Props = {
  editor: Editor | null;
};

export function EditorToolbar({ editor }: Props) {
  const handleAddImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement)?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const src = e.target?.result as string;
          if (src) {
            editor?.chain().focus().setImage({ src }).run();
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input  rounded-[2px] p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
      <Button
        variant={editor.isActive("bold") ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("italic") ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("strike") ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough (Ctrl+Shift+X)"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        variant={
          editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"
        }
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1 (Ctrl+Alt+1)"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant={
          editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"
        }
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2 (Ctrl+Alt+2)"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant={
          editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"
        }
        size="icon"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3 (Ctrl+Alt+3)"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("paragraph") ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().setParagraph().run()}
        title="Paragraph (Ctrl+Alt+0)"
      >
        <Pilcrow className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List (Ctrl+Shift+8)"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Ordered List (Ctrl+Shift+7)"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Blockquote (Ctrl+Shift+B)"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("codeBlock") ? "secondary" : "ghost"}
        size="icon"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code Block (Ctrl+Alt+C)"
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* <ToggleGroup type="single" value={editor.isActive({ textAlign: 'left' }) ? 'left' : editor.isActive({ textAlign: 'center' }) ? 'center' : editor.isActive({ textAlign: 'right' }) ? 'right' : editor.isActive({ textAlign: 'justify' }) ? 'justify' : ''} 
        onValueChange={(value) => {
          if (value) editor.chain().focus().setTextAlign(value).run();
          else editor.chain().focus().unsetTextAlign().run();
        }}
        className="gap-0.5"
      >
        <ToggleGroupItem value="left" aria-label="Align left" title="Align Left (Ctrl+Shift+L)">
          <AlignLeft className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center" title="Align Center (Ctrl+Shift+E)">
          <AlignCenter className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right" title="Align Right (Ctrl+Shift+R)">
          <AlignRight className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="justify" aria-label="Align justify" title="Align Justify (Ctrl+Shift+J)">
          <AlignJustify className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup> */}

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={handleAddImage}
        title="Add Image"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive("link") ? "secondary" : "ghost"}
        size="icon"
        onClick={setLink}
        title="Set Link (Ctrl+K)"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      {editor.isActive("link") && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().unsetLink().run()}
          title="Unlink (Ctrl+Shift+K)"
        >
          <Unlink className="h-4 w-4" />
        </Button>
      )}

      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
}
