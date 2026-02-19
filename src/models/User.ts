import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    activeRoadmapId: Types.ObjectId | null;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    activeRoadmapId: { type: Schema.Types.ObjectId, ref: 'Roadmap', default: null },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
