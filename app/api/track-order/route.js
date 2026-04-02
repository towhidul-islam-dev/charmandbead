import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { consignmentId } = await req.json();

    // 1. Authenticate with Pathao to get a Token
    const authResponse = await fetch('https://api-hermes.pathao.com/aladdin/api/v1/issue-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.PATHAO_CLIENT_ID,
        client_secret: process.env.PATHAO_CLIENT_SECRET,
        username: process.env.PATHAO_MERCHANT_EMAIL,
        password: process.env.PATHAO_MERCHANT_PASSWORD,
        grant_type: "password"
      }),
    });

    const authData = await authResponse.json();
    
    // 2. Use that Token to fetch tracking data
    const trackingResponse = await fetch(`https://api-hermes.pathao.com/aladdin/api/v1/orders/${consignmentId}/tracking`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const trackingData = await trackingResponse.json();
    return NextResponse.json(trackingData);

  } catch (error) {
    return NextResponse.json({ error: "Tracking service unavailable" }, { status: 500 });
  }
}