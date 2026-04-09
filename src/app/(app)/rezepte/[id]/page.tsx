export default function RezeptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="p-4 lg:p-8">
      <h1 className="text-3xl font-headline font-bold text-on-surface">
        Rezept-Details
      </h1>
      <p className="text-on-surface-variant mt-2">
        Wird im Rezept-Details-Ticket implementiert.
      </p>
    </div>
  );
}
