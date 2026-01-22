"use client";

import { useEditor, EditorContent, type Content } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import TextAlignExtension from "@tiptap/extension-text-align";
import PlaceholderExtension from "@tiptap/extension-placeholder";

import { useEffect } from "react";
import { EditorToolbar } from "./EditToolbar";
import { ImageBubbleMenu } from "./imageBubble";

interface TiptapEditorProps {
  content: Content;
  onChange: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
}

const CustomImageExtension = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return { width: attributes.width };
        },
        parseHTML: (element) => element.getAttribute("width"),
      },
      height: {
        // Height will be auto by default or can be set if needed
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return { height: attributes.height };
        },
        parseHTML: (element) => element.getAttribute("height"),
      },
      "data-float": {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes["data-float"]) {
            return {};
          }
          return { "data-float": attributes["data-float"] };
        },
        parseHTML: (element) => element.getAttribute("data-float"),
      },
    };
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: "cursor-pointer transition-all duration-150 ease-in-out", // Added transition
  },
});

export function TiptapEditor({
  content,
  onChange,
  editable = true,
  placeholder = "Start writing...",
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // Disable default hardBreak to allow Shift+Enter for soft line break
        // and Enter for new paragraph
        hardBreak: false,
      }),
      CustomImageExtension,
      LinkExtension.configure({
        openOnClick: false, // Open links on click when not editable
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      TextAlignExtension.configure({
        types: ["heading", "paragraph", "image"], // Allow text align on images
      }),
      PlaceholderExtension.configure({
        placeholder,
      }),
    ],
    content: content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring tiptap",
      },
    },
  });

  useEffect(() => {
    if (editor && editable !== editor.isEditable) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  useEffect(() => {
    if (
      editor &&
      JSON.stringify(content) !== JSON.stringify(editor.getJSON())
    ) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {editable && <EditorToolbar editor={editor} />}
      {editable && <ImageBubbleMenu editor={editor} />}
      <EditorContent editor={editor} className="bg-card rounded-[2px] shadow-sm" />
    </div>
  );
}
