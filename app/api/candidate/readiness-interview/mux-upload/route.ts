import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import Mux from '@mux/mux-node';

// Access variables safely to prevent build-time/startup crashing
const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Mux is configured
    if (MUX_TOKEN_ID && MUX_TOKEN_SECRET) {
      const mux = new Mux({
        tokenId: MUX_TOKEN_ID,
        tokenSecret: MUX_TOKEN_SECRET,
      });

      // Create a Mux Direct Upload
      const upload = await mux.video.uploads.create({
        new_asset_settings: {
          playback_policy: ['public'],
        },
        cors_origin: '*', // Allows candidate client-side blobs to upload directly
      });

      return NextResponse.json({
        success: true,
        isMock: false,
        uploadId: upload.id,
        uploadUrl: upload.url,
      });
    } else {
      // Graceful local development / sandbox simulation fallback
      console.warn('Mux is not configured. Falling back to video presentation simulator mode.');
      
      const mockUploadId = `mock_upload_${Math.random().toString(36).substring(2)}`;
      
      return NextResponse.json({
        success: true,
        isMock: true,
        uploadId: mockUploadId,
        uploadUrl: `/api/candidate/readiness-interview/mux-upload/mock`, // local simulated receiver route
      });
    }
  } catch (error: any) {
    console.error('Error generating Mux upload URL:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
