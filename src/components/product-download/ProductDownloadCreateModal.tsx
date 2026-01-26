import React, { useState } from "react";
import { useCreateProductDownload } from "@/hooks/useProductDownload";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, X, FileText, Image as ImageIcon, File, Download } from "lucide-react";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { Icon } from "@iconify/react/dist/iconify.js";


interface ProductDownloadCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  productId: string;
}

export function ProductDownloadCreateModal({
  open,
  onOpenChange,
  categoryId,
  productId,
}: ProductDownloadCreateModalProps) {
  const createMutation = useCreateProductDownload();

  const [formData, setFormData] = useState({
    productId: productId,
    categoryId: categoryId,
    title: "",
    summary: "",
    version: "",
    sizeBytes: 0,
    downloadUrl: null as File | null,
    platforms: [] as string[],
    fileType: "",
    deprecated: false,
    sortOrder: 1,
    mirrors: [] as Array<{ label: string; url: string }>,
  });

  const [platformInput, setPlatformInput] = useState("");
  const [mirrorLabel, setMirrorLabel] = useState("");
  const [mirrorUrl, setMirrorUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { getRecaptchaToken } = useRecaptcha()

  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/octet-stream',
    'application/x-msdownload',
    'application/vnd.microsoft.portable-executable',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  const MAX_FILE_SIZE = 500 * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setErrors({ ...errors, downloadUrl: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` });
        return;
      }

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type) && !file.name.match(/\.(exe|msi|dmg|pkg|deb|rpm|apk)$/i)) {
        setErrors({ ...errors, downloadUrl: 'Invalid file type. Please upload a supported file format.' });
        return;
      }

      setFormData({
        ...formData,
        downloadUrl: file,
        sizeBytes: file.size,
        fileType: file.name.split('.').pop() || "",
      });

      const newErrors = { ...errors };
      delete newErrors.downloadUrl;
      setErrors(newErrors);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        setFilePreview('pdf');
      } else {
        setFilePreview('file');
      }
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }


    if (!formData.downloadUrl) {
      newErrors.downloadUrl = 'File is required';
    }

    // Optional but validated fields
    if (formData.summary && formData.summary.length > 500) {
      newErrors.summary = 'Summary must be less than 500 characters';
    }

    if (formData.sortOrder < 1) {
      newErrors.sortOrder = 'Sort order must be at least 1';
    }

    // Validate mirror URLs
    formData.mirrors.forEach((mirror, index) => {
      try {
        new URL(mirror.url);
      } catch {
        newErrors[`mirror_${index}`] = `Invalid URL for mirror: ${mirror.label}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time field validation
  const validateField = (fieldName: string, value: any) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = 'Title is required';
        } else if (value.length < 3) {
          newErrors.title = 'Title must be at least 3 characters';
        } else if (value.length > 200) {
          newErrors.title = 'Title must be less than 200 characters';
        } else {
          delete newErrors.title;
        }
        break;

      case 'summary':
        if (value && value.length > 500) {
          newErrors.summary = 'Summary must be less than 500 characters';
        } else {
          delete newErrors.summary;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleBlur = (fieldName: string) => {
    setTouched({ ...touched, [fieldName]: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      title: true,
      version: true,
      downloadUrl: true,
      summary: true,
    });

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    const recaptchaToken = await getRecaptchaToken('kjbjhbj');
    if (!recaptchaToken) {
      toast.error("Failed to verify reCAPTCHA");
      return;
    }


    try {
      await createMutation.mutateAsync({
        recaptchaToken,
        productId: productId,
        categoryId: categoryId,
        title: formData.title,
        summary: formData.summary,
        version: formData.version,
        sizeBytes: formData.sizeBytes,
        downloadUrl: formData.downloadUrl || "",
        platforms: formData.platforms.length > 0 ? formData.platforms : ["All"],
        fileType: formData.fileType,
        deprecated: formData.deprecated,
        isActive: true,
        sortOrder: formData.sortOrder,
        mirrors: formData.mirrors.length > 0 ? formData.mirrors : undefined,
      });

      toast.success("Download created successfully");
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create download");
    }
  };

  // Get file icon based on type
  const getFileIcon = () => {
    if (!formData.downloadUrl) return <Icon icon={"streamline:new-file"} strokeWidth={1} className="w-16 h-16 text-gray-400" />;

    const fileName = formData.downloadUrl.name;
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <ImageIcon className="w-16 h-16 text-blue-500" />;
    } else if (fileName.match(/\.(pdf)$/i)) {
      return <FileText className="w-16 h-16 text-red-500" />;
    } else if (fileName.match(/\.(zip|rar|7z)$/i)) {
      return <Download className="w-16 h-16 text-primary" />;
    } else {
      return <File className="w-16 h-16 text-gray-500" />;
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: categoryId,
      productId: productId,
      title: "",
      summary: "",
      version: "",
      sizeBytes: 0,
      downloadUrl: null,
      platforms: [],
      fileType: "",
      deprecated: false,
      sortOrder: 1,
      mirrors: [],
    });
    setPlatformInput("");
    setMirrorLabel("");
    setMirrorUrl("");
    setErrors({});
    setFilePreview(null);
    setTouched({});
  };

  const handlePlatformChange = (value: string) => {
    setPlatformInput(value);
    // Split by comma and trim whitespace, filter out empty strings
    const platformsArray = value
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    setFormData({
      ...formData,
      platforms: platformsArray,
    });
  };

  const addMirror = () => {
    if (mirrorLabel && mirrorUrl) {
      // Validate URL
      try {
        new URL(mirrorUrl);
        setFormData({
          ...formData,
          mirrors: [...formData.mirrors, { label: mirrorLabel, url: mirrorUrl }],
        });
        setMirrorLabel("");
        setMirrorUrl("");
        // Clear any mirror errors
        const newErrors = { ...errors };
        Object.keys(newErrors).forEach(key => {
          if (key.startsWith('mirror_')) delete newErrors[key];
        });
        setErrors(newErrors);
      } catch {
        toast.error("Please enter a valid URL for the mirror");
      }
    } else {
      toast.error("Please provide both label and URL for the mirror");
    }
  };

  const removeMirror = (index: number) => {
    setFormData({
      ...formData,
      mirrors: formData.mirrors.filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Product Download</DialogTitle>
          <DialogDescription>
            Add a new downloadable file for this category
          </DialogDescription>
        </DialogHeader>



        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">
                Version
              </Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => {
                  setFormData({ ...formData, version: e.target.value });
                  if (touched.version) validateField('version', e.target.value);
                }}
                onBlur={() => handleBlur('version')}
                placeholder="e.g., 1.0.0"
                className={errors.version && touched.version ? 'border-red-500' : ''}
              />
              {errors.version && touched.version && (
                <p className="text-sm text-red-500">{errors.version}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (touched.title) validateField('title', e.target.value);
              }}
              onBlur={() => handleBlur('title')}
              placeholder="e.g., D18 Series Driver x32"
              required
              className={errors.title && touched.title ? 'border-red-500' : ''}
            />
            {errors.title && touched.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">
              Summary
              <span className="text-sm text-gray-500 ml-2">
                ({formData.summary.length}/500)
              </span>
            </Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => {
                setFormData({ ...formData, summary: e.target.value });
                if (touched.summary) validateField('summary', e.target.value);
              }}
              onBlur={() => handleBlur('summary')}
              placeholder="Brief description of this download"
              rows={3}
              className={errors.summary && touched.summary ? 'border-red-500' : ''}
            />
            {errors.summary && touched.summary && (
              <p className="text-sm text-red-500">{errors.summary}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">
              Upload File <span className="text-red-500">*</span>
            </Label>
            <Input
              id="file"
              type="file"

              onChange={handleFileChange}
              required
              className={errors.downloadUrl && touched.downloadUrl ? 'border-red-500' : '' + " mt-2"}
            />
            {errors.downloadUrl && touched.downloadUrl && (
              <p className="text-sm text-red-500">{errors.downloadUrl}</p>
            )}

            {/* File Preview */}
            {formData.downloadUrl && (
              <div className="mt-4 p-4  rounded-lg bg-muted">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 ">
                    {filePreview && filePreview !== 'pdf' && filePreview !== 'file' ? (
                      <img src={filePreview} alt="Preview" className="w-24 h-24 object-cover rounded" />
                    ) : (
                      <div className="flex items-center justify-center w-24 h-24 bg-white text-zinc-400 rounded ">
                        <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 14 14" className="size-20" ><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.3}
                        ><path d="M12.5 12.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1H9L12.5 4z"></path><path d="M8.5.5v4h4"></path></g></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-primary truncate">{formData.downloadUrl.name}</p>
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <p>Size: {(formData.sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
                      <p>Type: {formData.fileType.toUpperCase()}</p>
                      <p>Last Modified: {new Date(formData.downloadUrl.lastModified).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="platforms">
              Platforms
              <span className="text-sm text-gray-500 ml-2">(comma-separated)</span>
            </Label>
            <Input
              id="platforms"
              className="mt-2"
              value={platformInput}
              onChange={(e) => handlePlatformChange(e.target.value)}
              placeholder="e.g., Windows, macOS, Linux"
            />
            {formData.platforms.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.platforms.map((platform, index) => (
                  <div
                    key={index}
                    className="bg-green-100 text-green-500 px-3 py-1 rounded-xs text-sm"
                  >
                    {platform}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mirror Links</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={mirrorLabel}
                onChange={(e) => setMirrorLabel(e.target.value)}
                placeholder="Mirror label"
              />

              <div className="flex gap-2 items-center">
                <Input
                  value={mirrorUrl}
                  onChange={(e) => setMirrorUrl(e.target.value)}
                  placeholder="Mirror URL"
                />
                <Button type="button" onClick={addMirror} variant="outline" size="sm" className="hover:text-white hover:bg-primary border border-primary bg-primary/20 text-primary">
                  <Icon icon={"lets-icons:check-fill"} className="w-4 h-4 mr-2 " />
                  Confirm
                </Button>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              {formData.mirrors.map((mirror, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 p-2 rounded"
                >
                  <div>
                    <p className="font-medium text-sm">{mirror.label}</p>
                    <p className="text-xs text-gray-600">{mirror.url}</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeMirror(index)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 1 })
              }
            />
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="deprecated"
                checked={formData.deprecated}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, deprecated: checked })
                }
              />
              <Label htmlFor="deprecated">Deprecated</Label>
            </div>
          </div>



          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || Object.keys(errors).length > 0}>
              {createMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create Download
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
