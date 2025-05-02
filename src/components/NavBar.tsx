'use client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    signOut();
    router.push('/auth/login');
  };

  return (
    <nav className="w-full flex justify-end p-4 bg-white shadow">
      <Button onClick={handleLogout} className="bg-green-700 hover:bg-green-600">Log out</Button>
    </nav>
  );
} 