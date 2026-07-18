import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'User email address',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    example: 'SecureP@ss123',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  password: string;
}
