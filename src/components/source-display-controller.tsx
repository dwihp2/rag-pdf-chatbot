'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GridIcon,
  ListIcon,
  SlidersHorizontalIcon,
  EyeIcon
} from 'lucide-react';
import { EnhancedSources } from './enhanced-sources';
import { cn } from '@/lib/utils';

interface Source {
  filename: string;
  page: number;
  text: string;
  score?: number;
}

interface SourceDisplayControllerProps {
  sources: Source[];
  defaultMode?: 'collapsible' | 'carousel' | 'grid';
  show?: boolean;
}

/**
 * Component that provides user controls for switching between different source display modes
 */
export function SourceDisplayController({
  sources,
  defaultMode = 'collapsible',
  show = false
}: SourceDisplayControllerProps) {
  const [displayMode, setDisplayMode] = useState<SourceDisplayControllerProps['defaultMode']>(defaultMode);
  const [showScores, setShowScores] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      {/* Display Mode Controls */}
      <div className={cn('flex items-center justify-between gap-2 pb-2 border-b', { hidden: !show })}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Display Mode:
          </span>
          <Tabs value={displayMode} onValueChange={(value) => setDisplayMode(value as 'collapsible' | 'carousel' | 'grid')} className="w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="collapsible" className="flex items-center gap-1">
                <ListIcon className="h-3 w-3" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger value="carousel" className="flex items-center gap-1">
                <SlidersHorizontalIcon className="h-3 w-3" />
                <span className="hidden sm:inline">Carousel</span>
              </TabsTrigger>
              <TabsTrigger value="grid" className="flex items-center gap-1">
                <GridIcon className="h-3 w-3" />
                <span className="hidden sm:inline">Grid</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowScores(!showScores)}
            className="flex items-center gap-1"
          >
            <EyeIcon className="h-3 w-3" />
            <span className="hidden sm:inline">
              {showScores ? 'Hide' : 'Show'} Scores
            </span>
          </Button>
          <Badge variant="secondary" className="text-xs">
            {sources.length} source{sources.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Enhanced Sources Display */}
      <EnhancedSources
        sources={sources}
        displayMode={displayMode}
        showScores={showScores}
      />

      {/* Source Statistics */}
      {showScores && (
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Source Analytics</CardTitle>
            <CardDescription className="text-xs">
              Relevance scores and statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">
                  {sources.length}
                </div>
                <div className="text-xs text-muted-foreground">Total Sources</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {sources.filter(s => s.score && s.score > 0.8).length}
                </div>
                <div className="text-xs text-muted-foreground">High Relevance</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {Math.round((sources.reduce((sum, s) => sum + (s.score || 0), 0) / sources.length) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Avg. Score</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {new Set(sources.map(s => s.filename)).size}
                </div>
                <div className="text-xs text-muted-foreground">Unique Docs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
