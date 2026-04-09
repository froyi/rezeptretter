export default function LoginPage() {
  return (
    <div className="bg-card rounded-2xl p-8 space-y-6 shadow-lg">
      <div className="text-center">
        <span className="material-symbols-outlined text-primary text-4xl">
          restaurant_menu
        </span>
        <h1 className="text-2xl font-headline font-bold mt-2 text-on-surface">
          Willkommen zurück
        </h1>
        <p className="text-on-surface-variant mt-1">
          Melde dich an oder erstelle ein Konto
        </p>
      </div>
      <p className="text-center text-muted-foreground text-sm">
        Login-Formular wird im Auth-Ticket implementiert.
      </p>
    </div>
  );
}
