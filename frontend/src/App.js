import { useEffect, useRef, useState, useCallback } from "react";
import "@/App.css";
import axios from "axios";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PlaySection } from "@/components/PlaySection";
import { MenuSection } from "@/components/MenuSection";
import { AILounge } from "@/components/AILounge";
import { BookingSection } from "@/components/BookingSection";
import { Footer } from "@/components/Footer";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const mainRef = useRef(null);

  const fetchMenu = useCallback(async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        axios.get(`${API}/menu`),
        axios.get(`${API}/menu/categories`)
      ]);
      setMenuItems(itemsRes.data);
      setCategories(catsRes.data.categories);
    } catch (e) {
      console.error("Failed to fetch menu:", e);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return (
    <div ref={mainRef} className="relative">
      {/* Ambient orbs */}
      <div className="floating-orb bg-[#00A859] w-[500px] h-[500px] top-0 -left-40 opacity-[0.07] fixed" />
      <div className="floating-orb bg-[#F5A623] w-[350px] h-[350px] bottom-1/4 -right-20 opacity-[0.04] fixed" />

      <Navbar />
      <Hero />
      <PlaySection />
      <MenuSection items={menuItems} categories={categories} />
      <AILounge apiUrl={API} />
      <BookingSection apiUrl={API} menuItems={menuItems} />
      <Footer />
    </div>
  );
}
