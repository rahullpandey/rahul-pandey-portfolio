import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const NAV_LINKS = [
  { name: 'Home', href: '#' },
  { name: 'About', href: '#about' },
  { name: 'Projects', href: '#projects' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navRef = useRef(null);
  const linksRef = useRef([]);
  const mobileMenuRef = useRef(null);
  const mobileLinksRef = useRef([]);
  const glowRef = useRef(null);

  // Scroll Event Listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initial Load Animation
  useEffect(() => {
    const tl = gsap.timeline();
    
    // Animate Navbar dropping down
    tl.fromTo(navRef.current, 
      { y: -100, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
    );
    
    // Stagger in the links
    if (linksRef.current.length > 0) {
      tl.fromTo(linksRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
        "-=0.6"
      );
    }
  }, []);

  // Mouse Glow Interaction
  const handleMouseMove = (e) => {
    if (!glowRef.current || !navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    gsap.to(glowRef.current, {
      x,
      y,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  // Mobile Menu Animation Toggle
  useEffect(() => {
    if (isMobileMenuOpen) {
      gsap.to(mobileMenuRef.current, {
        clipPath: 'circle(150% at 90% 10%)',
        duration: 0.8,
        ease: 'power3.inOut'
      });
      gsap.fromTo(mobileLinksRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.3 }
      );
    } else {
      gsap.to(mobileMenuRef.current, {
        clipPath: 'circle(0% at 90% 10%)',
        duration: 0.6,
        ease: 'power3.inOut'
      });
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav 
        ref={navRef}
        onMouseMove={handleMouseMove}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 overflow-hidden ${
          isScrolled 
            ? 'bg-black/40 backdrop-blur-md border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-4' 
            : 'bg-transparent py-6'
        }`}
      >
        {/* Subtle Background Glow Mask */}
        <div 
          ref={glowRef}
          className="pointer-events-none absolute w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 mix-blend-screen opacity-0 md:opacity-100 transition-opacity duration-300"
        />

        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative z-10">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group">
            {/* Minimalist Spider/Web-inspired SVG Logo */}
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white transition-transform duration-500 group-hover:rotate-45 group-hover:scale-110">
              <path d="M12 2L12 22M2 12L22 12M5 5L19 19M5 19L19 5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
            </svg>
            <span className="text-white font-bold tracking-[0.18em] uppercase text-sm ml-2 opacity-90 group-hover:opacity-100 transition-opacity">
              Rahul Pandey
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-10">
            {NAV_LINKS.map((link, index) => (
              <a 
                key={link.name} 
                href={link.href}
                ref={el => linksRef.current[index] = el}
                className="relative text-gray-400 hover:text-white text-sm font-medium tracking-wide transition-colors duration-300 group"
              >
                {link.name}
                {/* Center-out underline animation */}
                <span className="absolute -bottom-1 left-1/2 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button 
              ref={el => linksRef.current[NAV_LINKS.length] = el} // animate with the links
              className="relative px-6 py-2.5 rounded-full overflow-hidden group bg-transparent border border-white/20 text-white text-sm font-medium tracking-wider hover:border-white/60 transition-colors duration-300"
            >
              <span className="relative z-10 group-hover:text-black transition-colors duration-300">Let's Talk</span>
              {/* Button Inner Fill Effect */}
              <div className="absolute inset-0 h-full w-full bg-white scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            className="md:hidden text-white p-2 z-50 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`w-full h-[1px] bg-white transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-[10px]' : ''}`} />
              <span className={`w-full h-[1px] bg-white transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-full h-[1px] bg-white transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-[10px]' : ''}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Fullscreen Menu */}
      <div 
        ref={mobileMenuRef}
        className="fixed inset-0 bg-black/95 backdrop-blur-xl z-40 flex flex-col justify-center items-center"
        style={{ clipPath: 'circle(0% at 90% 10%)' }}
      >
        <div className="flex flex-col space-y-8 text-center mt-10">
          {NAV_LINKS.map((link, index) => (
            <a 
              key={link.name} 
              href={link.href}
              ref={el => mobileLinksRef.current[index] = el}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-3xl font-light text-gray-400 hover:text-white transition-colors tracking-widest relative group"
            >
              {link.name}
              <span className="absolute -bottom-2 left-1/2 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-1/2 group-hover:left-1/4"></span>
            </a>
          ))}
          
          <button 
            ref={el => mobileLinksRef.current[NAV_LINKS.length] = el}
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-8 px-8 py-3 rounded-full border border-white text-white tracking-widest hover:bg-white hover:text-black transition-all duration-300"
          >
            Hire Me
          </button>
        </div>
      </div>
    </>
  );
}
