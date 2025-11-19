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
  Activity,
  Gauge,
  Workflow,
  GitBranch,
  Package,
  Wrench,
  Network,
  Drumstick,
  SplitSquareHorizontal,
  GitMerge,
  Link2,
  Brain,
  Medal,
  Puzzle,
  Layers,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  phase?: number;
}

type NavSection =
  | {
      type: 'item';
      href: string;
      label: string;
      icon: React.ReactNode;
      phase?: number;
    }
  | {
      type: 'group';
      label: string;
      icon: React.ReactNode;
      phase?: number;
      items: NavItem[];
    };

const navSections: NavSection[] = [
  {
    type: 'item',
    href: '/dash',
    label: 'Dashboard',
    icon: <LayoutDashboard />,
  },

  {
    type: 'group',
    label: 'Ejercicios',
    icon: <Dumbbell />,
    phase: 3,
    items: [
      { href: '/exercise', label: 'Ejercicios', icon: <Dumbbell />, phase: 11 },
      { href: '/training-method', label: 'Metodos de entrenamiento', icon: <Activity />, phase: 10 },
      { href: '/difficulty-level', label: 'Niveles de dificultad', icon: <Gauge />, phase: 4 },
      { href: '/movement-pattern', label: 'Patrones de movimiento', icon: <Workflow />, phase: 2 },
      { href: '/exercise-movement-pattern', label: 'Ejercicio + Patron', icon: <GitBranch />, phase: 13 },
      { href: '/equipment', label: 'Equipamiento', icon: <Package />, phase: 5 },
      { href: '/exercise-equipment', label: 'Ejercicio + Equipamiento', icon: <Wrench />, phase: 12 },
    ],
  },

  {
    type: 'group',
    label: 'Musculos',
    icon: <Network />,
    phase: 2,
    items: [
      { href: '/exercise-muscle', label: 'Ejercicio + Musculo', icon: <Link2 />, phase: 14 },
      { href: '/muscle-group', label: 'Grupos musculares', icon: <Layers />, phase: 1 },
      { href: '/muscle', label: 'Musculos', icon: <Drumstick />, phase: 8 },
      
    ],
  },

  {
    type: 'group',
    label: 'Estructura Fisica',
    icon: <Brain />,
    phase: 4,
    items: [
      { href: '/physical-capability', label: 'Capacidades', icon: <Medal />, phase: 6 },
      { href: '/physical-subcapability', label: 'Subcapacidades', icon: <Puzzle />, phase: 9 },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    'Ejercicios',
    'Musculos',
    'Estructura Fisica',
  ]);

  const pathname = usePathname();

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
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
        {!collapsed && <span className="text-lg font-bold">KronThor</span>}
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

          const group = section;
          const open = expandedGroups.includes(group.label);
          const isActive = group.items.some((i) => i.href === pathname);

          return (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group.label)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all',
                  collapsed ? 'justify-center' : '',
                  isActive
                    ? 'bg-gray-800 text-white font-semibold'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                {group.icon}
                {!collapsed && (
                  <>
                    <span className="flex-1">{group.label}</span>
                    <ChevronDown
                      size={18}
                      className={cn('transition-transform', open ? 'rotate-0' : '-rotate-90')}
                    />
                  </>
                )}
              </button>

              {!collapsed && open && (
                <div className="ml-4 space-y-1 mt-1">
                  {group.items.map((item) => (
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
