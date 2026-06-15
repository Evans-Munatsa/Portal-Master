import { NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    
    // Convert formData to simple object
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    // Verify the payment status
    if (data.payment_status === 'COMPLETE') {
      const paymentId = data.m_payment_id;
      if (paymentId && paymentId.startsWith('JOB_')) {
        const jobId = parseInt(paymentId.split('_')[1], 10);
        
        // Update the job status
        if (!isNaN(jobId)) {
          await db.job.update({
            where: { id: jobId },
            data: { status: 'ACTIVE' }
          });
        }
      }
    }

    // Always respond 200 OK so Payfast knows we received it
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('Payfast Webhook ERror:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
