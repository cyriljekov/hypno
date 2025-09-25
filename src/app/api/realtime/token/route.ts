import { NextResponse } from 'next/server';

interface EphemeralTokenResponse {
  value: string;
  expires_at: string;
}

interface ErrorResponse {
  error: string;
  message: string;
}

export async function POST() {
  try {
    // Validate API key exists
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Configuration Error', message: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Request ephemeral token from OpenAI
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: 'gpt-realtime',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', errorData);

      return NextResponse.json(
        {
          error: 'Token Generation Failed',
          message: 'Unable to generate ephemeral token',
        },
        { status: response.status }
      );
    }

    const data: EphemeralTokenResponse = await response.json();

    // Return token with CORS headers for WebRTC
    return NextResponse.json(
      { token: data.value, expiresAt: data.expires_at },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Token generation error:', error);

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/*
 * Security Considerations:
 * 1. Ephemeral tokens expire in 60 seconds, limiting exposure
 * 2. API key is never exposed to client
 * 3. CORS headers configured for WebRTC requirements
 * 4. Error messages don't leak sensitive information
 * 5. Rate limiting should be implemented at infrastructure level (Vercel/Cloudflare)
 * 6. Consider adding request validation and IP-based throttling for production
 */