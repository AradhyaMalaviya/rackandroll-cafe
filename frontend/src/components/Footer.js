import { MapPin, Phone } from "lucide-react";

const HOURS = [
  { days: "Mon - Thurs", time: "11:00 AM - 11:00 PM", highlight: false },
  { days: "Fri - Sat", time: "11:00 AM - 1:00 AM", highlight: true },
  { days: "Sunday", time: "10:00 AM - 11:00 PM", highlight: false },
];

const SOCIALS = [
  { name: "Instagram", icon: "instagram", url: "#" },
  { name: "Facebook", icon: "facebook", url: "#" },
  { name: "WhatsApp", icon: "whatsapp", url: "#" },
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
              Your premium destination for sports, gaming, and great food. Whether you're breaking a rack, scoring goals on PS5, or just chilling with friends, we've got you covered.
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
                  123 Gaming Boulevard,
                  <br />
                  Sports Arena District,
                  <br />
                  City Name, ST 12345
                </span>
              </li>
              <li className="flex items-center gap-3" data-testid="footer-phone">
                <Phone size={18} className="text-[#00A859] flex-shrink-0" />
                <span className="text-[#A1A1AA]">+1 (555) 019-8273</span>
              </li>
              <li className="mt-6">
                <a
                  href="https://maps.google.com"
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
    whatsapp: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  };
  return icons[name] || null;
};
