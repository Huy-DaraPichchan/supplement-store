import Link from "next/link";
import { FaceAngry, FaceGrinning, Mail } from "lucide-react";

const footerLinks = {
  Products: [
    { name: "All Products", href: "/products" },
    { name: "Categories", href: "/categories" },
    { name: "New Arrivals", href: "/new" },
  ],
  Company: [
    { name: "About Us", href: "/about" },
    { name: "Business", href: "/business" },
    { name: "Careers", href: "/careers" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Disclaimer", href: "/disclaimer" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">BrandName</h2>
            <p className="text-sm text-muted-foreground">
              Short description of your business. We provide high-quality
              products and services.
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="LinkedIn" className="hover:text-primary">
                <FaceGrinning size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-primary">
                <FaceGrinning size={20} />
              </a>
              <a href="#" aria-label="GitHub" className="hover:text-primary">
                <FaceAngry
                 size={20} />
              </a>
              <a href="#" aria-label="Email" className="hover:text-primary">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Disclaimers */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} BrandName. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-primary">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-primary">
                Cookies
              </Link>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Disclaimer: The information provided on this website is for general
            informational purposes only. All products and services are subject
            to availability.
          </p>
        </div>
      </div>
    </footer>
  );
}