import { requireAuth, getUserTeams } from '@/lib/auth/auth';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const teams = await getUserTeams(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav user={user} teams={teams} />
      <main className="lg:pl-72">
        <div className="xl:pl-96">
          <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}