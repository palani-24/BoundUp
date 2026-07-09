import mongoose, { Schema } from 'mongoose';
const FavoriteSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, animeId: { type: String, required: true } }, { timestamps: true });
FavoriteSchema.index({ user: 1, animeId: 1 }, { unique: true });
export const Favorite = mongoose.model('Favorite', FavoriteSchema);
