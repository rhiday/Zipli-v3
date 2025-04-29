'use client';

export default function TerminalDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Food Terminal Dashboard</h1>
      <p>Welcome to your terminal dashboard. Here you will be able to:</p>
      <ul className="list-disc pl-6 mt-4">
        <li>Process large-scale food donations</li>
        <li>Coordinate with multiple donors and receivers</li>
        <li>Manage food storage and distribution</li>
        <li>Track processing center capacity</li>
      </ul>
    </div>
  );
} 