import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  accountStatus: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  createdAt: { type: String, required: true },
  resetOtp: { type: String },
  resetOtpExpiry: { type: String },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
