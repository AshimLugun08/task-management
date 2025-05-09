import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/model/user';

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    await connectDB();
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching user', error }, { status: 500 });
  }
}
