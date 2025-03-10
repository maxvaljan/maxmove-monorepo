'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import NavbarDesktopMenu from "./navbar/NavbarDesktopMenu";
import NavbarMobileMenu from "./navbar/NavbarMobileMenu";
import NavbarUserMenu from "./navbar/NavbarUserMenu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Define dark background routes
  const darkBackgroundRoutes = ["/", "/investment", "/roadmap", "/business"];
  const isDarkBackground = darkBackgroundRoutes.includes(pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Add a try-catch to handle any errors with Supabase
    try {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      }).catch(err => {
        console.error("Failed to get session:", err);
      });

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => {
        window.removeEventListener("scroll", handleScroll);
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.error("Error initializing Supabase auth:", error);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getTextColor = () => {
    if (isDarkBackground) {
      return isScrolled ? "text-maxmove-700 hover:text-maxmove-900" : "text-white hover:text-white/80";
    }
    return "text-maxmove-700 hover:text-maxmove-900";
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link 
              href="/" 
              className={`text-2xl font-bold transition-colors ${
                isDarkBackground 
                  ? isScrolled ? "text-maxmove-900" : "text-white"
                  : "text-maxmove-900"
              }`}
            >
              Maxmove
            </Link>
          </div>

          <NavbarDesktopMenu getTextColor={getTextColor} />
          
          <NavbarUserMenu
            session={session}
            handleSignOut={handleSignOut}
            getTextColor={getTextColor}
            isHomePage={isDarkBackground}
            isScrolled={isScrolled}
          />

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={isDarkBackground ? (isScrolled ? "text-maxmove-900" : "text-white") : "text-maxmove-900"}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <NavbarMobileMenu
            session={session}
            handleSignOut={handleSignOut}
            navigate={router}
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;