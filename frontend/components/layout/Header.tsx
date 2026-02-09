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
    <header className={`sticky top-0 z-40 backdrop-blur-md bg-background/80 text-foreground shadow-lg py-4 px-4 sm:px-6 ${className}`} {...props}>
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text" tabIndex={0}>
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
      {/* Gradient accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] gradient-hero" />
    </header>
  );
};

export default Header;
