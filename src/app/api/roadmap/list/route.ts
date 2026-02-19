import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getSessionUser } from '@/lib/session';
import Roadmap from '@/models/Roadmap';

export async function GET() {
    try {
        let userId: string;
        try {
            userId = await getSessionUser();
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const roadmaps = await Roadmap.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ roadmaps });
    } catch (error) {
        console.error('List roadmaps error:', error);
        return NextResponse.json({ error: 'Failed to list roadmaps' }, { status: 500 });
    }
}
