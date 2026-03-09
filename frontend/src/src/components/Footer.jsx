import React from "react";
import { Link } from "react-router-dom";
import { DogIcon, GithubIcon, MailIcon, FileTextIcon } from "lucide-react";
export const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-16 pb-8 border-t border-primary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <DogIcon className="w-6 h-6 text-accent" />
              </div>
              <span className="font-bold text-xl">
                Early Dog Illness Detection System
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
              AI-Powered Early Health Monitoring for Your Dog. Detect behavioral
              patterns early and consult your veterinarian with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/analyze"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  Analyze Video
                </Link>
              </li>
              <li>
                <Link
                  to="/history"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  View History
                </Link>
              </li>
              <li>
                <Link
                  to="/dogs"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  Dog Profiles
                </Link>
              </li>
              <li>
                <a
                  href="/#how-it-works"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="/#about"
                  className="text-gray-300 hover:text-accent transition-colors"
                >
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Info */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">
              Contact & Info
            </h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a
                  href="mailto:nethmini.20221487@iit.ac.lk"
                  className="flex items-center gap-3 text-gray-300 hover:text-accent transition-colors"
                >
                  <MailIcon className="w-5 h-5 text-gray-400" />
                  nethmini.20221487@iit.ac.lk
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 text-center text-xs text-gray-400 leading-relaxed">
          <p className="mb-2">
            © {new Date().getFullYear()} Early Dog Illness Detection System |
            Final Year Project
          </p>
          <p>
            Herath Mudiyanselage Nethmini | Informatics Institute of Technology
            | University of Westminster
          </p>
        </div>
      </div>
    </footer>
  );
};
