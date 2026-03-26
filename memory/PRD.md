# Rack&Roll Cafe - PRD

## Original Problem Statement
Convert a static HTML website for "Rack&Roll Cafe" (gaming & sports cafe) into a full-stack React + FastAPI app with improvements across multiple iterations.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + GSAP animations + Lucide/Phosphor icons
- **Backend**: FastAPI (Python) with async MongoDB (Motor)
- **Database**: MongoDB (collections: menu_items, bookings)
- **AI Integration**: Gemini 3 Flash via Emergent LLM Key (visit planner)
- **Email**: Resend API for booking confirmation emails to aaradhya.malaviya2005@gmail.com

## What's Been Implemented

### Iteration 1 - Initial Build
- Full React SPA: Navbar, Hero, PlaySection, MenuSection, AILounge, BookingSection, Footer
- Glass-morphism dark theme with GSAP scroll animations

### Iteration 2 - Core Customizations
- Removed Trash Talk Generator
- Multi-activity booking with +/- quantity
- Calendar date picker, Google Maps link, phone 9260940347, INR prices

### Iteration 3 - Address, Email & Cleanup
- Address: "Rack&Roll Cafe, NRI City, Near Intown Myra, Kanpur"
- Email-based booking notifications via Resend API
- Removed WhatsApp, removed "pool table atmosphere"

### Iteration 4 - Food Ordering in Booking Flow
- Full menu grid within booking section with images, prices, descriptions
- Category tabs: All, Burgers, Pizza, Sides, Drinks, Desserts
- +/- quantity controls per food item (max 10 each)
- Live cart badge showing item count and total in ₹
- Order Summary section: activities + food + customer info at a glance
- food_orders array stored in MongoDB with name, quantity, price_per_item, food_total
- Booking confirmation email includes complete food order table

### Database Schema
**menu_items**: id, name, description, price (INR), category, image, tags
**bookings**: id, name, phone, email, date, time_slot, activities [{activity, quantity}], group_size, notes, food_orders [{name, quantity, price_per_item}], food_total, status, created_at

## Prioritized Backlog
- P1: Admin dashboard for booking management
- P2: Online payment integration (Razorpay)
- P2: Customer reviews/testimonials section
- P3: Loyalty/rewards program
