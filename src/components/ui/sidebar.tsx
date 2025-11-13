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
  ChevronDown,
  Building2,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

type NavSection = 
  | { type: 'item'; href: string; label: string; icon: React.ReactNode }
  | { type: 'group'; label: string; icon: React.ReactNode; items: NavItem[] };

const navSections: NavSection[] = [
  { type: 'item', href: '/admin', label: 'Dashboard', icon: <LayoutDashboard /> },
  {
    type: 'group',
    label: 'Estructura',
    icon: <Building2 />,
    items: [
      { href: '/physical-capability', label: 'Capacidades', icon: <Dumbbell /> },
      { href: '/physical-subcapability', label: 'Subcapacidades', icon: <Dumbbell /> },
      { href: '/training-method', label: 'Métodos de entrenamiento', icon: <Dumbbell /> },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Estructura']);
  const pathname = usePathname();

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupLabel)
        ? prev.filter((g) => g !== groupLabel)
        : [...prev, groupLabel]
    );
  };

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
        {navSections.map((section) => {
          if (section.type === 'item') {
            return (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-all',
                  collapsed ? 'justify-center' : '',
                  pathname === section.href
                    ? 'bg-gray-800 text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                {section.icon}
                {!collapsed && <span>{section.label}</span>}
              </Link>
            );
          }

          // section.type === 'group'
          const groupSection = section as { type: 'group'; label: string; icon: React.ReactNode; items: NavItem[] };
          const isExpanded = expandedGroups.includes(groupSection.label);
          const hasActiveChild = groupSection.items.some(
            (item) => pathname === item.href
          );

          return (
            <div key={groupSection.label}>
              <button
                onClick={() => toggleGroup(groupSection.label)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all',
                  collapsed ? 'justify-center' : '',
                  hasActiveChild
                    ? 'bg-gray-800 text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                {groupSection.icon}
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{groupSection.label}</span>
                    <ChevronDown
                      size={18}
                      className={cn(
                        'transition-transform',
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      )}
                    />
                  </>
                )}
              </button>
              {isExpanded && !collapsed && (
                <div className="ml-4 space-y-1 mt-1">
                  {groupSection.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm',
                        pathname === item.href
                          ? 'bg-gray-700 text-white font-semibold'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
