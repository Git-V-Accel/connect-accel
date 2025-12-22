import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { cn } from "../lib/utils";

const platformItems = [
  { label: "Technology", href: "/platform/technology" },
  { label: "Security", href: "/platform/security" },
      { label: "How It Works", href: "/how-it-works" },
];

const forYouItems = [
      { label: "For Clients", href: "/for-clients" },
      { label: "For Engineers", href: "/for-engineers" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const [forYouOpen, setForYouOpen] = useState(false);
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const [forYouDropdownOpen, setForYouDropdownOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Pricing", href: "/pricing" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30"
    >
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-accent-gradient flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">C</span>
          </div>
          <span className="font-outfit font-bold text-xl text-[#252525]">
            Connect<span className="text-primary">Accel</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {/* Home */}
          <Link
            to="/"
            className={cn(
              "inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
              isActive("/") ? "text-primary" : "text-muted-foreground"
            )}
          >
            Home
          </Link>

          {/* Platform Dropdown */}
          <DropdownMenu open={platformDropdownOpen} onOpenChange={setPlatformDropdownOpen}>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none data-[state=open]:bg-accent/50",
                location.pathname.startsWith("/platform") || location.pathname === "/how-it-works"
                  ? "text-muted-foreground"
                  : "text-primary"
              )}
            >
              Platform
              <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] bg-popover border rounded-md shadow-lg p-2">
              {platformItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    to={item.href}
                    onClick={() => setPlatformDropdownOpen(false)}
                    className={cn(
                      "block select-none rounded-md px-3 py-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer",
                      isActive(item.href) ? "bg-accent/50 text-primary" : "text-[#252525]"
                    )}
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* For You Dropdown */}
          <DropdownMenu open={forYouDropdownOpen} onOpenChange={setForYouDropdownOpen}>
            <DropdownMenuTrigger
              className={cn(
                "inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none data-[state=open]:bg-accent/50",
                location.pathname.startsWith("/for-")
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              For You
              <ChevronDown className="ml-1 h-3 w-3 transition-transform duration-200 data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] bg-popover border rounded-md shadow-lg p-2">
              {forYouItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    to={item.href}
                    onClick={() => setForYouDropdownOpen(false)}
                    className={cn(
                      "block select-none rounded-md px-3 py-3 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer",
                      isActive(item.href) ? "bg-accent/50 text-primary" : "text-[#252525]"
                    )}
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Regular nav items */}
          {navItems.slice(1).map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                isActive(item.href) ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
          ))}

          {/* Login Button */}
          <Link
            to="/login"
            className={cn(
              "inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none ml-2",
              isActive("/login") ? "text-primary" : "text-muted-foreground"
            )}
          >
            Log In
          </Link>

          {/* Get Started Button */}
          <Button size="default" asChild className="ml-2">
            <Link to="/signup">Get Started</Link>
          </Button>

          {/* Contact Us Button */}
          <Button size="default" variant="outline" asChild className="ml-2">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden glass border-t border-border/30"
        >
          <div className="container mx-auto px-6 py-4 flex flex-col gap-2">
            {/* Home */}
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary py-2 px-2 rounded-md",
                isActive("/") ? "text-primary bg-accent/50" : "text-muted-foreground"
              )}
            >
              Home
            </Link>

            {/* Platform Dropdown - Mobile */}
            <Collapsible open={platformOpen} onOpenChange={setPlatformOpen}>
              <CollapsibleTrigger
                className={cn(
                  "flex items-center justify-between w-full px-4 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-accent/50 rounded-lg",
                  (location.pathname.startsWith("/platform") || location.pathname === "/how-it-works")
                    ? "text-primary bg-accent/50"
                    : "text-muted-foreground"
                )}
              >
                Platform
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  platformOpen && "rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 pt-2 pb-2">
                <div className="flex flex-col gap-1">
                  {platformItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => {
                        setIsOpen(false);
                        setPlatformOpen(false);
                      }}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary py-2 px-2 rounded-md",
                        isActive(item.href) ? "text-primary bg-accent/50" : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* For You Dropdown - Mobile */}
            <Collapsible open={forYouOpen} onOpenChange={setForYouOpen}>
              <CollapsibleTrigger
                        className={cn(
                  "flex items-center justify-between w-full px-4 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-accent/50 rounded-lg",
                  location.pathname.startsWith("/for-")
                    ? "text-primary bg-accent/50"
                                : "text-muted-foreground"
                            )}
                          >
                For You
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  forYouOpen && "rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 pt-2 pb-2">
                <div className="flex flex-col gap-1">
                  {forYouItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => {
                        setIsOpen(false);
                        setForYouOpen(false);
                      }}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary py-2 px-2 rounded-md",
                        isActive(item.href) ? "text-primary bg-accent/50" : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                          </Link>
                        ))}
                      </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Regular nav items */}
            {navItems.slice(1).map((item) => (
                <Link
                  key={item.href}
                to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                  "text-sm font-medium transition-colors hover:text-primary py-2 px-2 rounded-md",
                  isActive(item.href) ? "text-primary bg-accent/50" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Link>
            ))}

            {/* Login Button - Mobile */}
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary py-2 px-2 rounded-md",
                isActive("/login") ? "text-primary bg-accent/50" : "text-muted-foreground"
              )}
            >
              Log In
            </Link>

            {/* Get Started Button - Mobile */}
            <Button size="default" asChild className="mt-2">
              <Link to="/signup" onClick={() => setIsOpen(false)}>
                Get Started
              </Link>
            </Button>

            {/* Contact Us Button - Mobile */}
            <Button size="default" variant="outline" asChild className="mt-2">
              <Link to="/contact" onClick={() => setIsOpen(false)}>
                Contact Us
              </Link>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
