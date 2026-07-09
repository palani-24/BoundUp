import mongoose, { Schema } from 'mongoose';
const NotificationSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User', index: true }, type: String, title: String, body: String, read: { type: Boolean, default: false }, data: Schema.Types.Mixed }, { timestamps: true });
export const Notification = mongoose.model('Notification', NotificationSchema);
