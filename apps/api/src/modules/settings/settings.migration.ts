import { Injectable } from '@nestjs/common';

export interface SettingMigration {
  key: string;
  version: number;
  up(value: unknown): unknown;
  down?(value: unknown): unknown;
}

@Injectable()
export class SettingMigrationRunner {
  private readonly migrations: SettingMigration[] = [];

  register(migration: SettingMigration) {
    if (!this.migrations.some((item) => item.key === migration.key && item.version === migration.version)) this.migrations.push(migration);
  }

  migrate(key: string, value: unknown, fromVersion: number, toVersion: number) {
    return this.migrations
      .filter((migration) => migration.key === key && migration.version > fromVersion && migration.version <= toVersion)
      .sort((a, b) => a.version - b.version)
      .reduce((current, migration) => migration.up(current), value);
  }
}
