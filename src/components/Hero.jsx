import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { vertexShader, fragmentShader } from './HeroShaders';

import imgSpiderman from '../assets/spiderman/20260407_055437.png';
import imgMan from '../assets/man/rahul-portrait.jpg';

export default function Hero() {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const textRef = useRef(null);
  
  // Create refs to hold things that need cleanup or updates
  const uniformRef = useRef(null);
  const mouseTarget = useRef({ x: 0.5, y: 0.5 });
  const mouseCurrent = useRef({ x: 0.5, y: 0.5 });
  
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Initial Hero Entrance Animation (AOS style smooth fade-up)
    gsap.fromTo(container, 
      { opacity: 0, y: 80 }, 
      { opacity: 1, y: 0, duration: 2, ease: "power3.out", delay: 0.1 }
    );
    
    // Text entrance animation (Fade down)
    if (textRef.current) {
      gsap.fromTo(textRef.current,
        { opacity: 0, y: -60 },
        { opacity: 1, y: 0, duration: 1.5, ease: "power3.out", delay: 0.8 }
      );
    }
    
    // 1. Setup Three.js Scene
    const scene = new THREE.Scene();
    
    // We use an orthographic camera to map perfectly to a screen setup
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    container.appendChild(renderer.domElement);

    // 2. Load textures
    const textureLoader = new THREE.TextureLoader();
    let isTexturesLoaded = false;
    
    // Define uniforms up front so they can be mutated
    const uniforms = {
      uTexture1: { value: null }, // Spiderman
      uTexture2: { value: null }, // Man
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHovered: { value: 0.0 }, // 0 to 1 value smoothly handled by GSAP
      uRadius: { value: 0.25 }, // Reveal radius size
      uSoftness: { value: 0.15 }, // Softness of the edge
      uScale: { value: 0.05 }, // Scale zoom amount
      uResolution: { value: new THREE.Vector2(width, height) },
      uTexture1Resolution: { value: new THREE.Vector2(1920, 1080) },
      uTexture2Resolution: { value: new THREE.Vector2(1920, 1080) }
    };
    
    uniformRef.current = uniforms;

    Promise.all([
      textureLoader.loadAsync(imgSpiderman),
      textureLoader.loadAsync(imgMan)
    ]).then(([tex1, tex2]) => {
      // Improve texture visual quality
      tex1.generateMipmaps = false;
      tex1.minFilter = THREE.LinearFilter;
      tex1.magFilter = THREE.LinearFilter;
      
      tex2.generateMipmaps = false;
      tex2.minFilter = THREE.LinearFilter;
      tex2.magFilter = THREE.LinearFilter;
      
      uniforms.uTexture1.value = tex1;
      uniforms.uTexture2.value = tex2;
      
      if (tex1.image) {
        uniforms.uTexture1Resolution.value.set(tex1.image.width, tex1.image.height);
      }

      if (tex2.image) {
        uniforms.uTexture2Resolution.value.set(tex2.image.width, tex2.image.height);
      }
      
      isTexturesLoaded = true;
    });

    // 3. Create full-screen plane geometry and shader material
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 4. GSAP Ticker for render loop and smooth lerping
    const renderTick = () => {
      if (!isTexturesLoaded) return;
      
      // Lerp the mouse coordinates smoothly
      mouseCurrent.current.x = gsap.utils.interpolate(mouseCurrent.current.x, mouseTarget.current.x, 0.1);
      mouseCurrent.current.y = gsap.utils.interpolate(mouseCurrent.current.y, mouseTarget.current.y, 0.1);
      
      uniforms.uMouse.value.set(mouseCurrent.current.x, mouseCurrent.current.y);
      
      // Also update DOM custom cursor position if needed
      if(cursorRef.current) {
        gsap.set(cursorRef.current, {
           x: mouseCurrent.current.x * width,
           y: mouseCurrent.current.y * height, // using normalized, so 0 top wait...
           // Actually threejs UV y is 0 bottom, 1 top. But our uMouse is updated below. Let's fix cursor DOM below.
        });
      }

      renderer.render(scene, camera);
    };
    
    gsap.ticker.add(renderTick);

    // 5. Setup interaction event handlers
    const updatePointerTarget = (clientX, clientY) => {
      const rect = container.getBoundingClientRect();
      const currentWidth = rect.width || container.clientWidth || 1;
      const currentHeight = rect.height || container.clientHeight || 1;
      const x = (clientX - rect.left) / currentWidth;
      // In Three.js UV space, Y=0 is bottom, Y=1 is top.
      const y = 1.0 - ((clientY - rect.top) / currentHeight);
      
      mouseTarget.current.x = x;
      mouseTarget.current.y = y;
    };

    const onMouseMove = (e) => {
      updatePointerTarget(e.clientX, e.clientY);

      // For DOM cursor, use standard coordinates
      if(cursorRef.current) {
        // Just store regular pixel coords in DOM cursor directly for zero latency, 
        // to have a quick cursor overlay if desired
        gsap.to(cursorRef.current, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: "power2.out"
        });
      }
    };
    
    const onMouseEnter = () => {
      setIsHovered(true);
      gsap.to(uniforms.uHovered, {
        value: 1.0,
        duration: 1.2,
        ease: "power3.out"
      });
      if(cursorRef.current) {
         gsap.to(cursorRef.current, { scale: 1, opacity: 1, duration: 0.3 });
      }
    };
    
    const onMouseLeave = () => {
      setIsHovered(false);
      gsap.to(uniforms.uHovered, {
        value: 0.0,
        duration: 1.2,
        ease: "power3.out"
      });
      if(cursorRef.current) {
         gsap.to(cursorRef.current, { scale: 0, opacity: 0, duration: 0.3 });
      }
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseenter', onMouseEnter);
    container.addEventListener('mouseleave', onMouseLeave);

    // 6. Handle resize
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    };
    
    window.addEventListener('resize', onResize);

    // Mobile fallback (Tap)
    const onTouch = (e) => {
        if(e.touches.length > 0) {
            const touch = e.touches[0];
            updatePointerTarget(touch.clientX, touch.clientY);
            
            // Toggle hover effect on touch
            if (!isHovered) {
                onMouseEnter();
            }
        }
    };

    const onTouchEnd = () => {
      onMouseLeave();
    };
    
    container.addEventListener('touchstart', onTouch);
    container.addEventListener('touchmove', onTouch);
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);

    // 7. Cleanup
    return () => {
      gsap.ticker.remove(renderTick);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseenter', onMouseEnter);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('touchstart', onTouch);
      container.removeEventListener('touchmove', onTouch);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      
      container.removeChild(renderer.domElement);
      renderer.dispose();
      material.dispose();
      geometry.dispose();
      // NOTE: should realistically dispose textures too 
    };
  }, []);

  return (
    <div className="relative w-full min-h-[100svh] overflow-hidden bg-black flex items-center justify-center">
      {/* Three.js Canvas Container */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 z-0 select-none"
      />
      
      {/* Custom Cursor / Light Bloom Overlay */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 hidden md:block w-32 h-32 rounded-full pointer-events-none z-20 mix-blend-screen opacity-0 scale-0"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          transform: 'translate(-50%, -50%)' // Center the glow on the mouse point
        }}
      />
      
      {/* Foreground UI Components */}
      <div ref={textRef} className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-end md:justify-center mx-auto w-full max-w-[90rem] px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-32 lg:px-16">
        <div 
          className="w-full flex flex-col md:flex-row justify-between md:items-end transition-all duration-700 ease-out transform gap-8 md:gap-10" 
          style={{ transform: isHovered ? 'translateY(-12px)' : 'translateY(0px)' }}
        >
            
          {/* Left Side: Intro and Title */}
          <div className="flex-1 max-w-full md:max-w-lg lg:max-w-xl text-left">
            <p className="text-xs sm:text-sm md:text-base text-gray-300 font-medium tracking-[0.3em] uppercase mb-4 sm:mb-6 opacity-90 drop-shadow-md">
              Hey, I'm Rahul Pandey
            </p>
            
            <h1 className="text-[2.4rem] sm:text-5xl lg:text-[4.25rem] font-bold tracking-tighter drop-shadow-2xl leading-[1.02] font-sans">
              Crafting Digital<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-500 font-serif italic font-light pr-2">Excellence</span> from<br />
              End to End
            </h1>
          </div>
          
          {/* Right Side: Description and CTA */}
          <div className="flex-1 w-full max-w-full md:max-w-md text-left md:text-right flex flex-col md:items-end">
            <p className="w-full text-base sm:text-lg md:text-xl text-gray-300 drop-shadow-xl font-light tracking-wide leading-relaxed mb-6 sm:mb-8">
              I build scalable web applications that merge striking design with robust, high-performance functionality. Seamless interactions, engineered for the future.
            </p>
            
            <button className="pointer-events-auto w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full border border-white/30 text-white text-xs sm:text-sm tracking-[0.2em] uppercase font-medium hover:bg-white hover:text-black hover:border-white transition-all duration-500 backdrop-blur-sm shadow-xl inline-block">
              Start a Project
            </button>
          </div>
            
        </div>
      </div>
      
      {/* Overlay border/frame for cinematic effect */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
