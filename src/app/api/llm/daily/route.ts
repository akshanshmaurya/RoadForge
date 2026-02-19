import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getSessionUser } from '@/lib/session';
import { generateContent } from '@/lib/gemini';
import LLMInsight from '@/models/LLMInsight';
import Roadmap from '@/models/Roadmap';
import Day from '@/models/Day';
import Task from '@/models/Task';
import User from '@/models/User';

export async function GET(request: NextRequest) {
    try {
        let userId: string;
        try {
            userId = await getSessionUser();
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const dayNumber = parseInt(searchParams.get('dayNumber') || '0');
        const weekNumber = parseInt(searchParams.get('weekNumber') || '0');

        const user = await User.findById(userId);
        if (!user?.activeRoadmapId) {
            return NextResponse.json({ error: 'No active roadmap' }, { status: 404 });
        }

        const roadmapId = user.activeRoadmapId;

        // Check cache
        const cached = await LLMInsight.findOne({
            userId,
            roadmapId,
            type: 'daily',
            dayNumber,
        });

        if (cached) {
            return NextResponse.json({ insight: cached.content, cached: true });
        }

        // Get today's tasks
        const roadmap = await Roadmap.findById(roadmapId);
        if (!roadmap) {
            return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
        }

        const day = await Day.findOne({ roadmapId, weekNumber, dayNumber });
        if (!day) {
            return NextResponse.json({ error: 'Day not found' }, { status: 404 });
        }

        const tasks = await Task.find({ dayId: day._id });
        if (tasks.length === 0) {
            return NextResponse.json({ insight: null });
        }

        const taskSummary = tasks.map(t => `- ${t.title} (${t.category})`).join('\n');

        const prompt = `You are a learning coach. Given this day's study plan:

Week ${weekNumber}, Day ${dayNumber}
Tasks:
${taskSummary}

Provide:
1. Main pattern being practiced today
2. One common mistake to avoid
3. Time management advice
4. Key concept reminder

Limit to 120 words. Return plain text only, no markdown headers.`;

        try {
            const content = await generateContent(prompt);

            // Save to cache
            await LLMInsight.create({
                userId,
                roadmapId,
                dayNumber,
                weekNumber,
                type: 'daily',
                content,
            });

            return NextResponse.json({ insight: content, cached: false });
        } catch (llmError) {
            console.error('Gemini daily insight error:', llmError);
            return NextResponse.json({ insight: null, error: 'LLM generation failed' });
        }
    } catch (error) {
        console.error('Daily insight error:', error);
        return NextResponse.json({ error: 'Failed to get daily insight' }, { status: 500 });
    }
}
