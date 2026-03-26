import { useEffect, useRef } from "react";
import { ArrowRight, Coffee, MouseSimple } from "@phosphor-icons/react";
import gsap from "gsap";

export const Hero = () => {
  const heroRef = useRef(null);
  const elementsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      gsap.fromTo(
        ".hero-bg-img",
        { scale: 1.15 },
        { scale: 1, duration: 3, ease: "power2.out" }
      );

      tl.from(".hero-badge", { y: 20, opacity: 0, duration: 0.5, ease: "power2.out" })
        .from(".hero-title", { y: 40, opacity: 0, duration: 0.7, ease: "back.out(1.4)" }, "-=0.2")
        .from(".hero-subtitle", { y: 30, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
        .from(".hero-btns", { y: 20, opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.2")
        .from(".hero-scroll", { opacity: 0, duration: 0.8 }, "-=0.1");
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative h-screen flex items-center justify-center overflow-hidden"
      data-testid="hero-section"
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542031767-1736fb5e315b?auto=format&fit=crop&q=80"
          alt="Pool table atmosphere"
          className="hero-bg-img w-full h-full object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 hero-gradient" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-16">
        <div className="hero-badge inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1A1A1A]/80 border border-[#00A859]/25 text-[#00A859] font-semibold text-sm mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#00A859] animate-pulse-glow" />
          Premium Gaming & Cafe Lounge
        </div>

        <h1 className="hero-title text-5xl md:text-7xl lg:text-[6.5rem] font-black mb-7 leading-[0.92] tracking-tight">
          Rack, Roll &<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A859] to-emerald-300 font-display italic font-bold">
            Relish.
          </span>
        </h1>

        <p className="hero-subtitle text-lg md:text-xl text-[#A1A1AA] mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          Your ultimate hangout spot. Experience professional-grade snooker, pool, next-gen PS5 gaming, and mouth-watering cafe delights all under one roof.
        </p>

        <div className="hero-btns flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => scrollTo("#play")}
            className="btn-primary px-8 py-4 rounded-full text-lg flex items-center justify-center gap-2.5"
            data-testid="hero-explore-btn"
          >
            Explore Setup <ArrowRight size={20} weight="bold" />
          </button>
          <button
            onClick={() => scrollTo("#menu")}
            className="px-8 py-4 bg-transparent border border-white/15 text-white rounded-full font-bold text-lg hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2.5"
            data-testid="hero-menu-btn"
          >
            View Menu <Coffee size={20} weight="bold" />
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll absolute bottom-10 left-1/2 -translate-x-1/2 opacity-40 animate-bounce">
        <MouseSimple size={28} className="text-white" />
      </div>
    </section>
  );
};
