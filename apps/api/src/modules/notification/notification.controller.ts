import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { createHash } from 'crypto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateNotificationSubscriptionDto, CreateWebhookEndpointDto, DeliveryQueryDto, EmitNotificationEventDto, NotificationQueryDto, UpdateNotificationPreferencesDto } from './dto/notification.dto';
import { NotificationQueryService } from './notification-query.service';
import { NotificationSubscriptionRepository, NotificationWebhookEndpointRepository } from './notification.repository';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(
    private readonly notifications: NotificationService,
    private readonly queries: NotificationQueryService,
    private readonly subscriptionsRepository: NotificationSubscriptionRepository,
    private readonly webhooksRepository: NotificationWebhookEndpointRepository,
  ) {}

  @Get()
  list(@CurrentUser('id') userId: string, @Query() query: NotificationQueryDto) {
    return this.queries.list(userId, query);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser('id') userId: string, @Query('workspaceId') workspaceId?: string) {
    return this.queries.unreadCount(userId, workspaceId);
  }

  @Get('preferences')
  preferences(@CurrentUser('id') userId: string, @Query('workspaceId') workspaceId?: string) {
    return this.notifications.preferencesFor(userId, workspaceId);
  }

  @Patch('preferences')
  updatePreferences(@CurrentUser('id') userId: string, @Body() dto: UpdateNotificationPreferencesDto) {
    return this.notifications.updatePreferences(userId, dto);
  }

  @Post('emit')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  emit(@Body() dto: EmitNotificationEventDto, @CurrentUser('id') userId: string) {
    return this.notifications.emit(dto, userId);
  }

  @Patch('mark-all-read')
  markAllRead(@CurrentUser('id') userId: string, @Query('workspaceId') workspaceId?: string) {
    return this.notifications.markAllRead(userId, workspaceId);
  }

  @Get('deliveries')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  deliveries(@Query() query: DeliveryQueryDto) {
    return this.queries.deliveryHistory(query);
  }

  @Patch('deliveries/:id/retry')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  retryDelivery(@Param('id') id: string) {
    return this.notifications.retryDelivery(id);
  }

  @Get('webhooks')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  webhookEndpoints(@Query('workspaceId') workspaceId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.notifications.webhookEndpoints(workspaceId, page, limit);
  }

  @Post('webhooks')
  @Roles(UserRole.ADMIN)
  createWebhookEndpoint(@Body() dto: CreateWebhookEndpointDto) {
    return this.webhooksRepository.create({
      workspaceId: dto.workspaceId,
      name: dto.name,
      url: dto.url,
      secretHash: createHash('sha256').update(dto.secret).digest('hex'),
      eventKeys: dto.eventKeys ?? [],
      metadata: dto.metadata ?? {},
      enabled: true,
      isDeleted: false,
    });
  }

  @Get('subscriptions')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  subscriptions(@Query('workspaceId') workspaceId?: string, @Query('eventKey') eventKey?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.notifications.subscriptions({ workspaceId, eventKey, page, limit });
  }

  @Post('subscriptions')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  createSubscription(@Body() dto: CreateNotificationSubscriptionDto, @CurrentUser('id') userId: string) {
    return this.subscriptionsRepository.create({
      eventKey: dto.eventKey,
      channel: dto.channel,
      workspaceId: dto.workspaceId ?? null,
      userId,
      webhookEndpointId: dto.webhookEndpointId ?? null,
      metadata: dto.metadata ?? {},
      enabled: true,
      isDeleted: false,
    });
  }

  @Get(':id')
  get(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notifications.get(userId, id);
  }

  @Patch(':id/read')
  markRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notifications.markRead(userId, id);
  }

  @Patch(':id/unread')
  markUnread(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notifications.markUnread(userId, id);
  }

  @Patch(':id/archive')
  archive(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notifications.archive(userId, id);
  }
}
