import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Heart, ExternalLink, Dog } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 text-white mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Brand Section - Takes more space */}
          <div className="md:col-span-5 space-y-5">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2.5 rounded-xl backdrop-blur-sm border border-blue-400/30 shadow-lg shadow-blue-500/20">
                <Dog className="w-7 h-7 text-blue-400" strokeWidth={1.1} />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">PawTrust AI</h3>
                <h4 className="text-xl text-blue-200 tracking-tight">Early Dog Illness Detection System</h4>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              AI-Powered Early Health Monitoring for Your Dog. Detect behavioral patterns early and consult your veterinarian with confidence.
            </p>
            
          </div>

          {/* Quick Links - Balanced spacing */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <div className="h-1 w-1 bg-blue-400 rounded-full"></div>
              Quick Links
            </h4>
            <nav className="space-y-2.5">
              {[
                { to: '/dashboard', label: 'Dashboard' },
                { to: '/analyze', label: 'Analyze Video' },
                { to: '/history', label: 'View History' },
                { to: '/dogs', label: 'Dog Profiles' },
                { to: '/how-it-works', label: 'How It Works' },
                { to: '/about', label: 'About' }
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-200 ease-out"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact & Info - Balanced spacing */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <div className="h-1 w-1 bg-blue-400 rounded-full"></div>
              Contact & Info
            </h4>
            
            {/* Email */}
            <a
              href="mailto:nethmini.20221487@iit.ac.lk"
              className="flex items-center gap-3 text-sm text-slate-300 hover:text-blue-400 transition-all duration-200 group"
            >
              <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition-all duration-200 border border-blue-500/20">
                <Mail className="w-4 h-4 text-blue-400" />
              </div>
              <span className="break-all">nethmini.20221487@iit.ac.lk</span>
            </a>

            {/* Academic Info */}
          </div>
        </div>
      </div>

      {/* Bottom Bar - Clean and balanced */}
      <div className="border-t border-slate-700/50 bg-slate-950/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm">
            <p className="text-slate-400 text-center md:text-left">
              © {currentYear} TrustPaw AI - Early Dog Illness Detection System. All rights reserved.
            </p>

          </div>
        </div>
      </div>
    </footer>
  );
};
