import mongoose, { Schema } from 'mongoose';
const ProfileSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User', unique: true }, username: { type: String, unique: true, sparse: true }, displayName: String, bio: String, website: String, location: String, profession: String, education: String, skills: [String], socialLinks: [String], coverImage: String, avatar: String, verified: { type: Boolean, default: false }, followers: [{ type: Schema.Types.ObjectId, ref: 'User' }], following: [{ type: Schema.Types.ObjectId, ref: 'User' }] }, { timestamps: true });
ProfileSchema.index({ username: 'text', displayName: 'text', bio: 'text' });
export const Profile = mongoose.model('Profile', ProfileSchema);
