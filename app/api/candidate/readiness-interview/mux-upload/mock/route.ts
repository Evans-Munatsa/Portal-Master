import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
  try {
    // Read body content as arrayBuffer (simulate streaming/uploading video binary stream)
    const arrayBuffer = await req.arrayBuffer();
    console.log(`[MUX SIMULATION] Successfully uploaded ${arrayBuffer.byteLength} bytes of recorded candidate video.`);
    
    return NextResponse.json({ success: true, message: 'Mock upload recorded successfully.' });
  } catch (error: any) {
    console.error('[MUX SIMULATION] Error receiving upload data:', error);
    return NextResponse.json({ error: 'Failed simulated upload' }, { status: 500 });
  }
}
