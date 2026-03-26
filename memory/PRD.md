# Rack&Roll Cafe - PRD

## Original Problem Statement
Convert a static HTML website for "Rack&Roll Cafe" (gaming & sports cafe) into a full-stack React + FastAPI app with improvements. Then implement specific modifications requested by the user across multiple iterations.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + GSAP animations + Lucide/Phosphor icons
- **Backend**: FastAPI (Python) with async MongoDB (Motor)
- **Database**: MongoDB (collections: menu_items, bookings)
- **AI Integration**: Gemini 3 Flash via Emergent LLM Key (visit planner)
- **Email**: Resend API for booking confirmation emails

## Core Requirements
- Dark theme gaming cafe aesthetic (green #00A859 + amber #F5A623)
- Hero, Play (gaming setup), Menu, AI Lounge, Booking, Footer sections
- AI-powered Visit Planner (Gemini)
- Table/console booking system with availability checking & multi-activity support
- Interactive food menu with categories in INR
- Email notifications on booking to aaradhya.malaviya2005@gmail.com

## What's Been Implemented

### Initial Build (March 2026)
- Full React SPA with 7 components (Navbar, Hero, PlaySection, MenuSection, AILounge, BookingSection, Footer)
- FastAPI backend with menu seeding, booking, availability, and AI endpoints
- Glass-morphism dark theme with GSAP scroll animations

### Iteration 2 - User Requested Changes
1. ✅ Removed Trash Talk Generator (UI + backend endpoint)
2. ✅ Multi-activity booking with +/- quantity selectors (Snooker, Pool, PS5)
3. ✅ Calendar date picker in booking section
4. ✅ Google Maps link: https://maps.app.goo.gl/9ireFo9o6A3oThB37
5. ✅ Phone number updated to 9260940347
6. ✅ Menu prices converted to Indian Rupees (INR ₹)

### Iteration 3 - Address, Email & Cleanup
1. ✅ Address updated to "Rack&Roll Cafe, NRI City, Near Intown Myra, Kanpur"
2. ✅ Get Directions button opens correct Google Maps link in new tab
3. ✅ Email-based booking notifications via Resend API (sends to aaradhya.malaviya2005@gmail.com)
4. ✅ Removed "pool table atmosphere" alt text from hero image
5. ✅ WhatsApp social link removed from footer

### Database Schema
**menu_items**: id, name, description, price (INR), category, image, tags
**bookings**: id, name, phone, email, date, time_slot, activities [{activity, quantity}], group_size, notes, status, created_at

## Prioritized Backlog
- P1: Admin dashboard for booking management
- P2: Online menu ordering with cart
- P2: Customer reviews/testimonials section
- P3: Loyalty/rewards program integration

## Next Tasks
- Build admin panel for store manager to view/manage bookings
- Add real-time availability updates
- SMS confirmation via Twilio (optional)
