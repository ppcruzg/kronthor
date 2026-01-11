"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Sidebar from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dumbbell,
  Trophy,
  Activity,
  Layers,
  Package,
  Gauge,
  TrendingUp,
  Database,
  Zap,
  Target,
  Users,
  BarChart3,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DashboardMetrics {
  exercises: number;
  sports: number;
  muscles: number;
  muscleGroups: number;
  equipment: number;
  patterns: number;
  trainingMethods: number;
  physicalCapabilities: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);

      const [
        exercisesRes,
        sportsRes,
        musclesRes,
        muscleGroupsRes,
        equipmentRes,
        patternsRes,
        methodsRes,
        capabilitiesRes,
      ] = await Promise.all([
        supabase.from("exercise").select("id", { count: "exact", head: true }),
        supabase.from("sport").select("id", { count: "exact", head: true }),
        supabase.from("muscle").select("id", { count: "exact", head: true }),
        supabase.from("muscle_group").select("id", { count: "exact", head: true }),
        supabase.from("equipment").select("id", { count: "exact", head: true }),
        supabase.from("movement_pattern").select("id", { count: "exact", head: true }),
        supabase.from("training_method").select("id", { count: "exact", head: true }),
        supabase.from("physical_capability").select("id", { count: "exact", head: true }),
      ]);

      setMetrics({
        exercises: exercisesRes.count || 0,
        sports: sportsRes.count || 0,
        muscles: musclesRes.count || 0,
        muscleGroups: muscleGroupsRes.count || 0,
        equipment: equipmentRes.count || 0,
        patterns: patternsRes.count || 0,
        trainingMethods: methodsRes.count || 0,
        physicalCapabilities: capabilitiesRes.count || 0,
      });

      setLoading(false);
    };

    fetchMetrics();
  }, []);

  const statCards = [
    {
      label: "Ejercicios Catalogados",
      value: metrics?.exercises || 0,
      icon: Dumbbell,
      color: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/30",
      iconColor: "text-indigo-400",
    },
    {
      label: "Perfiles Deportivos",
      value: metrics?.sports || 0,
      icon: Trophy,
      color: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
      iconColor: "text-amber-400",
    },
    {
      label: "Músculos Mapeados",
      value: metrics?.muscles || 0,
      icon: Activity,
      color: "from-rose-500/20 to-rose-500/5 border-rose-500/30",
      iconColor: "text-rose-400",
    },
    {
      label: "Grupos Musculares",
      value: metrics?.muscleGroups || 0,
      icon: Layers,
      color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
      iconColor: "text-emerald-400",
    },
    {
      label: "Equipamiento",
      value: metrics?.equipment || 0,
      icon: Package,
      color: "from-sky-500/20 to-sky-500/5 border-sky-500/30",
      iconColor: "text-sky-400",
    },
    {
      label: "Patrones de Movimiento",
      value: metrics?.patterns || 0,
      icon: TrendingUp,
      color: "from-purple-500/20 to-purple-500/5 border-purple-500/30",
      iconColor: "text-purple-400",
    },
    {
      label: "Métodos de Entrenamiento",
      value: metrics?.trainingMethods || 0,
      icon: Gauge,
      color: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
      iconColor: "text-cyan-400",
    },
    {
      label: "Capacidades Físicas",
      value: metrics?.physicalCapabilities || 0,
      icon: Zap,
      color: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
      iconColor: "text-yellow-400",
    },
  ];

  const systemOverview = [
    {
      title: "Base de Datos Biomecánica",
      description: "Ontología completa de ejercicios con tags por capas: planos, vectores, SSC, impacto y patrones de movimiento.",
      icon: Database,
      stats: `${metrics?.exercises || 0} ejercicios × ${metrics?.patterns || 0} patrones`,
    },
    {
      title: "Perfiles Deportivos",
      description: "Análisis de demandas específicas por deporte: acciones clave, zonas de riesgo y prioridades físicas.",
      icon: Target,
      stats: `${metrics?.sports || 0} deportes catalogados`,
    },
    {
      title: "Sistema Muscular",
      description: "Mapeo completo de cadenas musculares, grupos y subgrupos para análisis de transferencia.",
      icon: Users,
      stats: `${metrics?.muscleGroups || 0} grupos × ${metrics?.muscles || 0} músculos`,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Header */}
        <section className="relative px-6 py-12 sm:px-12 lg:px-20">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-x-[-30%] top-10 h-64 rounded-full bg-indigo-200/40 dark:bg-indigo-500/20 blur-3xl" />
          </div>

          <div className="max-w-7xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-500 dark:bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-200">
                Panel de Control
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
              Dashboard Kronthor
            </h1>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-300 font-medium max-w-3xl">
              Visión general del ecosistema de planificación deportiva inteligente
            </p>
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="px-6 sm:px-12 lg:px-20 pb-8">
          <div className="max-w-7xl">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 mb-6">
              Métricas del Sistema
            </h2>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-2xl bg-slate-200 dark:bg-white/5" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card
                      key={stat.label}
                      className={`border bg-gradient-to-b ${stat.color} hover:scale-105 transition-transform duration-200 shadow-lg dark:shadow-none`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-2.5 bg-white/20 dark:bg-white/10 rounded-xl ${stat.iconColor}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-slate-900 dark:text-white">
                              {stat.value}
                            </p>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          {stat.label}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* System Overview */}
        <section className="px-6 sm:px-12 lg:px-20 pb-12">
          <div className="max-w-7xl">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 mb-6">
              Resumen del Ecosistema
            </h2>

            <div className="grid gap-6 lg:grid-cols-3">
              {systemOverview.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.title}
                    className="border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-300 shadow-md dark:shadow-none"
                  >
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl">
                          <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {item.stats}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Quick Stats Bar */}
        <section className="px-6 sm:px-12 lg:px-20 pb-12">
          <div className="max-w-7xl">
            <Card className="border-slate-200 dark:border-white/10 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10 shadow-lg dark:shadow-none">
              <CardContent className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <p className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                      {((metrics?.exercises || 0) / (metrics?.sports || 1)).toFixed(0)}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Ejercicios por Deporte
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                      {metrics?.patterns || 0}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Patrones Biomecánicos
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                      {metrics?.trainingMethods || 0}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Métodos Validados
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                      {metrics?.physicalCapabilities || 0}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Capacidades Físicas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
