import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Roadmap from '@/models/Roadmap';

export default async function Home() {
  try {
    await dbConnect();
    const roadmap = await Roadmap.findOne().sort({ createdAt: -1 });

    if (roadmap) {
      redirect('/dashboard');
    } else {
      redirect('/upload');
    }
  } catch {
    // If DB connection fails, go to upload
    redirect('/upload');
  }
}
