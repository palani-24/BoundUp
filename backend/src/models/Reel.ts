import mongoose, { Schema } from 'mongoose';
const ReelSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User' }, videoUrl: String, caption: String, music: String, hashtags: [String], likes: [{ type: Schema.Types.ObjectId, ref: 'User' }], commentsCount: { type: Number, default: 0 }, sharesCount: { type: Number, default: 0 }, views: { type: Number, default: 0 }, remixEnabled: { type: Boolean, default: true } }, { timestamps: true });
ReelSchema.index({ caption: 'text', hashtags: 'text' });
export const Reel = mongoose.model('Reel', ReelSchema);
