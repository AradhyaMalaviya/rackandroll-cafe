import { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CalendarDays, Users, Clock, Loader2, CheckCircle2,
  Plus, Minus, ChevronLeft, ChevronRight
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ACTIVITIES = [
  { value: "Snooker", label: "Snooker Table", maxCap: 1, icon: "S" },
  { value: "Pool", label: "Pool Table", maxCap: 1, icon: "P" },
  { value: "PS5", label: "PS5 Console", maxCap: 2, icon: "5" },
];

// Mini calendar component
const MiniCalendar = ({ selectedDate, onSelect }) => {
  const [viewDate, setViewDate] = useState(() => {
    const d = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
  const firstDay = new Date(viewDate.year, viewDate.month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const prevMonth = () => {
    setViewDate((v) => {
      const m = v.month === 0 ? 11 : v.month - 1;
      const y = v.month === 0 ? v.year - 1 : v.year;
      return { year: y, month: m };
    });
  };

  const nextMonth = () => {
    setViewDate((v) => {
      const m = v.month === 11 ? 0 : v.month + 1;
      const y = v.month === 11 ? v.year + 1 : v.year;
      return { year: y, month: m };
    });
  };

  const handleDayClick = (day) => {
    const d = new Date(viewDate.year, viewDate.month, day);
    if (d < today) return;
    const iso = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onSelect(iso);
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    const iso = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return iso === selectedDate;
  };

  const isPast = (day) => {
    const d = new Date(viewDate.year, viewDate.month, day);
    return d < today;
  };

  const canGoPrev = () => {
    return viewDate.year > today.getFullYear() || viewDate.month > today.getMonth();
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4" data-testid="booking-calendar">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev()}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors duration-200 disabled:opacity-20 disabled:cursor-not-allowed"
          data-testid="calendar-prev-month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-white">
          {monthNames[viewDate.month]} {viewDate.year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors duration-200"
          data-testid="calendar-next-month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-[#555] uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) =>
          day === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              disabled={isPast(day)}
              className={`w-full aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-all duration-200 ${
                isSelected(day)
                  ? "bg-[#00A859] text-white"
                  : isPast(day)
                  ? "text-[#333] cursor-not-allowed"
                  : "text-[#A1A1AA] hover:bg-white/10 hover:text-white cursor-pointer"
              }`}
              data-testid={`calendar-day-${day}`}
            >
              {day}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export const BookingSection = ({ apiUrl }) => {
  const sectionRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time_slot: "",
    group_size: 2,
    notes: "",
  });
  // Multi-activity: { Snooker: 0, Pool: 0, PS5: 0 }
  const [activityQty, setActivityQty] = useState({ Snooker: 0, Pool: 0, PS5: 0 });
  const [slotsData, setSlotsData] = useState([]);
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
    if (form.date) {
      fetchAvailability();
    }
  }, [form.date]);

  const fetchAvailability = async () => {
    setSlotsLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/bookings/availability`, {
        params: { date: form.date },
      });
      setSlotsData(res.data.slots);
    } catch (e) {
      console.error("Failed to fetch availability:", e);
    }
    setSlotsLoading(false);
  };

  // Check if selected slot has availability for selected activities
  const getSlotAvailability = (slot) => {
    const slotInfo = slotsData.find((s) => s.slot === slot);
    if (!slotInfo) return true;
    for (const [act, qty] of Object.entries(activityQty)) {
      if (qty > 0 && slotInfo.available[act] !== undefined && slotInfo.available[act] < qty) {
        return false;
      }
    }
    return true;
  };

  const selectedActivities = Object.entries(activityQty)
    .filter(([, qty]) => qty > 0)
    .map(([activity, quantity]) => ({ activity, quantity }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date || !form.time_slot) {
      setError("Please fill in all required fields.");
      return;
    }
    if (selectedActivities.length === 0) {
      setError("Please select at least one activity.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        activities: selectedActivities,
      };
      const res = await axios.post(`${apiUrl}/bookings`, payload);
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

  const updateQty = (activity, delta) => {
    const info = ACTIVITIES.find((a) => a.value === activity);
    setActivityQty((prev) => {
      const newVal = Math.max(0, Math.min(info.maxCap, prev[activity] + delta));
      return { ...prev, [activity]: newVal };
    });
    setError("");
  };

  const inputClasses =
    "w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00A859] transition-colors duration-300";
  const selectClasses =
    "w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00A859] transition-colors duration-300 appearance-none cursor-pointer";
  const labelClasses =
    "block text-xs text-[#A1A1AA] mb-1.5 font-medium uppercase tracking-wider";

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
                <span className="text-[#A1A1AA]">Activities</span>
                <span className="text-white font-semibold">
                  {booked.activities.map((a) => `${a.activity}${a.quantity > 1 ? ` x${a.quantity}` : ""}`).join(", ")}
                </span>
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
              {booked.phone && (
                <div className="flex justify-between">
                  <span className="text-[#A1A1AA]">Phone</span>
                  <span className="text-white font-semibold">{booked.phone}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                setBooked(null);
                setForm({ name: "", phone: "", email: "", date: "", time_slot: "", group_size: 2, notes: "" });
                setActivityQty({ Snooker: 0, Pool: 0, PS5: 0 });
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
          {/* Left - Info + Activity Selector + Calendar */}
          <div className="booking-header space-y-8">
            <div>
              <p className="text-[#00A859] font-bold tracking-[0.2em] uppercase text-xs mb-3">
                Reserve Your Spot
              </p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                Book a Session
              </h2>
              <div className="w-20 h-1 bg-[#00A859] mb-6 rounded-full" />
              <p className="text-[#A1A1AA] text-lg font-light leading-relaxed max-w-md">
                Select your activities, pick a date, choose a time, and we'll have everything ready when you arrive.
              </p>
            </div>

            {/* Multi-Activity Selector with Quantity */}
            <div>
              <h4 className={labelClasses}>Select Activities & Sessions</h4>
              <div className="space-y-3 mt-2">
                {ACTIVITIES.map((a) => (
                  <div
                    key={a.value}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                      activityQty[a.value] > 0
                        ? "border-[#00A859]/50 bg-[#00A859]/5"
                        : "border-white/5 bg-white/[0.02]"
                    }`}
                    data-testid={`activity-option-${a.value.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black ${
                          activityQty[a.value] > 0
                            ? "bg-[#00A859] text-white"
                            : "bg-white/5 text-[#A1A1AA]"
                        }`}
                      >
                        {a.icon}
                      </div>
                      <div>
                        <span className="font-semibold text-sm">{a.label}</span>
                        <p className="text-[10px] text-[#555]">Max {a.maxCap} per slot</p>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => updateQty(a.value, -1)}
                        disabled={activityQty[a.value] === 0}
                        className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#A1A1AA] hover:text-white hover:border-white/30 transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed"
                        data-testid={`qty-minus-${a.value.toLowerCase()}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        className="w-6 text-center text-sm font-bold text-white"
                        data-testid={`qty-value-${a.value.toLowerCase()}`}
                      >
                        {activityQty[a.value]}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(a.value, 1)}
                        disabled={activityQty[a.value] >= a.maxCap}
                        className="w-8 h-8 rounded-full border border-[#00A859]/40 bg-[#00A859]/10 flex items-center justify-center text-[#00A859] hover:bg-[#00A859] hover:text-white transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed"
                        data-testid={`qty-plus-${a.value.toLowerCase()}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {selectedActivities.length > 0 && (
                <div className="mt-3 text-xs text-[#00A859] font-medium" data-testid="activity-summary">
                  Selected: {selectedActivities.map((a) => `${a.activity} x${a.quantity}`).join(", ")}
                </div>
              )}
            </div>

            {/* Calendar */}
            <div>
              <h4 className={labelClasses}>
                <CalendarDays size={12} className="inline mr-1" />
                Pick a Date
              </h4>
              <div className="mt-2">
                <MiniCalendar
                  selectedDate={form.date}
                  onSelect={(d) => update("date", d)}
                />
              </div>
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
                  placeholder="e.g., 9260940347"
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

            {/* Time Slot */}
            <div>
              <label className={labelClasses}>
                <Clock size={12} className="inline mr-1" />
                Time Slot <span className="text-red-400">*</span>
              </label>
              {!form.date ? (
                <p className="text-xs text-[#555] mt-2">Pick a date on the calendar first</p>
              ) : slotsLoading ? (
                <div className="flex items-center gap-2 text-[#A1A1AA] text-sm mt-2">
                  <Loader2 size={14} className="animate-spin" /> Loading availability...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2" data-testid="time-slots">
                  {slotsData.map((slotInfo) => {
                    const isAvail = getSlotAvailability(slotInfo.slot);
                    const isSelected = form.time_slot === slotInfo.slot;
                    return (
                      <button
                        key={slotInfo.slot}
                        type="button"
                        onClick={() => isAvail && update("time_slot", slotInfo.slot)}
                        disabled={!isAvail}
                        className={`py-2.5 px-2 rounded-lg text-xs font-semibold text-center transition-all duration-200 ${
                          isSelected
                            ? "bg-[#00A859] text-white"
                            : isAvail
                            ? "bg-white/5 text-[#A1A1AA] hover:bg-white/10 hover:text-white"
                            : "bg-white/[0.02] text-[#333] cursor-not-allowed line-through"
                        }`}
                        data-testid={`slot-${slotInfo.slot.replace(/\s+/g, "-")}`}
                      >
                        {slotInfo.slot}
                      </button>
                    );
                  })}
                  {slotsData.length === 0 && (
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
