import { auth } from '@/lib/auth';
import { getUsageSummary } from '@/lib/billing/usage';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { db } from '@/lib/db';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  // Redirect new users to onboarding (unless they have prior activity)
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      onboardingCompleted: true,
      _count: { select: { audits: true, monitoredSites: true } },
    },
  });
  const hasActivity = (dbUser?._count.audits ?? 0) > 0 || (dbUser?._count.monitoredSites ?? 0) > 0;
  if (dbUser && !dbUser.onboardingCompleted && !hasActivity) {
    redirect('/onboarding');
  }

  const usage = await getUsageSummary(session.user.id);

  return (
    <div className="flex h-screen bg-[#020817] overflow-hidden">
      <Sidebar
        user={{ name: session.user.name, email: session.user.email, role: session.user.role }}
        usage={usage}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
