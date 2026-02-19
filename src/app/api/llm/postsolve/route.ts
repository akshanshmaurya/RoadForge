import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getSessionUser } from '@/lib/session';
import { generateContent } from '@/lib/gemini';
import LLMInsight from '@/models/LLMInsight';
import Task from '@/models/Task';
import Day from '@/models/Day';
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
        const { taskId } = await request.json();

        if (!taskId) {
            return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user?.activeRoadmapId) {
            return NextResponse.json({ error: 'No active roadmap' }, { status: 404 });
        }

        const roadmapId = user.activeRoadmapId;

        // Check cache
        const cached = await LLMInsight.findOne({
            userId,
            roadmapId,
            type: 'postsolve',
            taskId,
        });

        if (cached) {
            return NextResponse.json({ insight: cached.content, cached: true });
        }

        // Verify task ownership
        const task = await Task.findById(taskId);
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        const day = await Day.findById(task.dayId);
        if (!day) {
            return NextResponse.json({ error: 'Day not found' }, { status: 404 });
        }

        const roadmap = await Roadmap.findOne({ _id: day.roadmapId, userId });
        if (!roadmap) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const prompt = `You are a technical learning assistant. For this problem:

Title: ${task.title}
Category: ${task.category}

Provide:
- Expected approach (brief)
- Pattern classification
- Time complexity
- One common mistake

Limit to 100 words. Return plain text only, no markdown headers.`;

        try {
            const content = await generateContent(prompt);

            await LLMInsight.create({
                userId,
                roadmapId,
                taskId,
                type: 'postsolve',
                content,
            });

            return NextResponse.json({ insight: content, cached: false });
        } catch (llmError) {
            console.error('Gemini postsolve error:', llmError);
            return NextResponse.json({ insight: null, error: 'LLM generation failed' });
        }
    } catch (error) {
        console.error('Post-solve error:', error);
        return NextResponse.json({ error: 'Failed to generate learning summary' }, { status: 500 });
    }
}
