import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Reuse our hero assets for the dual-identity mask effect prototype
import imgSpiderman from '../assets/spiderman/20260407_055437.png';
import imgMan from '../assets/man/rahul-portrait.jpg';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef(null);
  const textContainerRef = useRef(null);
  const imageContainerRef = useRef(null);
  const maskRef = useRef(null);
  
  // 1. ScrollTrigger entrance animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Create a timeline bound to the scroll position
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%", // triggers when the top of the section hits 75% of the viewport height
          toggleActions: "play none none reverse" // play forwards on scroll down, reverse on scroll out
        }
      });

      // Select all text lines that have the 'stagger-reveal' class
      const textElements = textContainerRef.current.querySelectorAll('.stagger-reveal');
      
      // Select the image container
      const imgElement = imageContainerRef.current;

      tl.fromTo(imgElement, 
        { opacity: 0, x: -50 }, 
        { opacity: 1, x: 0, duration: 1.2, ease: "power3.out" }
      )
      .fromTo(textElements, 
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out" },
        "-=0.8" // start before image is fully in
      );
      
    }, sectionRef);

    return () => ctx.revert(); // clean up ScrollTrigger
  }, []);

  // 2. Interactive Spotlight Mask
  const updateMaskPosition = (clientX, clientY) => {
    if (!imageContainerRef.current) return;
    
    // Get mouse position relative to the image container
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    // Use GSAP to smoothly lerp the mask center
    gsap.to(maskRef.current, {
      '--x': `${x}%`,
      '--y': `${y}%`,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const handleMouseMove = (e) => {
    updateMaskPosition(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    if (!e.touches?.length) return;
    const touch = e.touches[0];
    updateMaskPosition(touch.clientX, touch.clientY);
  };

  const handleMouseLeave = () => {
    // Return to default center position smoothly
    gsap.to(maskRef.current, {
      '--x': '50%',
      '--y': '50%',
      duration: 0.8,
      ease: 'power3.out'
    });
  };

  return (
    <section 
    id='about'
      ref={sectionRef} 
      className="relative w-full min-h-screen bg-black flex items-center justify-center py-20 px-5 sm:py-24 sm:px-6 md:px-12 lg:px-24 overflow-hidden"
    >
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] sm:w-[600px] sm:h-[600px] bg-red-900/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIvPjwvc3ZnPg==')] opacity-30 mix-blend-overlay" />
      </div>

      <div className="max-w-[90rem] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24 items-center relative z-10">
        
        {/* Left Column: Interactive Portrait */}
        <div 
          ref={imageContainerRef}
          className="relative w-full aspect-[4/5] max-w-sm sm:max-w-md mx-auto lg:max-w-none rounded-2xl overflow-hidden cursor-crosshair group shadow-2xl border border-white/5"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchMove}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseLeave}
          onTouchCancel={handleMouseLeave}
          style={{ transform: 'translateZ(0)' }} // Hardware acceleration
        >
          {/* Base Layer: Superhero Persona (Moody/Dark) */}
          <img 
            src={imgSpiderman} 
            alt="Superhero Persona" 
            className="absolute inset-0 w-full h-full object-cover object-center grayscale opacity-60 mix-blend-luminosity brightness-75 transition-all duration-700 group-hover:scale-105"
          />

          {/* Masked Overlay: Developer Portrait */}
          <div 
            ref={maskRef}
            className="absolute inset-0 w-full h-full"
            style={{
              '--x': '50%',
              '--y': '50%',
              // The polygon logic simulates a circular spotlight reveal
              // For a soft glowing edge, clip-path doesn't support blur inherently, but this acts perfectly as the mask.
              clipPath: 'circle(18% at var(--x) var(--y))',
              transition: 'clip-path 0.1s ease-out'
            }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <img 
                src={imgMan} 
                alt="Developer Portrait" 
                className="absolute inset-0 w-full h-full object-cover object-[center_18%] scale-[1.1] sm:scale-[1.14] transition-transform duration-[2s] ease-out group-hover:scale-[1.16] sm:group-hover:scale-[1.18]"
              />
            </div>
            
            {/* Inner spotlight glow matched inside the mask */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/80" />
          </div>

          {/* Interaction Hint Overlay */}
          <div className="absolute inset-0 pointer-events-none hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <div className="w-24 h-24 rounded-full border border-white/20 scale-150 animate-ping absolute" />
          </div>
        </div>

        {/* Right Column: Story & Details */}
        <div ref={textContainerRef} className="flex flex-col justify-center space-y-8 sm:space-y-10">
          
          <div className="overflow-hidden">
            <h2 className="stagger-reveal text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-white font-sans leading-tight">
              The Dual <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-500 font-serif italic pr-4">Persona</span>
            </h2>
          </div>

          <div className="overflow-hidden">
            <p className="stagger-reveal text-base sm:text-lg md:text-xl text-gray-400 font-light leading-relaxed max-w-xl">
              There are two sides to every great digital experience. The relentless logic of the backend, and the striking, emotional pull of the frontend. As a Full-Stack Developer, my superpower lies in bridging that gap—masking complex, high-performance web architecture behind beautiful, fluid, and fiercely creative user interfaces.
            </p>
          </div>

          {/* Expertise Highlights */}
          <div className="overflow-hidden">
            <div className="stagger-reveal grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-white/10 max-w-xl">
              {[
                "Full-Stack Fluidity", 
                "Motion & Micro-Interactions", 
                "System Architecture", 
                "Pixel-Perfect UIs"
              ].map((skill, i) => (
                <div key={i} className="flex items-center space-x-3 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-red-500 transition-colors duration-300" />
                  <span className="text-gray-300 text-sm md:text-base font-medium tracking-wide uppercase group-hover:text-white transition-colors duration-300">
                    {skill}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quote Block */}
          <div className="overflow-hidden mt-6">
            <blockquote className="stagger-reveal border-l-2 border-red-500/50 pl-6 py-2">
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 font-serif italic">
                “Logic builds the foundation. <br /> Imagination breaks the boundaries.”
              </p>
            </blockquote>
          </div>
          
        </div>

      </div>
    </section>
  );
}
