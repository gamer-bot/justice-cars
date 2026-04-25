import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center font-bold text-primary-foreground text-xs">
                JC
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Justice <span className="text-primary">Cars</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Nigeria's trusted automotive marketplace. Find your perfect car at the best prices.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Quick Links</h4>
            <div className="space-y-2">
              {[
                { href: "/", label: "Browse Cars" },
                { href: "/about", label: "About Us" },
                { href: "/info", label: "Buying Guide" },
                { href: "/blog", label: "Blog" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>speak2justicechibueze@gmail.com</p>
              <p>+234 703 713 8664</p>
              <p>Abuja, Nigeria</p>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Justice Cars. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Developed by <span className="text-primary font-semibold">💎 𝕯𝕖𝕧.𝕊𝕔𝕆𝕽𝕡𝕀𝕆𝕹</span> – v1.0
          </p>
        </div>
      </div>
    </footer>
  );
}
