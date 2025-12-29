import { LANDING_CONTENT } from "@/components/budget/landing/content";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070A12]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <div className="text-sm font-semibold text-white">{LANDING_CONTENT.brand.name}</div>
          <div className="mt-1 text-sm text-slate-500">
            Premium budgeting with a one-time upgrade.
          </div>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/budget-app/auth/login" className="text-slate-400 hover:text-white">
            Log in
          </Link>
          <Link href="/budget-app/auth/signup" className="text-slate-400 hover:text-white">
            Start trial
          </Link>
          <Link href="/budget-app/auth/upgrade" className="text-slate-400 hover:text-white">
            Upgrade
          </Link>
          <Link href="/budget-app/settings" className="text-slate-400 hover:text-white">
            Settings
          </Link>
        </nav>

        <div className="text-sm text-slate-500">
          © {new Date().getFullYear()} {LANDING_CONTENT.brand.name}
        </div>
      </div>
    </footer>
  );
}


