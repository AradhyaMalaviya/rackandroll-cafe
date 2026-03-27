import { MapPin, Phone } from "lucide-react";

const HOURS = [
  { days: "Mon - Thurs", time: "11:00 AM - 11:00 PM", highlight: false },
  { days: "Fri - Sat", time: "11:00 AM - 1:00 AM", highlight: true },
  { days: "Sunday", time: "10:00 AM - 11:00 PM", highlight: false },
];

const SOCIALS = [
  { name: "Instagram", icon: "instagram", url: "#" },
  { name: "Facebook", icon: "facebook", url: "#" },
];

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      id="visit"
      className="bg-[#080808] pt-20 pb-10 border-t border-white/5 relative overflow-hidden"
      data-testid="footer"
    >
      {/* Watermark */}
      <h2 className="absolute -bottom-6 left-0 text-[12vw] font-black text-white/[0.02] whitespace-nowrap select-none pointer-events-none tracking-tighter">
        RACK & ROLL
      </h2>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#00A859] flex items-center justify-center text-white font-black text-sm">
                R
              </div>
              <span className="font-bold text-xl tracking-wide font-display italic">
                Rack&Roll
              </span>
            </div>
            <p className="text-[#A1A1AA] text-sm leading-relaxed mb-7 max-w-sm">
              Your premium destination for sports, gaming, and great food at Rack&Roll Cafe, NRI City, Near Intown Myra, Kanpur.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#A1A1AA] hover:bg-[#00A859] hover:text-white transition-all duration-300"
                  data-testid={`social-${s.icon}`}
                  aria-label={s.name}
                >
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-[0.15em] text-xs">
              Working Hours
            </h4>
            <ul className="space-y-3.5" data-testid="working-hours">
              {HOURS.map((h) => (
                <li
                  key={h.days}
                  className="flex justify-between text-sm border-b border-white/5 pb-3"
                >
                  <span className="text-[#A1A1AA]">{h.days}</span>
                  <span
                    className={
                      h.highlight
                        ? "text-[#00A859] font-bold"
                        : "text-white font-medium"
                    }
                  >
                    {h.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-[0.15em] text-xs">
              Find Us
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3" data-testid="footer-address">
                <MapPin size={18} className="text-[#00A859] mt-0.5 flex-shrink-0" />
                <span className="text-[#A1A1AA] leading-relaxed">
                  Rack&Roll Cafe,
                  <br />
                  NRI City, Near Intown Myra,
                  <br />
                  Kanpur
                </span>
              </li>
              <li className="flex items-center gap-3" data-testid="footer-phone">
                <Phone size={18} className="text-[#00A859] flex-shrink-0" />
                <span className="text-[#A1A1AA]">9260940347</span>
              </li>
              <li className="mt-6">
                <a
                  href="https://maps.app.goo.gl/4moGabadV3xKhKncA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3.5 text-center bg-white/5 hover:bg-[#00A859] text-white font-bold rounded-lg transition-all duration-300 border border-white/10 hover:border-[#00A859] text-sm tracking-wider"
                  data-testid="get-directions-btn"
                >
                  Get Directions
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="neon-line mb-6" />

        <div className="text-center text-[#555] text-sm">
          <p>&copy; {year} Rack&Roll Cafe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ name }) => {
  const icons = {
    instagram: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" />
      </svg>
    ),
    facebook: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  };
  return icons[name] || null;
};
