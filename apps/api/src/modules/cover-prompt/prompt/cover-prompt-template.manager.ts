import { Injectable } from '@nestjs/common';
import { coverPromptConfig } from '../config/cover-prompt.config';

@Injectable()
export class CoverPromptTemplateManager {
  getVersion(): string {
    return coverPromptConfig.promptVersion;
  }

  getNegativePrompt(): string {
    return 'low resolution, blurry image, distorted anatomy, unreadable typography, watermark, logo, publisher branding, cluttered layout, duplicate objects, cropped title, misspelled text, generic stock image appearance';
  }
}