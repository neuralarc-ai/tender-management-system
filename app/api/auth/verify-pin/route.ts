import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/verify-pin
 * Verify PIN and return user info
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin || pin.length !== 4) {
      return NextResponse.json(
        { error: 'Invalid PIN format' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Fetch all active users (demo has only 2)
    const { data: users, error } = await serviceClient
      .from('users')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Authentication service error' },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'No users found. Please run seed migration.' },
        { status: 404 }
      );
    }

    // Check PIN against all users
    for (const user of users) {
      // For demo: simple match (7531 for partner, 1978 for admin, 8642 for Selina)
      // In production: use bcrypt.compare(pin, user.pin_hash)
      const isMatch = (pin === '7531' && user.role === 'client' && user.email === 'partner@dcs.com') || 
                      (pin === '1978' && user.role === 'admin') ||
                      (pin === '8642' && user.email === 'selina@godaddy.com');
      
      if (isMatch) {
        // Update last login
        await serviceClient
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', user.id);

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            organization: user.organization_name,
            fullName: user.full_name
          }
        });
      }
    }

    // No match found
    return NextResponse.json(
      { error: 'Invalid PIN' },
      { status: 401 }
    );

  } catch (error: any) {
    console.error('Error verifying PIN:', error);
    return NextResponse.json(
      { error: 'Authentication failed', details: error.message },
      { status: 500 }
    );
  }
}

