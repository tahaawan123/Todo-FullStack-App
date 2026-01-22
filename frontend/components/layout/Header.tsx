import React from 'react';

interface HeaderProps extends React.HTMLAttributes<HTMLHeadElement> {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Todo App', className = '', ...props }) => {
  return (
    <header className={`bg-white shadow-sm py-4 px-6 ${className}`} {...props}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900" tabIndex={0}>
          {title}
        </h1>
      </div>
    </header>
  );
};

export default Header;