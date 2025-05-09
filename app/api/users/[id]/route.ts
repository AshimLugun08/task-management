import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/model/user';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return the user data
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);

    // Return error response
    return NextResponse.json(
      {
        message: 'Error fetching user',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
