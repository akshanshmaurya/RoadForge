import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITask extends Document {
    dayId: Types.ObjectId;
    title: string;
    category: 'graph' | 'revision' | 'theory';
    link: string;
    completed: boolean;
}

const TaskSchema = new Schema<ITask>({
    dayId: { type: Schema.Types.ObjectId, ref: 'Day', required: true },
    title: { type: String, required: true },
    category: { type: String, enum: ['graph', 'revision', 'theory'], required: true },
    link: { type: String, default: '' },
    completed: { type: Boolean, default: false },
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
