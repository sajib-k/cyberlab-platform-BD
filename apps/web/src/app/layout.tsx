import './globals.css';
import React from 'react';

export const metadata = {
  title: 'CyberLab — Cybersecurity Education Platform',
  description: 'Break Things Safely. Build Real Skills.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-obsidian text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
