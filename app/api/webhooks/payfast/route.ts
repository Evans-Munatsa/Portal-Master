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
      if (paymentId) {
        if (paymentId.startsWith('JOB_')) {
          const jobId = parseInt(paymentId.split('_')[1], 10);
          
          // Update the job status
          if (!isNaN(jobId)) {
            await db.job.update({
              where: { id: jobId },
              data: { status: 'ACTIVE' }
            });
          }
        } else if (paymentId.startsWith('UNLOCK_JOB_')) {
          const jobId = parseInt(paymentId.split('_')[2], 10);
          if (!isNaN(jobId)) {
            const job = await db.job.findUnique({
              where: { id: jobId }
            });
            if (job && job.tenant_id) {
              const tenant = await db.tenant.findUnique({
                where: { id: job.tenant_id }
              });
              if (tenant) {
                let featuresObj: any = {};
                try {
                  featuresObj = JSON.parse(tenant.features || '{}');
                } catch (e) {
                  featuresObj = {};
                }
                if (!featuresObj.unlockedJobIds) {
                  featuresObj.unlockedJobIds = [];
                }
                if (!featuresObj.unlockedJobIds.includes(jobId)) {
                  featuresObj.unlockedJobIds.push(jobId);
                }
                await db.tenant.update({
                  where: { id: job.tenant_id },
                  data: {
                    features: JSON.stringify(featuresObj)
                  }
                });
              }
            }
          }
        } else if (paymentId.startsWith('UNLOCK_TENANT_')) {
          const tenantId = parseInt(paymentId.split('_')[2], 10);
          
          // Update the tenant plan to premium
          if (!isNaN(tenantId)) {
            await db.tenant.update({
              where: { id: tenantId },
              data: { plan: 'premium' }
            });
          }
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
