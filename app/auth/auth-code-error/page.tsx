import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center bg-zinc-50">
      <h1 className="text-4xl font-semibold mb-4">Chyba pri autentifikácii</h1>
      <p className="text-lg mb-2">Počas procesu autentifikácie sa niečo pokazilo.</p>
      <p className="text-lg mb-6">Prosím, skúste to znova.</p>
      <Link href="/" className="mt-5 px-6 py-3 text-white bg-primary rounded-md hover:bg-primary/90 transition-colors">
        Prejsť na domovskú stránku
      </Link>
    </main>
  );
}
