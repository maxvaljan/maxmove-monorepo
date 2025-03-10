'use client';

import { Linkedin } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-maxmove-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Maxmove</h3>
            <p className="text-maxmove-300">
              Move anything, anytime, anywhere
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.linkedin.com/company/maxmove" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-maxmove-300 hover:text-white transition-colors"
              >
                <Linkedin className="h-8 w-8" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-maxmove-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/personal-delivery" className="text-maxmove-300 hover:text-white transition-colors">
                  Personal Delivery
                </Link>
              </li>
              <li>
                <Link href="/business" className="text-maxmove-300 hover:text-white transition-colors">
                  Business Solutions
                </Link>
              </li>
              <li>
                <Link href="/drivers" className="text-maxmove-300 hover:text-white transition-colors">
                  Become a Driver
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-maxmove-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/career" className="text-maxmove-300 hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/terms" className="text-maxmove-300 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="text-maxmove-300 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="text-maxmove-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-maxmove-300">
                contact@maxmove.com
              </li>
              <li className="text-maxmove-300">+49 173 4224371</li>
              <li className="text-maxmove-300">
                Eulenbergstr.37
                <br />
                51065 Köln, Deutschland
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-maxmove-800">
          <p className="text-center text-maxmove-300">
            © {new Date().getFullYear()} Maxmove. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;