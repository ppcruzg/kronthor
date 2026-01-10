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
  Trophy,
  Target,
  ShieldAlert,
  Zap,
} from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';

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
    label: 'Deportes',
    icon: <Medal />,
    items: [
      { href: '/sport', label: 'Perfiles Deportivos', icon: <Trophy /> },
      { href: '/key-action', label: 'Acciones Clave', icon: <Target /> },
      { href: '/physical-priority', label: 'Prioridades Físicas', icon: <Activity /> },
      { href: '/risk-zone', label: 'Zonas de Riesgo', icon: <ShieldAlert /> },
      { href: '/common-limiter', label: 'Limitantes Comunes', icon: <Package /> },
      { href: '/cod-demand', label: 'Demanda COD', icon: <Activity /> },
      { href: '/practice-volume', label: 'Volumen Práctica', icon: <Layers /> },
      { href: '/energy-profile', label: 'Perfil Energético', icon: <Activity /> },
    ],
  },

  {
    type: 'group',
    label: 'Ejercicios',
    icon: <Dumbbell />,
    items: [
      { href: '/exercise', label: 'Catálogo Core', icon: <Dumbbell /> },
      { href: '/movement-pattern', label: 'Patrones Mov.', icon: <Workflow /> },
      { href: '/training-method', label: 'Métodos Entrenamiento', icon: <Activity /> },
      { href: '/difficulty-level', label: 'Niveles Dificultad', icon: <Gauge /> },
      { href: '/equipment', label: 'Equipamiento', icon: <Package /> },
    ],
  },

  {
    type: 'group',
    label: 'Biomecánica',
    icon: <Brain />,
    items: [
      { href: '/dominant-vector', label: 'Vectores Dominantes', icon: <SplitSquareHorizontal /> },
      { href: '/laterality-support', label: 'Apoyo Lateralidad', icon: <GitMerge /> },
      { href: '/laterality-load', label: 'Carga Lateralidad', icon: <GitBranch /> },
      { href: '/ssc-demand', label: 'Demanda SSC', icon: <Zap /> },
      { href: '/impact-demand', label: 'Demanda Impacto', icon: <Activity /> },
      { href: '/antirotation-stability', label: 'Estabilidad Antirot.', icon: <ShieldAlert /> },
    ],
  },

  {
    type: 'group',
    label: 'Músculos',
    icon: <Network />,
    items: [
      { href: '/muscle-group', label: 'Grupos musculares', icon: <Layers /> },
      { href: '/muscle', label: 'Músculos', icon: <Activity /> },
    ],
  },

  {
    type: 'group',
    label: 'Configuración',
    icon: <LayoutDashboard />,
    items: [
      { href: '/physical-capability', label: 'Capacidades', icon: <Medal /> },
      { href: '/physical-subcapability', label: 'Subcapacidades', icon: <Puzzle /> },
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
        'h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col transition-all duration-300 border-r border-slate-200 dark:border-white/5',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!collapsed && <span className="text-lg font-bold">KronThor</span>}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-indigo-500"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <Menu /> : <ChevronLeft />}
            </Button>
          </div>
        </div>
        {!collapsed && (
          <div className="mt-2 text-xs text-gray-400">
            Versión: 25.11.19.B
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 space-y-2">
        {navSections.map((section) => {
          if (section.type === 'item') {
            return (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-all font-bold',
                  collapsed ? 'justify-center' : '',
                  pathname === section.href
                    ? 'bg-indigo-500/10 text-indigo-700 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
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
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all font-bold',
                  collapsed ? 'justify-center' : '',
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-700 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
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
                        'flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm font-bold',
                        pathname === item.href
                          ? 'bg-indigo-500/20 text-indigo-800 dark:bg-slate-700 dark:text-white'
                          : 'text-slate-500 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
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
