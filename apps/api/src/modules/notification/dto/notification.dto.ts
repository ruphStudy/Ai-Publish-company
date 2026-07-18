import { IsArray, IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';
import { NotificationCategory, NotificationChannel, NotificationSeverity, NotificationStatus } from '../entities/notification.entity';

export class NotificationQueryDto {
  @IsOptional() @IsEnum(NotificationCategory) category?: NotificationCategory;
  @IsOptional() @IsEnum(NotificationSeverity) severity?: NotificationSeverity;
  @IsOptional() @IsEnum(NotificationStatus) status?: NotificationStatus;
  @IsOptional() @IsString() workspaceId?: string;
  @IsOptional() @IsNumber() @Min(1) page?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(100) limit?: number;
}

export class EmitNotificationEventDto {
  @IsString() eventKey: string;
  @IsOptional() @IsString() eventId?: string;
  @IsOptional() @IsString() workspaceId?: string;
  @IsOptional() @IsString() tenantId?: string;
  @IsOptional() @IsString() entityType?: string;
  @IsOptional() @IsString() entityId?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) recipientUserIds?: string[];
  @IsOptional() @IsObject() payload?: Record<string, unknown>;
  @IsOptional() @IsString() correlationId?: string;
}

export class UpdateNotificationPreferencesDto {
  @IsOptional() @IsString() workspaceId?: string;
  @IsOptional() @IsString() eventKey?: string;
  @IsOptional() @IsEnum(NotificationCategory) category?: NotificationCategory;
  @IsArray() @IsEnum(NotificationChannel, { each: true }) enabledChannels: NotificationChannel[];
  @IsBoolean() enabled: boolean;
  @IsOptional() @IsObject() quietHours?: Record<string, unknown>;
}

export class CreateWebhookEndpointDto {
  @IsString() workspaceId: string;
  @IsString() name: string;
  @IsUrl({ require_protocol: true }) url: string;
  @IsString() secret: string;
  @IsOptional() @IsArray() @IsString({ each: true }) eventKeys?: string[];
  @IsOptional() @IsObject() metadata?: Record<string, unknown>;
}

export class CreateNotificationSubscriptionDto {
  @IsString() eventKey: string;
  @IsEnum(NotificationChannel) channel: NotificationChannel;
  @IsOptional() @IsString() workspaceId?: string;
  @IsOptional() @IsString() webhookEndpointId?: string;
  @IsOptional() @IsObject() metadata?: Record<string, unknown>;
}

export class DeliveryQueryDto {
  @IsOptional() @IsString() notificationId?: string;
  @IsOptional() @IsString() workspaceId?: string;
  @IsOptional() @IsEnum(NotificationChannel) channel?: NotificationChannel;
  @IsOptional() @IsNumber() @Min(1) page?: number;
  @IsOptional() @IsNumber() @Min(1) @Max(100) limit?: number;
}
