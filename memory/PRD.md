# Rack&Roll Cafe - PRD

## Original Problem Statement
Convert a static HTML website for "Rack&Roll Cafe" (gaming & sports cafe) into a full-stack React + FastAPI app with improvements. Then implement 6 specific modifications requested by the user.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + GSAP animations + Lucide/Phosphor icons
- **Backend**: FastAPI (Python) with async MongoDB (Motor)
- **Database**: MongoDB (collections: menu_items, bookings)
- **AI Integration**: Gemini 3 Flash via Emergent LLM Key (visit planner)

## Core Requirements
- Dark theme gaming cafe aesthetic (green #00A859 + amber #F5A623)
- Hero, Play (gaming setup), Menu, AI Lounge, Booking, Footer sections
- AI-powered Visit Planner (Gemini)
- Table/console booking system with availability checking
- Interactive food menu with categories

## What's Been Implemented (March 2026)

### Initial Build
- Full React SPA with 7 components (Navbar, Hero, PlaySection, MenuSection, AILounge, BookingSection, Footer)
- FastAPI backend with menu seeding, booking, availability, and AI endpoints
- Glass-morphism dark theme with GSAP scroll animations
- Mobile-responsive design

### User-Requested Changes (Iteration 2)
1. ✅ Removed Trash Talk Generator (UI + backend endpoint)
2. ✅ Multi-activity booking with +/- quantity selectors (Snooker, Pool, PS5)
3. ✅ Calendar date picker in booking section
4. ✅ Google Maps link: https://maps.app.goo.gl/9ireFo9o6A3oThB37
5. ✅ Phone number updated to 9260940347
6. ✅ Menu prices converted to Indian Rupees (INR ₹)

### Database Schema
**menu_items**: id, name, description, price (INR), category, image, tags
**bookings**: id, name, phone, email, date, time_slot, activities [{activity, quantity}], group_size, notes, status, created_at

## Prioritized Backlog
- P1: Admin dashboard for booking management
- P1: WhatsApp booking confirmation notification
- P2: Online menu ordering with cart
- P2: Customer reviews/testimonials section
- P3: Loyalty/rewards program integration

## Next Tasks
- Build admin panel for store manager to view/manage bookings
- Add real-time availability updates
- Add customer notification system (WhatsApp/SMS)
