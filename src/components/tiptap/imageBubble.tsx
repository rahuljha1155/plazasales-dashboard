"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  ArrowLeftRight,
} from "lucide-react";
import { useState, useEffect } from "react";

type Props = {
  editor: Editor;
};

export function ImageBubbleMenu({ editor }: Props) {
  const [widthInput, setWidthInput] = useState<string>("");

  // Get current attributes within effects or callbacks that need them to ensure freshness
  // const currentAttributes = editor.getAttributes('image'); // This would be from the render scope

  useEffect(() => {
    if (editor.isActive("image")) {
      const imageAttrs = editor.getAttributes("image");
      setWidthInput(imageAttrs.width || "");
    }
    // This effect should re-run if:
    // - The editor instance changes (unlikely in this component's lifecycle).
    // - An image becomes active or inactive.
    // - The selection changes (potentially new image selected).
    // - The document content changes (attributes of the selected image might have changed).
  }, [
    editor,
    editor.isActive("image"),
    editor.state.selection,
    editor.state.doc,
  ]);

  const handleWidthChange = (value: string) => {
    setWidthInput(value);
    // Allow 'auto' or numeric values (interpreted as px or %)
    if (
      value === "" ||
      value.toLowerCase() === "auto" ||
      /^\d+(\.\d+)?(px|%)?$/.test(value)
    ) {
      editor
        .chain()
        .focus()
        .updateAttributes("image", { width: value || null, height: null })
        .run();
    }
  };

  const setFloat = (floatValue: "left" | "right" | null) => {
    editor
      .chain()
      .focus()
      .updateAttributes("image", { "data-float": floatValue })
      .run();
  };

  const setPresetWidth = (width: string | null) => {
    editor
      .chain()
      .focus()
      .updateAttributes("image", { width: width, height: null })
      .run();
    setWidthInput(width || "");
  };

  const deleteImage = () => {
    editor.chain().focus().deleteSelection().run();
  };

  if (!editor) return null;

  // editor.getAttributes('image') should be called here if needed for direct render logic,
  // to ensure it reflects the current state for this render pass.
  const currentImageAttributes = editor.isActive("image")
    ? editor.getAttributes("image")
    : {};

  return (
    <TiptapBubbleMenu
      editor={editor}
      shouldShow={({ editor }) => editor.isActive("image")}
      tippyOptions={{
        duration: 0,
        placement: "bottom",
        appendTo: () => document.body,
      }}
      className="bg-background border border-border shadow-xl rounded-[2px] p-2 flex items-center gap-2"
    >
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          title="Float Left"
          onClick={() => setFloat("left")}
          className={
            currentImageAttributes["data-float"] === "left"
              ? "bg-secondary"
              : ""
          }
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Clear Float"
          onClick={() => setFloat(null)}
          className={
            !currentImageAttributes["data-float"] ? "bg-secondary" : ""
          }
        >
          <AlignCenter className="h-4 w-4" />{" "}
          {/* Icon for 'no float' / 'inline' */}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Float Right"
          onClick={() => setFloat("right")}
          className={
            currentImageAttributes["data-float"] === "right"
              ? "bg-secondary"
              : ""
          }
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => setPresetWidth("25%")}>
          S
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setPresetWidth("50%")}>
          M
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setPresetWidth("75%")}>
          L
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPresetWidth("100%")}
        >
          XL
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPresetWidth(null)}
          title="Original Width"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>
      </div>

      <Input
        type="text"
        value={widthInput}
        onChange={(e) => handleWidthChange(e.target.value)}
        placeholder="Width (e.g. 50% or 300px)"
        className="w-36 h-8 text-xs"
      />

      <Separator orientation="vertical" className="h-6" />
      <Button
        variant="ghost"
        size="icon"
        title="Delete Image"
        onClick={deleteImage}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </TiptapBubbleMenu>
  );
}
