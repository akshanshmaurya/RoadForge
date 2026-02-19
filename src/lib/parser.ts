/**
 * RoadForge Markdown Parser
 * 
 * Parses LLM-generated markdown roadmaps into structured data.
 * Handles varying formats across weeks (explicit Graph:/Revision: labels vs implicit).
 */

export interface ParsedTask {
    title: string;
    category: 'graph' | 'revision' | 'theory';
    link: string;
}

export interface ParsedDay {
    dayNumber: number;
    type: 'weekday' | 'weekend';
    tasks: ParsedTask[];
}

export interface ParsedWeek {
    weekNumber: number;
    title: string;
    days: ParsedDay[];
}

export interface ParsedReference {
    sectionTitle: string;
    contentMarkdown: string;
}

export interface ParsedRoadmap {
    title: string;
    weeks: ParsedWeek[];
    references: ParsedReference[];
}

function extractLink(line: string): string {
    const trimmed = line.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }
    return '';
}

function isWeekHeader(line: string): RegExpMatchArray | null {
    return line.match(/^#\s+WEEK\s+(\d+)\s*[–-]\s*(.+)$/i)
        || line.match(/^#\s+WEEK\s+(\d+)\s*[–-]\s*(.+)$/i);
}

function isDayHeader(line: string): RegExpMatchArray | null {
    return line.match(/^###\s+Day\s+(\d+)/i);
}

function isWeekendHeader(line: string): boolean {
    return /^###\s+Weekend/i.test(line);
}

function isSectionHeader(line: string): RegExpMatchArray | null {
    return line.match(/^#\s+(.+)$/);
}

function isCodeBlockDelimiter(line: string): boolean {
    return line.trim().startsWith('```');
}

/**
 * Splits the markdown into reference sections (before first WEEK and after last WEEK)
 * and week blocks.
 */
function splitIntoSections(lines: string[]): {
    referenceLines: { title: string; lines: string[] }[];
    weekBlocks: { weekNumber: number; title: string; lines: string[] }[];
} {
    const referenceLines: { title: string; lines: string[] }[] = [];
    const weekBlocks: { weekNumber: number; title: string; lines: string[] }[] = [];

    let currentSection: { title: string; lines: string[] } | null = null;
    let currentWeek: { weekNumber: number; title: string; lines: string[] } | null = null;
    let firstWeekFound = false;

    // Sections to skip (not reference-worthy)
    const skipSections = new Set([
        '8-week graph mastery roadmap (placement-oriented)',
        'final outcome after 8 weeks',
    ]);

    for (const line of lines) {
        const weekMatch = isWeekHeader(line);
        if (weekMatch) {
            // Save previous section/week
            if (currentSection && !skipSections.has(currentSection.title.toLowerCase())) {
                referenceLines.push(currentSection);
            }
            if (currentWeek) {
                weekBlocks.push(currentWeek);
            }
            currentSection = null;
            firstWeekFound = true;
            currentWeek = {
                weekNumber: parseInt(weekMatch[1]),
                title: weekMatch[2].trim(),
                lines: [],
            };
            continue;
        }

        const sectionMatch = isSectionHeader(line);
        if (sectionMatch && !weekMatch) {
            // It's a top-level # section that's not a WEEK
            if (currentSection && !skipSections.has(currentSection.title.toLowerCase())) {
                referenceLines.push(currentSection);
            }
            if (currentWeek) {
                weekBlocks.push(currentWeek);
                currentWeek = null;
            }
            currentSection = {
                title: sectionMatch[1].trim(),
                lines: [],
            };
            continue;
        }

        if (currentWeek) {
            currentWeek.lines.push(line);
        } else if (currentSection) {
            currentSection.lines.push(line);
        }
    }

    // Save final block
    if (currentWeek) weekBlocks.push(currentWeek);
    if (currentSection && !skipSections.has(currentSection.title.toLowerCase())) {
        referenceLines.push(currentSection);
    }

    return { referenceLines, weekBlocks };
}

/**
 * Parse a block of lines from a single day into tasks.
 */
function parseDayBlock(lines: string[]): ParsedTask[] {
    const tasks: ParsedTask[] = [];
    let currentCategory: 'graph' | 'revision' | 'theory' = 'graph';
    let inCodeBlock = false;
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip code blocks
        if (isCodeBlockDelimiter(line)) {
            inCodeBlock = !inCodeBlock;
            i++;
            continue;
        }
        if (inCodeBlock) {
            i++;
            continue;
        }

        // Skip empty lines and separators
        if (!trimmed || trimmed === '---') {
            i++;
            continue;
        }

        // Detect category labels
        if (/^Graph:$/i.test(trimmed) || /^Graph\s*Problems?:$/i.test(trimmed)) {
            currentCategory = 'graph';
            i++;
            continue;
        }

        if (/^Revision:$/i.test(trimmed)) {
            currentCategory = 'revision';
            i++;
            continue;
        }

        if (/^Theory\s*Revision:$/i.test(trimmed) || /^Theory:$/i.test(trimmed)) {
            currentCategory = 'theory';
            i++;
            continue;
        }

        // Inline "Revision: Topic Name" format
        const inlineRevisionMatch = trimmed.match(/^Revision:\s+(.+)$/i);
        if (inlineRevisionMatch) {
            const title = inlineRevisionMatch[1].trim();
            tasks.push({ title, category: 'revision', link: '' });
            i++;
            continue;
        }

        // Inline "Theory Revision: Topic" format
        const inlineTheoryMatch = trimmed.match(/^Theory\s+Revision:\s+(.+)$/i);
        if (inlineTheoryMatch) {
            const title = inlineTheoryMatch[1].trim();
            tasks.push({ title, category: 'theory', link: '' });
            i++;
            continue;
        }

        // Task items: lines starting with "-"
        if (trimmed.startsWith('- ')) {
            const taskTitle = trimmed.slice(2).trim();
            // Check if next line is a link
            let link = '';
            if (i + 1 < lines.length) {
                link = extractLink(lines[i + 1]);
                if (link) i++; // consume the link line
            }
            tasks.push({ title: taskTitle, category: currentCategory, link });
            i++;
            continue;
        }

        // Standalone link on its own line (for some formats)
        const standaloneLink = extractLink(trimmed);
        if (standaloneLink) {
            // Link without preceding task - skip (already consumed)
            i++;
            continue;
        }

        // Lines that might be task descriptions without dash (Week 2+ format)
        // e.g., "- 01 Matrix" at top of day block defaults to graph
        i++;
    }

    return tasks;
}

/**
 * Parse a week block into days.
 */
function parseWeekBlock(weekLines: string[], weekNumber: number): ParsedDay[] {
    const days: ParsedDay[] = [];

    // Split by day headers
    const dayBlocks: { dayNumber: number; type: 'weekday' | 'weekend'; lines: string[] }[] = [];
    let currentDayBlock: { dayNumber: number; type: 'weekday' | 'weekend'; lines: string[] } | null = null;

    for (const line of weekLines) {
        const dayMatch = isDayHeader(line);
        if (dayMatch) {
            if (currentDayBlock) dayBlocks.push(currentDayBlock);
            currentDayBlock = {
                dayNumber: parseInt(dayMatch[1]),
                type: 'weekday',
                lines: [],
            };
            continue;
        }

        if (isWeekendHeader(line)) {
            if (currentDayBlock) dayBlocks.push(currentDayBlock);
            currentDayBlock = {
                dayNumber: 6, // weekend
                type: 'weekend',
                lines: [],
            };
            continue;
        }

        if (currentDayBlock) {
            currentDayBlock.lines.push(line);
        } else {
            // Lines before any day header in the week block
            // These might be general week instructions (e.g., Week 8 "Daily:" instructions)
            // Try to add them as a Day 1 with general tasks
            if (line.trim() && !line.trim().startsWith('---')) {
                if (!currentDayBlock) {
                    currentDayBlock = {
                        dayNumber: 1,
                        type: 'weekday',
                        lines: [],
                    };
                }
                currentDayBlock.lines.push(line);
            }
        }
    }

    if (currentDayBlock) dayBlocks.push(currentDayBlock);

    // Parse each day block
    for (const block of dayBlocks) {
        const tasks = parseDayBlock(block.lines);
        if (tasks.length > 0 || block.type === 'weekend') {
            days.push({
                dayNumber: block.dayNumber,
                type: block.type,
                tasks,
            });
        }
    }

    // Handle weeks without explicit day headers (e.g., Week 8 simulation)
    // If no days were found, create a single day with all tasks
    if (days.length === 0) {
        const tasks = parseDayBlock(weekLines);
        if (tasks.length > 0) {
            days.push({
                dayNumber: 1,
                type: 'weekday',
                tasks,
            });
        }
    }

    return days;
}

/**
 * Main parser entry point.
 * Takes raw markdown string and returns structured roadmap data.
 */
export function parseRoadmapMarkdown(markdown: string): ParsedRoadmap {
    const lines = markdown.split('\n');
    const { referenceLines, weekBlocks } = splitIntoSections(lines);

    // Extract title from first H1
    let title = 'Untitled Roadmap';
    for (const line of lines) {
        const match = line.match(/^#\s+(.+)$/);
        if (match) {
            title = match[1].trim();
            break;
        }
    }

    // Parse weeks
    const weeks: ParsedWeek[] = weekBlocks.map((wb) => ({
        weekNumber: wb.weekNumber,
        title: wb.title,
        days: parseWeekBlock(wb.lines, wb.weekNumber),
    }));

    // Parse references
    const references: ParsedReference[] = referenceLines
        .filter(r => r.lines.some(l => l.trim().length > 0))
        .map((r) => ({
            sectionTitle: r.title,
            contentMarkdown: r.lines.join('\n').trim(),
        }));

    return { title, weeks, references };
}
