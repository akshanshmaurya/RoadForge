import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getSessionUser(): Promise<string> {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as { id?: string }).id) {
        throw new Error('UNAUTHORIZED');
    }

    return (session.user as { id: string }).id;
}
