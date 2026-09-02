import { Globe, Heart, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Shop: ["All Supplements", "Vitamins", "Minerals", "Herbs"],
  Help: ["Contact Us", "Shipping & Returns", "FAQs", "Order Status"],
  Company: ["About PureVita", "Our Standards", "Business", "Careers"],
};

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="text-2xl font-black tracking-tight text-white">
              Pure<span className="text-emerald-400">Vita</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
              Simple, honest wellness essentials for the rituals that keep you feeling your best.
            </p>
            <div className="mt-6 flex gap-3">
              {[Globe, Heart, MessageCircle, Mail].map((Icon, index) => (
                <a key={index} href="#" aria-label="Social link" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 transition-colors hover:border-emerald-400 hover:text-emerald-400">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <ul className="mt-5 space-y-3 text-sm text-slate-400">
                {links.map((label) => (
                  <li key={label}><Link href={title === "Shop" ? "/products" : "/about"} className="transition-colors hover:text-emerald-400">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} PureVita. All rights reserved.</p>
          <p>Made for better everyday habits.</p>
        </div>
      </div>
    </footer>
  );
}
