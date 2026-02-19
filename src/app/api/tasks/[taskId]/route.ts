import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        await dbConnect();
        const { taskId } = await params;
        const body = await request.json();

        const task = await Task.findByIdAndUpdate(
            taskId,
            { completed: body.completed },
            { new: true }
        );

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        return NextResponse.json({ task: task.toObject() });
    } catch (error) {
        console.error('Task update error:', error);
        return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
        );
    }
}
