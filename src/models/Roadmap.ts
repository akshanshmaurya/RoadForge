import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRoadmap extends Document {
    userId: Types.ObjectId;
    title: string;
    startDate: Date;
    totalWeeks: number;
    totalDays: number;
    isActive: boolean;
    isArchived: boolean;
    createdAt: Date;
}

const RoadmapSchema = new Schema<IRoadmap>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    totalWeeks: { type: Number, required: true },
    totalDays: { type: Number, required: true },
    isActive: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Roadmap || mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
