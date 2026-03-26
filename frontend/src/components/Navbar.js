import { useState, useEffect, useCallback } from "react";
import { List, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Play", href: "#play" },
  { label: "Menu", href: "#menu" },
  { label: "AI Lounge", href: "#ai-lounge", special: true },
  { label: "Book Now", href: "#booking", cta: true },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollTo = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass-nav shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => scrollTo("#home")}
          className="flex items-center gap-2.5 group"
          data-testid="nav-brand"
        >
          <div className="w-9 h-9 rounded-full bg-[#00A859] flex items-center justify-center text-white font-black text-lg transition-transform duration-300 group-hover:scale-110">
            R
          </div>
          <span className="font-bold text-xl tracking-wide">
            Rack&Roll{" "}
            <span className="text-[#00A859]">Cafe</span>
          </span>
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) =>
            link.cta ? (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="ml-4 px-6 py-2.5 bg-[#00A859] text-white rounded-full font-bold text-sm tracking-wider hover:bg-[#008f4c] transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,168,89,0.35)]"
                data-testid="nav-book-now"
              >
                {link.label}
              </button>
            ) : (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-colors duration-300 ${
                  link.special
                    ? "text-[#F5A623] hover:text-[#ffc048]"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
                data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {link.label}
              </button>
            )
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-testid="mobile-menu-toggle"
        >
          {mobileOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-nav mt-2 mx-4 rounded-xl p-4 space-y-1" data-testid="mobile-menu">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                link.cta
                  ? "bg-[#00A859] text-white"
                  : link.special
                  ? "text-[#F5A623] hover:bg-white/5"
                  : "text-[#A1A1AA] hover:bg-white/5 hover:text-white"
              }`}
              data-testid={`mobile-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
