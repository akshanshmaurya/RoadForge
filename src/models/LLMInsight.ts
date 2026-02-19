import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILLMInsight extends Document {
    userId: Types.ObjectId;
    roadmapId: Types.ObjectId;
    dayNumber: number;
    weekNumber: number;
    taskId: Types.ObjectId | null;
    type: 'daily' | 'weakness' | 'postsolve';
    content: string;
    createdAt: Date;
}

const LLMInsightSchema = new Schema<ILLMInsight>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    dayNumber: { type: Number, default: 0 },
    weekNumber: { type: Number, default: 0 },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', default: null },
    type: { type: String, enum: ['daily', 'weakness', 'postsolve'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Index for efficient cache lookups
LLMInsightSchema.index({ userId: 1, roadmapId: 1, type: 1, dayNumber: 1 });
LLMInsightSchema.index({ userId: 1, roadmapId: 1, type: 1, taskId: 1 });

export default mongoose.models.LLMInsight || mongoose.model<ILLMInsight>('LLMInsight', LLMInsightSchema);
