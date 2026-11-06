import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface PublicLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ 
  children, 
  title = 'Smart AgriTech | Precision Agriculture',
  description = 'Empowering modern agriculture with precision automated systems and data-driven insights.' 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-[#f9f9f6] text-[#2C392F] min-h-screen font-sans selection:bg-[#4A6B53]/30">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <style>{`html { scroll-behavior: smooth; }`}</style>
      </Head>

      {/* Elegant Corporate Navigation */}
      <nav className="fixed w-full z-50 bg-[#f9f9f6]/95 backdrop-blur-md border-b border-[#2C392F]/10 py-4 px-6 sm:px-12 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-2xl font-bold tracking-tight text-[#2C392F]">
              Smart <span className="text-[#4A6B53]">AgriTech</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold tracking-wide text-[#4A6B53]">
            <a href="#vision" className="hover:text-[#D4A373] transition-colors">Vision</a>
            <a href="#products" className="hover:text-[#D4A373] transition-colors">Products</a>
            <a href="#technology" className="hover:text-[#D4A373] transition-colors">Technology</a>
            <a href="#applications" className="hover:text-[#D4A373] transition-colors">Applications</a>
            <a href="#founders" className="hover:text-[#D4A373] transition-colors">Founders</a>
            <a href="#contact" className="hover:text-[#D4A373] transition-colors">Contact</a>
          </div>
          
          <div className="hidden md:flex space-x-4">
            <Link href="/login" className="bg-[#4A6B53] hover:bg-[#2C392F] text-white text-sm font-bold tracking-wide px-6 py-2 rounded-sm transition-all shadow-md">
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#2C392F] focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#f9f9f6] border-b border-[#2C392F]/10 shadow-lg py-4 px-6 flex flex-col space-y-4 text-center">
            <a href="#vision" onClick={() => setMobileMenuOpen(false)} className="text-[#4A6B53] font-semibold hover:text-[#D4A373]">Vision</a>
            <a href="#products" onClick={() => setMobileMenuOpen(false)} className="text-[#4A6B53] font-semibold hover:text-[#D4A373]">Products</a>
            <a href="#technology" onClick={() => setMobileMenuOpen(false)} className="text-[#4A6B53] font-semibold hover:text-[#D4A373]">Technology</a>
            <a href="#applications" onClick={() => setMobileMenuOpen(false)} className="text-[#4A6B53] font-semibold hover:text-[#D4A373]">Applications</a>
            <a href="#founders" onClick={() => setMobileMenuOpen(false)} className="text-[#4A6B53] font-semibold hover:text-[#D4A373]">Founders</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-[#4A6B53] font-semibold hover:text-[#D4A373]">Contact</a>
            <div className="pt-4 border-t border-[#2C392F]/10">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="bg-[#4A6B53] text-white text-sm font-bold tracking-wide px-6 py-2 rounded-sm inline-block w-full">
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-16 min-h-screen">
        {children}
      </main>

      {/* Corporate Footer */}
      <footer className="bg-[#2C392F] text-white py-16 px-6 sm:px-12 border-t border-[#4A6B53]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <h3 className="text-2xl font-bold mb-4 tracking-tight">Smart <span className="text-[#D4A373]">AgriTech</span></h3>
            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              Empowering modern agriculture with precision automated systems and data-driven insights. Built for enterprise-scale operations.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#D4A373]">Company</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#vision" className="hover:text-white transition-colors">Vision</a></li>
              <li><a href="#products" className="hover:text-white transition-colors">Products</a></li>
              <li><a href="#technology" className="hover:text-white transition-colors">Technology</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#D4A373]">Contact</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="mailto:enterprise@agritech.com" className="hover:text-white transition-colors">enterprise@agritech.com</a></li>
              <li><a href="tel:+18005550199" className="hover:text-white transition-colors">+1 (800) 555-0199</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#4A6B53]/50 text-gray-500 text-sm text-center">
          &copy; {new Date().getFullYear()} Smart AgriTech Systems Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
