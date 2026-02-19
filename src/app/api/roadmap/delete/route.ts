import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getSessionUser } from '@/lib/session';
import Roadmap from '@/models/Roadmap';
import Week from '@/models/Week';
import Day from '@/models/Day';
import Task from '@/models/Task';
import Reference from '@/models/Reference';
import LLMInsight from '@/models/LLMInsight';
import User from '@/models/User';

export async function DELETE(request: NextRequest) {
    try {
        let userId: string;
        try {
            userId = await getSessionUser();
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { roadmapId } = await request.json();

        if (!roadmapId) {
            return NextResponse.json({ error: 'roadmapId is required' }, { status: 400 });
        }

        // Verify ownership
        const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
        if (!roadmap) {
            return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
        }

        // Delete all related data
        const days = await Day.find({ roadmapId });
        const dayIds = days.map(d => d._id);

        await Task.deleteMany({ dayId: { $in: dayIds } });
        await Day.deleteMany({ roadmapId });
        await Week.deleteMany({ roadmapId });
        await Reference.deleteMany({ roadmapId });
        await LLMInsight.deleteMany({ roadmapId, userId });
        await Roadmap.findByIdAndDelete(roadmapId);

        // If this was the active roadmap, clear it
        const user = await User.findById(userId);
        if (user?.activeRoadmapId?.toString() === roadmapId) {
            // Try to set another roadmap as active
            const nextRoadmap = await Roadmap.findOne({ userId, isArchived: false }).sort({ createdAt: -1 });
            if (nextRoadmap) {
                nextRoadmap.isActive = true;
                await nextRoadmap.save();
                await User.findByIdAndUpdate(userId, { activeRoadmapId: nextRoadmap._id });
            } else {
                await User.findByIdAndUpdate(userId, { activeRoadmapId: null });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete roadmap error:', error);
        return NextResponse.json({ error: 'Failed to delete roadmap' }, { status: 500 });
    }
}
