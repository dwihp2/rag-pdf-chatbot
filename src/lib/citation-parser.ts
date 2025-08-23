import React from 'react';

export interface EnhancedSource {
  id: string;
  title: string;
  url?: string;
  filename: string;
  page?: number;
  description?: string;
  snippet: string;
  score?: number;
  text: string; // Full text content for display
}

export interface CitationInfo {
  text: string; // The text that should be highlighted
  sourceIds: string[]; // Array of source IDs that support this text
  startIndex: number;
  endIndex: number;
}

export interface ParsedContent {
  content: string; // Original content
  citations: CitationInfo[];
  sources: EnhancedSource[];
}

/**
 * Parses content to extract inline citations in the format [1], [2], etc.
 * and maps them to provided sources
 */
export function parseContentWithCitations(
  content: string, 
  sources: Array<{
    filename: string;
    page: number;
    text: string;
    score?: number;
  }>
): ParsedContent {
  // Enhanced sources with generated IDs and better metadata
  const enhancedSources: EnhancedSource[] = sources.map((source, index) => ({
    id: (index + 1).toString(),
    title: `${source.filename}${source.page ? ` (page ${source.page})` : ''}`,
    filename: source.filename,
    page: source.page,
    description: `Excerpt from ${source.filename}`,
    snippet: source.text.length > 200 ? source.text.substring(0, 197) + '...' : source.text,
    score: source.score,
    text: source.text,
    url: `#${source.filename.replace(/[^a-zA-Z0-9]/g, '-')}-${source.page || 'unknown'}`
  }));

  // Find all citation patterns [1], [2], etc.
  const citationRegex = /\[(\d+)\]/g;
  const citations: CitationInfo[] = [];
  
  let match;
  while ((match = citationRegex.exec(content)) !== null) {
    const citationId = match[1];
    const startIndex = match.index;
    const endIndex = match.index + match[0].length;
    
    // Find the source that corresponds to this citation
    const source = enhancedSources.find(s => s.id === citationId);
    if (source) {
      // Try to find the relevant text that this citation refers to
      // Look for the sentence or phrase that precedes this citation
      const textBefore = content.substring(Math.max(0, startIndex - 100), startIndex);
      const sentences = textBefore.split(/[.!?]+/);
      const relevantText = sentences[sentences.length - 1]?.trim() || '';
      
      citations.push({
        text: relevantText + match[0], // Include the citation marker
        sourceIds: [citationId],
        startIndex: Math.max(0, startIndex - relevantText.length),
        endIndex: endIndex
      });
    }
  }

  return {
    content,
    citations,
    sources: enhancedSources
  };
}

/**
 * Processes content to add inline citation components
 * This function will be used to render citations with hover cards
 */
export function renderContentWithInlineCitations(
  content: string
): React.ReactNode {
  // For now, return the content as-is
  // This will be enhanced with React components in the next step
  return content;
}

/**
 * Groups citations by their source IDs for carousel display
 */
export function groupCitationsBySources(citations: CitationInfo[]): { [sourceId: string]: CitationInfo[] } {
  return citations.reduce((groups, citation) => {
    citation.sourceIds.forEach(sourceId => {
      if (!groups[sourceId]) {
        groups[sourceId] = [];
      }
      groups[sourceId].push(citation);
    });
    return groups;
  }, {} as { [sourceId: string]: CitationInfo[] });
}
