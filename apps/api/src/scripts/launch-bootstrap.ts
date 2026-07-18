import 'tsconfig-paths/register';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Category, CategoryStatus } from '../modules/category/entities/category.entity';
import { CategorySchema } from '../modules/category/entities/category.entity';
import { User, UserRole } from '../modules/auth/entities/user.entity';
import { UserSchema } from '../modules/auth/entities/user.entity';

const defaultCategories = [
  { name: 'Technology', slug: 'technology', description: 'Technology, software, AI and digital systems.', color: '#3B82F6', displayOrder: 10 },
  { name: 'Business', slug: 'business', description: 'Business, leadership, management and entrepreneurship.', color: '#10B981', displayOrder: 20 },
  { name: 'Health & Fitness', slug: 'health-fitness', description: 'Health, wellness, fitness and lifestyle.', color: '#F59E0B', displayOrder: 30 },
  { name: 'Self-Help', slug: 'self-help', description: 'Personal development, productivity and self-improvement.', color: '#8B5CF6', displayOrder: 40 },
  { name: 'Finance', slug: 'finance', description: 'Personal finance, investing and financial education.', color: '#14B8A6', displayOrder: 50 },
  { name: 'Marketing', slug: 'marketing', description: 'Marketing, sales, branding and growth.', color: '#EC4899', displayOrder: 60 },
];

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '../../.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...parts] = trimmed.split('=');
    if (!process.env[key]) process.env[key] = parts.join('=').replace(/^["']|["']$/g, '');
  }
}

async function bootstrap() {
  loadEnvFile();
  await mongoose.connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/ai_publishing');
  const categoryModel = mongoose.model<Category>(Category.name, CategorySchema);
  const userModel = mongoose.model<User>(User.name, UserSchema);
  for (const category of defaultCategories) {
    await categoryModel.updateOne({ slug: category.slug }, { $setOnInsert: { ...category, status: CategoryStatus.ACTIVE, isDeleted: false } }, { upsert: true }).exec();
  }
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (email && password) {
    if (process.env.NODE_ENV === 'production' && password.length < 16) throw new Error('BOOTSTRAP_ADMIN_PASSWORD must be at least 16 characters in production');
    const existing = await userModel.findOne({ email }).exec();
    if (!existing) {
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await userModel.create({ email, password: passwordHash, firstName: process.env.BOOTSTRAP_ADMIN_FIRST_NAME ?? 'Launch', lastName: process.env.BOOTSTRAP_ADMIN_LAST_NAME ?? 'Admin', roles: [UserRole.ADMIN], isActive: true, isDeleted: false });
      user.createdBy = user._id;
      user.updatedBy = user._id;
      await user.save();
    }
  }
  await mongoose.disconnect();
}

void bootstrap();
