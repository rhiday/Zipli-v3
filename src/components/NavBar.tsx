'use client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';

export default function NavBar() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <nav className="w-full flex justify-end p-4 bg-white shadow">
      <Button onClick={signOut} className="bg-green-700 hover:bg-green-600">Log out</Button>
    </nav>
  );
} 