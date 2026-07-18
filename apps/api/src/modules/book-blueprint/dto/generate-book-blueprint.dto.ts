import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class GenerateBookBlueprintDto {
  @ApiProperty()
  @IsMongoId()
  projectId: string;

  @ApiProperty()
  @IsMongoId()
  marketIntelligenceId: string;

  @ApiProperty()
  @IsMongoId()
  knowledgeRecordId: string;
}