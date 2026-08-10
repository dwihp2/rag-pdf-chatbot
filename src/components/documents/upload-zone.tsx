"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function UploadZone({
  onUpload,
}: {
  onUpload: (file: File) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        if (!file.name.toLowerCase().endsWith(".pdf")) continue;
        setUploading(true);
        try {
          await onUpload(file);
        } finally {
          setUploading(false);
        }
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25",
        uploading && "opacity-50 pointer-events-none"
      )}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div className="space-y-2">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">
            Uploading and processing...
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-sm font-medium">
            {isDragActive
              ? "Drop PDFs here"
              : "Drag & drop PDFs here, or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground">
            PDF only, up to 50MB each
          </p>
        </div>
      )}
    </div>
  );
}
