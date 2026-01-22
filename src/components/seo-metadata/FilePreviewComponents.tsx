import { X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";

// Image Preview Component
export function ImagePreview({ files, onRemove }: { files: File[], onRemove: (index: number) => void }) {
  return (
    <div className="grid grid-cols-4 gap-4 mt-2">
      {files.map((file, index) => (
        <div key={index} className="relative group">
          <img
            src={URL.createObjectURL(file)}
            alt={`Preview ${index + 1}`}
            className="w-full h-24 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-xs text-muted-foreground mt-1 truncate">{file.name}</p>
        </div>
      ))}
    </div>
  );
}

// Existing Image Preview (from URL)
export function ExistingImagePreview({ urls, onRemove }: { urls: string[], onRemove?: (index: number) => void }) {
  return (
    <div className="grid grid-cols-4 gap-4 mt-2">
      {urls.map((url, index) => (
        <div key={index} className="relative group">
          <img
            src={url}
            alt={`Existing ${index + 1}`}
            className="w-full h-24 object-cover rounded-lg border"
          />
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline mt-1 block truncate"
          >
            View full
          </a>
        </div>
      ))}
    </div>
  );
}

// File Preview Component
export function FilePreview({ file, onRemove, icon }: { file: File, onRemove: () => void, icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border mt-2">
      {icon || <FileText className="w-5 h-5 text-gray-600" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-8 w-8"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Existing File Preview (from URL)
export function ExistingFilePreview({ 
  url, 
  filename, 
  onRemove, 
  icon 
}: { 
  url: string, 
  filename: string, 
  onRemove?: () => void, 
  icon?: React.ReactNode 
}) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border mt-2">
      {icon || <FileText className="w-5 h-5 text-gray-600" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{filename}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          Download / View
        </a>
      </div>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
