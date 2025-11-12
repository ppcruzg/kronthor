// components/ui/sidebar.tsx
'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Dumbbell,
  Menu,
  ChevronLeft,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard /> },
  { href: '/physical-capability', label: 'Capacidades', icon: <Dumbbell /> },
  { href: '/physical-subcapability', label: 'Subcapacidades', icon: <Dumbbell /> },
  { href: '/training-method', label: 'Métodos de entrenamiento', icon: <Dumbbell /> },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'h-screen bg-gray-900 text-white flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4">
        <span className={cn('text-lg font-bold', collapsed && 'hidden')}>KronThor</span>
        <Button
          variant="ghost"
          size="icon"
          className="text-white"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu /> : <ChevronLeft />}
        </Button>
      </div>
      <nav className="flex-1 px-2 space-y-2">
        {navItems.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md transition-all',
              collapsed ? 'justify-center' : '',
              pathname === href
                ? 'bg-gray-800 text-white font-semibold'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
          >
            {icon}
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
