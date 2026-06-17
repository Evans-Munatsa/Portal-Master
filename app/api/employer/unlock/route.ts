import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { NextResponse } from 'next/server';
import { PayfastService } from '@/services/integrations/payfast.service';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'CLIENT' && session.role !== 'EMPLOYER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, jobId } = await req.json();

    // Find the user with their tenant
    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { tenant: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ensure user has a tenant
    let tenantId = user.tenant_id;
    let tenant = user.tenant;

    if (!tenantId || !tenant) {
      const newTenant = await db.tenant.create({
        data: {
          name: user.name ? `${user.name}'s Workspace` : 'Employer Workspace',
          plan: 'free'
        }
      });
      tenantId = newTenant.id;
      tenant = newTenant;
      
      await db.user.update({
        where: { id: user.id },
        data: { tenant_id: tenantId }
      });
    }

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required to unlock candidate pipeline' }, { status: 400 });
    }

    const numericJobId = parseInt(String(jobId), 10);
    // Verify that the job belongs to this employer
    const job = await db.job.findFirst({
      where: {
        id: numericJobId,
        employer_id: session.userId
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
    }

    if (action === 'bypass') {
      let featuresObj: any = {};
      try {
        featuresObj = JSON.parse(tenant?.features || '{}');
      } catch (e) {
        featuresObj = {};
      }
      if (!featuresObj.unlockedJobIds) {
        featuresObj.unlockedJobIds = [];
      }
      if (!featuresObj.unlockedJobIds.includes(numericJobId)) {
        featuresObj.unlockedJobIds.push(numericJobId);
      }

      const updatedTenant = await db.tenant.update({
        where: { id: tenantId },
        data: {
          features: JSON.stringify(featuresObj)
        }
      });

      return NextResponse.json({ success: true, bypassed: true, plan: updatedTenant.plan, unlockedJobIds: featuresObj.unlockedJobIds });
    }

    // Otherwise, generate real/sandbox Payfast checkout parameters
    const origin = new URL(req.url).origin;
    const paymentId = `UNLOCK_JOB_${numericJobId}`;
    const amount = 499.00; // Unlock fee in ZAR per job
    const itemName = `LaunchPath Candidate Pipeline Unlock - ${job.title}`;

    const returnUrl = `${origin}/employer/dashboard?unlocked=true&jobId=${numericJobId}`;
    const cancelUrl = `${origin}/employer/dashboard?cancel=true`;
    const notifyUrl = `${origin}/api/webhooks/payfast`;

    const payfastData = PayfastService.generatePaymentData(
      paymentId,
      amount,
      itemName,
      returnUrl,
      cancelUrl,
      notifyUrl
    );

    return NextResponse.json({ success: true, payfast: payfastData });

  } catch (error) {
    console.error('Unlock API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
