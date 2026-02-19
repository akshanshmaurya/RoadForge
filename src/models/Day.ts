import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDay extends Document {
    roadmapId: Types.ObjectId;
    weekId: Types.ObjectId;
    weekNumber: number;
    dayNumber: number;
    globalDayIndex: number;
    type: 'weekday' | 'weekend';
}

const DaySchema = new Schema<IDay>({
    roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    weekId: { type: Schema.Types.ObjectId, ref: 'Week', required: true },
    weekNumber: { type: Number, required: true },
    dayNumber: { type: Number, required: true },
    globalDayIndex: { type: Number, required: true },
    type: { type: String, enum: ['weekday', 'weekend'], required: true },
});

export default mongoose.models.Day || mongoose.model<IDay>('Day', DaySchema);
