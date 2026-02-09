'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/components/auth/AuthProvider';
import { authClient } from '@/lib/auth-client';

interface HeaderProps extends React.HTMLAttributes<HTMLHeadElement> {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Todo App', className = '', ...props }) => {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/signin');
  };

  return (
    <header className={`bg-background text-foreground shadow-lg py-4 px-4 sm:px-6 ${className}`} {...props}>
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold" tabIndex={0}>
          {title}
        </h1>
        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.name}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Sign Out
              </button>
            </>
          )}
          {!user && (
            <a
              href="/signin"
              className="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Sign In
            </a>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
