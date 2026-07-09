import mongoose, { Schema } from 'mongoose';
const AnimeSchema = new Schema({
  title: { type: String, required: true, index: true },
  category: { type: String, index: true },
  rating: Number,
  year: Number,
  status: String,
  image: String,
  description: String,
  episodes: Number
}, { timestamps: true });
AnimeSchema.index({ title: 'text', category: 'text', description: 'text' });
export const Anime = mongoose.model('Anime', AnimeSchema);
