import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <p className="text-6xl font-semibold text-maroon">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-stone-800">
        Page not found
      </h1>
      <p className="mt-3 text-stone-600">
        The page you are looking for doesn&rsquo;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-maroon px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-maroon-600"
      >
        Back to Home
      </Link>
    </div>
  );
}
