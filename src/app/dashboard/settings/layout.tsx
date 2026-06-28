'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SETTINGS_NAV = [
  { label: 'Profile', href: '/dashboard/settings/profile', icon: '👤' },
  { label: 'Security', href: '/dashboard/settings/security', icon: '🔐' },
  { label: 'Notifications', href: '/dashboard/settings/notifications', icon: '🔔' },
  { label: 'Billing', href: '/dashboard/settings/billing', icon: '💳' },
  { label: 'API Keys', href: '/dashboard/settings/api-keys', icon: '🔑' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#020817] p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl font-bold text-white mb-6">Settings</h1>
        <div className="flex gap-8">
          {/* Side nav */}
          <aside className="w-48 shrink-0">
            <nav className="space-y-0.5">
              {SETTINGS_NAV.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${active ? 'bg-blue-600/15 text-white font-semibold border border-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
