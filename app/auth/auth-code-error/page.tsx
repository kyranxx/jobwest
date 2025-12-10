import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">Chyba pri autentifikácii</h1>
      <p className="text-lg mb-2">Počas procesu autentifikácie sa niečo pokazilo.</p>
      <p className="text-lg mb-6">Prosím, skúste to znova.</p>
      <Link href="/" className="mt-5 px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
        Prejsť na domovskú stránku
      </Link>
    </div>
  );
}
