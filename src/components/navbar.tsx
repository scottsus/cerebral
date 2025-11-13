import { DatabaseIcon, Users } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <div className="flex w-full items-center justify-between px-4 pb-2 pt-6 sm:px-8 sm:pb-2 sm:pt-8 md:px-16 lg:px-32 lg:pb-4 lg:pt-10">
      <Link
        href="/"
        className="text-2xl font-bold text-[#f6f930] md:text-3xl lg:text-4xl"
      >
        Ind<span className="text-[#ffffff]">order</span>.
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="/customers"
          className="text-sm font-semibold text-[#f6f930] md:text-xl lg:text-xl hover:brightness-125 transition-all"
        >
          <Users size={40} />
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-[#f6f930] md:text-xl lg:text-xl hover:brightness-125 transition-all"
        >
          <DatabaseIcon size={40} />
        </Link>
      </div>
    </div>
  );
}
