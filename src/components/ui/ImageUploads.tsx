import { useRef, useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { X, Image as ImageIcon, Info } from "lucide-react";

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface Props {
  name: string;
  label: string;
  previewUrl?: string | null;
  onChange: any;
}

export function ImageUploadField({ name, label, previewUrl, onChange }: Props) {
  const { control } = useFormContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [newPreview, setNewPreview] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<File | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = () => {
    setNewPreview(null);
    setFileInfo(null);
    onChange({ target: { files: null } }); // Clear the input
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex gap-8 mt-2  rounded-sm  bg-white/5 max-w-3xl">
          <div
            className="flex flex-col  items-center justify-center border-2 border-dashed border-gray-300 z-[45] rounded-[2px] p-1 cursor-pointer h-40 aspect-[16/9] relative"
            onClick={handleClick}
          >

            {/* Show existing preview URL if available */}
            {previewUrl && !newPreview && (
              <img
                src={previewUrl}
                alt="Existing preview"
                className="w-full z-[45] h-full object-cover rounded-[2px]"
              />
            )}

            {/* Show new preview if uploaded */}
            {newPreview && (
              <img
                src={newPreview}
                alt="New preview"
                className="w-full z-[60]  h-full object-cover rounded-[2px]"
              />
            )}

            {/* Show placeholder if no image */}
            {!previewUrl && !newPreview && (
              <div className="text-center text-gray-500">
                <ImageIcon className="mx-auto mb-2" />
                <p className="text-2xl">Image Info</p>
              </div>
            )}

            {/* Remove button */}
            {(previewUrl || newPreview) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-2 right-2 z-[70] bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex-1">
            {fileInfo && (
              <>
                <div className="font-semibold mb-2 text-2xl">{label}</div>

                <div className="text-xl font-semibold mb-1">
                  Name: <span className="text-primary">{fileInfo.name}</span>
                </div>
                <div className="text-xl font-semibold mb-1">
                  Size:{" "}
                  <span className="text-primary">
                    {(fileInfo.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </>
            )}

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                onChange(e);
                if (e.target.files?.[0]) {
                  const file = e.target.files[0];
                  setFileInfo(file);
                  setNewPreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>
        </div>
      )}
    />
  );
}
