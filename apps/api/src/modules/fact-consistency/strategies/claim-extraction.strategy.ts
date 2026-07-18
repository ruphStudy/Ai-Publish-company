import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { ClaimSupportStatus, ExtractedClaim } from '../entities/fact-consistency.entity';
import type { FactConsistencyInput } from '../interfaces/fact-consistency.interface';

@Injectable()
export class ClaimExtractionStrategy {
  extract(input: FactConsistencyInput): ExtractedClaim[] {
    return input.segments.flatMap((segment) => segment.text.split(/(?<=[.!?])\s+/).filter((text) => this.isClaim(text)).map((text) => this.claim(text.trim(), segment.location, segment.chapterId, segment.sectionId)));
  }
  private isClaim(text: string): boolean { return text.trim().length >= 20 && (/\d/.test(text) || /\b(is|are|was|were|has|have|causes?|increases?|decreases?|founded|located)\b/i.test(text)); }
  private claim(text: string, location: string, chapterId?: string, sectionId?: string): ExtractedClaim {
    const citations = text.match(/\[[^\]]+\]|\([^)]*\b(?:19|20)\d{2}\b[^)]*\)/g) ?? [];
    const dates: string[] = text.match(/\b(?:19|20)\d{2}(?:-\d{2}-\d{2})?\b/g) ?? [];
    const numericValues = (text.match(/\b\d+(?:\.\d+)?%?\b/g) ?? []).filter((value) => !dates.includes(value)).map((value) => Number(value.replace('%', '')));
    const entities = [...new Set(text.match(/\b[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*\b/g) ?? [])];
    return { claimId: `CLM-${createHash('sha1').update(`${location}:${text}`).digest('hex').slice(0, 12)}`, text, normalizedText: text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\b\d+(?:\.\d+)?\b/g, '#').replace(/\s+/g, ' ').trim(), claimType: numericValues.length ? 'QUANTITATIVE' : dates.length ? 'TEMPORAL' : 'FACTUAL', sourceLocation: location, chapterId: chapterId ?? null, sectionId: sectionId ?? null, entities, dates, numericValues, citations, supportStatus: citations.length ? ClaimSupportStatus.PARTIALLY_SUPPORTED : ClaimSupportStatus.UNCERTAIN, confidence: 80, relatedClaimIds: [], contradictionIds: [], notes: citations.length ? ['Citation detected; external verification was not performed.'] : ['External verification is pending.'] };
  }
}
