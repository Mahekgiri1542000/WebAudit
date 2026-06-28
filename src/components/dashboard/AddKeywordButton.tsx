'use client';

export default function AddKeywordButton({ siteId }: { siteId: string }) {
  const handleClick = () => {
    const keyword = window.prompt('Enter keyword to track (e.g. "plumber dallas"):');
    if (!keyword?.trim()) return;
    fetch(`/api/sites/${siteId}/keywords`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword: keyword.trim() }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { alert(data.error); return; }
        window.location.reload();
      })
      .catch(() => alert('Failed to add keyword'));
  };

  return (
    <button
      onClick={handleClick}
      className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
    >
      + Keyword
    </button>
  );
}
