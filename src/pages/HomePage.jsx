import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MODELS } from "../components/editor/ModelsPopup";
import fistoLogo from "../assets/images/fisto-logo.webp";
import packagingIcon from "../assets/images/Home/packaging.webp";
import realistic3dIcon from "../assets/images/Home/realistic3d.webp";
import fasteasyIcon from "../assets/images/Home/fasteasy.webp";
// Slide 1 (Food Containers)
import bg1 from "../assets/images/Home/Hero/slide1/bg.webp";
import prod1 from "../assets/images/Home/Hero/slide1/product.webp";
import leafLeft1 from "../assets/images/Home/Hero/slide1/leaf-left.webp";
import rightWood1 from "../assets/images/Home/Hero/slide1/right-wood.webp";
import potRight1 from "../assets/images/Home/Hero/slide1/pot-right.webp";
import pantRight1 from "../assets/images/Home/Hero/slide1/pant-right.webp";

// Slide 2 (Food Packaging)
import bg2 from "../assets/images/Home/Hero/slide2/bg.webp";
import prod2 from "../assets/images/Home/Hero/slide2/product.webp";

// Slide 3 (Drinkware Bottles)
import bg3 from "../assets/images/Home/Hero/slide3/bg.webp";
import prod3 from "../assets/images/Home/Hero/slide3/product.webp";
import leaf3 from "../assets/images/Home/Hero/slide3/leaf.webp";

// Slide 4 (Carton Boxes)
import bg4 from "../assets/images/Home/Hero/slide4/bg.webp";
import prod4 from "../assets/images/Home/Hero/slide4/product.webp";

// Slide 5 (Eco-Friendly Bags)
import bg5 from "../assets/images/Home/Hero/slide5/bg.webp";
import prod5 from "../assets/images/Home/Hero/slide5/product.webp";

// Slide 6 (Packaging Tapes)
import bg6 from "../assets/images/Home/Hero/slide6/bg.webp";
import prod6_1 from "../assets/images/Home/Hero/slide6/product1.webp";
import prod6_2 from "../assets/images/Home/Hero/slide6/product2.webp";
import prod6_3 from "../assets/images/Home/Hero/slide6/product3.webp";
import prod6_4 from "../assets/images/Home/Hero/slide6/product4.webp";
import prod6_5 from "../assets/images/Home/Hero/slide6/product5.webp";
import prod6_6 from "../assets/images/Home/Hero/slide6/product6.webp";
import prod6_7 from "../assets/images/Home/Hero/slide6/product7.webp";
import prod6_8 from "../assets/images/Home/Hero/slide6/product8.webp";


// Slide 7 (Fashion Wear)
import bg7 from "../assets/images/Home/Hero/slide7/bg.webp";
import prod7 from "../assets/images/Home/Hero/slide7/product.webp";
import centerBootmPot7 from "../assets/images/Home/Hero/slide7/center-bootm-pot.webp";
import rightLeaf7 from "../assets/images/Home/Hero/slide7/right-leaf.webp";
import rightPoy7 from "../assets/images/Home/Hero/slide7/right-poy.webp";

import AnimatedSvgCard from "../components/AnimatedSvgCard";
import card1 from "../assets/images/Home/cards/card1.svg?url";
import card2 from "../assets/images/Home/cards/card2.svg?url";
import card3 from "../assets/images/Home/cards/card3.svg?url";
import card4 from "../assets/images/Home/cards/card4.svg?url";
import card5 from "../assets/images/Home/cards/card5.svg?url";
import card6 from "../assets/images/Home/cards/card6.svg?url";
import card7 from "../assets/images/Home/cards/card7.svg?url";

import bgCard1 from "../assets/images/Home/cards/bg1.webp";
import bgCard2 from "../assets/images/Home/cards/bg2.webp";
import bgCard3 from "../assets/images/Home/cards/bg3.webp";
import bgCard4 from "../assets/images/Home/cards/bg4.webp";
import bgCard5 from "../assets/images/Home/cards/bg5.webp";
import bgCard6 from "../assets/images/Home/cards/bg6.webp";
import bgCard7 from "../assets/images/Home/cards/bg7.webp";

import Footer from "../components/Footer";
import GsapSmoothScroll from "../components/GsapSmoothScroll";
import ReadyMockupBanner from "../components/ReadyMockupBanner";

const cardsConfig = [
  { src: card1, bg: bgCard1, category: "Food Containers" },
  { src: card2, bg: bgCard2, category: "Food Packaging" },
  { src: card3, bg: bgCard3, category: "Drinkware Bottles" },
  { src: card4, bg: bgCard4, category: "Carton Boxes" },
  { src: card5, bg: bgCard5, category: "Eco-Friendly Bags" },
  { src: card6, bg: bgCard6, category: "Packaging Tapes" },
  { src: card7, bg: bgCard7, category: "Fashion Wear" },
];

gsap.registerPlugin(ScrollTrigger);

const slideConfigs = [
  {
    id: 1,
    bg: bg1,
    assets: [
      {
        src: rightWood1,
        css: {
          left: "77.76%",
          top: "11.48%",
          width: "19.69%",
          height: "52.41%",
        },
      },
      {
        src: leafLeft1,
        css: {
          left: "0.21%",
          top: "63.89%",
          width: "24.58%",
          height: "36.67%",
        },
        isLeaf: true,
      },
      {
        src: potRight1,
        css: {
          left: "87.55%",
          top: "42.13%",
          width: "14.43%",
          height: "32.96%",
        },
      },
      {
        src: pantRight1,
        css: {
          left: "84.74%",
          top: "15.00%",
          width: "18.07%",
          height: "32.13%",
        },
      },
      {
        src: prod1,
        css: { right: "5%", top: "30%", width: "55%", objectFit: "contain" },
      },
    ],
  },
  {
    id: 2,
    bg: bg2,
    assets: [
      {
        src: prod2,
        css: {
          left: "47.97%",
          top: "20.85%",
          width: "42.03%",
          height: "auto",
        },
      },
    ],
  },
  {
    id: 3,
    bg: bg3,
    assets: [
      {
        src: prod3,
        css: { right: "12%", bottom: "5%", width: "55%", height: "auto" },
      },
      {
        src: leaf3,
        css: { left: "0", top: "-7.00%", width: "100", height: "100%" },
        isLeaf: true,
      },
    ],
  },
  {
    id: 4,
    bg: bg4,
    assets: [
      {
        src: prod4,
        css: { right: "4.5%", top: "18%", width: "48%", objectFit: "contain" },
      },
    ],
  },
  {
    id: 5,
    bg: bg5,
    bgPosition: "center -10%",
    assets: [
      
      {
        src: prod5,
        css: { right: "17%", top: "19%", width: "35%", height: "auto" },
      },
    ],
  },
  {
    id: 6,
    bg: bg6,
    assets: [
      {
        src: prod6_1,
        css: { left: "54%", top: "22%", width: "24%", objectFit: "contain" },
      },
      {
        src: prod6_2,
        css: { left: "64%", top: "29%", width: "21%", objectFit: "contain" },
      },
      {
        src: prod6_3,
        css: { left: "77%", top: "49%", width: "17%", objectFit: "contain" },
      },
            {
        src: prod6_5,
        css: { left: "43%", top: "38%", width: "17%", objectFit: "contain" },
      },
     
      {
        src: prod6_7,
        css: { left: "70%", top: "59%", width: "14%", objectFit: "contain" },
      },
      {
        src: prod6_8,
        css: { left: "54%", top: "48%", width: "13%", objectFit: "contain" },
      },
          {
        src: prod6_4,
        css: { left: "57%", top: "63%", width: "15%", objectFit: "contain" },
      },
    ],
  },
  {
    id: 7,
    bg: bg7,
    bgPosition: "bottom",
    assets: [
      {
        src: rightLeaf7,
        css: {
          right: "-7%",
          top: "33%",
          width: "22.23%",
          height: "auto",
          filter: "grayscale(20%) brightness(90%)",
        },
        isLeaf: true,
      },
      {
        src: rightPoy7,
        css: {
          right: "0%",
          top: "80.5%",
          width: "11.39%",
          height: "1auto",
          filter: "grayscale(20%) brightness(90%)",
        },
      },
      {
        src: centerBootmPot7,
        css: {
          left: "41.75%",
          top: "75%",
          width: "13.88%",
          height: "24.68%",
          filter: "grayscale(20%) brightness(90%)",
        },
      },
      {
        src: prod7,
        css: { left: "44%", top: "22%", width: "45%", objectFit: "contain" },
      },
    ],
  },
];

const slideContents = [
  {
    title: (
      <>
        <span className="hero-title-line block">Design Premium</span>
        <span className="hero-title-line block">
          Container <span style={{ color: "#37472F" }}>Mockups</span>
        </span>
        <span className="hero-title-line block" style={{ color: "#37472F" }}>
          In Minutes
        </span>
      </>
    ),
    description:
      "Showcase your packaging designs on realistic food and storage containers with studio-quality mockups built for modern brands.",
    buttonBg: "#37472F",
    themeColor: "#37472F",
    features: [
      { text: "Smart\nPacking Preview", icon: realistic3dIcon },
      { text: "HD Container\nMockups", icon: packagingIcon },
      { text: "Fast Design\nEditing", icon: fasteasyIcon },
    ],
  },
  {
    title: (
      <>
        <span className="hero-title-line block">Bring Your</span>
        <span className="hero-title-line block">
          Food <span style={{ color: "#7C4321" }}>Packaging</span>
        </span>
        <span className="hero-title-line block" style={{ color: "#7C4321" }}>
          To Life
        </span>
      </>
    ),
    description:
      "Present your snack, bakery, and takeaway packaging with realistic mockups designed for branding, marketing, and online stores.",
    buttonBg: "#7C4321",
    themeColor: "#7C4321",
    features: [
      { text: "Realistic\nFood Packaging", icon: realistic3dIcon },
      { text: "Print-ready\nPresentation", icon: packagingIcon },
      { text: "Instant Brand\nPreview", icon: fasteasyIcon },
    ],
  },
  {
    title: (
      <>
        <span className="hero-title-line block">Realistic Water</span>
        <span className="hero-title-line block">
          Bottle <span style={{ color: "#4f5d2f" }}>Mockups</span>
        </span>
        <span className="hero-title-line block" style={{ color: "#4f5d2f" }}>
          For Every Brand
        </span>
      </>
    ),
    description:
      "High-quality 3D water bottle mockups for stunning packaging, branding, and product presentations.",
    buttonBg: "#4f5d2f",
    themeColor: "#4f5d2f",
    features: [
      { text: "Realistic 3D\nPreviews", icon: realistic3dIcon },
      { text: "Premium\nQuality", icon: packagingIcon },
      { text: "Fast & Easy\nCustomization", icon: fasteasyIcon },
    ],
  },
  {
    title: (
      <>
        <span className="hero-title-line block">Create Professional</span>
        <span className="hero-title-line block">
          Box <span style={{ color: "#5a6215" }}>Mockups</span>
        </span>
        <span className="hero-title-line block" style={{ color: "#5a6215" }}>
          In Seconds
        </span>
      </>
    ),
    description:
      "Showcase your packaging designs on realistic box mockups with high-quality 3D previews. Perfect for product packaging, shipping boxes, retail branding, and e-commerce presentations.",
    buttonBg: "#5a6215",
    themeColor: "#5a6215",
    features: [
      { text: "Realistic 3D\nBox Preview", icon: realistic3dIcon },
      { text: "Premium\nPackaging Mockups", icon: packagingIcon },
      { text: "Fast & Easy\nCustomization", icon: fasteasyIcon },
    ],
  },
  {
    title: (
      <>
        <span className="hero-title-line block">Create Eye-Catching</span>
        <span className="hero-title-line block">
          Bag <span style={{ color: "#a6530c" }}>Mockups</span>
        </span>
        <span className="hero-title-line block" style={{ color: "#a6530c" }}>
          Effortlessly
        </span>
      </>
    ),
    description:
      "Preview shopping bags, paper bags and carry bags with professional mockups that help your brand stand out instantly.",
    buttonBg: "#a6530c",
    themeColor: "#a6530c",
    features: [
      { text: "Premium Bag\nDesign", icon: realistic3dIcon },
      { text: "Realistic Print\nPreview", icon: packagingIcon },
      { text: "Quick Custom\nEditing", icon: fasteasyIcon },
    ],
  },
  {
    title: (
      <>
        <span className="hero-title-line block">Secure Every Shipment.</span>
        <span className="hero-title-line block" style={{ color: "#2B4326" }}>
          Deliver With
        </span>
        <span className="hero-title-line block" style={{ color: "#2B4326" }}>
          Confidence.
        </span>
      </>
    ),
    description:
      "Premium packaging solutions designed to protect products, reduce damage, and ensure safe delivery from warehouse to customer.",
    buttonBg: "#2B4326",
    themeColor: "#2B4326",
    features: [
      { text: "Strong\nAdhesion", icon: realistic3dIcon },
      { text: "Secure\nSealing", icon: packagingIcon },
      { text: "Durable &\nReliable", icon: fasteasyIcon },
    ],
  },
  {
    title: (
      <>
        <span className="hero-title-line block">Bring Your</span>
        <span className="hero-title-line block" style={{ color: "#1E3D59" }}>
          Designs to Life
        </span>
      </>
    ),
    description:
      "Create realistic product mockups in minutes. Showcase your artwork with professional-quality visuals for websites, marketing, and online stores.",
    buttonBg: "#1E3D59",
    themeColor: "#1E3D59",
    features: [
      { text: "HD Apparel\nMockups", icon: realistic3dIcon },
      { text: "Instant Design\nPreview", icon: packagingIcon },
      { text: "Easy Color\nCustomization", icon: fasteasyIcon },
    ],
  },
];

export default function HomePage({ onLoaded }) {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  const handleStartDesigning = () => {
    const slideToModelIdMap = {
      0: "oval-container",
      1: "kraft-paper",
      2: "glass-bottle",
      3: "beverage-cup",
      4: "biodegradable-bags",
      5: "box-sealing-tape",
      6: "t-shirt",
    };
    const modelId = slideToModelIdMap[currentSlide] || "oval-container";
    const selectedModel = MODELS.find((m) => m.id === modelId);
    navigate("/editor", {
      state: { initialModelUrl: selectedModel?.modelUrl },
    });
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const [bannersContent, setBannersContent] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasAnimatedMount, setHasAnimatedMount] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const cardsRowRef = useRef(null);

  const scrollCards = (direction) => {
    if (!cardsRowRef.current) return;
    const scrollAmount = 300;
    if (direction === "left") {
      cardsRowRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      cardsRowRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Preload images
  useEffect(() => {
    const imageUrls = [];
    slideConfigs.forEach((config) => {
      if (config.bg) imageUrls.push(config.bg);
      if (config.assets) {
        config.assets.forEach((asset) => {
          if (asset.src) imageUrls.push(asset.src);
        });
      }
    });

    let loadedCount = 0;
    const totalImages = imageUrls.length;

    if (totalImages === 0) {
      setImagesLoaded(true);
      setBannersContent(slideConfigs);
      if (onLoaded) onLoaded();
      return;
    }

    const handleImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        setImagesLoaded(true);
        setBannersContent(slideConfigs);
        if (onLoaded) onLoaded();
      }
    };

    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = handleImageLoad;
      img.onerror = handleImageLoad;
    });
  }, []);

  const changeSlide = (nextIndex, isManual = false) => {
    if (!isManual && isTransitioning) return;

    let logicalNext = nextIndex;
    if (nextIndex >= slideConfigs.length) logicalNext = 0;
    if (nextIndex < 0) logicalNext = slideConfigs.length - 1;

    if (currentSlide === logicalNext) return;

    const leftContent = pageRef.current?.querySelector(".hero-left-content");

    if (isManual) {
      // Manual click: switch content instantly without slow exit animation, then play entry animation like before
      setIsTransitioning(false);
      
      if (leftContent && leftContent.children) {
        gsap.killTweensOf(leftContent.children);
        gsap.set(leftContent, { opacity: 1 });
        // Hide instantly to avoid flashing before entry animation starts
        gsap.set(leftContent.children, { y: 80, opacity: 0 });
      }
      
      setCurrentSlide(logicalNext);

      if (leftContent && leftContent.children) {
        setTimeout(() => {
          gsap.fromTo(
            leftContent.children,
            { y: 80, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.0,
              stagger: 0.12,
              ease: "power3.out",
            },
          );
        }, 30);
      }
    } else {
      // Auto-transition (timer): play full exit -> switch -> entry animation like before
      setIsTransitioning(true);

      if (leftContent && leftContent.children) {
        gsap.killTweensOf(leftContent.children);
        gsap.to(leftContent.children, {
          y: 40,
          opacity: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.inOut",
          onComplete: () => {
            setCurrentSlide(logicalNext);

            setTimeout(() => {
              gsap.fromTo(
                leftContent.children,
                { y: 80, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.8,
                  stagger: 0.1,
                  ease: "power3.out",
                  onComplete: () => {
                    setIsTransitioning(false);
                  },
                },
              );
            }, 50);
          },
        });
      } else {
        setCurrentSlide(logicalNext);
        setIsTransitioning(false);
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      changeSlide(currentSlide + 1);
    }, 2800); // reduced slide staying time
    return () => clearInterval(timer);
  }, [currentSlide, isTransitioning]);

  useEffect(() => {
    if (bannersContent.length === 0 || hasAnimatedMount) return;

    const leftContent = pageRef.current?.querySelector(".hero-left-content");
    if (leftContent && leftContent.children) {
      gsap.fromTo(
        leftContent.children,
        { opacity: 0, y: 80 },
        { opacity: 1, y: 0, duration: 1.0, stagger: 0.15, ease: "power3.out" },
      );
      // Reveal the container itself to avoid CSS hidden
      gsap.set(leftContent, { opacity: 1 });
    }
    setHasAnimatedMount(true);
  }, [bannersContent, hasAnimatedMount]);

  // Waving leaf animation
  useEffect(() => {
    if (bannersContent.length === 0) return;

    const leaves = pageRef.current?.querySelectorAll(".waving-leaf");
    if (!leaves || leaves.length === 0) return;

    const ctx = gsap.context(() => {
      leaves.forEach((leaf) => {
        gsap.set(leaf, { transformOrigin: "bottom center" });

        gsap.to(leaf, {
          rotation: "random(-2, 2)",
          x: "random(-4, 4)",
          y: "random(-2, 2)",
          duration: "random(3, 5)",
          repeat: -1,
          yoyo: true,
          ease: "sine3.inOut",
          delay: "random(0, 2)",
        });
      });
    }, pageRef);

    return () => {
      ctx.revert();
    };
  }, [bannersContent]);

  // Active slide assets animation
  useEffect(() => {
    if (bannersContent.length === 0 || currentSlide < 0) return;

    const container = pageRef.current?.querySelector(".hero-svg-wrapper");
    if (!container) return;

    const activeSlideEl = container.querySelectorAll(
      ".hero-svg-wrapper-inner > div",
    )[currentSlide];
    if (!activeSlideEl) return;

    const background = activeSlideEl.querySelector(".hero-slide-bg");
    if (background) {
      gsap.fromTo(
        background,
        { opacity: 0.5 },
        { opacity: 1, duration: 1.0, overwrite: "auto" },
      );
    }

    const activeAssets = activeSlideEl.querySelectorAll(".hero-slide-asset");
    if (activeAssets.length > 0) {
      gsap.set(activeAssets, {
        transformOrigin: "center center",
        opacity: 0,
        scale: 1,
        x: 0,
        y: 0,
      });

      const tl = gsap.timeline({ overwrite: "auto" });

      if (currentSlide === 0) {
        // Slide 1: 1st wood from right, next flower pot, third product from bottom
        if (activeAssets[0])
          tl.fromTo(
            activeAssets[0],
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            0,
          );
        if (activeAssets[1])
          tl.fromTo(
            activeAssets[1],
            { x: -50, opacity: 0 },
            { x: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            0.2,
          );
        if (activeAssets[2])
          tl.fromTo(
            activeAssets[2],
            { x: 50, opacity: 0 },
            { x: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            0.2,
          );
        if (activeAssets[3])
          tl.fromTo(
            activeAssets[3],
            { y: -50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            0.2,
          );
        if (activeAssets[4])
          tl.fromTo(
            activeAssets[4],
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            0.4,
          );
      } else if (currentSlide === 1) {
        // Slide 2: product from right
        tl.fromTo(
          activeAssets[0],
          { x: 150, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
          0,
        );
      } else if (currentSlide === 2) {
        // Slide 3: product from bottom and leaf appear
        if (activeAssets[0])
          tl.fromTo(
            activeAssets[0],
            { y: 150, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            0,
          );
        if (activeAssets[1])
          tl.fromTo(
            activeAssets[1],
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" },
            0.2,
          );
      } else if (currentSlide === 3) {
        // Slide 4: product from right side
        if (activeAssets[0])
          tl.fromTo(
            activeAssets[0],
            { x: 150, opacity: 0 },
            { x: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            0,
          );
      } else if (currentSlide === 4) {
        // Slide 5: leaf from right, product from top
        if (activeAssets[0])
          tl.fromTo(
            activeAssets[0],
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            0,
          );
        if (activeAssets[1])
          tl.fromTo(
            activeAssets[1],
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            0.2,
          );
        if (activeAssets[2])
          tl.fromTo(
            activeAssets[2],
            { y: -150, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            0.4,
          );
      } else if (currentSlide === 5) {
        // Slide 6: product appear one by one from bottom right corner
        tl.fromTo(
          activeAssets,
          { x: 100, y: 100, opacity: 0 },
          {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 1.5,
            stagger: 0.2,
            ease: "power2.out",
          },
          0,
        );
      } else if (currentSlide === 6) {
        // Slide 7: leaf and pot from bottom, product from left
        if (activeAssets[0])
          tl.fromTo(
            activeAssets[0],
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            0,
          );
        if (activeAssets[1])
          tl.fromTo(
            activeAssets[1],
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            0.1,
          );
        if (activeAssets[2])
          tl.fromTo(
            activeAssets[2],
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            0.2,
          );
        if (activeAssets[3])
          tl.fromTo(
            activeAssets[3],
            { x: -150, opacity: 0 },
            { x: 0, opacity: 1, duration: 1.5, ease: "power2.out" },
            0.4,
          );
      }
    }
  }, [currentSlide, bannersContent]);

  useEffect(() => {
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (prefersReducedMotion.matches) return undefined;

    const hoverCleanups = [];
    const context = gsap.context(() => {
      const revealOnScroll = (elements, fromVars, toVars = {}) => {
        const {
          trigger,
          start = "top 88%",
          end = "bottom 12%",
          duration = 0.9,
          ease = "power3.out",
          ...animationVars
        } = toVars;

        gsap.utils.toArray(elements).forEach((element) => {
          gsap.fromTo(element, fromVars, {
            ...animationVars,
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
            duration,
            ease,
            overwrite: "auto",
            immediateRender: false,
            scrollTrigger: {
              trigger: trigger ?? element,
              start,
              end,
              toggleActions: "play reverse play reverse",
            },
          });
        });
      };

      gsap.to(".hero-svg-wrapper", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      revealOnScroll("[data-scroll-fade]", { autoAlpha: 0, y: 34 });
      revealOnScroll("[data-scroll-left]", { autoAlpha: 0, x: -54 });
      revealOnScroll("[data-scroll-right]", { autoAlpha: 0, x: 54 });

      // Explore By Category - Header Text Reveal
      gsap.fromTo(
        ".explore-text",
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#features",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      // Explore By Category - Cards
      gsap.fromTo(
        ".explore-card",
        { autoAlpha: 0, x: -50 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".category-cards",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      // How It Works - Header Text
      gsap.fromTo(
        ".how-text",
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#mockups",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      // How It Works - Cards
      gsap.fromTo(
        ".how-card",
        { autoAlpha: 0, y: 30, scale: 0.95 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: "#mockups > div:nth-child(3)",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      // Ready Mockup Banner Text
      gsap.fromTo(
        ".frame-text",
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".frame-banner",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      // Ready Mockup Banner Image
      gsap.fromTo(
        ".frame-product",
        { autoAlpha: 0, x: 50 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".frame-banner",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      gsap.utils.toArray(".step-card").forEach((card) => {
        const enter = () =>
          gsap.to(card, {
            y: -12,
            scale: 1.035,
            boxShadow: "0 24px 52px rgba(17,24,39,0.16)",
            duration: 0.35,
            ease: "power3.out",
          });
        const leave = () =>
          gsap.to(card, {
            y: 0,
            scale: 1,
            boxShadow:
              "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
            duration: 0.35,
            ease: "power3.out",
          });
        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        hoverCleanups.push(() => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
        });
      });

      gsap.fromTo(
        ".frame-product",
        { autoAlpha: 0, x: 120, y: 46, rotate: 5, scale: 0.88 },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          duration: 1.05,
          ease: "back.out(1.25)",
          immediateRender: false,
          overwrite: "auto",
          scrollTrigger: {
            trigger: ".frame-banner",
            start: "top 82%",
            end: "bottom 18%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      gsap.fromTo(
        ".trusted-by-badge",
        { autoAlpha: 0, scale: 0.8, y: -60 },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          ease: "back.out(1.5)",
          immediateRender: false,
          overwrite: "auto",
          scrollTrigger: {
            trigger: ".frame-banner",
            start: "top 82%",
            end: "bottom 18%",
            toggleActions: "play reverse play reverse",
          },
        },
      );

      revealOnScroll(
        "footer > div > div",
        { autoAlpha: 0, y: 30, scale: 0.98 },
        { trigger: "footer", start: "top 92%" },
      );

      window.requestAnimationFrame(() => ScrollTrigger.refresh());
    }, pageRef);

    return () => {
      hoverCleanups.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, []);

  return (
    <GsapSmoothScroll>
      <div
        ref={pageRef}
        className="flex flex-col min-h-full bg-white font-['Inter'] flex-1 w-full"
      >
         <style>{`
          @media (max-height: 780px) {
            .hero-section {
              min-height: 520px !important;
              height: 100vh !important;
            }
            .hero-left-content {
              padding-top: 2rem !important;
            }
            .hero-left-content h1 {
              margin-bottom: 0.75rem !important;
            }
            .hero-left-content p {
              font-size: 0.95rem !important;
              margin-bottom: 1.25rem !important;
              max-width: 500px !important;
              line-height: 1.4 !important;
            }
            .hero-btn {
              margin-bottom: 1.5rem !important;
              padding: 0.6rem 1.2rem !important;
              font-size: 0.95rem !important;
            }
            .hero-left-content .w-12 {
              width: 2.25rem !important;
              height: 2.25rem !important;
            }
            .hero-left-content .w-12 img {
              width: 1.1rem !important;
              height: 1.1rem !important;
            }
            .hero-left-content .text-sm {
              font-size: 0.75rem !important;
            }
          }

          @media (max-width: 1023px) {
            .hero-section {
              height: auto !important;
              min-height: 0 !important;
              padding: 2.5rem 1rem 4rem 1rem !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              background-color: #FAF6F1 !important; /* solid light cream background */
            }
            .hero-svg-wrapper {
              display: none !important; /* hide all background images and assets completely on mobile/tab */
            }
            .hero-section > div.w-full {
              flex-direction: column !important;
              align-items: center !important;
              text-align: center !important;
            }
            .hero-left-content {
              width: 100% !important;
              max-width: 600px !important;
              text-align: center !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              padding-top: 0 !important;
              margin-bottom: 0 !important;
            }
            .hero-left-content h1 {
              font-size: clamp(28px, 6vw, 38px) !important;
              text-align: center !important;
              margin-bottom: 1rem !important;
            }
            .hero-left-content p {
              font-size: 0.95rem !important;
              text-align: center !important;
              margin-bottom: 1.5rem !important;
              line-height: 1.5 !important;
            }
            .hero-btn {
              margin-bottom: 2rem !important;
            }
            .hero-left-content div.flex-wrap {
              justify-content: center !important;
              gap: 1.25rem !important;
            }
            /* Hide absolute side navigation arrows on mobile/tablet */
            .carousel-nav-arrow {
              display: none !important;
            }
          }
        `}</style>
        <main className="flex flex-col w-full flex-1">
          {/* Hero Section */}
          <div
            id="home"
            className="hero-section relative w-[100vw] h-[100vh] flex flex-col justify-center overflow-hidden"
          >
            {/* Background & Right-Side SVG Banner Fade (Fade In / Fade Out) */}
            <div className="hero-svg-wrapper absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden bg-[#EEE2D3]">
              <div className="hero-svg-wrapper-inner relative w-[100vw] h-full">
                {bannersContent.map((banner, index) => {
                  const isActive = currentSlide === index;
                  return (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex justify-center items-center select-none ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                      style={{
                        willChange: "opacity",
                        transform: "translate3d(0,0,0)",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      <div
                        className={`absolute left-1/2 -translate-x-1/2 w-[100vw] h-[100vh] min-w-[177.777vh] min-h-[56.25vw] ${banner.bgPosition === "bottom" ? "bottom-0" : "top-1/2 -translate-y-1/2"}`}
                      >
                        {/* Background */}
                        <img
                          src={banner.bg}
                          className="absolute inset-0 w-full h-full object-cover hero-slide-bg"
                          style={{
                            objectPosition: banner.bgPosition || "center",
                            willChange: "opacity",
                            transform: "translate3d(0,0,0)",
                            backfaceVisibility: "hidden",
                          }}
                          alt="Background"
                        />

                        {/* Assets */}
                        {banner.assets?.map((asset, assetIdx) => (
                          <img
                            key={assetIdx}
                            src={asset.src}
                            style={{
                              ...asset.css,
                              willChange: "transform, opacity",
                              transform: `${asset.css.transform || ""} translate3d(0,0,0)`.trim(),
                              backfaceVisibility: "hidden",
                            }}
                            className={`absolute drop-shadow-2xl hero-slide-asset ${asset.isLeaf ? "waving-leaf" : ""}`}
                            alt={`Asset ${assetIdx}`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-full px-6 lg:px-12 xl:px-20 flex flex-col lg:flex-row items-center z-10 relative">
              {/* Left Content */}
              <div className="hero-left-content w-full lg:w-[60%] z-10 text-left pt-10 lg:pt-0 opacity-0">
                <h1
                  className="font-bold text-gray-900 mb-6"
                  style={{
                    fontSize: "clamp(40px, 4.3vw, 81.1px)",
                    lineHeight: "127.1%",
                    letterSpacing: "0%",
                  }}
                >
                  {slideContents[currentSlide]?.title}
                </h1>

                <p className="text-lg lg:text-xl text-gray-800 max-w-2xl mb-10 leading-relaxed">
                  {slideContents[currentSlide]?.description}
                </p>

                <button
                  onClick={handleStartDesigning}
                  className="hero-btn group flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:opacity-90 border-none cursor-pointer mb-16 "
                  style={{
                    background: slideContents[currentSlide]?.buttonBg,
                  }}
                >
                  Start Designing
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5 transition-transform group-hover:translate-x-1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>

                {/* 3 Features */}
                <div className="flex flex-wrap items-center gap-6 lg:gap-10">
                  {slideContents[currentSlide]?.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300"
                        style={{
                          backgroundColor:
                            slideContents[currentSlide]?.themeColor,
                        }}
                      >
                        <img
                          src={feature.icon}
                          alt={feature.text}
                          className="w-6 h-6 object-contain filter invert brightness-0"
                          style={{ filter: "brightness(0) invert(1)" }}
                        />
                      </div>
                      <span className="text-sm lg:text-base font-bold text-gray-900 leading-tight whitespace-pre-line">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Carousel Slide Indicators (Mobile/Tablet only) */}
                <div className="carousel-dots-container-mobile lg:hidden flex items-center justify-center gap-3 mt-8 w-full">
                  {/* Mobile Left Arrow */}
                  <button
                    onClick={() =>
                      changeSlide(currentSlide === 0 ? -1 : currentSlide - 1, true)
                    }
                    className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/25 border border-black/10 text-black/80 flex items-center justify-center cursor-pointer"
                    aria-label="Previous slide"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5 8.25 12l7.5-7.5"
                      />
                    </svg>
                  </button>

                  {slideConfigs.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => changeSlide(index, true)}
                      className={`h-3.5 rounded-full transition-all duration-300 cursor-pointer ${
                        currentSlide === index
                          ? "w-8 bg-[#C15F27]"
                          : "w-3.5 bg-black/20 hover:bg-black/40"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}

                  {/* Mobile Right Arrow */}
                  <button
                    onClick={() => changeSlide(currentSlide + 1, true)}
                    className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/25 border border-black/10 text-black/80 flex items-center justify-center cursor-pointer"
                    aria-label="Next slide"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

             {/* Carousel Navigation Arrows */}
            <button
              onClick={() =>
                changeSlide(currentSlide === 0 ? -1 : currentSlide - 1, true)
              }
              className="carousel-nav-arrow absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/15 hover:bg-black/30 border border-white/20 text-white flex items-center justify-center cursor-pointer z-20 backdrop-blur-sm transition-all hover:scale-105"
              aria-label="Previous slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              onClick={() => changeSlide(currentSlide + 1, true)}
              className="carousel-nav-arrow absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/15 hover:bg-black/30 border border-white/20 text-white flex items-center justify-center cursor-pointer z-20 backdrop-blur-sm transition-all hover:scale-105"
              aria-label="Next slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>

            {/* Carousel Slide Indicators */}
            <div className="carousel-dots-container absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-3 z-20">
              {slideConfigs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => changeSlide(index, true)}
                  className={`h-3.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === index
                      ? "w-8 bg-[#C15F27]"
                      : "w-3.5 bg-black/20 hover:bg-black/40"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Marquee Bar */}
          <div
            data-scroll-fade
            className="w-[100vw] overflow-hidden flex items-center h-[72px]"
            style={{ backgroundColor: "#2B4326" }}
          >
            <div className="flex animate-marquee text-white font-bold text-xl md:text-2xl tracking-wide w-max">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center whitespace-nowrap">
                  <span className="mx-8">Round Container</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Tamper Evident Container</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Oval Containers</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Zip Lock Pouches</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Kraft Paper Pouches</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Plastic Water Bottle</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Glass Water Bottle</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Soft Drink Bottles</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Folding Carton Box</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Die-Cut Carton Box</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Paper Bags</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Biodegradable Bags</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Box Sealing Tape</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">T-Shirts</span>
                  <span style={{ color: "#C15F27" }}>●</span>
                  <span className="mx-8">Hoodies</span>

                  <span style={{ color: "#C15F27", marginRight: "2rem" }}>
                    ●
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Explore by Category */}
          <div
            id="features"
            className="w-full py-14 px-4 sm:px-6 lg:px-12 xl:px-20 flex flex-col items-center bg-white"
          >
            <span
              className="explore-text text-lg sm:text-xl md:text-2xl font-bold tracking-widest uppercase mb-4"
              style={{ color: "#D89234" }}
            >
              Explore By Category
            </span>
            <h2
              className="explore-text text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4 text-center"
              style={{ color: "#111827" }}
            >
              Mockups For Every Need
            </h2>
            <p className="explore-text text-gray-500 text-base sm:text-lg lg:text-xl text-center max-w-2xl mb-12">
              Choose from a wide range of packaging mockups and bring your ideas
              to life.
            </p>

            <div className="w-full relative mx-auto flex flex-col items-center">
              <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="category-cards-container w-full pb-4">
                <div
                  ref={cardsRowRef}
                  className="category-cards category-cards-row flex gap-6 md:gap-14 lg:gap-16 xl:gap-20 justify-start lg:justify-center scrollbar-hide scroll-smooth snap-x snap-mandatory w-full lg:flex-wrap px-6 lg:px-12 overflow-x-auto"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {cardsConfig.map((card, idx) => (
                    <div
                      key={idx}
                      className="explore-card group w-[260px] sm:w-[280px] lg:w-[calc(25%-36px)] xl:w-[calc(20%-42px)] max-w-[320px] shrink-0 snap-center cursor-pointer bg-transparent rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_24px_60px_rgba(0,0,0,0.18)] transition-all duration-300 border-none flex items-center justify-center relative hover:scale-[1.02] hover:-translate-y-1"
                      onClick={() =>
                        navigate("/modelsMockup", {
                          state: { activeCategory: card.category },
                        })
                      }
                    >
                      {/* Background Image on Hover wrapped in a container that has rounded-3xl and overflow-hidden */}
                      <div className="absolute inset-0 w-full h-full rounded-[24px] overflow-hidden z-0 pointer-events-none">
                        <img
                          src={card.bg}
                          alt=""
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${
                            idx === 1 || idx === 5 || idx === 6 ? "scale-[1.14]" : "scale-[1.08]"
                          }`}
                        />
                      </div>
                      
                      {/* SVG Content on top */}
                      <div className="relative z-10 w-full">
                        <AnimatedSvgCard src={card.src} index={idx} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows Centered Below */}
              <div className="flex gap-4 mt-6 lg:hidden">
                <button
                  onClick={() => scrollCards("left")}
                  className="w-12 h-12 rounded-full bg-[#344B2D] hover:bg-[#253620] text-white flex items-center justify-center cursor-pointer border-none hover:scale-105 transition-all shadow-md"
                  aria-label="Scroll left"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5 8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => scrollCards("right")}
                  className="w-12 h-12 rounded-full bg-[#344B2D] hover:bg-[#253620] text-white flex items-center justify-center cursor-pointer border-none hover:scale-105 transition-all shadow-md"
                  aria-label="Scroll right"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate("/modelsMockup")}
              className="group mt-16 flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg hover:opacity-90 transition-opacity border-none cursor-pointer"
              style={{ background: "#C15F27" }}
            >
              View All Mockups
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </div>

          {/* Section 3: How it Works */}
          <div
            id="mockups"
            data-scroll-section
            className="w-full pb-10 px-6 lg:px-12 xl:px-20 flex flex-col items-center bg-white font-Outfit"
          >
            <span
              className="how-text text-2xl font-bold tracking-widest uppercase mb-4"
              style={{ color: "#D89234" }}
            >
              How it Works
            </span>
            <h2 className="how-text text-4xl lg:text-5xl font-bold text-black mb-16 text-center">
              Simple Steps, Stunning Results
            </h2>

            <div className="w-full mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 xl:gap-4">
              {/* Step 1 */}
              <div className="how-card step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center will-change-transform">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4"
                  style={{ backgroundColor: "#E4EADF", color: "#37472F" }}
                >
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Choose Mockup
                </h3>
                <p className="text-gray-500 text-sm">
                  Select the perfect mockup for your product.
                </p>
              </div>

              {/* Arrow */}
              <div className="how-card text-[#6B7280] hidden lg:block">
                <svg
                  width="40"
                  height="20"
                  viewBox="0 0 40 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 10H38M38 10L30 2M38 10L30 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              {/* Step 2 */}
              <div className="how-card step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center will-change-transform">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4"
                  style={{ backgroundColor: "#E4EADF", color: "#37472F" }}
                >
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Upload Design
                </h3>
                <p className="text-gray-500 text-sm">
                  Upload your artwork with ease.
                </p>
              </div>

              {/* Arrow */}
              <div className="how-card text-[#6B7280] hidden lg:block">
                <svg
                  width="40"
                  height="20"
                  viewBox="0 0 40 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 10H38M38 10L30 2M38 10L30 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              {/* Step 3 */}
              <div className="how-card step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center will-change-transform">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4"
                  style={{ backgroundColor: "#E4EADF", color: "#37472F" }}
                >
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Customize
                </h3>
                <p className="text-gray-500 text-sm">
                  Adjust colors, shadows and elements.
                </p>
              </div>

              {/* Arrow */}
              <div className="how-card text-[#6B7280] hidden lg:block">
                <svg
                  width="40"
                  height="20"
                  viewBox="0 0 40 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 10H38M38 10L30 2M38 10L30 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              {/* Step 4 */}
              <div className="how-card step-card bg-[#FAF8F8] border-2 border-white shadow-xl rounded-[32px] p-8 w-full max-w-[300px] h-[220px] flex flex-col justify-center will-change-transform">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4"
                  style={{ backgroundColor: "#E4EADF", color: "#37472F" }}
                >
                  4
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Download
                </h3>
                <p className="text-gray-500 text-sm">
                  Download high-quality images instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Banner */}
          <div
            id="pricing"
            className="w-full px-4 lg:px-10 xl:px-18 pb-12 pt-10"
          >
            <ReadyMockupBanner animated />
          </div>
        </main>
        <Footer />
      </div>
    </GsapSmoothScroll>
  );
}
