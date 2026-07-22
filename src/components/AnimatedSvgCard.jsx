import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedSvgCard({ src, index = 0 }) {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const tweens = [];
    const cleanupHandlers = [];

    fetch(src)
      .then((res) => res.text())
      .then((svg) => {
        if (!isMounted || !containerRef.current || !wrapperRef.current) return;
        containerRef.current.innerHTML = svg;

        const container = containerRef.current;
        const wrapper = wrapperRef.current;
        const svgElement = container.querySelector("svg");
        if (svgElement) {
          svgElement.style.width = "100%";
          svgElement.style.height = "auto";
          svgElement.style.transform = "scale(1.15)";
          svgElement.style.transformOrigin = "center 15%";
          svgElement.style.marginTop = "-8%";
          svgElement.style.marginBottom = "-10%";
        }

        // Find card background container and border rects (non-pattern)
        const bgRects = Array.from(container.querySelectorAll("rect")).filter((rect) => {
          const fill = rect.getAttribute("fill") || "";
          return !fill.startsWith("url(");
        });

        // Remove card drop-shadow filters
        const groups = container.querySelectorAll("g");
        groups.forEach((g) => {
          const filter = g.getAttribute("filter") || "";
          if (filter.includes("filter0") || filter.includes("filter1")) {
            g.removeAttribute("filter");
          }
        });

        const titleText = container.querySelector('path[fill="#111827"]');
        const descText = container.querySelector('path[fill="#6B7280"]');
        const productImage = container.querySelector('rect[fill^="url("]');

          if (titleText) {
          gsap.set(titleText, { scale: 0.9, transformOrigin: "center center" });
        }
        if (descText) {
          gsap.set(descText, { scale: 0.9, transformOrigin: "center center" });
        }
        if (productImage) {
          gsap.set(productImage, { scale: 0.8, transformOrigin: "center center" });
        }

        const enter = () => {
          gsap.to(wrapper, {
            y: -6,
            rotate: index % 2 === 0 ? -0.6 : 0.6,
            duration: 0.4,
            ease: "power2.out",
          });
          if (bgRects.length > 0) {
            gsap.to(bgRects, {
              opacity: 0,
              duration: 0.4,
              ease: "power2.out",
            });
          }
          if (productImage) {
            gsap.to(productImage, {
              scale: 1,
              transformOrigin: "center center",
              duration: 0.4,
              ease: "power2.out",
            });
          }
        };

        const leave = () => {
          gsap.to(wrapper, {
            y: 0,
            rotate: 0,
            duration: 0.4,
            ease: "power2.out",
          });
          if (bgRects.length > 0) {
            gsap.to(bgRects, {
              opacity: 1,
              duration: 0.4,
              ease: "power2.out",
            });
          }
          if (productImage) {
            gsap.to(productImage, {
              scale: 0.8,
              transformOrigin: "center center",
              duration: 0.4,
              ease: "power2.out",
            });
          }
        };

        wrapper.addEventListener("mouseenter", enter);
        wrapper.addEventListener("mouseleave", leave);
        cleanupHandlers.push(() => {
          wrapper.removeEventListener("mouseenter", enter);
          wrapper.removeEventListener("mouseleave", leave);
        });

        if (productImage) {
          tweens.push(
            gsap.to(productImage, {
              y: -16,
              duration: 1.8,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              delay: index * 0.18,
            }),
          );
        }

        ScrollTrigger.refresh();
      });

    return () => {
      isMounted = false;
      cleanupHandlers.forEach((cleanup) => cleanup());
      tweens.forEach((tween) => tween.kill());
    };
  }, [index, src]);

  return (
    <div
      ref={wrapperRef}
      className="relative group category-wrapper w-full flex-1 justify-center cursor-pointer will-change-transform"
    >
      <div
        ref={containerRef}
        className="category-card w-full h-full overflow-hidden rounded-[20px]"
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#C15F27] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.12)] border border-[#C15F27] text-white transition-colors duration-300 z-10 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
          className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
          />
        </svg>
      </div>
    </div>
  );
}
