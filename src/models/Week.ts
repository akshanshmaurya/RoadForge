import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWeek extends Document {
    roadmapId: Types.ObjectId;
    weekNumber: number;
    title: string;
}

const WeekSchema = new Schema<IWeek>({
    roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    weekNumber: { type: Number, required: true },
    title: { type: String, required: true },
});

export default mongoose.models.Week || mongoose.model<IWeek>('Week', WeekSchema);
