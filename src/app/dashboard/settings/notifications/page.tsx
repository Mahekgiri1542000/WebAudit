'use client';
import { useState, useEffect } from 'react';

interface Settings {
  emailAlerts: boolean;
  inAppAlerts: boolean;
  seoAlerts: boolean;
  rankingAlerts: boolean;
  securityAlerts: boolean;
  geoAlerts: boolean;
  digestFrequency: 'daily' | 'weekly' | 'off';
  quietDaysOnly: boolean;
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    emailAlerts: true,
    inAppAlerts: true,
    seoAlerts: true,
    rankingAlerts: true,
    securityAlerts: true,
    geoAlerts: true,
    digestFrequency: 'weekly',
    quietDaysOnly: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/notifications/settings')
      .then((r) => r.json())
      .then((data) => { setSettings(data); setLoading(false); });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch('/api/notifications/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  const Toggle = ({
    field,
    label,
    description,
  }: {
    field: keyof Pick<Settings, 'emailAlerts' | 'inAppAlerts' | 'seoAlerts' | 'rankingAlerts' | 'securityAlerts' | 'geoAlerts' | 'quietDaysOnly'>;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-slate-800">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        {description && <p className="text-slate-500 text-xs mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => setSettings((s) => ({ ...s, [field]: !s[field] }))}
        className={`shrink-0 w-10 h-6 rounded-full transition ${settings[field] ? 'bg-blue-600' : 'bg-slate-700'} relative`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings[field] ? 'left-5' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020817] p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Notification Settings</h1>
        <p className="text-slate-400 text-sm mb-8">Choose when and how you get notified.</p>

        <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Channels</p>
          <Toggle field="emailAlerts" label="Email Alerts" description="Receive email for critical events" />
          <Toggle field="inAppAlerts" label="In-App Alerts" description="Bell icon in dashboard" />

          <p className="text-xs text-slate-500 uppercase tracking-wider mt-4 mb-2">Alert Types</p>
          <Toggle field="seoAlerts" label="SEO Changes" description="Score drops or improvements ≥5 points" />
          <Toggle field="geoAlerts" label="GEO/AI Changes" description="AI search visibility changes" />
          <Toggle field="rankingAlerts" label="Ranking Changes" description="Keyword positions shift ≥3 places" />
          <Toggle field="securityAlerts" label="Security Alerts" description="Malware detected or SSL expiring" />

          <div className="py-4 border-b border-slate-800">
            <label className="block text-white text-sm font-medium mb-1">Email Digest Frequency</label>
            <select
              value={settings.digestFrequency}
              onChange={(e) => setSettings((s) => ({ ...s, digestFrequency: e.target.value as Settings['digestFrequency'] }))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="daily">Daily digest</option>
              <option value="weekly">Weekly digest</option>
              <option value="off">Off (instant only)</option>
            </select>
          </div>

          <Toggle field="quietDaysOnly" label="Weekdays Only" description="Only send alerts Mon–Fri" />

          <div className="pt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {saved && <span className="text-green-400 text-sm">✓ Saved</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
