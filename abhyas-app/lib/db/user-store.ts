import { User as UserType } from '@/lib/types';
import connectToDatabase from '@/lib/db/mongoose';
import { User } from '@/lib/models/User';

const MAX_USERS = 10;
const MAX_ADMINS = 2;

function toPlainUser(doc: any): UserType {
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    passwordHash: doc.passwordHash,
    role: doc.role,
    accountStatus: doc.accountStatus,
    createdAt: doc.createdAt,
    resetOtp: doc.resetOtp,
    resetOtpExpiry: doc.resetOtpExpiry,
    currentStreak: doc.currentStreak || 0,
    longestStreak: doc.longestStreak || 0,
    lastStreakDate: doc.lastStreakDate,
    streakHistory: doc.streakHistory || [],
  };
}

export async function getAllUsers(): Promise<UserType[]> {
  await connectToDatabase();
  const users = await User.find({}).lean();
  return users.map(toPlainUser);
}

export async function getUserByEmail(email: string): Promise<UserType | null> {
  await connectToDatabase();
  // Using case-insensitive regex search for email
  const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).lean();
  return user ? toPlainUser(user) : null;
}

export async function getUserById(id: string): Promise<UserType | null> {
  await connectToDatabase();
  const user = await User.findOne({ id }).lean();
  return user ? toPlainUser(user) : null;
}

export async function addUser(user: UserType): Promise<void> {
  await connectToDatabase();

  const existingUser = await User.findOne({ email: { $regex: new RegExp(`^${user.email}$`, 'i') } });
  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  // Check caps
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount >= MAX_ADMINS) {
      throw new Error(`Admin cap reached (max ${MAX_ADMINS})`);
    }
  } else {
    const userCount = await User.countDocuments({ role: 'user' });
    if (userCount >= MAX_USERS) {
      throw new Error(`User registration cap reached (max ${MAX_USERS})`);
    }
  }

  await User.create(user);
}

export async function getUserCounts(): Promise<{ admins: number; users: number; total: number }> {
  await connectToDatabase();
  const admins = await User.countDocuments({ role: 'admin' });
  const users = await User.countDocuments({ role: 'user' });
  return { admins, users, total: admins + users };
}

export async function updateUserStatus(userId: string, status: UserType['accountStatus']): Promise<void> {
  await connectToDatabase();
  const result = await User.findOneAndUpdate({ id: userId }, { accountStatus: status });
  if (!result) {
    throw new Error('User not found');
  }
}

export async function deleteUser(userId: string): Promise<void> {
  await connectToDatabase();
  
  const userToDelete = await User.findOne({ id: userId });
  if (!userToDelete) {
    throw new Error('User not found');
  }

  if (userToDelete.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      throw new Error('Cannot delete the last admin account');
    }
  }

  await User.deleteOne({ id: userId });
}

export async function updateUser(userId: string, updates: Partial<UserType>): Promise<void> {
  await connectToDatabase();
  const result = await User.findOneAndUpdate({ id: userId }, updates);
  if (!result) {
    throw new Error('User not found');
  }
}

export { MAX_USERS, MAX_ADMINS };
