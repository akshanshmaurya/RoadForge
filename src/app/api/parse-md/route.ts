import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { parseRoadmapMarkdown } from '@/lib/parser';
import Roadmap from '@/models/Roadmap';
import Week from '@/models/Week';
import Day from '@/models/Day';
import Task from '@/models/Task';
import Reference from '@/models/Reference';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const startDateStr = formData.get('startDate') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const markdown = await file.text();
        const parsed = parseRoadmapMarkdown(markdown);

        // Delete existing roadmap data (keep latest active)
        const existingRoadmaps = await Roadmap.find({});
        for (const rm of existingRoadmaps) {
            const weeks = await Week.find({ roadmapId: rm._id });
            const weekIds = weeks.map(w => w._id);
            const days = await Day.find({ roadmapId: rm._id });
            const dayIds = days.map(d => d._id);
            await Task.deleteMany({ dayId: { $in: dayIds } });
            await Day.deleteMany({ roadmapId: rm._id });
            await Week.deleteMany({ roadmapId: rm._id });
            await Reference.deleteMany({ roadmapId: rm._id });
            await Roadmap.deleteOne({ _id: rm._id });
        }

        // Calculate total days
        let totalDays = 0;
        for (const week of parsed.weeks) {
            totalDays += week.days.length;
        }

        // Create roadmap
        const roadmap = await Roadmap.create({
            title: parsed.title,
            startDate: startDateStr ? new Date(startDateStr) : new Date(),
            totalWeeks: parsed.weeks.length,
            totalDays,
        });

        // Create weeks, days, tasks
        let globalDayIndex = 0;
        for (const parsedWeek of parsed.weeks) {
            const week = await Week.create({
                roadmapId: roadmap._id,
                weekNumber: parsedWeek.weekNumber,
                title: parsedWeek.title,
            });

            for (const parsedDay of parsedWeek.days) {
                const day = await Day.create({
                    roadmapId: roadmap._id,
                    weekId: week._id,
                    weekNumber: parsedWeek.weekNumber,
                    dayNumber: parsedDay.dayNumber,
                    globalDayIndex,
                    type: parsedDay.type,
                });

                for (const parsedTask of parsedDay.tasks) {
                    await Task.create({
                        dayId: day._id,
                        title: parsedTask.title,
                        category: parsedTask.category,
                        link: parsedTask.link,
                        completed: false,
                    });
                }

                globalDayIndex++;
            }
        }

        // Create references
        for (const ref of parsed.references) {
            await Reference.create({
                roadmapId: roadmap._id,
                sectionTitle: ref.sectionTitle,
                contentMarkdown: ref.contentMarkdown,
            });
        }

        return NextResponse.json({
            success: true,
            roadmapId: roadmap._id,
            stats: {
                weeks: parsed.weeks.length,
                totalDays,
                references: parsed.references.length,
            },
        });
    } catch (error) {
        console.error('Parse error:', error);
        return NextResponse.json(
            { error: 'Failed to parse markdown file' },
            { status: 500 }
        );
    }
}
