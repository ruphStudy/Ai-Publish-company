import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import type { Model} from 'mongoose';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { permissionsForRoles } from '@ai-publishing/shared';

import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditEntityType } from '../audit/entities/audit-log.entity';

export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly accessTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenSecret: string;
  private readonly refreshTokenExpiry: string;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly auditService: AuditService,
  ) {
    this.accessTokenSecret = this.config.getOrThrow<string>('jwt.secret');
    this.accessTokenExpiry = this.config.getOrThrow<string>('jwt.expiresIn');
    this.refreshTokenSecret = this.config.getOrThrow<string>('jwt.refreshSecret');
    this.refreshTokenExpiry = this.config.getOrThrow<string>('jwt.refreshExpiresIn');
  }

  async register(
    dto: RegisterDto,
    context?: RequestContext,
  ): Promise<AuthResponseDto> {
    const existingUser = await this.userModel.findOne({ email: dto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.hashPassword(dto.password);

    const user = await this.userModel.create({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      createdBy: null,
    });

    user.createdBy = user._id;
    await user.save();

    const response = await this.generateAuthResponse(user);

    await this.auditService.log({
      action: AuditAction.REGISTER,
      entityType: AuditEntityType.USER,
      entityId: user._id as Types.ObjectId,
      performedBy: user._id as Types.ObjectId,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      description: `New user registered: ${user.email}`,
    });

    return response;
  }

  async login(
    dto: LoginDto,
    context?: RequestContext,
  ): Promise<AuthResponseDto> {
    const user = await this.userModel
      .findOne({ email: dto.email })
      .select('+password');

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await this.comparePasswords(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const response = await this.generateAuthResponse(user);

    await this.auditService.log({
      action: AuditAction.LOGIN,
      entityType: AuditEntityType.USER,
      entityId: user._id as Types.ObjectId,
      performedBy: user._id as Types.ObjectId,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      description: `User logged in: ${user.email}`,
    });

    return response;
  }

  async refreshToken(token: string): Promise<AuthResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.refreshTokenSecret,
      });

      const user = await this.userModel
        .findById(payload.sub)
        .select('+refreshToken');

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (!user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isValid = await bcrypt.compare(token, user.refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(
    userId: string,
    context?: RequestContext,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });

    await this.auditService.log({
      action: AuditAction.LOGOUT,
      entityType: AuditEntityType.USER,
      entityId: new Types.ObjectId(userId),
      performedBy: new Types.ObjectId(userId),
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      description: 'User logged out',
    });
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }

  private async generateAuthResponse(user: User): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpiry,
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.refreshTokenSecret,
        expiresIn: this.refreshTokenExpiry,
      },
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(user.id, {
      refreshToken: hashedRefreshToken,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        permissions: permissionsForRoles(user.roles),
      },
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  private async comparePasswords(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
