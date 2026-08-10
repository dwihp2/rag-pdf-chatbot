"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Folder,
  FileText,
  MessageSquare,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface Doc {
  id: string;
  filename: string;
  status: string;
  chunkCount: number;
}

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  documents: { document: Doc }[];
  chats: Chat[];
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [allDocs, setAllDocs] = useState<Doc[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  const fetchCollection = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/collections/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setCollection(data);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAllDocs = useCallback(async () => {
    const res = await fetch("/api/documents");
    const data = await res.json();
    setAllDocs(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetchCollection();
    fetchAllDocs();
  }, [fetchCollection, fetchAllDocs]);

  const handleAddDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDocs.size === 0) return;
    setAdding(true);
    try {
      // Add documents one by one since API expects single relation
      await Promise.all(
        Array.from(selectedDocs).map((documentId) =>
          fetch(`/api/collections/${id}/documents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentId }),
          })
        )
      );
      toast.success("Documents added");
      setSelectedDocs(new Set());
      setAddOpen(false);
      fetchCollection();
    } catch {
      toast.error("Failed to add documents");
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    const res = await fetch(`/api/collections/${id}/documents/${documentId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Failed to remove document");
      return;
    }
    toast.success("Document removed");
    fetchCollection();
  };

  const handleDeleteCollection = async () => {
    const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete collection");
      return;
    }
    toast.success("Collection deleted");
    router.push("/collections");
  };

  const toggleDoc = (docId: string) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId);
      else next.add(docId);
      return next;
    });
  };

  const existingDocIds = new Set(
    collection?.documents.map((d) => d.document.id) ?? []
  );
  const availableDocs = allDocs.filter((d) => !existingDocIds.has(d.id));

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <p className="text-muted-foreground">Collection not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href="/collections">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Folder className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{collection.name}</h1>
          </div>
          {collection.description && (
            <p className="text-muted-foreground mt-1">
              {collection.description}
            </p>
          )}
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteCollection}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </CardTitle>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleAddDocuments}>
                <DialogHeader>
                  <DialogTitle>Add documents</DialogTitle>
                  <DialogDescription>
                    Select documents to add to this collection.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-80 overflow-y-auto space-y-2">
                  {availableDocs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No available documents. Upload more in the Documents page.
                    </p>
                  ) : (
                    availableDocs.map((doc) => (
                      <label
                        key={doc.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedDocs.has(doc.id)}
                          onCheckedChange={() => toggleDoc(doc.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {doc.filename}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.chunkCount} chunks
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={adding || selectedDocs.size === 0}
                  >
                    {adding ? "Adding..." : `Add ${selectedDocs.size}`}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {collection.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No documents in this collection yet.
            </p>
          ) : (
            <div className="space-y-2">
              {collection.documents.map(({ document: doc }) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate">{doc.filename}</span>
                    <Badge variant="secondary" className="text-xs">
                      {doc.chunkCount} chunks
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleRemoveDocument(doc.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chats
          </CardTitle>
        </CardHeader>
        <CardContent>
          {collection.chats.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No chats in this collection yet.
            </p>
          ) : (
            <div className="space-y-2">
              {collection.chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="flex items-center justify-between p-2 rounded border hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-medium">{chat.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
