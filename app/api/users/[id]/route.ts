import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/model/user';

// Using Route Segment Config to specify dynamic params handling
export const dynamic = 'force-dynamic';

/**
 * GET handler for the user by ID route
 * @param request - The incoming request object
 * @param context - The route context with dynamic params
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // Explicitly type params as Promise
) {
  try {
    await connectDB();

    // Await params to resolve the Promise
    const { id } = await context.params;

    // Fetch user by ID
    const user = await User.findById(id);

    // Return 404 if user not found
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