import mongoose, { Schema } from 'mongoose';
const CommentSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User' }, text: String, createdAt: { type: Date, default: Date.now } }, { _id: false });
const PostSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User' }, type: { type: String, enum: ['image','video','text','poll','music'], default: 'text' }, content: String, mediaUrls: [String], hashtags: [String], mentions: [String], likes: [{ type: Schema.Types.ObjectId, ref: 'User' }], comments: [CommentSchema], saves: [{ type: Schema.Types.ObjectId, ref: 'User' }], viewCount: { type: Number, default: 0 }, isReported: { type: Boolean, default: false } }, { timestamps: true });
PostSchema.index({ content: 'text', hashtags: 'text' });
export const Post = mongoose.model('Post', PostSchema);
