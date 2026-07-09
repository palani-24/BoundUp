import mongoose, { Schema } from 'mongoose';

const MusicPlaySchema = new Schema({
  trackId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  source: { type: String, default: 'frontend-procedural-bgm' },
  ip: String,
  userAgent: String
}, { timestamps: true });

export const MusicPlay = mongoose.model('MusicPlay', MusicPlaySchema);
