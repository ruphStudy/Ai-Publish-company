import { Injectable } from '@nestjs/common';
import { GenreStyleMapper } from './genre-style.mapper';

@Injectable()
export class StyleRecommendationEngine {
  constructor(private readonly genreStyleMapper: GenreStyleMapper) {}

  generate(
    blueprint: Record<string, unknown>,
    metadata: Record<string, unknown>,
  ) {
    const recommendation = this.genreStyleMapper.getRecommendation(
      String(blueprint.genre ?? blueprint.niche ?? ''),
    );

    return {
      ...recommendation,
      title: String(metadata.title ?? blueprint.title),
      subtitle: String(metadata.subtitle ?? blueprint.subtitle ?? ''),
      targetAudience: String(
        blueprint.targetAudience ?? 'general adult readers',
      ),
      genre: String(blueprint.genre ?? blueprint.niche ?? 'general nonfiction'),
    };
  }
}