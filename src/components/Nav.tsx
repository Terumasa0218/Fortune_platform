import Link from "next/link";

export function Nav() {
  return (
    <nav className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-gray-900">
          🔮 占いの広場
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-gray-900">
            ホーム
          </Link>
          <Link href="/daily/horoscope" className="hover:text-gray-900">
            デイリー
          </Link>
          <Link href="/person/new" className="hover:text-gray-900">
            Person
          </Link>
          <Link href="/pair/new" className="hover:text-gray-900">
            相性
          </Link>
        </div>
      </div>
    </nav>
  );
}
