import { join } from 'path';

export const exportConfig = {
  storage: {
    provider: process.env.EXPORT_STORAGE_PROVIDER ?? 'local',
    localPath:
      process.env.EXPORT_LOCAL_STORAGE_PATH ??
      join(process.cwd(), 'storage', 'exports'),
    publicBaseUrl: process.env.EXPORT_PUBLIC_BASE_URL ?? '/api/v1/exports/download',
  },
  package: {
    enabled: process.env.EXPORT_PACKAGE_ENABLED !== 'false',
  },
};