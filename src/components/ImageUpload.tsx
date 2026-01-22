import { Input } from "@/components/ui/input"
import { Icon } from "@iconify/react/dist/iconify.js"
import { X } from "lucide-react"
import { useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ImageUploadProps {
  preview?: string
  onFileChange: (file: File | null) => void
  onRemove?: () => void
  accept?: string
  maxSize?: number // in MB
  className?: string
  height?: string
  label?: string
  placeholder?: string
  icon?: string
  aspectRatio?: string
  multiple?: boolean
  showFileName?: boolean
}

export function ImageUpload({
  preview,
  onFileChange,
  onRemove,
  accept = "image/*",
  maxSize = 2,
  className,
  height = "h-52",
  label = "Upload Image",
  placeholder = "Click to upload image",
  icon = "solar:upload-line-duotone",
  aspectRatio,
  multiple = false,
  showFileName = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string>("")

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (file) {
        validateAndSetFile(file)
      }
    },
    [maxSize],
  )

  const validateAndSetFile = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`${file.name} exceeds ${maxSize}MB limit.`)
      return
    }

    setFileName(file.name)
    onFileChange(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFileName("")
    onFileChange(null)
    onRemove?.()
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative w-full rounded-sm border-2 border-dashed border-zinc-300 hover:border-orange-500/50 transition-colors bg-zinc-50/50",
          height,
          isDragging && "border-orange-500 bg-orange-50/50",
          preview && "border-solid"
        )}
      >
        {!preview && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none z-10">
             <div className="bg-neutral-200/80 text-neutral-400 p-3 rounded-full mb-3">
              <Icon icon="solar:gallery-add-line-duotone" width="24" height="24" />
            </div>
            <p className="text-sm !text-zinc-600 mb-1">
              <span className="font-medium text-neutral-500">{placeholder}</span>
            </p>
            <p className="text-xs font-medium text-neutral-400">
              PNG or JPG (max. {maxSize}MB)
            </p>
          </div>
        )}

        {preview && (
          <div className="relative h-full flex items-center justify-center p-4">
            <img
              src={preview}
              alt="Preview"
              className={cn(
                "max-h-full max-w-full object-contain",
                aspectRatio && `aspect-${aspectRatio}`
              )}
            />
            <button
              type="button"
              className="absolute top-2 right-2 hover:scale-105 cursor-pointer bg-red-500 hover:bg-red-600 text-white p-1.5  transition-all shadow-lg z-50"
              onClick={handleRemoveClick}
            >
              <Icon icon={"ic:baseline-delete"} className="h-4 w-4" />
            </button>
          </div>
        )}

        {!preview && (
          <Input
            type="file"
            accept={accept}
            multiple={multiple}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-20"
            onChange={handleFileInputChange}
          />
        )}
      </div>

      {showFileName && fileName && (
        <p className="mt-2 text-sm text-zinc-600 truncate">{fileName}</p>
      )}
    </div>
  )
}

// Multi-image upload component
interface MultiImageUploadProps {
  previews: string[]
  onFilesChange: (files: File[]) => void
  onRemove: (index: number) => void
  accept?: string
  maxSize?: number
  maxImages?: number
  className?: string
  height?: string
  label?: string
  placeholder?: string
}

export function MultiImageUpload({
  previews,
  onFilesChange,
  onRemove,
  accept = "image/*",
  maxSize = 2,
  maxImages = 5,
  className,
  height = "h-64",
  label = "Upload Images",
  placeholder = "Click to upload banners",
}: MultiImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      validateAndSetFiles(files)
    },
    [maxSize, maxImages, previews],
  )

  const validateAndSetFiles = (files: File[]) => {
    if (previews.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    const validFiles = files.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${maxSize}MB limit.`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      onFilesChange(validFiles)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    validateAndSetFiles(files)
  }

  const handleRemoveClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    onRemove(index)
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Image Counter and Status */}
      {previews.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-100 text-primary px-2.5 py-1 rounded-full text-xs font-semibold">
              {previews.length} / {maxImages}
            </div>
            <span className="text-xs text-gray-600">
              {previews.length === maxImages ? "Maximum images uploaded" : `${maxImages - previews.length} more available`}
            </span>
          </div>
          {previews.length < maxImages && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Icon icon="solar:info-circle-line-duotone" width="14" height="14" />
              Max {maxSize}MB per image
            </span>
          )}
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative w-full rounded-lg border-2 border-dashed transition-all duration-200",
          previews.length === 0 && height,
          previews.length === 0 && "border-zinc-300 hover:border-primary/50 bg-zinc-50/50",
          previews.length > 0 && "border-zinc-200 bg-white",
          isDragging && "border-primary bg-primary/5 scale-[1.01]"
        )}
      >
        {/* Empty State */}
        {previews.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none z-10">
            <div className="bg-zinc-100 text-primary p-4 rounded-full mb-4">
              <Icon icon="solar:gallery-add-bold-duotone" width="32" height="32" />
            </div>
            <p className="text-base font-semibold text-gray-700 mb-2">
              {placeholder}
            </p>
            <p className="text-sm text-gray-500 mb-1">
              or drag and drop images here
            </p>
            <p className="text-xs font-medium text-gray-400">
              PNG or JPG • Max {maxSize}MB each • Up to {maxImages} images • Aspect Ratio 16:9
            </p>
          </div>
        )}

        {/* Image Grid with Previews */}
        {previews.length > 0 && (
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {previews.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50 group hover:border-primary/50 transition-all duration-200"
                >
                  <img
                    src={url}
                    alt={`Banner ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {/* Image Number Badge */}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                    #{idx + 1}
                  </div>
                  {/* Remove Button */}
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 cursor-pointer hover:scale-105 hover:bg-red-600 text-white p-1.5  transition-all shadow-lg opacity-0 group-hover:opacity-100 z-50"
                    onClick={(e) => handleRemoveClick(e, idx)}
                  >
                    <Icon icon={"ic:baseline-delete"} className="h-4 w-4" />
                  </button>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200" />
                </div>
              ))}

              {/* Add More Button */}
              {previews.length < maxImages && (
                <label className="relative aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-primary/50 bg-gray-50/50 hover:bg-primary/5 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center group">
                  <div className="text-center">
                    <div className="bg-zinc-100 group-hover:bg-primary/20 text-primary p-3 rounded-full mb-2 mx-auto inline-flex transition-colors">
                      <Icon icon="solar:add-circle-bold-duotone" width="24" height="24" />
                    </div>
                    <p className="text-xs font-semibold text-gray-600 group-hover:text-primary transition-colors">
                      Add More
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {maxImages - previews.length} left
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept={accept}
                    multiple
                    className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                    onChange={handleFileInputChange}
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {/* File Input for Empty State */}
        {previews.length === 0 && (
          <Input
            type="file"
            accept={accept}
            multiple
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-20"
            onChange={handleFileInputChange}
          />
        )}
      </div>

      {/* Helper Text */}
      {isDragging && (
        <div className="text-center">
          <p className="text-sm font-semibold text-primary animate-pulse">
            Drop images here to upload
          </p>
        </div>
      )}
    </div>
  )
}
