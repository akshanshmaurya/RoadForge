import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReference extends Document {
    roadmapId: Types.ObjectId;
    sectionTitle: string;
    contentMarkdown: string;
}

const ReferenceSchema = new Schema<IReference>({
    roadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    sectionTitle: { type: String, required: true },
    contentMarkdown: { type: String, required: true },
});

export default mongoose.models.Reference || mongoose.model<IReference>('Reference', ReferenceSchema);
