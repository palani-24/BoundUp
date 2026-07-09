import mongoose, { Schema } from 'mongoose';
const CallLogSchema = new Schema({ roomId: String, participants: [{ type: Schema.Types.ObjectId, ref: 'User' }], type: { type: String, enum: ['voice','video','group-voice','group-video'], default: 'voice' }, status: { type: String, default: 'completed' }, durationSeconds: { type: Number, default: 0 } }, { timestamps: true });
export const CallLog = mongoose.model('CallLog', CallLogSchema);
