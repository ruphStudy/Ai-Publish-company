import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

@Injectable()
export class SettingEncryptionService {
  private readonly key = createHash('sha256').update(process.env.SETTINGS_ENCRYPTION_KEY ?? process.env.JWT_SECRET ?? 'apc-local-settings-key').digest();
  private readonly keyVersion = 'v1';

  encrypt(value: unknown) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const plaintext = JSON.stringify(value);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return { value: `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`, keyVersion: this.keyVersion };
  }

  decrypt<TValue>(value: string): TValue {
    const [iv, tag, encrypted] = value.split('.').map((part) => Buffer.from(part, 'base64'));
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')) as TValue;
  }

  mask(value: unknown) {
    if (value === null || value === undefined) return null;
    return '********' as const;
  }
}
