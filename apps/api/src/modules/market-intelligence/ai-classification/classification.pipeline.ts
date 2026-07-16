import { BadRequestException, Injectable } from '@nestjs/common';

import { ClassificationFactory } from './classification.factory';
import { AIClassificationValidator } from './ai-classification.validator';
import {
  ClassificationContext,
  ClassificationResult,
} from './models/classification-result.model';

@Injectable()
export class ClassificationPipeline {
  constructor(
    private readonly factory: ClassificationFactory,
    private readonly validator: AIClassificationValidator,
  ) {}

  async execute(context: ClassificationContext): Promise<ClassificationResult> {
    const contextValidation = this.validator.validateContext(context);

    if (!contextValidation.valid) {
      throw new BadRequestException({
        message: 'Invalid classification context',
        errors: contextValidation.errors,
      });
    }

    const strategy = this.factory.resolve(context);
    const result = await strategy.classify(context);
    const resultValidation = this.validator.validateResult(result);

    if (!resultValidation.valid) {
      throw new BadRequestException({
        message: 'Invalid classification result',
        errors: resultValidation.errors,
      });
    }

    return result;
  }
}