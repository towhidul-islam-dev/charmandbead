import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { consignmentId } = await req.json();

    if (!consignmentId) {
      return NextResponse.json({ success: false, message: "Consignment ID is required" }, { status: 400 });
    }

    // 1. Authenticate using Client ID and Client Secret only
    const authResponse = await fetch('https://api-hermes.pathao.com/aladdin/api/v1/issue-token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json' 
      },
      body: JSON.stringify({
        client_id: process.env.PATHAO_CLIENT_ID,
        client_secret: process.env.PATHAO_CLIENT_SECRET,
        grant_type: "client_credentials"
      }),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok || !authData.access_token) {
      console.error("Pathao Auth Error Response:", authData);
      return NextResponse.json({ 
        success: false, 
        message: authData.message || "Pathao authentication failed." 
      }, { status: 401 });
    }

    // 2. Fetch Live Tracking Data using the Access Token
    const trackingResponse = await fetch(`https://api-hermes.pathao.com/aladdin/api/v1/orders/${consignmentId}/tracking`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const trackingResult = await trackingResponse.json();

    if (!trackingResponse.ok) {
      console.error("Pathao Tracking Error Response:", trackingResult);
      return NextResponse.json({ 
        success: false, 
        message: trackingResult.message || "Failed to fetch tracking details from Pathao" 
      }, { status: trackingResponse.status });
    }

    return NextResponse.json({
      success: true,
      data: trackingResult.data || trackingResult
    });

  } catch (error) {
    console.error("Tracking Route Exception:", error);
    return NextResponse.json({ success: false, error: "Tracking service unavailable" }, { status: 500 });
  }
}