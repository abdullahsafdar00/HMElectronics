import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import courierService from '@/lib/courier-services';

export async function GET(request, { params }) {
  try {
    // 1. Ensure the user is securely authenticated via Clerk before querying logistics
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized session' }, { status: 401 });
    }

    const { trackingNumber } = await params;

    if (!trackingNumber) {
      return NextResponse.json({ success: false, error: 'Tracking number parameter missing' }, { status: 400 });
    }

    // 2. Fetch live data from the courier partner API wrapper
    const result = await courierService.trackShipment(trackingNumber, 'tcs');

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }

    // Return the tracking results to the client-side component
    return NextResponse.json({
      success: true,
      status: result.status,
      currentLocation: result.currentLocation,
      history: result.history || [] // Array of checkpoints containing { date, time, location, remarks }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
