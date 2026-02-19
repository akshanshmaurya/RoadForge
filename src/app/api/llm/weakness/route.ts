import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getSessionUser } from '@/lib/session';
import { generateContent } from '@/lib/gemini';
import LLMInsight from '@/models/LLMInsight';
import Day from '@/models/Day';
import Task from '@/models/Task';
import User from '@/models/User';

export async function GET() {
    try {
        let userId: string;
        try {
            userId = await getSessionUser();
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findById(userId);
        if (!user?.activeRoadmapId) {
            return NextResponse.json({ error: 'No active roadmap' }, { status: 404 });
        }

        const roadmapId = user.activeRoadmapId;

        // Check if we already have a recent weakness report (within 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const cached = await LLMInsight.findOne({
            userId,
            roadmapId,
            type: 'weakness',
            createdAt: { $gte: sevenDaysAgo },
        }).sort({ createdAt: -1 });

        if (cached) {
            return NextResponse.json({ report: cached.content, cached: true });
        }

        // Gather performance data
        const days = await Day.find({ roadmapId });
        const dayIds = days.map(d => d._id);
        const tasks = await Task.find({ dayId: { $in: dayIds } });

        if (tasks.length === 0) {
            return NextResponse.json({ report: null });
        }

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.completed).length;
        const skippedTasks = totalTasks - completedTasks;

        // Category breakdown
        const categories = ['graph', 'revision', 'theory'] as const;
        const categoryStats = categories.map(cat => {
            const catTasks = tasks.filter(t => t.category === cat);
            const completed = catTasks.filter(t => t.completed).length;
            const hard = catTasks.filter(t => t.difficulty === 'hard').length;
            return `${cat}: ${completed}/${catTasks.length} completed, ${hard} marked hard`;
        }).join('\n');

        // Difficulty breakdown
        const hardTasks = tasks.filter(t => t.difficulty === 'hard');
        const hardList = hardTasks.length > 0
            ? hardTasks.slice(0, 10).map(t => `- ${t.title} (${t.category})`).join('\n')
            : 'None marked as hard yet';

        const prompt = `You are a learning performance analyst. Based on this performance data:

Total tasks: ${totalTasks}
Completed: ${completedTasks}
Skipped: ${skippedTasks}

Category performance:
${categoryStats}

Tasks marked as hard:
${hardList}

Provide:
1. Identify the weakest pattern/area
2. Suggest 3 specific revision topics
3. Strategic advice for the coming week

Limit to 150 words. Return plain text only, no markdown headers.`;

        try {
            const content = await generateContent(prompt);

            await LLMInsight.create({
                userId,
                roadmapId,
                type: 'weakness',
                content,
            });

            return NextResponse.json({ report: content, cached: false });
        } catch (llmError) {
            console.error('Gemini weakness error:', llmError);
            return NextResponse.json({ report: null, error: 'LLM generation failed' });
        }
    } catch (error) {
        console.error('Weakness report error:', error);
        return NextResponse.json({ error: 'Failed to generate weakness report' }, { status: 500 });
    }
}
