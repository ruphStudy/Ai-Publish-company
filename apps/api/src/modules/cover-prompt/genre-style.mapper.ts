import { Injectable } from '@nestjs/common';

export interface GenreStyleRecommendation {
  visualTheme: string;
  artStyle: string;
  colorPalette: string[];
  typographyStyle: string;
  coverLayout: string;
  illustrationStyle: string;
}

@Injectable()
export class GenreStyleMapper {
  getRecommendation(genre?: string): GenreStyleRecommendation {
    const normalizedGenre = genre?.toLowerCase() ?? '';

    if (normalizedGenre.includes('romance')) {
      return {
        visualTheme: 'emotional intimacy and aspirational romance',
        artStyle: 'cinematic contemporary romance illustration',
        colorPalette: ['blush pink', 'warm ivory', 'muted gold'],
        typographyStyle: 'elegant serif title with refined script accent',
        coverLayout: 'title-focused composition with central romantic focal point',
        illustrationStyle: 'soft painterly digital illustration',
      };
    }

    if (
      normalizedGenre.includes('business') ||
      normalizedGenre.includes('self-help') ||
      normalizedGenre.includes('personal development')
    ) {
      return {
        visualTheme: 'clarity, growth, and confident transformation',
        artStyle: 'premium modern editorial design',
        colorPalette: ['deep navy', 'white', 'electric blue'],
        typographyStyle: 'bold modern sans-serif typography',
        coverLayout: 'minimal title-led composition with a single symbolic element',
        illustrationStyle: 'clean conceptual vector and editorial illustration',
      };
    }

    if (
      normalizedGenre.includes('fantasy') ||
      normalizedGenre.includes('science fiction')
    ) {
      return {
        visualTheme: 'wonder, scale, mystery, and immersive discovery',
        artStyle: 'cinematic speculative fiction key art',
        colorPalette: ['midnight blue', 'violet', 'luminous gold'],
        typographyStyle: 'dramatic display serif typography',
        coverLayout: 'hero subject foreground with expansive atmospheric background',
        illustrationStyle: 'high-detail cinematic digital painting',
      };
    }

    if (
      normalizedGenre.includes('children') ||
      normalizedGenre.includes('juvenile')
    ) {
      return {
        visualTheme: 'curiosity, joy, imagination, and warmth',
        artStyle: 'playful illustrated children book cover',
        colorPalette: ['sky blue', 'sunshine yellow', 'coral orange'],
        typographyStyle: 'friendly rounded display typography',
        coverLayout: 'character-centered composition with clear title space',
        illustrationStyle: 'bright hand-painted storybook illustration',
      };
    }

    return {
      visualTheme: 'clear value, reader transformation, and professional authority',
      artStyle: 'premium contemporary publishing design',
      colorPalette: ['charcoal', 'warm white', 'teal'],
      typographyStyle: 'modern readable serif and sans-serif combination',
      coverLayout: 'balanced title-led composition with refined focal point',
      illustrationStyle: 'editorial conceptual illustration',
    };
  }
}