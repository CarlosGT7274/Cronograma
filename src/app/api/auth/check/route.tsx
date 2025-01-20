import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(sessionCookie.value);

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id,
        correo: user.correo,
        roles: user.roles
      }
    });
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
