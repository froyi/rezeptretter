export default function RezeptePage() {
  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-3xl font-headline font-bold text-on-surface">
        Meine Rezepte
      </h1>
      <p className="text-on-surface-variant mt-2">
        Deine Rezeptsammlung – wird im Übersichts-Ticket implementiert.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-surface-container rounded-2xl aspect-[3/4] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
