import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  phone: String,
  passwordHash: { type: String, required: true },
  avatar: String,
  role: { type: String, enum: ['user','admin'], default: 'user' },
  aura: { type: String, default: 'Gaming Aura' },
  settings: { theme: { type: String, default: 'dark' }, language: { type: String, enum: ['en','ta','hi'], default: 'en' }, notifications: { type: Boolean, default: true } }
}, { timestamps: true });
export const User = mongoose.model('User', UserSchema);
