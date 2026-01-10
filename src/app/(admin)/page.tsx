export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-black to-gray-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-6 text-center">
        Bienvenido a <span className="text-indigo-400">Kronthor</span>
      </h1>
      <p className="text-lg text-gray-300 max-w-2xl text-center mb-10">
        Plataforma inteligente para planificación deportiva, análisis de capacidades físicas y construcción avanzada de ejercicios. Diseñada para entrenadores, atletas y equipos de alto rendimiento.
      </p>

      <div className="flex flex-wrap gap-6 justify-center mb-12">
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-72 hover:scale-105 transition-transform">
          <h3 className="text-xl font-semibold mb-3">Catálogo de Ejercicios</h3>
          <p className="text-gray-300 text-sm">Explora y administra cientos de ejercicios clasificados por músculos y patrones de movimiento.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-72 hover:scale-105 transition-transform">
          <h3 className="text-xl font-semibold mb-3">Capacidades Físicas</h3>
          <p className="text-gray-300 text-sm">Define planes basados en capacidades primarias y secundarias según cada deporte.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl w-72 hover:scale-105 transition-transform">
          <h3 className="text-xl font-semibold mb-3">Dashboard de Entrenamiento</h3>
          <p className="text-gray-300 text-sm">Monitorea el progreso y mantén una visión clara sobre el rendimiento de atletas.</p>
        </div>
      </div>

      <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full text-lg font-semibold shadow-lg transition-all">
        Entrar al Panel
      </button>
    </div>
  );
}
