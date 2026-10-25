import React, { Component, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";
import { CartProvider } from "@/context/CartContext";
import { setLenis } from "@/lib/scroll";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import MenuSection from "@/components/MenuSection";
import RestaurantSection from "@/components/RestaurantSection";
import RewardsSection from "@/components/RewardsSection";
import RechargeSection from "@/components/RechargeSection";
import OrdersSection from "@/components/OrdersSection";
import CartDrawer from "@/components/CartDrawer";
import PartnerPortal from "@/components/PartnerPortal";
import Footer from "@/components/Footer";
import "@/index.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bone p-8 text-center">
          <div>
            <p className="font-display text-2xl font-extrabold text-ink">Something went wrong</p>
            <button
              onClick={() => this.setState({ error: null })}
              className="mt-4 h-11 px-6 rounded-full bg-obsidian text-bone text-sm font-bold"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    setLenis(lenis);
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);
  return children;
}

const Home = () => (
  <div className="grain min-h-screen bg-bone">
    <Navbar />
    <main className="relative">
      <Hero />
      <Marquee />
      <MenuSection />
      <RestaurantSection />
      <RewardsSection />
      <RechargeSection />
      <OrdersSection />
    </main>
    <Footer />
    <CartDrawer />
    <Toaster position="top-center" richColors closeButton />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SmoothScroll>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/partners" element={<PartnerPortal />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </CartProvider>
        </SmoothScroll>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
