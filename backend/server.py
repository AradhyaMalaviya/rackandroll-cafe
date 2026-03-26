from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

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

class BookingCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    date: str
    time_slot: str
    activity: str
    group_size: int
    notes: Optional[str] = None

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    date: str
    time_slot: str
    activity: str
    group_size: int
    notes: Optional[str] = None
    status: str = "confirmed"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AIPlanRequest(BaseModel):
    group: str
    vibe: str

class AITrashTalkRequest(BaseModel):
    rival: str
    game: str

class AIResponse(BaseModel):
    text: str


# --- Seed Menu Data ---

MENU_SEED = [
    {"name": "Smash Burger", "description": "Double-patty smash burger with caramelized onions, cheddar, and secret sauce", "price": 12.99, "category": "Burgers", "tags": ["bestseller", "heavy"], "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600"},
    {"name": "Classic Chicken Burger", "description": "Crispy fried chicken with coleslaw and spicy mayo", "price": 10.99, "category": "Burgers", "tags": ["popular"], "image": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&q=80&w=600"},
    {"name": "Margherita Pizza", "description": "Hand-tossed with fresh mozzarella, basil, and San Marzano tomatoes", "price": 14.99, "category": "Pizza", "tags": ["vegetarian"], "image": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=600"},
    {"name": "BBQ Chicken Pizza", "description": "Smoky BBQ sauce, grilled chicken, red onion, and cilantro", "price": 16.99, "category": "Pizza", "tags": ["bestseller"], "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600"},
    {"name": "Loaded Fries", "description": "Crispy fries topped with melted cheese, jalapenos, and sour cream", "price": 7.99, "category": "Sides", "tags": ["shareable"], "image": "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&q=80&w=600"},
    {"name": "Chicken Wings", "description": "12 crispy wings tossed in your choice of buffalo, BBQ, or garlic parmesan", "price": 13.99, "category": "Sides", "tags": ["shareable", "popular"], "image": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&q=80&w=600"},
    {"name": "Iced Caramel Latte", "description": "Espresso with caramel syrup, cold milk, and ice", "price": 5.49, "category": "Drinks", "tags": ["cold"], "image": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=600"},
    {"name": "Berry Blast Smoothie", "description": "Mixed berries, banana, yogurt, and a splash of honey", "price": 6.99, "category": "Drinks", "tags": ["healthy"], "image": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=600"},
    {"name": "Espresso Shot", "description": "Double shot of premium Italian espresso", "price": 3.49, "category": "Drinks", "tags": ["hot", "quick"], "image": "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&q=80&w=600"},
    {"name": "Chocolate Brownie", "description": "Warm fudge brownie with vanilla ice cream and chocolate drizzle", "price": 7.49, "category": "Desserts", "tags": ["sweet"], "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600"},
    {"name": "Nachos Supreme", "description": "Loaded nachos with guacamole, salsa, cheese, and sour cream", "price": 9.99, "category": "Sides", "tags": ["shareable", "vegetarian"], "image": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=600"},
    {"name": "Mint Mojito", "description": "Fresh mint, lime, soda, and a hint of sweetness (non-alcoholic)", "price": 4.99, "category": "Drinks", "tags": ["cold", "refreshing"], "image": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&q=80&w=600"},
]


@app.on_event("startup")
async def seed_menu():
    count = await db.menu_items.count_documents({})
    if count == 0:
        for item in MENU_SEED:
            menu_item = MenuItem(**item)
            doc = menu_item.model_dump()
            await db.menu_items.insert_one(doc)
        logger.info(f"Seeded {len(MENU_SEED)} menu items")


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

@api_router.post("/bookings", response_model=Booking)
async def create_booking(input_data: BookingCreate):
    existing = await db.bookings.find_one({
        "date": input_data.date,
        "time_slot": input_data.time_slot,
        "activity": input_data.activity,
        "status": "confirmed"
    }, {"_id": 0})
    
    if existing and input_data.activity in ["Snooker", "Pool"]:
        raise HTTPException(status_code=409, detail=f"{input_data.activity} table is already booked for this time slot")
    
    if input_data.activity == "PS5":
        ps5_count = await db.bookings.count_documents({
            "date": input_data.date,
            "time_slot": input_data.time_slot,
            "activity": "PS5",
            "status": "confirmed"
        })
        if ps5_count >= 2:
            raise HTTPException(status_code=409, detail="Both PS5 consoles are booked for this time slot")
    
    booking = Booking(**input_data.model_dump())
    doc = booking.model_dump()
    await db.bookings.insert_one(doc)
    return booking

@api_router.get("/bookings/slots")
async def get_available_slots(date: str, activity: str):
    all_slots = [
        "11:00 AM - 12:00 PM", "12:00 PM - 1:00 PM", "1:00 PM - 2:00 PM",
        "2:00 PM - 3:00 PM", "3:00 PM - 4:00 PM", "4:00 PM - 5:00 PM",
        "5:00 PM - 6:00 PM", "6:00 PM - 7:00 PM", "7:00 PM - 8:00 PM",
        "8:00 PM - 9:00 PM", "9:00 PM - 10:00 PM", "10:00 PM - 11:00 PM"
    ]
    
    booked = await db.bookings.find({
        "date": date,
        "activity": activity,
        "status": "confirmed"
    }, {"_id": 0, "time_slot": 1}).to_list(100)
    
    booked_slots = [b["time_slot"] for b in booked]
    
    max_capacity = 1 if activity in ["Snooker", "Pool"] else 2
    
    available = []
    for slot in all_slots:
        count = booked_slots.count(slot)
        if count < max_capacity:
            available.append(slot)
    
    return {"available_slots": available, "all_slots": all_slots}


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


@api_router.post("/ai/trashtalk", response_model=AIResponse)
async def ai_trashtalk(request: AITrashTalkRequest):
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"trash-{uuid.uuid4()}",
        system_message="You are a witty gamer. Provide friendly, competitive banter. Do not use profanity. Keep it PG-13 and fun."
    ).with_model("gemini", "gemini-3-flash-preview")

    rival = request.rival if request.rival else "Buddy"
    prompt = f"I am about to play {request.game} against my rival named {rival}. Give me a 1-2 sentence funny, slightly sarcastic, PG-13 trash talk message to send them before the game starts."

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
