import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Tag } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const MenuSection = ({ items, categories }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const sectionRef = useRef(null);

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".menu-header", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        y: 30,
        opacity: 0,
        duration: 0.7,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="menu"
      ref={sectionRef}
      className="py-24 md:py-32 relative bg-[#0a0a0a] border-y border-white/5"
      data-testid="menu-section"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="menu-header mb-12">
          <p className="text-[#F5A623] font-bold tracking-[0.2em] uppercase text-xs mb-3">
            Fuel Your Game
          </p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">
            Bites & Beverages
          </h2>
          <div className="w-20 h-1 bg-[#F5A623] mt-6 rounded-full" />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide" data-testid="menu-tabs">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
              activeCategory === "All"
                ? "bg-[#00A859] text-white"
                : "bg-white/5 text-[#A1A1AA] hover:bg-white/10 hover:text-white"
            }`}
            data-testid="menu-tab-all"
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-[#00A859] text-white"
                  : "bg-white/5 text-[#A1A1AA] hover:bg-white/10 hover:text-white"
              }`}
              data-testid={`menu-tab-${cat.toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="menu-grid">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-xl overflow-hidden group cursor-default"
              data-testid={`menu-item-${item.id}`}
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="feature-card-img w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                <div className="absolute bottom-3 right-3 bg-[#00A859] text-white text-sm font-bold px-3 py-1 rounded-full">
                  ${item.price.toFixed(2)}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold tracking-tight">{item.name}</h3>
                </div>
                <p className="text-[#A1A1AA] text-sm leading-relaxed mb-3">
                  {item.description}
                </p>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs text-[#A1A1AA] bg-white/5 px-2.5 py-1 rounded-full"
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16 text-[#A1A1AA]" data-testid="menu-empty">
            <p className="text-lg">Loading menu items...</p>
          </div>
        )}
      </div>
    </section>
  );
};
