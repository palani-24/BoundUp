import mongoose, { Schema } from 'mongoose';
const HistorySchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, animeId: { type: String, required: true }, watchedAt: { type: Date, default: Date.now } }, { timestamps: true });
export const History = mongoose.model('History', HistorySchema);
