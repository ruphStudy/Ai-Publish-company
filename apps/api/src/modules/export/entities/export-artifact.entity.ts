import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum ExportFormat {
  PDF = 'PDF',
  PRINT_PDF = 'PRINT_PDF',
  EPUB = 'EPUB',
  DOCX = 'DOCX',
  ZIP = 'ZIP',
}

@Schema({ _id: false })
export class ExportArtifact {
  @Prop({ required: true, trim: true })
  artifactId: string;

  @Prop({ required: true, trim: true })
  exportJobId: string;

  @Prop({ required: true, enum: ExportFormat })
  format: ExportFormat;

  @Prop({ required: true, trim: true })
  filename: string;

  @Prop({ required: true, trim: true })
  fileExtension: string;

  @Prop({ required: true, trim: true })
  mimeType: string;

  @Prop({ required: true, trim: true })
  storageProvider: string;

  @Prop({ required: true, trim: true })
  storagePath: string;

  @Prop({ required: true, trim: true })
  downloadUrl: string;

  @Prop({ required: true, trim: true })
  checksum: string;

  @Prop({ required: true, min: 0 })
  fileSize: number;

  @Prop({ required: true })
  generatedAt: Date;
}

export const ExportArtifactSchema =
  SchemaFactory.createForClass(ExportArtifact);
