import { Toaster } from "@website/components/ui/toaster";
import { Toaster as Sonner } from "@website/components/ui/sonner";
import { TooltipProvider } from "@website/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@website/components/ScrollToTop";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import Technology from "./pages/Technology";
import Security from "./pages/Security";
import ForClients from "./pages/ForClients";
import ForEngineers from "./pages/ForEngineers";
import Pricing from "./pages/Pricing";
import CaseStudies from "./pages/CaseStudies";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/platform/technology" element={<Technology />} />
          <Route path="/platform/security" element={<Security />} />
          <Route path="/for-clients" element={<ForClients />} />
          <Route path="/for-engineers" element={<ForEngineers />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
