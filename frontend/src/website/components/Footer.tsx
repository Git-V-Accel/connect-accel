import { Link } from "react-router-dom";
import { Linkedin, Twitter, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Column 1: ConnectAccel */}
          <div>
            <h3 className="font-semibold text-[#252525] mb-4">ConnectAccel</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About V-Accel
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/case-studies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: For Clients */}
          <div>
            <h3 className="font-semibold text-[#252525] mb-4">For Clients</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/for-clients" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  For Clients
                </Link>
              </li>
              <li>
                <Link to="/platform/technology" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Technology Capabilities
                </Link>
              </li>
              <li>
                <Link to="/platform/security" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Control & Security
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Get a Quote
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Engineers */}
          <div>
            <h3 className="font-semibold text-[#252525] mb-4">For Engineers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/for-engineers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  For Engineers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Apply Now
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Engineer Login
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h3 className="font-semibold text-[#252525] mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About V-Accel
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="https://axesstechnology.in/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Axess Technology
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal */}
          <div>
            <h3 className="font-semibold text-[#252525] mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/30 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left Side */}
            <div className="text-sm text-muted-foreground text-center md:text-left">
              © 2025 V-Accel AI Dynamics Private Limited. All rights reserved.
            </div>

            {/* Right Side - Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://linkedin.com/company/v-accel-ai-dynamics"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/vaccel_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/v-accel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="mt-6 pt-6 border-t border-border/30">
            <p className="text-xs text-muted-foreground text-center">
              ConnectAccel is a managed software development execution platform. We do not offer non-technical or general freelancing services.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
