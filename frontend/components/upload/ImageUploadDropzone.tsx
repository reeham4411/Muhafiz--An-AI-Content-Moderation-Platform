"use client";

import { useCallback, useRef, useState, DragEvent, ChangeEvent } from "react";
import { UploadCloud, X, ImageIcon } from "lucide-react";
import { formatFileSize } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface PendingFile {
  file: File;
  previewUrl: string;
  id: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILES = 10;

export function ImageUploadDropzone({
  files,
  onFilesChange,
  disabled,
}: {
  files: PendingFile[];
  onFilesChange: (files: PendingFile[]) => void;
  disabled?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      setError(null);

      const valid: PendingFile[] = [];
      for (const file of Array.from(newFiles)) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError(`"${file.name}" is not a supported image type.`);
          continue;
        }
        valid.push({
          file,
          previewUrl: URL.createObjectURL(file),
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        });
      }

      const combined = [...files, ...valid];
      if (combined.length > MAX_FILES) {
        setError(`You can upload up to ${MAX_FILES} images at once.`);
        onFilesChange(combined.slice(0, MAX_FILES));
        return;
      }
      onFilesChange(combined);
    },
    [files, onFilesChange]
  );

  const removeFile = (id: string) => {
    const target = files.find((f) => f.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    addFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) inputRef.current?.click();
        }}
        aria-label="Upload images by clicking or dragging files here"
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2",
          isDragging ? "border-teal-600 bg-teal-50" : "border-border-strong bg-surface-muted/40 hover:border-teal-400 hover:bg-teal-50/40",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-soft">
          <UploadCloud className="h-6 w-6 text-teal-600" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-ink">
            <span className="text-teal-700">Click to upload</span> or drag and drop
          </p>
          <p className="mt-1 text-sm text-ink-faint">JPG, PNG, WebP or GIF — up to {MAX_FILES} images</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="sr-only"
          onChange={handleInputChange}
          disabled={disabled}
          aria-hidden="true"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-coral-700" role="alert">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((f) => (
            <div key={f.id} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.previewUrl} alt={f.file.name} className="h-full w-full object-cover" />
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(f.id);
                  }}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label={`Remove ${f.file.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-2 pb-1.5 pt-4">
                <p className="truncate text-[11px] font-medium text-white">{f.file.name}</p>
                <p className="text-[10px] text-white/70">{formatFileSize(f.file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-faint">
          <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {files.length} {files.length === 1 ? "image" : "images"} selected
        </p>
      )}
    </div>
  );
}
