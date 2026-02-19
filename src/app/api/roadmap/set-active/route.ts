import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getSessionUser } from '@/lib/session';
import Roadmap from '@/models/Roadmap';
import User from '@/models/User';

export async function POST(request: NextRequest) {
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

        // Deactivate all, then activate the selected one
        await Roadmap.updateMany({ userId, isActive: true }, { isActive: false });
        await Roadmap.findByIdAndUpdate(roadmapId, { isActive: true, isArchived: false });
        await User.findByIdAndUpdate(userId, { activeRoadmapId: roadmapId });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Set active error:', error);
        return NextResponse.json({ error: 'Failed to set active roadmap' }, { status: 500 });
    }
}
