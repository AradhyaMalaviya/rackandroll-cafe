import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GameController } from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

const SETUPS = [
  {
    title: "Premium Snooker",
    desc: "Full-sized tournament-grade snooker table with flawless green felt and professional overhead lighting for the perfect shot.",
    image: "https://images.pexels.com/photos/19554778/pexels-photo-19554778.jpeg?auto=compress&cs=tinysrgb&w=800",
    badge: "1 Table",
    color: "#00A859",
    icon: "snooker",
  },
  {
    title: "Classic Pool",
    desc: "A highly maintained 8-ball pool table. Perfect for casual hangouts or competitive matches with your friends.",
    image: "https://images.pexels.com/photos/6032554/pexels-photo-6032554.jpeg?auto=compress&cs=tinysrgb&w=800",
    badge: "1 Table",
    color: "#00A859",
    icon: "pool",
  },
  {
    title: "Next-Gen PS5",
    desc: "Experience next-level gaming with our 2 PlayStation 5 setups featuring 4K displays and a massive library of co-op and competitive games.",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=800",
    badge: "2 Consoles",
    color: "#00439C",
    icon: "ps5",
  },
];

export const PlaySection = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".play-header", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        y: 30,
        opacity: 0,
        duration: 0.7,
      });

      gsap.utils.toArray(".setup-card").forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: "top 88%" },
          y: 50,
          opacity: 0,
          duration: 0.6,
          delay: i * 0.12,
          ease: "power2.out",
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="play"
      ref={sectionRef}
      className="py-24 md:py-32 relative z-10"
      data-testid="play-section"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="play-header mb-16">
          <p className="text-[#00A859] font-bold tracking-[0.2em] uppercase text-xs mb-3">
            The Arsenal
          </p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">
            Unmatched Setup
          </h2>
          <div className="w-20 h-1 bg-[#00A859] mt-6 rounded-full" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {SETUPS.map((setup, i) => (
            <div
              key={setup.title}
              className="setup-card group glass-card rounded-2xl overflow-hidden cursor-default"
              data-testid={`setup-card-${i}`}
            >
              {/* Image */}
              <div className="h-60 md:h-64 overflow-hidden relative">
                <img
                  src={setup.image}
                  alt={setup.title}
                  className="feature-card-img w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                <div
                  className="absolute top-4 right-4 text-white text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: setup.color }}
                >
                  {setup.badge}
                </div>
              </div>

              {/* Content */}
              <div className="p-7">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: `${setup.color}20`,
                    color: setup.color,
                  }}
                >
                  <GameController size={22} weight="fill" />
                </div>
                <h3 className="text-xl font-bold mb-2.5 tracking-tight">
                  {setup.title}
                </h3>
                <p className="text-[#A1A1AA] text-sm leading-relaxed">
                  {setup.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
