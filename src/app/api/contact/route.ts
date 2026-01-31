import { NextRequest, NextResponse } from 'next/server';
import { validateContactForm } from '@/lib/validation';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { sendContactEmail } from '@/lib/email';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests. Please try again later.',
          errors: { general: 'Rate limit exceeded' },
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimit.resetIn / 1000).toString(),
            'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString(),
          },
        }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request body',
          errors: { general: 'Invalid JSON' },
        },
        { status: 400 }
      );
    }

    // Validate and sanitize input
    const validation = validateContactForm(body);
    
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please fix the errors below',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Send email
    const emailResult = await sendContactEmail(validation.data);

    if (!emailResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: emailResult.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: emailResult.message,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Disallow other methods
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}
