"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder, Trash2, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  _count: { documents: number; chats: number };
}

export function CollectionCard({
  collection,
  onDelete,
}: {
  collection: Collection;
  onDelete: (id: string) => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    try {
      await onDelete(collection.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Link href={`/collections/${collection.id}`} className="block group">
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Folder className="h-5 w-5 shrink-0 text-primary" />
              <h3 className="font-semibold truncate">{collection.name}</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {collection.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {collection.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {collection._count.documents} docs
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {collection._count.chats} chats
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
