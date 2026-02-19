import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getSessionUser } from '@/lib/session';
import { parseRoadmapMarkdown } from '@/lib/parser';
import { generateJSON } from '@/lib/gemini';
import Roadmap from '@/models/Roadmap';
import Week from '@/models/Week';
import Day from '@/models/Day';
import Task from '@/models/Task';
import Reference from '@/models/Reference';
import User from '@/models/User';

interface GeminiParsedWeek {
    weekNumber: number;
    title: string;
    days: {
        dayNumber: number;
        type: 'weekday' | 'weekend';
        tasks: {
            title: string;
            category: 'graph' | 'revision' | 'theory';
            link: string | null;
        }[];
    }[];
}

interface GeminiParsedResult {
    weeks: GeminiParsedWeek[];
}

export async function POST(request: NextRequest) {
    try {
        let userId: string;
        try {
            userId = await getSessionUser();
        } catch {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const startDateStr = formData.get('startDate') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const markdown = await file.text();

        // Try Gemini smart parsing first, fallback to local parser
        let parsedWeeks: GeminiParsedWeek[] = [];
        let title = 'Untitled Roadmap';
        let references: { sectionTitle: string; contentMarkdown: string }[] = [];

        try {
            const prompt = `Convert this learning roadmap markdown into structured JSON using this exact schema:

{
  "weeks": [
    {
      "weekNumber": number,
      "title": string,
      "days": [
        {
          "dayNumber": number,
          "type": "weekday" | "weekend",
          "tasks": [
            {
              "title": string,
              "category": "graph" | "revision" | "theory",
              "link": string | null
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- Ignore code blocks and templates
- Extract LeetCode/problem links accurately
- Detect Weekend sections separately (type: "weekend")
- Weekend dayNumber should be 6
- Default category to "graph" unless explicitly labeled as Revision or Theory
- "Revision:" or "Revision: Topic" lines should have category "revision"
- "Theory Revision:" lines should have category "theory"
- Return valid JSON only, no explanation

Markdown content:
${markdown}`;

            const geminiResult = await generateJSON<GeminiParsedResult>(prompt);

            if (geminiResult.weeks && Array.isArray(geminiResult.weeks) && geminiResult.weeks.length > 0) {
                parsedWeeks = geminiResult.weeks;
                // Extract title from first line of markdown
                const titleMatch = markdown.match(/^#\s+(.+)$/m);
                title = titleMatch ? titleMatch[1].trim() : 'Untitled Roadmap';
            } else {
                throw new Error('Invalid Gemini response structure');
            }
        } catch (geminiError) {
            console.log('Gemini parsing failed, falling back to local parser:', geminiError);
            // Fallback to local parser
            const localParsed = parseRoadmapMarkdown(markdown);
            title = localParsed.title;
            references = localParsed.references;
            parsedWeeks = localParsed.weeks.map(w => ({
                weekNumber: w.weekNumber,
                title: w.title,
                days: w.days.map(d => ({
                    dayNumber: d.dayNumber,
                    type: d.type,
                    tasks: d.tasks.map(t => ({
                        title: t.title,
                        category: t.category,
                        link: t.link || null,
                    })),
                })),
            }));
        }

        // Also extract references using local parser (Gemini doesn't handle these)
        if (references.length === 0) {
            const localParsed = parseRoadmapMarkdown(markdown);
            references = localParsed.references;
        }

        // Calculate total days
        let totalDays = 0;
        for (const week of parsedWeeks) {
            totalDays += week.days.length;
        }

        // Deactivate other roadmaps for this user
        await Roadmap.updateMany({ userId, isActive: true }, { isActive: false });

        // Create roadmap
        const roadmap = await Roadmap.create({
            userId,
            title,
            startDate: startDateStr ? new Date(startDateStr) : new Date(),
            totalWeeks: parsedWeeks.length,
            totalDays,
            isActive: true,
        });

        // Update user's active roadmap
        await User.findByIdAndUpdate(userId, { activeRoadmapId: roadmap._id });

        // Create weeks, days, tasks
        let globalDayIndex = 0;
        for (const parsedWeek of parsedWeeks) {
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
                        link: parsedTask.link || '',
                        completed: false,
                    });
                }

                globalDayIndex++;
            }
        }

        // Create references
        for (const ref of references) {
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
                weeks: parsedWeeks.length,
                totalDays,
                references: references.length,
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
