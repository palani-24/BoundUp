import mongoose, { Schema } from 'mongoose';
const DownloadSchema = new Schema({ file: String, platform: String, ip: String, userAgent: String }, { timestamps: true });
export const Download = mongoose.model('Download', DownloadSchema);
