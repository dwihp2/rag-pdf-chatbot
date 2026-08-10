"use client";

import { useEffect, useState } from "react";
import { FileText, Trash2, CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatFileSize } from "@/lib/utils";

interface Doc {
  id: string;
  filename: string;
  status: string;
  chunkCount: number;
  fileSize: number;
  uploadedAt: string;
}

export function DocumentList({ refreshKey }: { refreshKey: number }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((data) => {
        setDocs(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground p-4">Loading...</div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center p-8">
        No documents yet. Upload your first PDF above.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {docs.map((doc) => (
        <DocumentItem key={doc.id} doc={doc} onDelete={handleDelete} />
      ))}
    </div>
  );
}

function DocumentItem({
  doc,
  onDelete,
}: {
  doc: Doc;
  onDelete: (id: string) => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleClick = async () => {
    setDeleting(true);
    try {
      await onDelete(doc.id);
    } finally {
      setDeleting(false);
    }
  };

  const statusConfig = getStatusConfig(doc.status);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{doc.filename}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(doc.fileSize)}
            {" · "}
            {doc.status === "completed"
              ? `${doc.chunkCount} chunks`
              : doc.status}
            {" · "}
            {new Date(doc.uploadedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <statusConfig.icon className={cn("h-3 w-3", statusConfig.color)} />
          <span className="capitalize">{doc.status}</span>
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleClick}
          disabled={deleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function getStatusConfig(status: string) {
  switch (status) {
    case "completed":
      return { icon: CheckCircle, color: "text-green-500" };
    case "processing":
      return { icon: Loader2, color: "text-blue-500 animate-spin" };
    case "failed":
      return { icon: XCircle, color: "text-red-500" };
    default:
      return { icon: Loader2, color: "text-muted-foreground" };
  }
}

