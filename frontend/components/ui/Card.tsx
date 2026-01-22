import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ className = '', ...props }) => (
  <div
    className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}
    {...props}
  />
);

const CardHeader: React.FC<CardHeaderProps> = ({ className = '', ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
);

const CardTitle: React.FC<CardTitleProps> = ({ className = '', ...props }) => (
  <h3 className={`font-semibold leading-none tracking-tight ${className}`} {...props} />
);

const CardContent: React.FC<CardContentProps> = ({ className = '', ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
);

const CardFooter: React.FC<CardFooterProps> = ({ className = '', ...props }) => (
  <div className={`flex items-center p-6 pt-0 ${className}`} {...props} />
);

export { Card, CardHeader, CardTitle, CardContent, CardFooter };