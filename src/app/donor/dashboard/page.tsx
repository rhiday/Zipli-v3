'use client';

export default function DonorDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Food Donor Dashboard</h1>
      <p>Welcome to your donor dashboard. Here you will be able to:</p>
      <ul className="list-disc pl-6 mt-4">
        <li>List available food items</li>
        <li>Create new donations</li>
        <li>Track donation status</li>
        <li>Manage pickup schedules</li>
      </ul>
    </div>
  );
} 