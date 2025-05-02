'use client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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
    <nav className="w-full bg-base shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-titleXs font-display font-bold text-primary">
          Zipli
        </Link>

        <div className="flex items-center gap-4">
          <Button 
            onClick={handleLogout} 
            variant="secondary"
            size="sm"
          >
            Log out
          </Button>
        </div>
      </div>
    </nav>
  );
} 