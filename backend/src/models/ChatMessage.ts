import mongoose, { Schema } from 'mongoose';
const ChatMessageSchema = new Schema({ roomId: { type: String, index: true, required: true }, sender: { type: Schema.Types.ObjectId, ref: 'User' }, text: { type: String, required: true }, type: { type: String, default: 'text' }, seenBy: [{ type: Schema.Types.ObjectId, ref: 'User' }] }, { timestamps: true });
export const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);
