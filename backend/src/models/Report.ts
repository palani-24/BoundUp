import mongoose, { Schema } from 'mongoose';
const ReportSchema = new Schema({ reporter: { type: Schema.Types.ObjectId, ref: 'User' }, targetType: String, targetId: String, reason: String, status: { type: String, enum: ['open','reviewing','resolved','dismissed'], default: 'open' }, aiRiskScore: { type: Number, default: 0 } }, { timestamps: true });
export const Report = mongoose.model('Report', ReportSchema);
