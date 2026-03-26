import { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CalendarDays, Users, Clock, Loader2, CheckCircle2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ACTIVITIES = [
  { value: "Snooker", label: "Snooker Table", capacity: "1 table" },
  { value: "Pool", label: "Pool Table", capacity: "1 table" },
  { value: "PS5", label: "PS5 Console", capacity: "2 available" },
];

export const BookingSection = ({ apiUrl }) => {
  const sectionRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time_slot: "",
    activity: "Snooker",
    group_size: 2,
    notes: "",
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booked, setBooked] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".booking-header", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        y: 30,
        opacity: 0,
        duration: 0.7,
      });
      gsap.from(".booking-form", {
        scrollTrigger: { trigger: sectionRef.current, start: "top 72%" },
        y: 40,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (form.date && form.activity) {
      fetchSlots();
    }
  }, [form.date, form.activity]);

  const fetchSlots = async () => {
    setSlotsLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/bookings/slots`, {
        params: { date: form.date, activity: form.activity },
      });
      setAvailableSlots(res.data.available_slots);
      if (!res.data.available_slots.includes(form.time_slot)) {
        setForm((f) => ({ ...f, time_slot: "" }));
      }
    } catch (e) {
      console.error("Failed to fetch slots:", e);
    }
    setSlotsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date || !form.time_slot) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${apiUrl}/bookings`, form);
      setBooked(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Booking failed. Please try again.");
    }
    setLoading(false);
  };

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  };

  const inputClasses =
    "w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00A859] transition-colors duration-300";
  const selectClasses =
    "w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00A859] transition-colors duration-300 appearance-none cursor-pointer";
  const labelClasses =
    "block text-xs text-[#A1A1AA] mb-1.5 font-medium uppercase tracking-wider";

  // Get min date (today)
  const today = new Date().toISOString().split("T")[0];

  if (booked) {
    return (
      <section
        id="booking"
        ref={sectionRef}
        className="py-24 md:py-32 relative bg-[#0a0a0a] border-y border-white/5"
        data-testid="booking-section"
      >
        <div className="max-w-xl mx-auto px-6 md:px-12 text-center">
          <div className="glass-card rounded-2xl p-10" data-testid="booking-success">
            <CheckCircle2 size={56} className="text-[#00A859] mx-auto mb-5" />
            <h3 className="text-2xl font-bold mb-3">Booking Confirmed!</h3>
            <p className="text-[#A1A1AA] mb-6">
              See you at Rack&Roll, {booked.name}!
            </p>
            <div className="bg-[#0a0a0a] rounded-lg p-5 text-left space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Activity</span>
                <span className="text-white font-semibold">{booked.activity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Date</span>
                <span className="text-white font-semibold">{booked.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Time</span>
                <span className="text-[#00A859] font-semibold">{booked.time_slot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Group Size</span>
                <span className="text-white font-semibold">{booked.group_size} people</span>
              </div>
            </div>
            <button
              onClick={() => {
                setBooked(null);
                setForm({
                  name: "",
                  phone: "",
                  email: "",
                  date: "",
                  time_slot: "",
                  activity: "Snooker",
                  group_size: 2,
                  notes: "",
                });
              }}
              className="mt-7 btn-primary px-8 py-3 rounded-full text-sm"
              data-testid="book-another-btn"
            >
              Book Another Session
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="booking"
      ref={sectionRef}
      className="py-24 md:py-32 relative bg-[#0a0a0a] border-y border-white/5"
      data-testid="booking-section"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left - Info */}
          <div className="booking-header">
            <p className="text-[#00A859] font-bold tracking-[0.2em] uppercase text-xs mb-3">
              Reserve Your Spot
            </p>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Book a Session
            </h2>
            <div className="w-20 h-1 bg-[#00A859] mb-8 rounded-full" />
            <p className="text-[#A1A1AA] text-lg font-light leading-relaxed mb-10 max-w-md">
              Secure your spot at the table or console. Pick your game, choose your time, and we'll have everything ready when you arrive.
            </p>

            <div className="space-y-5">
              {ACTIVITIES.map((a) => (
                <div
                  key={a.value}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    form.activity === a.value
                      ? "border-[#00A859]/50 bg-[#00A859]/5"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10"
                  }`}
                  onClick={() => update("activity", a.value)}
                  data-testid={`activity-option-${a.value.toLowerCase()}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        form.activity === a.value
                          ? "border-[#00A859] bg-[#00A859]"
                          : "border-white/20"
                      }`}
                    />
                    <span className="font-semibold">{a.label}</span>
                  </div>
                  <span className="text-xs text-[#A1A1AA]">{a.capacity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Form */}
          <form
            onSubmit={handleSubmit}
            className="booking-form glass-card rounded-2xl p-7 md:p-9 space-y-5"
            data-testid="booking-form"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Your name"
                  className={inputClasses}
                  data-testid="booking-name-input"
                />
              </div>
              <div>
                <label className={labelClasses}>
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={inputClasses}
                  data-testid="booking-phone-input"
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Email (Optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="your@email.com"
                className={inputClasses}
                data-testid="booking-email-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>
                  <CalendarDays size={12} className="inline mr-1" />
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  min={today}
                  className={inputClasses}
                  data-testid="booking-date-input"
                />
              </div>
              <div>
                <label className={labelClasses}>
                  <Users size={12} className="inline mr-1" />
                  Group Size
                </label>
                <select
                  value={form.group_size}
                  onChange={(e) => update("group_size", parseInt(e.target.value))}
                  className={selectClasses}
                  data-testid="booking-group-select"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "person" : "people"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClasses}>
                <Clock size={12} className="inline mr-1" />
                Time Slot <span className="text-red-400">*</span>
              </label>
              {!form.date ? (
                <p className="text-xs text-[#555] mt-2">Select a date first to see available slots</p>
              ) : slotsLoading ? (
                <div className="flex items-center gap-2 text-[#A1A1AA] text-sm mt-2">
                  <Loader2 size={14} className="animate-spin" /> Loading slots...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2" data-testid="time-slots">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => update("time_slot", slot)}
                      className={`py-2.5 px-3 rounded-lg text-xs font-semibold text-center transition-all duration-200 ${
                        form.time_slot === slot
                          ? "bg-[#00A859] text-white"
                          : "bg-white/5 text-[#A1A1AA] hover:bg-white/10 hover:text-white"
                      }`}
                      data-testid={`slot-${slot.replace(/\s+/g, "-")}`}
                    >
                      {slot}
                    </button>
                  ))}
                  {availableSlots.length === 0 && (
                    <p className="col-span-3 text-xs text-[#555]">No slots available for this date.</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className={labelClasses}>Special Requests</label>
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Any special requests? (e.g., birthday celebration)"
                rows={3}
                className={`${inputClasses} resize-none`}
                data-testid="booking-notes-input"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm" data-testid="booking-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 rounded-xl text-sm tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              data-testid="submit-booking-btn"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Confirming...
                </>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
