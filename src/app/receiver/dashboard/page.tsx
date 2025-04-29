'use client';

export default function ReceiverDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Food Receiver Dashboard</h1>
      <p>Welcome to your receiver dashboard. Here you will be able to:</p>
      <ul className="list-disc pl-6 mt-4">
        <li>Browse available donations</li>
        <li>Claim food items</li>
        <li>Schedule pickups</li>
        <li>View donation history</li>
      </ul>
    </div>
  );
} 