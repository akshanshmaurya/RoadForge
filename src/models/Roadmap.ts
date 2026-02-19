import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadmap extends Document {
    title: string;
    startDate: Date;
    totalWeeks: number;
    totalDays: number;
    createdAt: Date;
}

const RoadmapSchema = new Schema<IRoadmap>({
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    totalWeeks: { type: Number, required: true },
    totalDays: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Roadmap || mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
