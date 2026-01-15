import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          🇮🇷 Iran Situation Monitor
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Real-time intelligence aggregation
        </p>
      </header>
      <Dashboard />
    </main>
  );
}
