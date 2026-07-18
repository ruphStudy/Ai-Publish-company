import { BadRequestException, Injectable } from '@nestjs/common';
import { SettingDataType } from './entities/setting.entity';
import type { SettingDefinition } from './interfaces/settings.interface';

@Injectable()
export class SettingValidator {
  validate(definition: SettingDefinition, value: unknown) {
    const rules = definition.validation ?? {};
    if ((value === undefined || value === null || value === '') && rules.required) throw new BadRequestException(`${definition.key} is required`);
    if ((value === null || value === undefined) && rules.allowNull) return;
    if (value === null || value === undefined) return;

    if (definition.allowedValues?.length && !definition.allowedValues.some((allowed) => JSON.stringify(allowed) === JSON.stringify(value))) throw new BadRequestException(`${definition.key} must be one of the allowed values`);
    if ((definition.dataType === SettingDataType.NUMBER || definition.dataType === SettingDataType.DECIMAL) && typeof value !== 'number') throw new BadRequestException(`${definition.key} must be a number`);
    if (definition.dataType === SettingDataType.BOOLEAN && typeof value !== 'boolean') throw new BadRequestException(`${definition.key} must be a boolean`);
    if ([SettingDataType.STRING, SettingDataType.ENUM, SettingDataType.DURATION, SettingDataType.URL, SettingDataType.EMAIL, SettingDataType.SECRET].includes(definition.dataType) && typeof value !== 'string') throw new BadRequestException(`${definition.key} must be a string`);
    if (definition.dataType === SettingDataType.LIST && !Array.isArray(value)) throw new BadRequestException(`${definition.key} must be a list`);
    if ((definition.dataType === SettingDataType.JSON || definition.dataType === SettingDataType.MAP) && (typeof value !== 'object' || Array.isArray(value))) throw new BadRequestException(`${definition.key} must be an object`);
    if (typeof value === 'number' && rules.min !== undefined && value < rules.min) throw new BadRequestException(`${definition.key} is below the minimum`);
    if (typeof value === 'number' && rules.max !== undefined && value > rules.max) throw new BadRequestException(`${definition.key} exceeds the maximum`);
    if (typeof value === 'string' && rules.minLength !== undefined && value.length < rules.minLength) throw new BadRequestException(`${definition.key} is too short`);
    if (typeof value === 'string' && rules.maxLength !== undefined && value.length > rules.maxLength) throw new BadRequestException(`${definition.key} is too long`);
    if (typeof value === 'string' && rules.pattern && !new RegExp(rules.pattern).test(value)) throw new BadRequestException(`${definition.key} has invalid format`);
    if (definition.dataType === SettingDataType.URL) new URL(String(value));
    if (definition.dataType === SettingDataType.EMAIL && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) throw new BadRequestException(`${definition.key} must be an email`);
  }
}
