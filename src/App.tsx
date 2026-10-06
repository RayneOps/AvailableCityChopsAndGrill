import { useEffect } from "react";
import { CartBar } from "./components/CartBar";
import { Contact } from "./components/Contact";
import { Events } from "./components/Events";
import { Favorites } from "./components/Favorites";
import { Footer } from "./components/Footer";
import { Gallery } from "./components/Gallery";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { Menu } from "./components/Menu";
import { OrderPanel } from "./components/order/OrderPanel";
import { dismissProductSheet, ProductSheetContent } from "./components/ProductSheet";
import { Sheet } from "./components/Sheet";
import { Toaster } from "./components/Toaster";
import { getProduct } from "./data/products";
import { site } from "./config/site";
import { closeOverlays, useRoute, type Route } from "./lib/router";

export function App() {
  const route = useRoute();
  useScrollReveal();
  useDocumentTitle(route);

  const itemRoute = route.name === "item" ? route : null;
  const orderRoute = route.name === "order" ? route : null;

  return (
    <>
      <a className="skip-link" href="#menu">
        Skip to menu
      </a>
      <Header />
      <main id="top">
        <Hero />
        <Favorites />
        <Menu />
        <Events />
        <Gallery />
        <HowItWorks />
        <Contact />
      </main>
      <Footer />

      <CartBar hidden={route.name !== "home"} />

      <Sheet
        open={!!itemRoute}
        onClose={() => dismissProductSheet(itemRoute?.editLineId)}
        variant="bottom"
        labelledBy="psheet-title"
        className="sheet--product"
      >
        {itemRoute && <ProductSheetContent productId={itemRoute.productId} editLineId={itemRoute.editLineId} />}
      </Sheet>

      <Sheet open={!!orderRoute} onClose={closeOverlays} variant="side" labelledBy="opanel-title" className="sheet--order">
        {orderRoute && <OrderPanel step={orderRoute.step} />}
      </Sheet>

      <Toaster />
    </>
  );
}

/** Fade sections in as they scroll into view (skipped for reduced motion). */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-revealed");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useDocumentTitle(route: Route) {
  useEffect(() => {
    const base = `${site.name} | Small Chops, Trays & Event Packs in Lagos`;
    if (route.name === "item") {
      const p = getProduct(route.productId);
      document.title = p ? `${p.name} | ${site.name}` : base;
    } else if (route.name === "order") {
      document.title = `Your order | ${site.name}`;
    } else {
      document.title = base;
    }
  }, [route]);
}
