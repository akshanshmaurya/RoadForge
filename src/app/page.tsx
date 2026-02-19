import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth');
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    redirect('/auth');
  }

  await dbConnect();
  const user = await User.findById(userId);

  if (user?.activeRoadmapId) {
    redirect('/dashboard');
  } else {
    redirect('/upload');
  }
}
