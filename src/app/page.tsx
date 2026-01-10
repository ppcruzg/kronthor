import Sidebar from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Activity,
  LineChart,
  ShieldCheck,
  Target,
  Users,
  Zap,
} from "lucide-react";

const metrics = [
  { label: "Ejercicios catalogados", value: "320+" },
  { label: "Musculos y cadenas", value: "90+" },
  { label: "Metodos validados", value: "40" },
];

const featureCards = [
  {
    title: "Catalogo inteligente",
    description:
      "Define variaciones, equipamiento y patrones de movimiento en segundos.",
    icon: Activity,
    accent: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/30",
  },
  {
    title: "Planes centrados en capacidades",
    description:
      "Mapea capacidades primarias y secundarias para cada deporte o equipo.",
    icon: Target,
    accent: "from-sky-500/20 to-sky-500/5 border-sky-500/30",
  },
  {
    title: "Monitoreo en tiempo real",
    description:
      "Tableros compartidos para atletas, entrenadores y directores de rendimiento.",
    icon: LineChart,
    accent: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
  },
];

const workflow = [
  {
    title: "Explora datos",
    detail:
      "Filtra ejercicios por objetivo, carga mecanica y riesgo esperado para componer sesiones.",
  },
  {
    title: "Construye sesiones",
    detail:
      "Arrastra movimientos a bloques, asigna capacidades y deja notas para el staff.",
  },
  {
    title: "Comparte resultados",
    detail:
      "Usa dashboards y reportes automaticos para seguir la evolucion de cada atleta.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <section className="relative px-6 py-16 sm:px-12 lg:px-20">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-x-[-30%] top-10 h-64 rounded-full bg-indigo-500/20 blur-3xl" />
          </div>

          <div className="max-w-5xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-sm uppercase tracking-widest text-indigo-200">
              KronThor Performance
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
              La plataforma integral para planificacion deportiva inteligente.
            </h1>

            <p className="mt-6 text-lg text-slate-300">
              Disenada para entrenadores, atletas y equipos de alto rendimiento.
              Gestiona catalogos de ejercicios, capacidades fisicas y
              dashboards de seguimiento desde un solo lugar.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button className="bg-indigo-500 px-8 py-6 text-base hover:bg-indigo-400">
                Entrar al panel
              </Button>
              <Button
                variant="outline"
                className="border-white/20 px-8 py-6 text-base text-white hover:bg-white/10"
              >
                Ver documentacion
              </Button>
            </div>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <p className="text-sm text-slate-300">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-12 sm:px-12 lg:px-20">
          <div className="grid gap-6 lg:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`rounded-3xl border bg-gradient-to-b ${feature.accent} p-8 shadow-xl`}
                >
                  <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-white/10">
                    <Icon className="size-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-slate-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-6 py-16 sm:px-12 lg:px-20">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">
                Flujo de trabajo
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-white">
                Del dato crudo a una experiencia de entrenamiento accionable.
              </h2>
              <p className="mt-4 text-slate-300">
                Cada seccion de KronThor conecta catalogos, capacidades y
                resultados para que el equipo se mantenga alineado y los atletas
                reciban retroalimentacion inmediata.
              </p>

              <div className="mt-8 space-y-6">
                {workflow.map((item, index) => (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-indigo-500/30 text-lg font-semibold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="text-sm text-slate-300">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
              <div className="flex flex-col gap-6">
                <div className="rounded-2xl bg-slate-900/70 p-6">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <ShieldCheck className="size-4 text-emerald-300" />
                    Seguridad y control granular
                  </div>
                  <p className="mt-3 text-lg text-white">
                    Roles, equipos y permisos adaptados a academias, clubes y
                    centros de alto rendimiento.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900/70 p-6">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Users className="size-4 text-sky-300" />
                    Colaboracion en vivo
                  </div>
                  <p className="mt-3 text-lg text-white">
                    Comentarios, historial y vistas compartidas mantienen al
                    staff sincronizado mientras los atletas reciben feedback al
                    instante.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900/70 p-6">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Zap className="size-4 text-yellow-300" />
                    Integraciones listas
                  </div>
                  <p className="mt-3 text-lg text-white">
                    API abierta y conectores hacia wearables, sensores y otros
                    sistemas ya presentes en tu flujo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
