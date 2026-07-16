import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({
    example: {
      id: '507f1f77bcf86cd799439011',
      email: 'john.doe@company.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: ['viewer'],
    },
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: UserRole[];
  };
}
