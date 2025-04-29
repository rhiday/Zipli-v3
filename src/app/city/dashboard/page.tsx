'use client';

export default function CityDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">City Administration Dashboard</h1>
      <p>Welcome to your city dashboard. Here you will be able to:</p>
      <ul className="list-disc pl-6 mt-4">
        <li>Monitor food waste reduction</li>
        <li>View city-wide donation statistics</li>
        <li>Manage food safety compliance</li>
        <li>Generate sustainability reports</li>
      </ul>
    </div>
  );
} 