import { Component, useEffect, ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";
import { CartProvider } from "@/src/context/CartContext";
import { setLenis } from "@/src/lib/scroll";
import Navbar from "@/src/components/Navbar";
import Hero from "@/src/components/Hero";
import Marquee from "@/src/components/Marquee";
import MenuSection from "@/src/components/MenuSection";
import RestaurantSection from "@/src/components/RestaurantSection";
import RewardsSection from "@/src/components/RewardsSection";
import RechargeSection from "@/src/components/RechargeSection";
import OrdersSection from "@/src/components/OrdersSection";
import CartDrawer from "@/src/components/CartDrawer";
import PartnerPortal from "@/src/components/PartnerPortal";
import Footer from "@/src/components/Footer";
import "@/src/index.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bone p-8 text-center">
          <div>
            <p className="font-display text-2xl font-extrabold text-ink">
              Something went wrong
            </p>
            <button
              onClick={() => this.setState({ error: null })}
              className="mt-4 h-11 px-6 rounded-full bg-obsidian text-bone text-sm font-bold cursor-pointer"
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

function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    setLenis(lenis);
    let raf: number;
    const loop = (t: number) => {
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
  return <>{children}</>;
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

export function App() {
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
