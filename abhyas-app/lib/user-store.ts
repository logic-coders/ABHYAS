import { User, UserRole } from './types';
import { uploadJSON, downloadJSON } from './s3';

const USERS_KEY = 'abhyas/users.json';

const MAX_USERS = 10;
const MAX_ADMINS = 2;

/**
 * Retrieve all users from S3.
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const data = await downloadJSON<User[]>(USERS_KEY);
    return data ?? [];
  } catch (error) {
    console.warn('Could not load users from S3:', (error as Error).message);
    return [];
  }
}

/**
 * Find a user by email (case-insensitive).
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const all = await getAllUsers();
  return all.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

/**
 * Find a user by ID.
 */
export async function getUserById(id: string): Promise<User | null> {
  const all = await getAllUsers();
  return all.find((u) => u.id === id) ?? null;
}

/**
 * Add a new user. Enforces role-based caps.
 * Throws if the cap is reached or email already exists.
 */
export async function addUser(user: User): Promise<void> {
  const all = await getAllUsers();

  // Check duplicate email
  if (all.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    throw new Error('An account with this email already exists');
  }

  // Check caps
  if (user.role === 'admin') {
    const adminCount = all.filter((u) => u.role === 'admin').length;
    if (adminCount >= MAX_ADMINS) {
      throw new Error(`Admin cap reached (max ${MAX_ADMINS})`);
    }
  } else {
    const userCount = all.filter((u) => u.role === 'user').length;
    if (userCount >= MAX_USERS) {
      throw new Error(`User registration cap reached (max ${MAX_USERS})`);
    }
  }

  all.push(user);
  await uploadJSON(USERS_KEY, all);
}

/**
 * Get current counts for roles.
 */
export async function getUserCounts(): Promise<{ admins: number; users: number; total: number }> {
  const all = await getAllUsers();
  const admins = all.filter((u) => u.role === 'admin').length;
  const users = all.filter((u) => u.role === 'user').length;
  return { admins, users, total: all.length };
}

export { MAX_USERS, MAX_ADMINS };
