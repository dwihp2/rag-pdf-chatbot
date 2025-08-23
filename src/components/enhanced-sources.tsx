'use client';

import React from 'react';
import {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source
} from '@/components/ui/ai-elements/source';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookIcon, FileTextIcon } from 'lucide-react';

interface EnhancedSource {
  filename: string;
  page: number;
  text: string;
  score?: number;
}

interface EnhancedSourcesProps {
  sources: EnhancedSource[];
  displayMode?: 'collapsible' | 'carousel' | 'grid';
  showScores?: boolean;
}

export function EnhancedSources({ 
  sources, 
  displayMode = 'collapsible',
  showScores = false 
}: EnhancedSourcesProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  const renderSourceCard = (source: EnhancedSource, index: number) => (
    <Card key={index} className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileTextIcon className="h-4 w-4" />
            {source.filename}
          </CardTitle>
          {showScores && source.score && (
            <Badge variant="secondary" className="text-xs">
              {(source.score * 100).toFixed(0)}%
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          Page {source.page}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {source.text.length > 150 ? source.text.substring(0, 147) + '...' : source.text}
        </p>
      </CardContent>
    </Card>
  );

  // Collapsible mode (original behavior)
  if (displayMode === 'collapsible') {
    return (
      <Sources>
        <SourcesTrigger count={sources.length} />
        <SourcesContent>
          {sources.map((source, index) => (
            <Source
              key={index}
              title={`${source.filename} (p.${source.page})`}
              href={`#${source.filename.replace(/[^a-zA-Z0-9]/g, '-')}-${source.page}`}
            >
              <div className="flex items-center gap-2">
                <BookIcon className="h-4 w-4" />
                <span className="block font-medium">
                  {source.filename} (p.{source.page})
                  {showScores && source.score && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {(source.score * 100).toFixed(0)}%
                    </Badge>
                  )}
                </span>
              </div>
            </Source>
          ))}
        </SourcesContent>
      </Sources>
    );
  }

  // Carousel mode
  if (displayMode === 'carousel') {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <BookIcon className="h-5 w-5 text-primary" />
          <h4 className="font-medium text-sm">
            Sources ({sources.length})
          </h4>
        </div>
        <Carousel className="w-full" opts={{ align: "start", loop: false }}>
          <CarouselContent className="-ml-2 md:-ml-4">
            {sources.map((source, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                {renderSourceCard(source, index)}
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-2 mt-4">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    );
  }

  // Grid mode
  if (displayMode === 'grid') {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <BookIcon className="h-5 w-5 text-primary" />
          <h4 className="font-medium text-sm">
            Sources ({sources.length})
          </h4>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((source, index) => renderSourceCard(source, index))}
        </div>
      </div>
    );
  }

  return null;
}
