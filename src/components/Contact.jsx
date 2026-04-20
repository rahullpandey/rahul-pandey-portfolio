import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse"
        }
      });
      
      // Select all animatable elements
      const elements = sectionRef.current.querySelectorAll('.animate-element');
      
      // Stagger them fading directly upward
      tl.fromTo(elements,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out" }
      );
      
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Insert actual send behavior here later
    alert("Connection encrypted. Message transmitted!");
  };

  return (
    <section 
      id="contact" 
      ref={sectionRef}
      className="relative w-full min-h-screen bg-[#030303] flex items-center justify-center py-20 px-5 sm:py-24 sm:px-6 md:px-12 overflow-hidden"
    >
      {/* Intense Background Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
        <div className="w-[120vw] max-w-[800px] h-[55vw] max-h-[500px] bg-red-600/10 rounded-full blur-[150px] mix-blend-screen opacity-50" />
      </div>

      <div className="max-w-2xl w-full relative z-10 flex flex-col items-center text-center">
        
        {/* Header Block */}
        <div className="mb-12 animate-element">
          <p className="text-red-500 font-mono text-sm tracking-[0.3em] uppercase font-bold mb-4">
            [ Encrypted Channel ]
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-white font-sans leading-none mb-6 drop-shadow-xl">
            Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white font-serif italic pr-2">Connect</span>
          </h2>
          <p className="text-gray-400 font-light text-base sm:text-lg tracking-wide leading-relaxed max-w-xl mx-auto">
            Whether you have a groundbreaking tech vision, a complex application to build, or just want to talk shop—my inbox is always open. Let’s collaborate and architect the digital tools of tomorrow.
          </p>
        </div>

        {/* Form Block */}
        <form ref={formRef} onSubmit={handleSubmit} className="w-full flex flex-col space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Input */}
            <div className="relative group animate-element">
              <input 
                type="text" 
                id="name"
                required
                className="peer w-full bg-white/5 border border-white/5 text-white text-base rounded-xl px-5 py-4 outline-none transition-all duration-300 focus:bg-white/10 focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(239,68,68,0.2)] placeholder-transparent"
                placeholder="Name"
              />
              <label htmlFor="name" className="absolute left-5 top-4 text-gray-500 text-base pointer-events-none transition-all duration-300 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-red-400 peer-valid:-top-3 peer-valid:text-xs peer-valid:text-gray-400 bg-[#030303] px-1 rounded">
                Name
              </label>
            </div>
            
            {/* Email Input */}
            <div className="relative group animate-element">
              <input 
                type="email" 
                id="email"
                required
                className="peer w-full bg-white/5 border border-white/5 text-white text-base rounded-xl px-5 py-4 outline-none transition-all duration-300 focus:bg-white/10 focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(239,68,68,0.2)] placeholder-transparent"
                placeholder="Email"
              />
              <label htmlFor="email" className="absolute left-5 top-4 text-gray-500 text-base pointer-events-none transition-all duration-300 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-red-400 peer-valid:-top-3 peer-valid:text-xs peer-valid:text-gray-400 bg-[#030303] px-1 rounded">
                Email
              </label>
            </div>
          </div>

          {/* Message Textarea */}
          <div className="relative group animate-element">
            <textarea 
              id="message"
              required
              rows="5"
              className="peer w-full bg-white/5 border border-white/5 text-white text-base rounded-xl px-5 py-4 outline-none transition-all duration-300 focus:bg-white/10 focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(239,68,68,0.2)] placeholder-transparent resize-none"
              placeholder="Message"
            ></textarea>
            <label htmlFor="message" className="absolute left-5 top-4 text-gray-500 text-base pointer-events-none transition-all duration-300 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-red-400 peer-valid:-top-3 peer-valid:text-xs peer-valid:text-gray-400 bg-[#030303] px-1 rounded">
              Message
            </label>
          </div>

          {/* Submit Button */}
          <div className="animate-element pt-4 flex justify-center">
            <button 
              type="submit" 
              className="relative group overflow-hidden rounded-full w-full md:w-auto px-12 py-4 border border-red-500/30 bg-black text-white text-sm uppercase tracking-[0.2em] font-medium transition-all duration-500 hover:scale-[1.02] hover:border-red-500 shadow-[0_0_0_rgba(239,68,68,0)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]"
            >
              {/* Animated Inner Sweep */}
              <span className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/20 to-red-600/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              
              <span className="relative z-10 flex items-center justify-center space-x-3">
                <span>Transmit Message</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300 text-red-500">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </span>
            </button>
          </div>
          
        </form>
      </div>

      {/* Tailwind config hack config for custom shimmer keyframe. A real project injects this in index.css or tailwind.config.js - we can shim it inline cleanly here */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </section>
  );
}
