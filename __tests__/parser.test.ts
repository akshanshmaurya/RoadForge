import { parseRoadmapMarkdown } from '../src/lib/parser';

describe('parseRoadmapMarkdown', () => {
    it('should extract the title from the first H1', () => {
        const md = `# My Test Roadmap

# WEEK 1 – Basics
### Day 1
- Task A
`;
        const result = parseRoadmapMarkdown(md);
        expect(result.title).toBe('My Test Roadmap');
    });

    it('should parse weeks with correct weekNumber and title', () => {
        const md = `# Roadmap

# WEEK 1 – Introduction
### Day 1
- Task 1

# WEEK 2 – Advanced
### Day 1
- Task 2
`;
        const result = parseRoadmapMarkdown(md);
        expect(result.weeks).toHaveLength(2);
        expect(result.weeks[0].weekNumber).toBe(1);
        expect(result.weeks[0].title).toBe('Introduction');
        expect(result.weeks[1].weekNumber).toBe(2);
        expect(result.weeks[1].title).toBe('Advanced');
    });

    it('should parse days within a week', () => {
        const md = `# Roadmap

# WEEK 1 – Basics
### Day 1
- Task A
### Day 2
- Task B
### Weekend
- Revision task
`;
        const result = parseRoadmapMarkdown(md);
        const week1 = result.weeks[0];
        expect(week1.days).toHaveLength(3);
        expect(week1.days[0].dayNumber).toBe(1);
        expect(week1.days[0].type).toBe('weekday');
        expect(week1.days[2].type).toBe('weekend');
    });

    it('should parse tasks with categories', () => {
        const md = `# Roadmap

# WEEK 1 – Basics
### Day 1
Graph:
- BFS problem
- DFS problem
Revision:
- Array basics
`;
        const result = parseRoadmapMarkdown(md);
        const tasks = result.weeks[0].days[0].tasks;
        expect(tasks).toHaveLength(3);
        expect(tasks[0].category).toBe('graph');
        expect(tasks[1].category).toBe('graph');
        expect(tasks[2].category).toBe('revision');
    });

    it('should parse tasks with links', () => {
        const md = `# Roadmap

# WEEK 1 – Basics
### Day 1
- BFS problem
https://leetcode.com/problems/bfs
- DFS problem
`;
        const result = parseRoadmapMarkdown(md);
        const tasks = result.weeks[0].days[0].tasks;
        expect(tasks[0].title).toBe('BFS problem');
        expect(tasks[0].link).toBe('https://leetcode.com/problems/bfs');
        expect(tasks[1].link).toBe('');
    });

    it('should extract reference sections', () => {
        const md = `# Roadmap

# BFS Template

\`\`\`python
def bfs(graph, start):
    pass
\`\`\`

# WEEK 1 – Basics
### Day 1
- Task A

# Complexity Table

| Op  | Time |
|-----|------|
| BFS | O(V) |
`;
        const result = parseRoadmapMarkdown(md);
        expect(result.references.length).toBeGreaterThanOrEqual(1);
        const bfsRef = result.references.find(r => r.sectionTitle === 'BFS Template');
        expect(bfsRef).toBeDefined();
        expect(bfsRef!.contentMarkdown).toContain('def bfs');
    });

    it('should handle empty markdown', () => {
        const result = parseRoadmapMarkdown('');
        expect(result.title).toBe('Untitled Roadmap');
        expect(result.weeks).toHaveLength(0);
        expect(result.references).toHaveLength(0);
    });

    it('should handle inline revision format', () => {
        const md = `# Roadmap

# WEEK 1 – Basics
### Day 1
Revision: Array basics review
`;
        const result = parseRoadmapMarkdown(md);
        const tasks = result.weeks[0].days[0].tasks;
        expect(tasks).toHaveLength(1);
        expect(tasks[0].category).toBe('revision');
        expect(tasks[0].title).toBe('Array basics review');
    });
});
