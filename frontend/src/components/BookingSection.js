import { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CalendarDays, Users, Clock, Loader2, CheckCircle2,
  Plus, Minus, ChevronLeft, ChevronRight, UtensilsCrossed, ShoppingBag
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ACTIVITIES = [
  { value: "Snooker", label: "Snooker Table", maxCap: 1, icon: "S" },
  { value: "Pool", label: "Pool Table", maxCap: 1, icon: "P" },
  { value: "PS5", label: "PS5 Console", maxCap: 2, icon: "5" },
];

const MiniCalendar = ({ selectedDate, onSelect }) => {
  const [viewDate, setViewDate] = useState(() => {
    const d = selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
  const firstDay = new Date(viewDate.year, viewDate.month, 1).getDay();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const prevMonth = () => setViewDate(v => { const m = v.month === 0 ? 11 : v.month - 1; return { year: v.month === 0 ? v.year - 1 : v.year, month: m }; });
  const nextMonth = () => setViewDate(v => { const m = v.month === 11 ? 0 : v.month + 1; return { year: v.month === 11 ? v.year + 1 : v.year, month: m }; });
  const handleDayClick = (day) => { const d = new Date(viewDate.year, viewDate.month, day); if (d < today) return; onSelect(`${viewDate.year}-${String(viewDate.month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`); };
  const isSelected = (day) => { if (!selectedDate) return false; return `${viewDate.year}-${String(viewDate.month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}` === selectedDate; };
  const isPast = (day) => new Date(viewDate.year, viewDate.month, day) < today;
  const canGoPrev = () => viewDate.year > today.getFullYear() || viewDate.month > today.getMonth();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4" data-testid="booking-calendar">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={prevMonth} disabled={!canGoPrev()} className="w-8 h-8 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors duration-200 disabled:opacity-20" data-testid="calendar-prev-month"><ChevronLeft size={16}/></button>
        <span className="text-sm font-semibold text-white">{monthNames[viewDate.month]} {viewDate.year}</span>
        <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors duration-200" data-testid="calendar-next-month"><ChevronRight size={16}/></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">{dayNames.map(d => <div key={d} className="text-center text-[10px] font-semibold text-[#555] uppercase">{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => day === null ? <div key={`e-${i}`}/> : (
          <button key={day} type="button" onClick={() => handleDayClick(day)} disabled={isPast(day)}
            className={`w-full aspect-square rounded-lg text-xs font-semibold flex items-center justify-center transition-all duration-200 ${isSelected(day) ? "bg-[#00A859] text-white" : isPast(day) ? "text-[#333] cursor-not-allowed" : "text-[#A1A1AA] hover:bg-white/10 hover:text-white cursor-pointer"}`}
            data-testid={`calendar-day-${day}`}>{day}</button>
        ))}
      </div>
    </div>
  );
};

export const BookingSection = ({ apiUrl, menuItems = [] }) => {
  const sectionRef = useRef(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", date: "", time_slot: "", group_size: 2, notes: "" });
  const [activityQty, setActivityQty] = useState({ Snooker: 0, Pool: 0, PS5: 0 });
  const [foodQty, setFoodQty] = useState({});
  const [foodCategory, setFoodCategory] = useState("All");
  const [slotsData, setSlotsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booked, setBooked] = useState(null);
  const [error, setError] = useState("");

  const categories = ["All", ...new Set(menuItems.map(i => i.category))];
  const filteredMenu = foodCategory === "All" ? menuItems : menuItems.filter(i => i.category === foodCategory);

  const foodOrders = menuItems
    .filter(item => (foodQty[item.id] || 0) > 0)
    .map(item => ({ name: item.name, quantity: foodQty[item.id], price_per_item: item.price }));
  const foodTotal = foodOrders.reduce((sum, f) => sum + f.price_per_item * f.quantity, 0);
  const foodItemCount = foodOrders.reduce((sum, f) => sum + f.quantity, 0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".booking-header", { scrollTrigger: { trigger: sectionRef.current, start: "top 80%" }, y: 30, opacity: 0, duration: 0.7 });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => { if (form.date) fetchAvailability(); }, [form.date]);

  const fetchAvailability = async () => {
    setSlotsLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/bookings/availability`, { params: { date: form.date } });
      setSlotsData(res.data.slots);
    } catch (e) { console.error("Failed to fetch availability:", e); }
    setSlotsLoading(false);
  };

  const getSlotAvailability = (slot) => {
    const slotInfo = slotsData.find(s => s.slot === slot);
    if (!slotInfo) return true;
    for (const [act, qty] of Object.entries(activityQty)) {
      if (qty > 0 && slotInfo.available[act] !== undefined && slotInfo.available[act] < qty) return false;
    }
    return true;
  };

  const selectedActivities = Object.entries(activityQty).filter(([, qty]) => qty > 0).map(([activity, quantity]) => ({ activity, quantity }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date || !form.time_slot) { setError("Please fill in all required fields."); return; }
    if (selectedActivities.length === 0) { setError("Please select at least one activity."); return; }
    setLoading(true);
    setError("");
    try {
      const payload = { ...form, activities: selectedActivities, food_orders: foodOrders };
      const res = await axios.post(`${apiUrl}/bookings`, payload);
      setBooked(res.data);
    } catch (e) { setError(e.response?.data?.detail || "Booking failed. Please try again."); }
    setLoading(false);
  };

  const update = (field, value) => { setForm(f => ({ ...f, [field]: value })); setError(""); };
  const updateQty = (activity, delta) => {
    const info = ACTIVITIES.find(a => a.value === activity);
    setActivityQty(prev => ({ ...prev, [activity]: Math.max(0, Math.min(info.maxCap, prev[activity] + delta)) }));
    setError("");
  };
  const updateFoodQty = (itemId, delta) => {
    setFoodQty(prev => {
      const curr = prev[itemId] || 0;
      const next = Math.max(0, Math.min(10, curr + delta));
      return { ...prev, [itemId]: next };
    });
  };

  const inputClasses = "w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#00A859] transition-colors duration-300";
  const selectClasses = "w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00A859] transition-colors duration-300 appearance-none cursor-pointer";
  const labelClasses = "block text-xs text-[#A1A1AA] mb-1.5 font-medium uppercase tracking-wider";

  if (booked) {
    return (
      <section id="booking" ref={sectionRef} className="py-24 md:py-32 relative bg-[#0a0a0a] border-y border-white/5" data-testid="booking-section">
        <div className="max-w-2xl mx-auto px-6 md:px-12 text-center">
          <div className="glass-card rounded-2xl p-10" data-testid="booking-success">
            <CheckCircle2 size={56} className="text-[#00A859] mx-auto mb-5" />
            <h3 className="text-2xl font-bold mb-3">Booking Confirmed!</h3>
            <p className="text-[#A1A1AA] mb-6">See you at Rack&Roll, {booked.name}!</p>
            <div className="bg-[#0a0a0a] rounded-lg p-5 text-left space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-[#A1A1AA]">Activities</span><span className="text-white font-semibold">{booked.activities.map(a => `${a.activity}${a.quantity > 1 ? ` x${a.quantity}` : ""}`).join(", ")}</span></div>
              <div className="flex justify-between"><span className="text-[#A1A1AA]">Date</span><span className="text-white font-semibold">{booked.date}</span></div>
              <div className="flex justify-between"><span className="text-[#A1A1AA]">Time</span><span className="text-[#00A859] font-semibold">{booked.time_slot}</span></div>
              <div className="flex justify-between"><span className="text-[#A1A1AA]">Group Size</span><span className="text-white font-semibold">{booked.group_size} people</span></div>
              {booked.phone && <div className="flex justify-between"><span className="text-[#A1A1AA]">Phone</span><span className="text-white font-semibold">{booked.phone}</span></div>}
            </div>

            {/* Food order in confirmation */}
            {booked.food_orders && booked.food_orders.length > 0 && (
              <div className="mt-5 bg-[#0a0a0a] rounded-lg p-5 text-left" data-testid="booking-food-confirmation">
                <p className="text-xs text-[#F5A623] font-bold uppercase tracking-wider mb-3">Food Order</p>
                <div className="space-y-2 text-sm">
                  {booked.food_orders.map((f, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-[#A1A1AA]">{f.name} x{f.quantity}</span>
                      <span className="text-white font-semibold">{"\u20B9"}{(f.price_per_item * f.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                    <span className="text-white font-bold">Food Total</span>
                    <span className="text-[#00A859] font-bold">{"\u20B9"}{booked.food_total.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            )}

            <button onClick={() => { setBooked(null); setForm({ name:"",phone:"",email:"",date:"",time_slot:"",group_size:2,notes:"" }); setActivityQty({Snooker:0,Pool:0,PS5:0}); setFoodQty({}); }}
              className="mt-7 btn-primary px-8 py-3 rounded-full text-sm" data-testid="book-another-btn">Book Another Session</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" ref={sectionRef} className="py-24 md:py-32 relative bg-[#0a0a0a] border-y border-white/5" data-testid="booking-section">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="booking-header mb-12">
          <p className="text-[#00A859] font-bold tracking-[0.2em] uppercase text-xs mb-3">Reserve Your Spot</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Book a Session</h2>
          <div className="w-20 h-1 bg-[#00A859] mb-6 rounded-full" />
          <p className="text-[#A1A1AA] text-lg font-light leading-relaxed max-w-lg">
            Select activities, pick your date & time, add food to your order, and we'll have everything ready.
          </p>
        </div>

        <form onSubmit={handleSubmit} data-testid="booking-form">
          {/* Row 1: Activities + Calendar (left) | Customer Details + Time (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-10">
            {/* Left Column */}
            <div className="space-y-7">
              {/* Activities */}
              <div>
                <h4 className={labelClasses}>Select Activities & Sessions</h4>
                <div className="space-y-3 mt-2">
                  {ACTIVITIES.map(a => (
                    <div key={a.value} className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${activityQty[a.value] > 0 ? "border-[#00A859]/50 bg-[#00A859]/5" : "border-white/5 bg-white/[0.02]"}`} data-testid={`activity-option-${a.value.toLowerCase()}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black ${activityQty[a.value] > 0 ? "bg-[#00A859] text-white" : "bg-white/5 text-[#A1A1AA]"}`}>{a.icon}</div>
                        <div><span className="font-semibold text-sm">{a.label}</span><p className="text-[10px] text-[#555]">Max {a.maxCap} per slot</p></div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button type="button" onClick={() => updateQty(a.value,-1)} disabled={activityQty[a.value]===0} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[#A1A1AA] hover:text-white hover:border-white/30 transition-all duration-200 disabled:opacity-20" data-testid={`qty-minus-${a.value.toLowerCase()}`}><Minus size={14}/></button>
                        <span className="w-6 text-center text-sm font-bold text-white" data-testid={`qty-value-${a.value.toLowerCase()}`}>{activityQty[a.value]}</span>
                        <button type="button" onClick={() => updateQty(a.value,1)} disabled={activityQty[a.value]>=a.maxCap} className="w-8 h-8 rounded-full border border-[#00A859]/40 bg-[#00A859]/10 flex items-center justify-center text-[#00A859] hover:bg-[#00A859] hover:text-white transition-all duration-200 disabled:opacity-20" data-testid={`qty-plus-${a.value.toLowerCase()}`}><Plus size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedActivities.length > 0 && <div className="mt-3 text-xs text-[#00A859] font-medium" data-testid="activity-summary">Selected: {selectedActivities.map(a => `${a.activity} x${a.quantity}`).join(", ")}</div>}
              </div>

              {/* Calendar */}
              <div>
                <h4 className={labelClasses}><CalendarDays size={12} className="inline mr-1"/>Pick a Date</h4>
                <div className="mt-2"><MiniCalendar selectedDate={form.date} onSelect={d => update("date",d)}/></div>
              </div>
            </div>

            {/* Right Column - Customer Details + Time */}
            <div className="glass-card rounded-2xl p-7 md:p-9 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClasses}>Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.name} onChange={e => update("name",e.target.value)} placeholder="Your name" className={inputClasses} data-testid="booking-name-input"/>
                </div>
                <div>
                  <label className={labelClasses}>Phone <span className="text-red-400">*</span></label>
                  <input type="tel" value={form.phone} onChange={e => update("phone",e.target.value)} placeholder="e.g., 9260940347" className={inputClasses} data-testid="booking-phone-input"/>
                </div>
              </div>
              <div>
                <label className={labelClasses}>Email (Optional)</label>
                <input type="email" value={form.email} onChange={e => update("email",e.target.value)} placeholder="your@email.com" className={inputClasses} data-testid="booking-email-input"/>
              </div>
              <div>
                <label className={labelClasses}><Users size={12} className="inline mr-1"/>Group Size</label>
                <select value={form.group_size} onChange={e => update("group_size",parseInt(e.target.value))} className={selectClasses} data-testid="booking-group-select">
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClasses}><Clock size={12} className="inline mr-1"/>Time Slot <span className="text-red-400">*</span></label>
                {!form.date ? <p className="text-xs text-[#555] mt-2">Pick a date on the calendar first</p>
                  : slotsLoading ? <div className="flex items-center gap-2 text-[#A1A1AA] text-sm mt-2"><Loader2 size={14} className="animate-spin"/> Loading availability...</div>
                  : <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2" data-testid="time-slots">
                      {slotsData.map(slotInfo => {
                        const isAvail = getSlotAvailability(slotInfo.slot);
                        const isSel = form.time_slot === slotInfo.slot;
                        return <button key={slotInfo.slot} type="button" onClick={() => isAvail && update("time_slot",slotInfo.slot)} disabled={!isAvail}
                          className={`py-2.5 px-2 rounded-lg text-xs font-semibold text-center transition-all duration-200 ${isSel ? "bg-[#00A859] text-white" : isAvail ? "bg-white/5 text-[#A1A1AA] hover:bg-white/10 hover:text-white" : "bg-white/[0.02] text-[#333] cursor-not-allowed line-through"}`}
                          data-testid={`slot-${slotInfo.slot.replace(/\s+/g,"-")}`}>{slotInfo.slot}</button>;
                      })}
                      {slotsData.length === 0 && <p className="col-span-3 text-xs text-[#555]">No slots available.</p>}
                    </div>
                }
              </div>
              <div>
                <label className={labelClasses}>Special Requests</label>
                <textarea value={form.notes} onChange={e => update("notes",e.target.value)} placeholder="Any special requests? (e.g., birthday celebration)" rows={2} className={`${inputClasses} resize-none`} data-testid="booking-notes-input"/>
              </div>
            </div>
          </div>

          {/* Row 2: Food Selection (Full Width) */}
          <div className="mb-10" data-testid="food-order-section">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#F5A623]/15 flex items-center justify-center text-[#F5A623]">
                <UtensilsCrossed size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Add Food to Your Booking</h3>
                <p className="text-xs text-[#A1A1AA]">Pre-order and have it ready when you arrive (optional)</p>
              </div>
              {foodItemCount > 0 && (
                <div className="ml-auto flex items-center gap-2 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-full px-4 py-1.5" data-testid="food-cart-badge">
                  <ShoppingBag size={14} className="text-[#F5A623]" />
                  <span className="text-[#F5A623] text-xs font-bold">{foodItemCount} items &middot; {"\u20B9"}{foodTotal.toFixed(0)}</span>
                </div>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-5 overflow-x-auto pb-2" data-testid="food-category-tabs">
              {categories.map(cat => (
                <button key={cat} type="button" onClick={() => setFoodCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${foodCategory === cat ? "bg-[#F5A623] text-black" : "bg-white/5 text-[#A1A1AA] hover:bg-white/10 hover:text-white"}`}
                  data-testid={`food-tab-${cat.toLowerCase()}`}>{cat}</button>
              ))}
            </div>

            {/* Food Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="food-items-grid">
              {filteredMenu.map(item => {
                const qty = foodQty[item.id] || 0;
                return (
                  <div key={item.id} className={`rounded-xl border overflow-hidden transition-all duration-300 ${qty > 0 ? "border-[#F5A623]/40 bg-[#F5A623]/[0.03]" : "border-white/5 bg-white/[0.02]"}`} data-testid={`food-item-${item.id}`}>
                    <div className="h-28 overflow-hidden relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"/>
                      <div className="absolute bottom-2 left-3 text-white text-xs font-bold bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">{"\u20B9"}{Math.round(item.price)}</div>
                    </div>
                    <div className="p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                          <p className="text-[10px] text-[#666] mt-0.5 line-clamp-1">{item.description}</p>
                        </div>
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {qty > 0 ? (
                            <>
                              <button type="button" onClick={() => updateFoodQty(item.id,-1)} className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center text-[#A1A1AA] hover:text-white transition-all" data-testid={`food-minus-${item.id}`}><Minus size={12}/></button>
                              <span className="w-5 text-center text-xs font-bold text-[#F5A623]" data-testid={`food-qty-${item.id}`}>{qty}</span>
                              <button type="button" onClick={() => updateFoodQty(item.id,1)} disabled={qty>=10} className="w-7 h-7 rounded-full bg-[#F5A623] flex items-center justify-center text-black hover:bg-[#ffc048] transition-all disabled:opacity-30" data-testid={`food-plus-${item.id}`}><Plus size={12}/></button>
                            </>
                          ) : (
                            <button type="button" onClick={() => updateFoodQty(item.id,1)} className="h-7 px-3 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/30 text-[#F5A623] text-xs font-bold hover:bg-[#F5A623] hover:text-black transition-all duration-200" data-testid={`food-add-${item.id}`}>Add</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 3: Order Summary + Submit */}
          <div className="glass-card rounded-2xl p-7 md:p-9" data-testid="order-summary">
            <h3 className="text-lg font-bold mb-5 tracking-tight">Order Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Activities summary */}
              <div>
                <p className="text-xs text-[#00A859] font-bold uppercase tracking-wider mb-2">Activities</p>
                {selectedActivities.length > 0 ? (
                  <div className="space-y-1.5">{selectedActivities.map(a => <div key={a.activity} className="flex justify-between text-sm"><span className="text-[#A1A1AA]">{a.activity}</span><span className="text-white font-semibold">x{a.quantity}</span></div>)}</div>
                ) : <p className="text-xs text-[#555]">No activities selected</p>}
              </div>
              {/* Food summary */}
              <div>
                <p className="text-xs text-[#F5A623] font-bold uppercase tracking-wider mb-2">Food Order</p>
                {foodOrders.length > 0 ? (
                  <div className="space-y-1.5">
                    {foodOrders.map((f,i) => <div key={i} className="flex justify-between text-sm"><span className="text-[#A1A1AA]">{f.name} x{f.quantity}</span><span className="text-white font-semibold">{"\u20B9"}{(f.price_per_item * f.quantity).toFixed(0)}</span></div>)}
                    <div className="border-t border-white/10 pt-2 flex justify-between text-sm"><span className="text-[#F5A623] font-bold">Food Total</span><span className="text-[#F5A623] font-bold">{"\u20B9"}{foodTotal.toFixed(0)}</span></div>
                  </div>
                ) : <p className="text-xs text-[#555]">No food items added</p>}
              </div>
            </div>

            {/* Booking info row */}
            <div className="flex flex-wrap gap-4 text-xs text-[#A1A1AA] mb-6 pb-5 border-b border-white/5">
              {form.date && <span className="bg-white/5 px-3 py-1.5 rounded-full">{form.date}</span>}
              {form.time_slot && <span className="bg-[#00A859]/10 text-[#00A859] px-3 py-1.5 rounded-full font-semibold">{form.time_slot}</span>}
              {form.name && <span className="bg-white/5 px-3 py-1.5 rounded-full">{form.name}</span>}
              {form.phone && <span className="bg-white/5 px-3 py-1.5 rounded-full">{form.phone}</span>}
            </div>

            {error && <p className="text-red-400 text-sm mb-4" data-testid="booking-error">{error}</p>}

            <button type="submit" disabled={loading} className="w-full btn-primary py-4 rounded-xl text-sm tracking-wider flex items-center justify-center gap-2 disabled:opacity-50" data-testid="submit-booking-btn">
              {loading ? <><Loader2 size={16} className="animate-spin"/> Confirming...</> : `Confirm Booking${foodTotal > 0 ? ` + Food (${"\u20B9"}${foodTotal.toFixed(0)})` : ""}`}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
