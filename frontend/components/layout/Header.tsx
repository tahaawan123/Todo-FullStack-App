import React from 'react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface HeaderProps extends React.HTMLAttributes<HTMLHeadElement> {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Todo App', className = '', ...props }) => {
  return (
    <header className={`bg-background text-foreground shadow-lg py-4 px-4 sm:px-6 ${className}`} {...props}>
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold" tabIndex={0}>
          {title}
        </h1>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;