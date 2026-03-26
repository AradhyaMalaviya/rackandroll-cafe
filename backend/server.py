from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
BOOKING_NOTIFY_EMAIL = 'aaradhya.malaviya2005@gmail.com'

resend.api_key = RESEND_API_KEY

app = FastAPI()
api_router = APIRouter(prefix="/api")


# --- Models ---

class MenuItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str
    image: Optional[str] = None
    tags: List[str] = []

class ActivitySelection(BaseModel):
    activity: str
    quantity: int = 1

class FoodOrderItem(BaseModel):
    name: str
    quantity: int
    price_per_item: float

class BookingCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    date: str
    time_slot: str
    activities: List[ActivitySelection]
    group_size: int
    notes: Optional[str] = None
    food_orders: Optional[List[FoodOrderItem]] = []

class BookingResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    date: str
    time_slot: str
    activities: List[ActivitySelection]
    group_size: int
    notes: Optional[str] = None
    food_orders: Optional[List[FoodOrderItem]] = []
    food_total: float = 0
    status: str = "confirmed"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AIPlanRequest(BaseModel):
    group: str
    vibe: str

class AIResponse(BaseModel):
    text: str


async def send_booking_email(booking: BookingResponse):
    """Send booking confirmation email to the cafe owner"""
    activities_html = "".join(
        f"<tr><td style='padding:8px 12px;border-bottom:1px solid #eee;'>{a.activity}</td>"
        f"<td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:center;'>{a.quantity}</td></tr>"
        for a in booking.activities
    )

    food_html = ""
    if booking.food_orders:
        food_rows = "".join(
            f"<tr><td style='padding:8px 12px;border-bottom:1px solid #eee;'>{f.name}</td>"
            f"<td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:center;'>{f.quantity}</td>"
            f"<td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:right;'>&#8377;{f.price_per_item:.0f}</td>"
            f"<td style='padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;'>&#8377;{f.price_per_item * f.quantity:.0f}</td></tr>"
            for f in booking.food_orders
        )
        food_html = f"""
        <h3 style="color:#333;">Food Order</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
          <tr style="background:#F5A623;color:white;">
            <th style="padding:10px 12px;text-align:left;">Item</th>
            <th style="padding:10px 12px;text-align:center;">Qty</th>
            <th style="padding:10px 12px;text-align:right;">Price</th>
            <th style="padding:10px 12px;text-align:right;">Total</th>
          </tr>
          {food_rows}
        </table>
        <p style="text-align:right;font-size:16px;font-weight:bold;color:#333;margin-bottom:16px;">
          Food Total: <span style="color:#00A859;">&#8377;{booking.food_total:.0f}</span>
        </p>
        """

    html_content = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:20px;">
      <div style="background:#00A859;color:white;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
        <h1 style="margin:0;font-size:24px;">New Booking at Rack&Roll Cafe</h1>
      </div>
      <div style="background:white;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e0e0e0;">
        <h2 style="color:#333;margin-top:0;">Booking Details</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <tr><td style="padding:8px 12px;color:#666;font-weight:bold;width:40%;">Customer Name</td><td style="padding:8px 12px;">{booking.name}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px 12px;color:#666;font-weight:bold;">Phone</td><td style="padding:8px 12px;">{booking.phone}</td></tr>
          <tr><td style="padding:8px 12px;color:#666;font-weight:bold;">Email</td><td style="padding:8px 12px;">{booking.email or 'Not provided'}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px 12px;color:#666;font-weight:bold;">Date</td><td style="padding:8px 12px;">{booking.date}</td></tr>
          <tr><td style="padding:8px 12px;color:#666;font-weight:bold;">Time Slot</td><td style="padding:8px 12px;color:#00A859;font-weight:bold;">{booking.time_slot}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px 12px;color:#666;font-weight:bold;">Group Size</td><td style="padding:8px 12px;">{booking.group_size} people</td></tr>
          <tr><td style="padding:8px 12px;color:#666;font-weight:bold;">Notes</td><td style="padding:8px 12px;">{booking.notes or 'None'}</td></tr>
        </table>
        <h3 style="color:#333;">Selected Activities</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <tr style="background:#00A859;color:white;">
            <th style="padding:10px 12px;text-align:left;">Activity</th>
            <th style="padding:10px 12px;text-align:center;">Quantity</th>
          </tr>
          {activities_html}
        </table>
        {food_html}
        <p style="color:#666;font-size:12px;margin-top:16px;">Booking ID: {booking.id}<br>Status: {booking.status}<br>Created: {booking.created_at}</p>
      </div>
    </div>
    """

    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [BOOKING_NOTIFY_EMAIL],
            "subject": f"New Booking: {booking.name} - {booking.date} ({booking.time_slot})",
            "html": html_content,
        }
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Booking email sent for booking {booking.id}")
    except Exception as e:
        logger.error(f"Failed to send booking email: {str(e)}")


# --- Seed Menu Data (INR Prices) ---

MENU_SEED = [
    {"name": "Smash Burger", "description": "Double-patty smash burger with caramelized onions, cheddar, and secret sauce", "price": 249, "category": "Burgers", "tags": ["bestseller", "heavy"], "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Classic Chicken Burger", "description": "Crispy fried chicken with coleslaw and spicy mayo", "price": 199, "category": "Burgers", "tags": ["popular"], "image": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&q=80&w=600"},
    {"name": "Margherita Pizza", "description": "Hand-tossed with fresh mozzarella, basil, and San Marzano tomatoes", "price": 299, "category": "Pizza", "tags": ["vegetarian"], "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=600"},
    {"name": "BBQ Chicken Pizza", "description": "Smoky BBQ sauce, grilled chicken, red onion, and cilantro", "price": 349, "category": "Pizza", "tags": ["bestseller"], "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600"},
    {"name": "Loaded Fries", "description": "Crispy fries topped with melted cheese, jalapenos, and sour cream", "price": 149, "category": "Sides", "tags": ["shareable"], "image": "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&q=80&w=600"},
    {"name": "Chicken Wings", "description": "12 crispy wings tossed in your choice of buffalo, BBQ, or garlic parmesan", "price": 279, "category": "Sides", "tags": ["shareable", "popular"], "image": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=600"},
    {"name": "Iced Caramel Latte", "description": "Espresso with caramel syrup, cold milk, and ice", "price": 129, "category": "Drinks", "tags": ["cold"], "image": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=600"},
    {"name": "Berry Blast Smoothie", "description": "Mixed berries, banana, yogurt, and a splash of honey", "price": 149, "category": "Drinks", "tags": ["healthy"], "image": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600"},
    {"name": "Espresso Shot", "description": "Double shot of premium Italian espresso", "price": 79, "category": "Drinks", "tags": ["hot", "quick"], "image": "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&q=80&w=600"},
    {"name": "Chocolate Brownie", "description": "Warm fudge brownie with vanilla ice cream and chocolate drizzle", "price": 159, "category": "Desserts", "tags": ["sweet"], "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600"},
    {"name": "Nachos Supreme", "description": "Loaded nachos with guacamole, salsa, cheese, and sour cream", "price": 199, "category": "Sides", "tags": ["shareable", "vegetarian"], "image": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=600"},
    {"name": "Mint Mojito", "description": "Fresh mint, lime, soda, and a hint of sweetness (non-alcoholic)", "price": 109, "category": "Drinks", "tags": ["cold", "refreshing"], "image": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&q=80&w=600"},
]


@app.on_event("startup")
async def seed_menu():
    # Drop and re-seed if prices need updating (INR migration)
    existing = await db.menu_items.find_one({}, {"_id": 0, "price": 1})
    if existing and existing.get("price", 0) < 50:
        # Old USD prices detected, re-seed with INR
        await db.menu_items.drop()

    count = await db.menu_items.count_documents({})
    if count == 0:
        for item in MENU_SEED:
            menu_item = MenuItem(**item)
            doc = menu_item.model_dump()
            await db.menu_items.insert_one(doc)
        logger.info(f"Seeded {len(MENU_SEED)} menu items with INR prices")


# --- API Routes ---

@api_router.get("/")
async def root():
    return {"message": "Rack&Roll Cafe API"}

@api_router.get("/menu", response_model=List[MenuItem])
async def get_menu():
    items = await db.menu_items.find({}, {"_id": 0}).to_list(100)
    return items

@api_router.get("/menu/categories")
async def get_menu_categories():
    categories = await db.menu_items.distinct("category")
    return {"categories": categories}

@api_router.post("/bookings", response_model=BookingResponse, status_code=201)
async def create_booking(input_data: BookingCreate):
    if not input_data.activities:
        raise HTTPException(status_code=400, detail="Please select at least one activity")

    # Check availability for each selected activity
    for sel in input_data.activities:
        if sel.activity in ["Snooker", "Pool"]:
            max_cap = 1
        elif sel.activity == "PS5":
            max_cap = 2
        else:
            continue

        # Sum up quantities already booked for this activity + slot
        pipeline = [
            {"$match": {
                "date": input_data.date,
                "time_slot": input_data.time_slot,
                "status": "confirmed"
            }},
            {"$unwind": "$activities"},
            {"$match": {"activities.activity": sel.activity}},
            {"$group": {"_id": None, "total_qty": {"$sum": "$activities.quantity"}}}
        ]
        agg_result = await db.bookings.aggregate(pipeline).to_list(1)
        current_booked = agg_result[0]["total_qty"] if agg_result else 0

        if current_booked + sel.quantity > max_cap:
            remaining = max_cap - current_booked
            if remaining <= 0:
                raise HTTPException(
                    status_code=409,
                    detail=f"{sel.activity} is fully booked for this time slot"
                )
            else:
                raise HTTPException(
                    status_code=409,
                    detail=f"Only {remaining} {sel.activity} session(s) available for this slot"
                )

    booking_data = input_data.model_dump()
    booking_data["activities"] = [a.model_dump() for a in input_data.activities]
    booking_data["food_orders"] = [f.model_dump() for f in (input_data.food_orders or [])]
    food_total = sum(f.price_per_item * f.quantity for f in (input_data.food_orders or []))
    booking_data["food_total"] = food_total
    booking = BookingResponse(**booking_data)
    doc = booking.model_dump()
    await db.bookings.insert_one(doc)

    # Send email notification (non-blocking, don't fail booking if email fails)
    asyncio.create_task(send_booking_email(booking))

    return booking

@api_router.get("/bookings/availability")
async def get_availability(date: str):
    """Get availability for all activities on a given date across all time slots"""
    all_slots = [
        "11:00 AM - 12:00 PM", "12:00 PM - 1:00 PM", "1:00 PM - 2:00 PM",
        "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM", "4:00 PM - 5:00 PM",
        "5:00 PM - 6:00 PM", "6:00 PM - 7:00 PM", "7:00 PM - 8:00 PM",
        "8:00 PM - 9:00 PM", "9:00 PM - 10:00 PM", "10:00 PM - 11:00 PM"
    ]

    capacities = {"Snooker": 1, "Pool": 1, "PS5": 2}

    # Get all bookings for this date
    pipeline = [
        {"$match": {"date": date, "status": "confirmed"}},
        {"$unwind": "$activities"},
        {"$group": {
            "_id": {"slot": "$time_slot", "activity": "$activities.activity"},
            "booked_qty": {"$sum": "$activities.quantity"}
        }}
    ]
    agg = await db.bookings.aggregate(pipeline).to_list(200)

    # Build lookup: { "slot|activity": booked_qty }
    booked_map = {}
    for entry in agg:
        key = f"{entry['_id']['slot']}|{entry['_id']['activity']}"
        booked_map[key] = entry["booked_qty"]

    slots_availability = []
    for slot in all_slots:
        activity_avail = {}
        for act, cap in capacities.items():
            key = f"{slot}|{act}"
            used = booked_map.get(key, 0)
            activity_avail[act] = max(0, cap - used)
        slots_availability.append({
            "slot": slot,
            "available": activity_avail
        })

    return {"all_slots": all_slots, "slots": slots_availability}

@api_router.get("/bookings", response_model=List[BookingResponse])
async def get_all_bookings():
    """Admin endpoint to view all bookings"""
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return bookings


@api_router.post("/ai/plan", response_model=AIResponse)
async def ai_plan(request: AIPlanRequest):
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"plan-{uuid.uuid4()}",
        system_message="You are a cool, welcoming host at Rack&Roll Cafe, a premium gaming lounge with snooker, pool, PS5, burgers, pizza, and coffee. Keep responses to 2-3 sentences, fun and punchy."
    ).with_model("gemini", "gemini-3-flash-preview")

    prompt = f"I am planning a visit to Rack&Roll Cafe. We are: {request.group}. The vibe is: {request.vibe}. Give me a 2-3 sentence recommendation on which game to play (Snooker, Pool, or PS5) and what food/drink combo to get from the menu. Keep it fun, punchy, and sound like a cool cafe host."

    msg = UserMessage(text=prompt)
    response = await chat.send_message(msg)
    return AIResponse(text=response)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
