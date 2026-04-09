export default function KochmodusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#1a1210] text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <span className="material-symbols-outlined text-6xl text-[#E65100]">
          skillet
        </span>
        <h1 className="text-3xl font-headline font-bold">Kochmodus</h1>
        <p className="text-white/60">
          Wird im Kochmodus-Ticket implementiert.
        </p>
      </div>
    </div>
  );
}
