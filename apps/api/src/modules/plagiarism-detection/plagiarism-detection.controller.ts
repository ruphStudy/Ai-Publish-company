import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePlagiarismDetectionDto, PlagiarismDetectionQueryDto } from './dto';
import { PlagiarismTargetType } from './entities/plagiarism-detection.entity';
import { PlagiarismDetectionService } from './plagiarism-detection.service';
@ApiTags('Plagiarism Detection') @ApiBearerAuth() @Controller('plagiarism-detections') @UseGuards(JwtAuthGuard, RolesGuard)
export class PlagiarismDetectionController { constructor(private readonly service: PlagiarismDetectionService) {} @Post() @Roles(UserRole.ADMIN, UserRole.EDITOR) create(@Body() dto: CreatePlagiarismDetectionDto, @CurrentUser('id') userId: string) { return this.service.create({ ...dto, createdBy: userId }); } @Get() search(@Query() query: PlagiarismDetectionQueryDto) { return this.service.search(query); } @Get('project/:projectId') project(@Param('projectId') id: string) { return this.service.findByProjectId(id); } @Get('project/:projectId/latest') latest(@Param('projectId') id: string) { return this.service.latestDetection(id); } @Get('target/:targetType/:targetId') target(@Param('targetType') type: PlagiarismTargetType, @Param('targetId') id: string) { return this.service.findByTarget(type, id); } @Get(':id') one(@Param('id') id: string) { return this.service.findById(id); } @Patch(':id/approve') @Roles(UserRole.ADMIN, UserRole.EDITOR) approve(@Param('id') id: string) { return this.service.approve(id); } @Patch(':id/reject') @Roles(UserRole.ADMIN, UserRole.EDITOR) reject(@Param('id') id: string) { return this.service.reject(id); } @Delete(':id') @Roles(UserRole.ADMIN, UserRole.EDITOR) async remove(@Param('id') id: string, @CurrentUser('id') userId: string) { await this.service.softDelete(id, userId); return { success: true }; } @Post(':id/restore') @Roles(UserRole.ADMIN) restore(@Param('id') id: string) { return this.service.restore(id); } }
