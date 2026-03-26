import { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkle, Loader2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const AILounge = ({ apiUrl }) => {
  const sectionRef = useRef(null);

  const [planGroup, setPlanGroup] = useState("Flying solo");
  const [planVibe, setPlanVibe] = useState("Chill and relaxed");
  const [planResult, setPlanResult] = useState("");
  const [planLoading, setPlanLoading] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".ai-header", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        y: 30,
        opacity: 0,
        duration: 0.7,
      });
      gsap.from(".ai-card", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 72%" },
        y: 50,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.2)",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const generatePlan = async () => {
    setPlanLoading(true);
    setPlanResult("");
    try {
      const res = await axios.post(`${apiUrl}/ai/plan`, {
        group: planGroup,
        vibe: planVibe,
      });
      setPlanResult(res.data.text);
    } catch (e) {
      setPlanResult("Oops! Our AI host is taking a quick coffee break. Try again in a moment!");
    }
    setPlanLoading(false);
  };

  const selectClasses =
    "w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#F5A623] transition-colors duration-300 appearance-none cursor-pointer";

  return (
    <section
      id="ai-lounge"
      ref={sectionRef}
      className="py-24 md:py-32 relative z-10 overflow-hidden"
      data-testid="ai-lounge-section"
    >
      <div className="max-w-[900px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="ai-header text-center mb-16">
          <p className="text-[#F5A623] font-bold tracking-[0.2em] uppercase text-xs mb-3">
            Powered by Gemini AI
          </p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">
            The AI Lounge
          </h2>
          <div className="w-20 h-1 bg-[#F5A623] mx-auto mt-6 rounded-full" />
          <p className="text-[#A1A1AA] mt-5 max-w-2xl mx-auto text-lg font-light">
            Let our intelligent host craft the perfect game night plan for you.
          </p>
        </div>

        {/* Visit Planner - Full Width */}
        <div className="ai-card terminal-card rounded-2xl p-7 md:p-10" data-testid="ai-planner-card">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-full bg-[#F5A623]/15 flex items-center justify-center text-[#F5A623]">
              <Sparkle size={22} />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">Perfect Visit Planner</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div>
              <label className="block text-xs text-[#A1A1AA] mb-1.5 font-medium uppercase tracking-wider">
                Who's coming?
              </label>
              <select
                value={planGroup}
                onChange={(e) => setPlanGroup(e.target.value)}
                className={selectClasses}
                data-testid="ai-group-select"
              >
                <option value="Flying solo">Flying solo</option>
                <option value="Me and a date">Me & a date</option>
                <option value="A small group of friends">Small group (3-4)</option>
                <option value="A big squad">Big squad (5+)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#A1A1AA] mb-1.5 font-medium uppercase tracking-wider">
                What's the vibe?
              </label>
              <select
                value={planVibe}
                onChange={(e) => setPlanVibe(e.target.value)}
                className={selectClasses}
                data-testid="ai-vibe-select"
              >
                <option value="Chill and relaxed">Chill & Relaxed</option>
                <option value="Highly competitive">Highly Competitive</option>
                <option value="We are starving">Mostly here for food</option>
              </select>
            </div>
          </div>

          <button
            onClick={generatePlan}
            disabled={planLoading}
            className="w-full py-4 bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/40 rounded-lg font-bold tracking-wide text-base transition-all duration-300 hover:bg-[#F5A623] hover:text-black disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="generate-plan-btn"
          >
            {planLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Consulting the AI host...
              </>
            ) : (
              <>
                <Sparkle size={18} /> Generate My Plan
              </>
            )}
          </button>

          {planResult && (
            <div
              className="mt-7 p-6 bg-[#0a0a0a] rounded-lg border border-[#F5A623]/10 text-sm text-[#d4d4d8] leading-relaxed"
              data-testid="plan-result"
            >
              {planResult}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
