"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { UploadZone } from "@/components/documents/upload-zone";
import { DocumentList } from "@/components/documents/document-list";

export default function DocumentsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpload = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      toast.success(`${file.name} uploaded successfully`);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload document"
      );
      throw err;
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Documents</h1>
        <p className="text-muted-foreground text-sm">
          Upload PDFs to build your knowledge base. Chunks are embedded and
          searchable instantly.
        </p>
      </div>
      <UploadZone onUpload={handleUpload} />
      <DocumentList refreshKey={refreshKey} />
    </div>
  );
}
