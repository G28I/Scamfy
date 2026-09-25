import * as React from "react";
import { UploadCloud, File, AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EvidenceDropzoneProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesSelected?: (files: File[]) => void;
  acceptedFileTypes?: string[]; // e.g. ["image/png", "image/jpeg", "application/pdf"]
  maxSizeBytes?: number; // e.g. 10 * 1024 * 1024 (10MB)
  isUploading?: boolean;
  uploadProgress?: number; // 0 to 100
  error?: string;
  disabled?: boolean;
  maxFiles?: number;
}

export function EvidenceDropzone({
  onFilesSelected,
  acceptedFileTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"],
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  isUploading = false,
  uploadProgress = 0,
  error,
  disabled = false,
  maxFiles = 5,
  className,
  ...props
}: EvidenceDropzoneProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateAndAddFiles = (newFiles: FileList | File[]) => {
    setValidationError(null);
    const valid: File[] = [];
    const filesArray = Array.from(newFiles);

    for (const file of filesArray) {
      if (!file) continue;

      if (acceptedFileTypes.length > 0 && !acceptedFileTypes.includes(file.type)) {
        setValidationError(`Unsupported file type: ${file.name}. Only PNG, JPG, WebP, and PDF are permitted.`);
        return;
      }

      if (file.size > maxSizeBytes) {
        setValidationError(`File too large: ${file.name} (${formatFileSize(file.size)}). Max allowed is ${formatFileSize(maxSizeBytes)}.`);
        return;
      }

      valid.push(file);
    }

    if (selectedFiles.length + valid.length > maxFiles) {
      setValidationError(`Maximum of ${maxFiles} files can be attached at once.`);
      return;
    }

    const updated = [...selectedFiles, ...valid];
    setSelectedFiles(updated);
    onFilesSelected?.(updated);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onFilesSelected?.(updated);
  };

  const activeError = error || validationError;

  return (
    <div className={cn("w-full space-y-3", className)} {...props}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer select-none",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border bg-card hover:border-border/80 hover:bg-muted/30",
          disabled && "pointer-events-none opacity-50 bg-muted/20 cursor-not-allowed",
          activeError && "border-destructive bg-destructive/5"
        )}
        role="region"
        aria-label="Evidence File Dropzone"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFileTypes.join(",")}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
          <UploadCloud className="h-6 w-6" aria-hidden="true" />
        </div>

        <h4 className="text-sm font-semibold text-foreground mb-1">
          Drag & drop evidence files or <span className="text-primary underline">browse</span>
        </h4>
        <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
          Attach transaction receipts, chat screenshots, or bank statements (PNG, JPG, PDF up to{" "}
          {formatFileSize(maxSizeBytes)} each).
        </p>

        {isUploading && (
          <div className="mt-4 w-full max-w-xs space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Uploading evidence...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {activeError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs font-medium text-destructive" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}

      {/* Selected File List */}
      {selectedFiles.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card text-xs">
          {selectedFiles.map((file, idx) => (
            <li key={`${file.name}-${idx}`} className="flex items-center justify-between p-2.5">
              <div className="flex items-center gap-2 truncate">
                <File className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate font-medium text-foreground">{file.name}</span>
                <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                {!disabled && !isUploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    className="text-muted-foreground hover:text-destructive focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    aria-label={`Remove file ${file.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
