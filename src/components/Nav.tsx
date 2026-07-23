import Link from "next/link";
import { CalendarDays, HeartHandshake, Orbit } from "lucide-react";

export function Nav() {
  return (
    <nav className="site-nav" aria-label="メインナビゲーション">
      <div className="site-nav-inner">
        <Link href="/" className="site-brand" aria-label="Fortune Platform トップ">
          <Orbit aria-hidden="true" size={24} strokeWidth={1.8} />
          <span>Fortune Platform</span>
        </Link>
        <div className="site-nav-links">
          <Link href="/person/new">
            <Orbit aria-hidden="true" size={18} />
            <span>詳細鑑定</span>
          </Link>
          <Link href="/daily/horoscope">
            <CalendarDays aria-hidden="true" size={18} />
            <span>今日</span>
          </Link>
          <Link href="/pair/new">
            <HeartHandshake aria-hidden="true" size={18} />
            <span>相性</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
