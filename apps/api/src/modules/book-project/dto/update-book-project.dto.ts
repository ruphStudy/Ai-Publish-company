import { PartialType } from '@nestjs/swagger';

import { CreateBookProjectDto } from './create-book-project.dto';

export class UpdateBookProjectDto extends PartialType(CreateBookProjectDto) {}