/**
 * Seed script to create admin accounts.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts --name "Admin" --email admin@abhyas.com --password secret123
 *
 * Requires AWS S3 env vars to be set (or a .env.local file).
 */

// Load env vars from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { hashPassword } from '../lib/auth';
import { addUser } from '../lib/user-store';
import { User } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

async function main() {
  const args = process.argv.slice(2);

  const getArg = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
  };

  const name = getArg('--name') || 'Admin';
  const email = getArg('--email');
  const password = getArg('--password');

  if (!email || !password) {
    console.error('Usage: npx tsx scripts/seed-admin.ts --name "Admin" --email admin@abhyas.com --password yourpassword');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('Password must be at least 6 characters');
    process.exit(1);
  }

  console.log(`Creating admin account for: ${email}...`);

  const passwordHash = await hashPassword(password);

  const user: User = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  try {
    await addUser(user);
    console.log(`✅ Admin account created successfully!`);
    console.log(`   Name:  ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role:  admin`);
    console.log(`   ID:    ${user.id}`);
  } catch (error) {
    console.error(`❌ Failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
