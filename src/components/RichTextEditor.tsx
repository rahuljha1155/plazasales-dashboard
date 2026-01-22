import { useState, useRef, useEffect } from "react";
import {
  useEditor,
  EditorContent,
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import PlaceholderExtension from "@tiptap/extension-placeholder";
import ImageExtension from "@tiptap/extension-image";

import TextAlignExtension from "@tiptap/extension-text-align";
import { api } from "@/services/api";
// Icons
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload as UploadIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// Types
interface ImageData {
  id: string;
  url: string;
  altText: string;
}

// --- ImageNodeView React Component ---
const ImageNodeView = (props: any) => (
  <NodeViewWrapper className="relative group inline-block">
    <img
      src={props.node.attrs.src}
      alt={props.node.attrs.alt || ""}
      className="max-w-full h-auto rounded-sm  cursor-pointer"
      style={{ display: "block", width: props.node.attrs.width || "auto" }}
      draggable={false}
    />
    <button
      type="button"
      data-testid="delete-image-btn"
      className="absolute top-2 right-2 z-20 bg-red-600 text-white rounded-full p-2 shadow-lg border-2 border-white hover:bg-red-700 focus:outline-none"
      style={{
        fontSize: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title="Delete Image"
      onClick={(e) => {
        e.preventDefault();
        if (typeof props.getPos === "function") {
          const pos = props.getPos();
          if (typeof pos === "number") {
            props.editor
              .chain()
              .focus()
              .deleteRange({ from: pos, to: pos + props.node.nodeSize })
              .run();
          }
        }
      }}
    >
      <Trash2 size={20} />
    </button>
    <NodeViewContent />
  </NodeViewWrapper>
);

interface UploadStatus {
  isUploading: boolean;
  message: string;
  type: "success" | "error" | "loading" | "";
}

// API Configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface RichTextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent,
  onChange,
  placeholder,
  className,
}) => {
  // State and refs
  const [characterCount, setCharacterCount] = useState(0);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Record<
    string,
    any
  > | null>(null);
  const [uploadStatus, setUploadStatus] = useState({
    isUploading: false,
    message: "",
    type: "",
  });
  const [recentImages, setRecentImages] = useState<ImageData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Sync editor content with prop (for editing previous data) ---
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-orange-600 underline hover:text-orange-800 cursor-pointer",
        },
      }),
      // --- Custom React Node View for Images ---
      ImageExtension.extend({
        addNodeView() {
          return ReactNodeViewRenderer(ImageNodeView);
        },
      }).configure({
        HTMLAttributes: {
          class: "max-w-full h-auto  shadow-md cursor-pointer",
        },
        allowBase64: false, // Disable base64 for production
      }),
      TextAlignExtension.configure({
        types: ["heading", "paragraph", "image"],
      }),
      PlaceholderExtension.configure({
        placeholder: placeholder || "Write something...",
      }),
    ],
    content: initialContent,
    onUpdate({ editor }) {
      const html = editor.getHTML();
     
      onChange(html);   
      setCharacterCount(editor.getText().length);
    },
    onSelectionUpdate({ editor }) {
      const { selection } = editor.state;
      const node = selection.$from.node();
      if (node?.type.name === "image") {
        setSelectedImage(node.attrs as Record<string, any>);
      } else {
        setSelectedImage(null);
      }
    },
    editorProps: {
      attributes: {
        class: "prose min-h-[300px] focus:outline-none",
      },
      handlePaste: (view, event, slice) => {
        // Handle pasted images
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.indexOf("image") === 0) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              handleImageUpload(file);
            }
          }
        }
        return false;
      },
    },
  });

  // --- Keep editor in sync with content prop ---
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {

      editor.commands.setContent(initialContent || "");
    }
  }, [initialContent, editor]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setUploadStatus({
        isUploading: false,
        message: "Please select an image file",
        type: "error",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({
        isUploading: false,
        message: "Image size should be less than 10MB",
        type: "error",
      });
      return;
    }

    setUploadStatus({
      isUploading: true,
      message: "Uploading image...",
      type: "loading",
    });

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("altText", `Uploaded image: ${file.name}`);
      const response = await api.post(`/images/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const result = response.data;
      if (!response.data) {
        throw new Error(result.error || "Upload failed");
      }

      // Insert image into editor
      editor
        ?.chain()
        .focus()
        .setImage({
          src: result.data.url,
          alt: result.data.altText,
          title: result.data.id,
        })
        .run();

      // Update recent images
      setRecentImages((prev) => [result.data, ...prev.slice(0, 4)]);

      setUploadStatus({
        isUploading: false,
        message: "Image uploaded successfully!",
        type: "success",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadStatus({ isUploading: false, message: "", type: "" });
      }, 3000);
    } catch (error: any) {
      setUploadStatus({
        isUploading: false,
        message: error.message || "Failed to upload image",
        type: "error",
      });
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Insert image from URL
  const insertImageFromUrl = async () => {
    if (!imageUrl.trim()) return;

    try {
      // Basic URL validation
      new URL(imageUrl);

      // Insert image directly (you might want to proxy this through your backend)
      editor?.chain().focus().setImage({ src: imageUrl }).run();

      setImageUrl("");
      setShowImageInput(false);
      setUploadStatus({
        isUploading: false,
        message: "Image inserted successfully!",
        type: "success",
      });

      setTimeout(() => {
        setUploadStatus({ isUploading: false, message: "", type: "" });
      }, 3000);
    } catch (error: any) {
      setUploadStatus({
        isUploading: false,
        message: "Please enter a valid image URL",
        type: "error",
      });
    }
  };

  // Delete image from backend
  const deleteSelectedImage = async () => {
    if (!selectedImage || !selectedImage.title) {
      editor?.commands.deleteSelection();
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/images/${selectedImage?.title ?? ""}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setUploadStatus({
          isUploading: false,
          message: "Image deleted successfully!",
          type: "success",
        });
      }
    } catch (error) {
    }

    editor?.commands.deleteSelection();
    setSelectedImage(null);
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin mr-2" />
        Loading editor...
      </div>
    );
  }

  const buttonClass = (isActive: boolean) =>
    `p-2 rounded transition-colors ${isActive
      ? "bg-primary text-white"
      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
    }`;

  const setLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkInput(false);
      return;
    }

    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const unsetLink = () => {
    editor?.chain().focus().unsetLink().run();
    setShowLinkInput(false);
    setLinkUrl("");
  };

  return (
    <div
      className={`  w-full mx-auto border overflow-hidden rounded-sm mt-2 bg-transparent min-h-[350px]`}
    >
      {/* Upload Status */}
      {uploadStatus.message && (
        <div
          className={`mb-4 p-3 rounded-sm flex items-center gap-2 ${uploadStatus.type === "error"
            ? "bg-red-50 text-red-600 border border-red-200"
            : uploadStatus.type === "success"
              ? "bg-green-50 text-green-600 border border-green-200"
              : "bg-orange-50 text-orange-600 border border-orange-200"
            }`}
        >
          {uploadStatus.type === "loading" && (
            <Loader2 className="animate-spin" size={16} />
          )}
          {uploadStatus.type === "error" && <AlertCircle size={16} />}
          {uploadStatus.type === "success" && <CheckCircle size={16} />}
          {uploadStatus.message}
        </div>
      )}

      <div className="bg-zinc-50 rounded-sm pb-10 overflow-hidden">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 p-3 bg-zinc-50 border-b ">
          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={buttonClass(editor?.isActive("bold"))}
            title="Bold (Ctrl+B)"
          >
            <Bold size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={buttonClass(editor?.isActive("italic"))}
            title="Italic (Ctrl+I)"
          >
            <Italic size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={buttonClass(editor.isActive("underline"))}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={18} />
          </button>

          <div className="w-px h-6 bg-zinc-300 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={buttonClass(editor.isActive("heading", { level: 1 }))}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </button>

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={buttonClass(editor.isActive("heading", { level: 2 }))}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={buttonClass(editor.isActive("bulletList"))}
            title="Bullet List"
          >
            <List size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={buttonClass(editor.isActive("orderedList"))}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={buttonClass(editor.isActive({ textAlign: "left" }))}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={buttonClass(editor.isActive({ textAlign: "center" }))}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={buttonClass(editor.isActive({ textAlign: "right" }))}
            title="Align Right"
          >
            <AlignRight size={18} />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Link */}
          {/* Link */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowLinkInput(!showLinkInput);
                if (!showLinkInput) {
                  const previousUrl = editor.getAttributes("link").href;
                  setLinkUrl(previousUrl || "");
                }
              }}
              className={buttonClass(editor.isActive("link"))}
              title="Add/Edit Link"
            >
              <LinkIcon size={18} />
            </button>

            {showLinkInput && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded-sm shadow-lg z-10 w-64">
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Enter URL"
                  className="w-full p-2 border rounded mb-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setLink();
                  }}
                />
                <div className="flex justify-between">
                  <button
                    onClick={setLink}
                    className="px-3 py-1 bg-primary text-white rounded hover:bg-primary"
                  >
                    Apply
                  </button>
                  <button
                    onClick={unsetLink}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowImageInput(true)}
                className={`${buttonClass(false)} ${uploadStatus.isUploading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                  }`}
                title="Insert image"
                disabled={uploadStatus.isUploading}
              >
                {uploadStatus.isUploading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <ImageIcon size={18} />
                )}
              </button>
            </div>

            {showImageInput && (
              <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-sm  w-full max-w-md">
                  <h3 className="text-lg font-medium mb-4">Insert Image</h3>

                  {/* Upload Status */}
                  {uploadStatus.message && (
                    <div
                      className={`mb-4 p-3 rounded-sm flex items-center gap-2 text-sm ${uploadStatus.type === "error"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : uploadStatus.type === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-orange-50 text-orange-700 border border-orange-200"
                        }`}
                    >
                      {uploadStatus.type === "loading" && (
                        <Loader2 className="animate-spin" size={16} />
                      )}
                      {uploadStatus.type === "error" && (
                        <AlertCircle size={16} />
                      )}
                      {uploadStatus.type === "success" && (
                        <CheckCircle size={16} />
                      )}
                      {uploadStatus.message}
                    </div>
                  )}

                  {/* Recent Images */}
                  {recentImages.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Recent Images
                      </h4>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {recentImages.map((img) => (
                          <div
                            key={img.id}
                            className="relative group cursor-pointer border rounded overflow-hidden aspect-square"
                            onClick={() => {
                              if (uploadStatus.isUploading) return;
                              editor
                                .chain()
                                .focus()
                                .setImage({
                                  src: img.url,
                                  alt: img.altText,
                                  title: img.id,
                                })
                                .run();
                              setShowImageInput(false);
                            }}
                          >
                            <img
                              src={img.url}
                              alt={img.altText}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                              <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                Insert
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Image
                      </label>
                      <div
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-[2px] ${uploadStatus.isUploading ? "opacity-50" : ""
                          }`}
                      >
                        <div className="space-y-1 text-center">
                          {uploadStatus.isUploading ? (
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Loader2 className="animate-spin h-8 w-8 text-primary" />
                              <p className="text-sm text-gray-600">
                                Uploading image...
                              </p>
                            </div>
                          ) : (
                            <>
                              <div className="flex text-sm text-gray-600 justify-center">
                                <label className="relative cursor-pointer bg-white rounded-[2px] font-medium text-orange-600 hover:text-primary focus-within:outline-none">
                                  <span>Upload a file</span>
                                  <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                    ref={fileInputRef}
                                    disabled={uploadStatus.isUploading}
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF up to 10MB
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">OR</span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="image-url"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Image URL
                      </label>
                      <div className="mt-1 flex rounded-[2px] ">
                        <input
                          type="text"
                          id="image-url"
                          className="focus:ring-orange-500 focus:border-orange-500 block w-full rounded-l-md sm:text-sm border-gray-300 p-2 border disabled:bg-gray-50"
                          placeholder="https://example.com/image.jpg"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            !uploadStatus.isUploading &&
                            insertImageFromUrl()
                          }
                          disabled={uploadStatus.isUploading}
                        />
                        <button
                          type="button"
                          onClick={insertImageFromUrl}
                          className={`inline-flex items-center px-3 rounded-r-md border border-l-0 ${uploadStatus.isUploading || !imageUrl.trim()
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-50 text-gray-500 hover:bg-gray-100 focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                            }`}
                          disabled={
                            !imageUrl.trim() || uploadStatus.isUploading
                          }
                        >
                          {uploadStatus.isUploading ? (
                            <Loader2 className="animate-spin h-4 w-4" />
                          ) : (
                            "Insert"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex justify-center w-full rounded-[2px] border border-transparent px-4 py-2 bg-primary text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setShowImageInput(false)}
                      disabled={uploadStatus.isUploading}
                    >
                      {uploadStatus.isUploading ? "Uploading..." : "Close"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* delete image */}
          {selectedImage && (
            <button
              type="button"
              onClick={deleteSelectedImage}
              className={buttonClass(false)}
              title="Delete Image"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* Recent Images */}
        {recentImages.length > 0 && (
          <div className="bg-gray-50/50 p-4 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Recent Images
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {recentImages.map((img) => (
                <div
                  key={img.id}
                  className="relative group flex-shrink-0 rounded-sm overflow-hidden border border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .setImage({
                        src: img.url,
                        alt: img.altText,
                        title: img.id,
                      })
                      .run();
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.altText}
                    className="h-20 w-auto object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute bottom-1 left-1 right-1 text-xs text-white truncate px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.altText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor Content */}
        <div className={`p-4 ${className}`}>
          <EditorContent className="overflow-y-auto" editor={editor} />
        </div>
      </div>
      {/* Character Count */}
      <div className="flex justify-end">
        <div className="bg-gray-50 text-gray-500 text-sm px-3 py-1 rounded-br-md rounded-bl-md">
          {characterCount} characters
        </div>
      </div>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default RichTextEditor;
