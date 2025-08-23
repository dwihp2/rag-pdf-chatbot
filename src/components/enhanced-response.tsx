'use client';

import React, { memo, useMemo } from 'react';
import { Response as BaseResponse } from '@/components/ui/ai-elements/response';
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
  InlineCitationSource,
  InlineCitationQuote,
} from '@/components/ui/ai-elements/inline-citation';
import { parseContentWithCitations } from '@/lib/citation-parser';

interface EnhancedResponseProps {
  children: string;
  sources?: Array<{
    filename: string;
    page: number;
    text: string;
    score?: number;
  }>;
  className?: string;
}

/**
 * Enhanced Response component that supports inline citations with Vercel AI Elements
 */
export const EnhancedResponse = memo(({
  children,
  sources = [],
  className,
  ...props
}: EnhancedResponseProps) => {
  // Parse content to identify citations and create enhanced sources
  const parsedContent = useMemo(() => {
    return parseContentWithCitations(children, sources);
  }, [children, sources]);

  // Process content to render with inline citations
  const renderWithInlineCitations = useMemo(() => {
    if (parsedContent.citations.length === 0 || parsedContent.sources.length === 0) {
      // No citations, use regular BaseResponse
      return (
        <BaseResponse className={className} {...props}>
          {children}
        </BaseResponse>
      );
    }

    // Normalize citation placement - move punctuation before citations
    let normalizedContent = children;
    
    // Pattern to match citation followed by punctuation: [1]. -> . [1]
    normalizedContent = normalizedContent.replace(/(\[\d+\])([\.,;:!?])/g, '$2 $1');
    
    // Split content by citation patterns [1], [2], etc.
    const parts = normalizedContent.split(/(\[\d+\])/);

    return (
      <div className={className} {...props}>
        <div className="prose prose-sm max-w-none">
          {parts.map((part, index) => {
            const citationMatch = part.match(/\[(\d+)\]/);
            if (citationMatch) {
              const citationNumber = citationMatch[1];
              const relevantSources = parsedContent.sources.filter(s => s.id === citationNumber);

              if (relevantSources.length > 0) {
                // Create source URLs - using filename as identifier since we don't have URLs
                const sourceUrls = relevantSources.map((source) =>
                  `[${source.id}]`
                );

                return (
                  <InlineCitation key={`citation-${index}`}>
                    <InlineCitationCard>
                      <InlineCitationCardTrigger sources={sourceUrls} />
                      <InlineCitationCardBody>
                        <InlineCitationCarousel>
                          <InlineCitationCarouselHeader>
                            <InlineCitationCarouselPrev />
                            <InlineCitationCarouselNext />
                            <InlineCitationCarouselIndex />
                          </InlineCitationCarouselHeader>
                          <InlineCitationCarouselContent>
                            {relevantSources.map((source, sourceIndex) => (
                              <InlineCitationCarouselItem key={sourceIndex}>
                                <InlineCitationSource
                                  title={source.title}
                                  url={`${source.title} - Page ${source.page}`}
                                  description={source.description}
                                />
                                <InlineCitationQuote>
                                  {source.snippet}
                                </InlineCitationQuote>
                              </InlineCitationCarouselItem>
                            ))}
                          </InlineCitationCarouselContent>
                        </InlineCitationCarousel>
                      </InlineCitationCardBody>
                    </InlineCitationCard>
                  </InlineCitation>
                );
              }
            }

            // Regular text part - process with BaseResponse for markdown formatting
            if (part.trim()) {
              return (
                <BaseResponse key={`text-${index}`} className="inline-block">
                  {part}
                </BaseResponse>
              );
            }

            return null;
          })}
        </div>
      </div>
    );
  }, [children, parsedContent, className, props]);

  return renderWithInlineCitations;
}, (prevProps, nextProps) =>
  prevProps.children === nextProps.children &&
  JSON.stringify(prevProps.sources) === JSON.stringify(nextProps.sources)
);

EnhancedResponse.displayName = 'EnhancedResponse';
