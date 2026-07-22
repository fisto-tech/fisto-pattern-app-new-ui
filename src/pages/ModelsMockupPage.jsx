import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "../components/Footer";
import ReadyMockupBanner from "../components/ReadyMockupBanner";

gsap.registerPlugin(ScrollTrigger);

import mockupBanner from "../assets/images/MockupsSection/banner.svg";

// New Icons
import packagingTapesIcon from "../assets/images/MockupsSection/Icons/tapes.webp";
import drinkWareIcon from "../assets/images/MockupsSection/Icons/drinkwareBottle.webp";
import ecoFriendlyBagsIcon from "../assets/images/MockupsSection/Icons/eco-bag.webp";
import fashionIcon from "../assets/images/MockupsSection/Icons/tshirt.webp";
import foodContainerNewIcon from "../assets/images/MockupsSection/Icons/FoodContainer.webp";
import foodPackingIcon from "../assets/images/MockupsSection/Icons/FoodPacking.webp";
import cartonBox from "../assets/images/MockupsSection/Icons/cartonBoxes.webp";
import allProducts from "../assets/images/MockupsSection/Icons/all.webp";

// Carton Box Models & Images
import beverageCupUrl from "../assets/models/Carton box/Beverage/Beverage Cup.glb?url";
import beverageCupImg from "../assets/models/Carton box/Beverage/Beverage.webp";
import dieCutBoxUrl from "../assets/models/Carton box/Die cut/Die cut.glb?url";
import dieCutBoxImg from "../assets/models/Carton box/Die cut/iecutd.webp";
import foldingBoxUrl from "../assets/models/Carton box/Folding/Folding.glb?url";
import foldingBoxImg from "../assets/models/Carton box/Folding/Folding.webp";

// Drinkware Bottles Models & Images
import glassBottleUrl from "../assets/models/Drinkware Bottles/Glass Bottle/glass_Bottle.glb?url";
import glassBottleImg from "../assets/models/Drinkware Bottles/Glass Bottle/Glass bottle1.webp";
import plasticWaterBottleUrl from "../assets/models/Drinkware Bottles/Plastic water bottles/Plastic Water bottle.glb?url";
import plasticWaterBottleImg from "../assets/models/Drinkware Bottles/Plastic water bottles/plastic water bottle.webp";
import softDrinksBottleUrl from "../assets/models/Drinkware Bottles/Soft drinks/Soft drinks bottle.glb?url";
import softDrinksBottleImg from "../assets/models/Drinkware Bottles/Soft drinks/05.waterbottle.webp";
import steelBottleUrl from "../assets/models/Drinkware Bottles/Steel Bottle/Steel bottle.glb?url";
import steelBottleImg from "../assets/models/Drinkware Bottles/Steel Bottle/Steel bottle.webp";

// Eco friendly Models & Images
import biodegradableBagsUrl from "../assets/models/Eco friendly/Bio degradable/Biodegradable bags.glb?url";
import biodegradableBagsImg from "../assets/models/Eco friendly/Bio degradable/Biodegradable.webp";
import paperBagUrl from "../assets/models/Eco friendly/Paper Bags/Paper Bag-1.glb?url";
import paperBagImg from "../assets/models/Eco friendly/Paper Bags/02.Plastic Bag.webp";

// Fashion Wear Models & Images
import tshirtUrl from "../assets/models/Fashion Wear/T-shirt/t s1.glb?url";
import tshirtImg from "../assets/models/Fashion Wear/T-shirt/tShirt.webp";
import hoodieUrl from "../assets/models/Fashion Wear/hoodie/Hoodie2.glb?url";
import hoodieImg from "../assets/models/Fashion Wear/hoodie/Hoodie.webp";

// Food Containers Models & Images
import ovalContainerUrl from "../assets/models/Food Containers/Oval/oval .glb?url";
import ovalContainerImg from "../assets/models/Food Containers/Oval/Oval.webp";
import roundContainerUrl from "../assets/models/Food Containers/Round/Round.glb?url";
import roundContainerImg from "../assets/models/Food Containers/Round/02.Round.webp";
import tamperEvidentUrl from "../assets/models/Food Containers/Tamper Evident/TE .glb?url";
import tamperEvidentImg from "../assets/models/Food Containers/Tamper Evident/TE-3.webp";

// Food Packaging Models & Images
import kraftPaperUrl from "../assets/models/Food Packaging/Kraft Paper/Craft paper.glb?url";
import kraftPaperImg from "../assets/models/Food Packaging/Kraft Paper/Kraft paper.webp";
import zipLockPouchesUrl from "../assets/models/Food Packaging/zip lock Pouches bag/Zip lock Pouches.glb?url";
import zipLockPouchesImg from "../assets/models/Food Packaging/zip lock Pouches bag/zip lock pouches.webp";

// Packaging tapes Models & Images
import boxSealingTapeUrl from "../assets/models/Packaging tapes/Box sealing Tape/Box_Tape.glb?url";
import boxSealingTapeImg from "../assets/models/Packaging tapes/Box sealing Tape/Tape.webp";

const modelMappings = {
  "Beverage Carton Box": beverageCupUrl,
  "Die-Cut Carton Box": dieCutBoxUrl,
  "Folding Carton Box": foldingBoxUrl,

  "Glass Water Bottle": glassBottleUrl,
  "Plastic Water Bottle": plasticWaterBottleUrl,
  "Soft Drink Bottles": softDrinksBottleUrl,
  "Steel Bottle": steelBottleUrl,

  "Biodegradable Bags": biodegradableBagsUrl,
  "Paper Bags": paperBagUrl,

  "T-Shirts": tshirtUrl,
  "Hoodies": hoodieUrl,

  "Oval Containers": ovalContainerUrl,
  "Round Container": roundContainerUrl,
  "Tamper Evident Container": tamperEvidentUrl,

  "Kraft Paper Pouches": kraftPaperUrl,
  "Zip Lock Pouches": zipLockPouchesUrl,

  "Box Sealing Tape": boxSealingTapeUrl,
};

const categoryGroups = [
  { title: "Food Containers", items: [] },
  { title: "Food Packaging", items: [] },
  { title: "Drinkware Bottles", items: [] },
  { title: "Carton Boxes", items: [] },
  { title: "Eco-Friendly Bags", items: [] },
  { title: "Packaging Tapes", items: [] },
  { title: "Fashion Wear", items: [] },
];

const catalogSections = [
  {
    title: "Food Containers",
    icon: "container",
    sidebarLabels: ["Food Containers"],
    products: ["Round Container", "Tamper Evident Container", "Oval Containers"],
  },
  {
    title: "Food Packaging",
    icon: "pack",
    sidebarLabels: ["Food Packaging"],
    products: ["Zip Lock Pouches", "Kraft Paper Pouches"],
  },
  {
    title: "Drinkware Bottles",
    icon: "bottle",
    sidebarLabels: ["Drinkware Bottles"],
    products: ["Plastic Water Bottle", "Glass Water Bottle", "Soft Drink Bottles", "Steel Bottle"],
  },
  {
    title: "Carton Boxes",
    icon: "box",
    sidebarLabels: ["Carton Boxes"],
    products: ["Folding Carton Box", "Die-Cut Carton Box", "Beverage Carton Box"],
  },
  {
    title: "Eco-Friendly Bags",
    icon: "bag",
    sidebarLabels: ["Eco-Friendly Bags"],
    products: ["Paper Bags", "Biodegradable Bags"],
  },
  {
    title: "Packaging Tapes",
    icon: "box",
    sidebarLabels: ["Packaging Tapes"],
    products: ["Box Sealing Tape"],
  },
  {
    title: "Fashion Wear",
    icon: "shirt",
    sidebarLabels: ["Fashion Wear"],
    products: ["T-Shirts", "Hoodies"],
  },
];

const productAliases = {};

function CubeIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </svg>
  );
}

function BottleIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 2h4v5l2 3v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V10l2-3V2Z" />
      <path d="M9 13h6" />
    </svg>
  );
}

function BagIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}

function ShirtIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 4 4 7l3 4 1.5-1.2V21h7V9.8L17 11l3-4-4-3-4 2-4-2Z" />
    </svg>
  );
}

const sidebarIcons = {
  // Generic / Fallback
  box: cartonBox,
  bag: ecoFriendlyBagsIcon,
  bottle: drinkWareIcon,
  container: foodContainerNewIcon,
  pack: foodPackingIcon,
  shirt: fashionIcon,

  // Specific Subcategory mappings
  "food containers": foodContainerNewIcon,
  "food packaging": foodPackingIcon,
  "drinkware bottles": drinkWareIcon,
  "carton boxes": cartonBox,
  "eco friendly bags": ecoFriendlyBagsIcon,
  "packaging tapes": packagingTapesIcon,
  "fashion wear": fashionIcon,
};

const productImages = {
  "beverage carton box": beverageCupImg,
  "die cut carton box": dieCutBoxImg,
  "folding carton box": foldingBoxImg,

  "glass water bottle": glassBottleImg,
  "plastic water bottle": plasticWaterBottleImg,
  "soft drink bottles": softDrinksBottleImg,
  "steel bottle": steelBottleImg,

  "biodegradable bags": biodegradableBagsImg,
  "paper bags": paperBagImg,

  "t shirts": tshirtImg,
  "hoodies": hoodieImg,

  "oval containers": ovalContainerImg,
  "round container": roundContainerImg,
  "tamper evident container": tamperEvidentImg,

  "kraft paper pouches": kraftPaperImg,
  "zip lock pouches": zipLockPouchesImg,

  "box sealing tape": boxSealingTapeImg,
};

function iconFor(type, className) {
  if (type === "bottle") return <BottleIcon className={className} />;
  if (type === "bag") return <BagIcon className={className} />;
  if (type === "shirt") return <ShirtIcon className={className} />;
  return <CubeIcon className={className} />;
}

function ProductPlaceholder({ name, index }) {
  const navigate = useNavigate();
  const exactName = normalizeLabel(name);
  const baseName = name.replace(/\s*\d+$/, "");
  const image =
    productImages[exactName] || productImages[normalizeLabel(baseName)];
  const tones = [
    "from-[#d9c7aa] via-[#b99a6b] to-[#f3eadf]",
    "from-[#f0ddba] via-[#bd9050] to-[#fff6e8]",
    "from-[#cfd9d7] via-[#80999b] to-[#edf4f4]",
    "from-[#f2efe7] via-[#b7afa1] to-[#ffffff]",
    "from-[#e4dfd1] via-[#a88964] to-[#f7efe5]",
    "from-[#d9e6e4] via-[#8ba19d] to-[#f7fbfa]",
  ];

  return (
    <article
      onClick={() => {
        const url = modelMappings[name] || null;
        navigate("/editor", { state: { initialModelUrl: url } });
      }}
      className="group cursor-pointer rounded-[8px] border border-transparent bg-white p-2 shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-[#d7c9bd] hover:shadow-[0_18px_34px_rgba(15,23,42,0.16)] max-w-[330px] xl:max-w-none w-full"
    >
      <div
        className={`relative aspect-[5/4] overflow-hidden rounded-[8px] bg-gradient-to-br ${tones[index % tones.length]}`}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute inset-x-8 bottom-8 top-12 rounded-[6px] border border-white/70 bg-white/45 shadow-[0_18px_40px_rgba(31,41,55,0.22)]" />
            <div className="absolute bottom-7 left-1/2 h-3 w-24 -translate-x-1/2 rounded-full bg-black/10 blur-sm" />
          </>
        )}
      </div>
      <h3 className="mt-3 truncate text-[17px] font-bold text-[#2b2b2b] transition-colors duration-200 group-hover:text-[#cc6428]">
        {name}
      </h3>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          const url = modelMappings[name] || null;
          navigate("/editor", { state: { initialModelUrl: url } });
        }}
        className="mt-2 h-10 w-full rounded-[6px] border-none bg-[#4f673f] text-[16px] font-medium text-white transition-all duration-200 hover:bg-[#cc6428] hover:shadow-[0_8px_16px_rgba(193,95,39,0.25)] cursor-pointer"
      >
        Customize
      </button>
    </article>
  );
}

function normalizeLabel(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function sidebarIconType(label) {
  return normalizeLabel(label);
}

const categoryColors = {
  "all": "#D2692B",
  "food containers": "#6B7062",
  "food packaging": "#507AA5",
  "drinkware bottles": "#948C5B",
  "carton boxes": "#79757A",
  "eco friendly bags": "#5E6B3C",
  "packaging tapes": "#967A6C",
  "fashion wear": "#80715B",
};

const unselectedIconColors = {
  "all": "#873E14",
  "food containers": "#4F5348",
  "food packaging": "#34577E",
  "drinkware bottles": "#6D673F",
  "carton boxes": "#524F53",
  "eco friendly bags": "#404B27",
  "packaging tapes": "#6E584D",
  "fashion wear": "#5A4E3E",
};

function SidebarItem({
  label,
  active,
  icon,
  onClick,
  isGroup,
  expanded,
  hasChildren,
  parentActive,
  count,
}) {
  const inactiveClass = "bg-white/50 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-white/60 text-[#858585] hover:bg-white/80 hover:shadow-[0_4px_15px_rgba(0,0,0,0.06)] hover:text-[#37472F]";
  const isActive = active || parentActive;
  const activeBg = categoryColors[normalizeLabel(label)] || "#D2692B";

  const iconSrc = sidebarIcons[icon] || (typeof icon === 'string' && icon.includes('/') ? icon : cartonBox);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-auto lg:w-full shrink-0 cursor-pointer items-center justify-between gap-4 rounded-[8px] py-2 px-3 xl:py-3 xl:px-4 transition-all duration-300 ${
        isActive ? "border border-transparent text-white font-bold" : inactiveClass
      } text-[13px] xl:text-[clamp(13px,1.45vw,16px)] font-bold`}
      style={
        isActive
          ? {
              backgroundColor: activeBg,
              boxShadow: `0 4px 12px ${activeBg}40`,
            }
          : {}
      }
    >
      <div className="flex items-center gap-3">
        <div
          style={{
            width: "24px",
            height: "24px",
            flexShrink: 0,
            backgroundColor: isActive ? "#ffffff" : (unselectedIconColors[normalizeLabel(label)] || "#873E14"),
            WebkitMaskImage: `url(${iconSrc})`,
            maskImage: `url(${iconSrc})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            transition: "all 0.3s ease",
          }}
        />
        <span>{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className={`text-[14px] px-2.5 py-0.5 rounded-full transition-colors ${
          isActive ? "bg-white/25 text-white" : "bg-black/5 text-[#6b6b6b]"
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function ModelsMockupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);
  
  const initialCategory = location.state?.activeCategory || "All";
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  
  const [expandedGroups, setExpandedGroups] = useState({ 
    All: true,
    ...(initialCategory !== "All" && { [initialCategory]: true })
  });

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Initial mount GSAP animations
    const sidebarHeader = document.querySelector(".sidebar-header");
    const sidebarItems = document.querySelectorAll(".sidebar-items > div, .sidebar-items > button");
    const mockupBanner = document.querySelector(".mockup-banner-wrap");

    // Set initial states to avoid flashing
    gsap.set([sidebarHeader, mockupBanner], { opacity: 0 });
    gsap.set(sidebarItems, { opacity: 0, x: -20 });

    const tl = gsap.timeline({
      onComplete: () => setHasLoaded(true)
    });
    
    tl.to(sidebarHeader, { opacity: 1, duration: 0.6, ease: "power2.out" })
      .to(sidebarItems, { opacity: 1, x: 0, duration: 0.5, stagger: 0.04, ease: "power2.out" }, "-=0.3")
      .fromTo(mockupBanner, { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.4");
  }, []);



  useEffect(() => {
    if (location.state?.activeCategory) {
      setActiveCategory(location.state.activeCategory);
      setExpandedGroups((prev) => ({
        ...prev,
        [location.state.activeCategory]: true
      }));
    }
  }, [location.state?.activeCategory]);

  useEffect(() => {
    if (scrollRef.current) {
      if (activeCategory === "All") {
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setTimeout(() => {
          const firstSection = scrollRef.current?.querySelector(".space-y-10 > section");
          if (firstSection) {
            firstSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    }
  }, [activeCategory]);

  const toggleGroup = (groupTitle) => {
    setExpandedGroups((prev) => ({
      [groupTitle]: !prev[groupTitle],
    }));
  };

  const displayedSections = useMemo(() => {
    if (activeCategory === "All") {
      return catalogSections;
    }
    const active = normalizeLabel(activeCategory);
    const alias = productAliases[active] ?? active;

    return catalogSections
      .map((section) => {
        const sectionLabels = [
          section.title,
          ...(section.sidebarLabels ?? []),
        ].map(normalizeLabel);
        const isSectionMatch = sectionLabels.includes(alias);

        if (isSectionMatch) {
          return section;
        }

        const products = section.products.filter(
          (product) => normalizeLabel(product) === alias,
        );
        if (!products.length) return null;

        return {
          ...section,
          title: activeCategory,
          products,
        };
      })
      .filter(Boolean);
  }, [activeCategory]);

  // Animate products when activeCategory / displayedSections updates using ScrollTrigger
  useEffect(() => {
    // Kill any existing ScrollTrigger instances for the cards to avoid memory leaks/conflicts
    const triggers = ScrollTrigger.getAll();
    triggers.forEach((trigger) => {
      if (trigger.trigger && typeof trigger.trigger === 'object' && trigger.trigger.closest && trigger.trigger.closest('.products-container')) {
        trigger.kill();
      }
    });

    const sections = scrollRef.current?.querySelectorAll(".products-container > section");
    if (sections && sections.length > 0) {
      sections.forEach((section) => {
        const heading = section.querySelector("div");
        const cards = section.querySelectorAll("article");
        
        if (cards.length === 0) return;

        // Set initial state of elements
        gsap.set(heading, { opacity: 0, y: 15 });
        gsap.set(cards, { opacity: 0, y: 35, scale: 0.95 });

        // Trigger animation when the section scrolls into view
        ScrollTrigger.create({
          trigger: section,
          scroller: scrollRef.current, // Target the scroll container!
          start: "top 92%", // Triggers when the top of the section reaches 92% of the viewport height
          onEnter: () => {
            gsap.to(heading, {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: "power2.out",
              overwrite: "auto"
            });
            
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              stagger: 0.08,
              ease: "power2.out",
              overwrite: "auto"
            });
          },
          toggleActions: "play none none none"
        });
      });
    }

    // Refresh ScrollTrigger to update positions
    ScrollTrigger.refresh();
  }, [displayedSections]);

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden text-[#292929]">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <main className="flex h-full w-full flex-col">
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[22%_78%] bg-[#FBF9F6]">
          <aside className="flex min-h-0 flex-col lg:border-r border-[#e5ded9] border-b lg:border-b-0 px-4 py-4 lg:py-8 lg:px-7 w-full lg:w-auto shrink-0">
            <header className="shrink-0 pb-4 lg:pb-7 sidebar-header hidden lg:block">
              <h1 className="m-0 text-[clamp(16px,2.8vw,23px)] font-bold leading-[1.05]">
                BROWSE BY CATEGORY
              </h1>
              <p className="mt-2 text-[clamp(12px,2vw,17px)] font-medium text-[#6f6f6f]">
                Premium Mockups Collection
              </p>
            </header>

            <div className="min-h-0 flex-1 overflow-x-auto lg:overflow-y-auto w-full pr-3 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <div className="flex lg:flex-col gap-2.5 lg:gap-2 pb-2 lg:pb-8 sidebar-items flex-row w-max lg:w-full overflow-x-auto lg:overflow-x-visible shrink-0">
                <SidebarItem
                  label="All"
                  isGroup={true}
                  active={activeCategory === "All"}
                  parentActive={activeCategory === "All"}
                  expanded={false}
                  hasChildren={false}
                  icon={allProducts}
                  onClick={() => {
                    setActiveCategory("All");
                  }}
                  count={catalogSections.reduce((acc, section) => acc + section.products.length, 0)}
                />

                {categoryGroups.map((group) => {
                  const isExpanded = expandedGroups[group.title];
                  const isParentActive =
                    group.items.includes(activeCategory) ||
                    activeCategory === group.title;
                  
                  const sectionInfo = catalogSections.find(s => s.title === group.title);
                  const itemCount = sectionInfo ? sectionInfo.products.length : 0;

                  return (
                    <div key={group.title} className="flex flex-row lg:flex-col gap-2.5 lg:gap-1 shrink-0">
                      <SidebarItem
                        label={group.title}
                        isGroup={true}
                        active={activeCategory === group.title}
                        parentActive={isParentActive}
                        expanded={isExpanded}
                        hasChildren={group.items.length > 0}
                        icon={sidebarIconType(group.title)}
                        onClick={() => {
                          if (group.items.length > 0) {
                            toggleGroup(group.title);
                            setActiveCategory(group.title);
                          } else {
                            setActiveCategory(group.title);
                          }
                        }}
                        count={itemCount}
                      />

                      {isExpanded && group.items.length > 0 && (
                        <div className="flex flex-col gap-1 mt-1 mb-2">
                          {group.items.map((item) => (
                            <SidebarItem
                              key={item}
                              label={item}
                              isGroup={false}
                              active={activeCategory === item}
                              icon={sidebarIconType(item)}
                              onClick={() => setActiveCategory(item)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <section
            ref={scrollRef}
            className="min-h-0 min-w-0 overflow-y-auto pb-0"
          >
            <div className="px-6 pt-8 lg:px-10 xl:px-12">
              <div className="relative mb-7 overflow-hidden rounded-[10px] shadow-[0_12px_30px_rgba(15,23,42,0.12)] mockup-banner-wrap">
                <img
                  src={mockupBanner}
                  alt="Design smarter, not harder"
                  className="block h-auto w-full"
                />
                <button
                  type="button"
                  onClick={() => navigate("/editor")}
                  aria-label="Explore more"
                  className="group absolute left-[4.2%] top-[78.4%] h-[12.5%] w-[15.2%] rounded-[10px] border-none bg-transparent cursor-pointer transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C15F27]"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-[10px] opacity-0 ring-2 ring-white/70 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="pointer-events-none absolute inset-y-0 left-[-45%] w-[35%] -skew-x-12 bg-white/30 opacity-0 transition-all duration-500 group-hover:left-[115%] group-hover:opacity-100" />
                </button>
              </div>

              <div className="space-y-10 products-container">
                {displayedSections.map((section, sectionIndex) => (
                  <section key={section.title} className="scroll-mt-7">
                    <div className="group/heading mb-5 flex w-fit cursor-default items-center gap-3">
                      <span className="text-[#7d8478] transition-colors duration-200 group-hover/heading:text-[#cc6428]">
                        {iconFor(section.icon, "h-7 w-7")}
                      </span>
                      <h2 className="m-0 text-[28px] font-extrabold leading-none text-[#3b3b3b] transition-colors duration-200 group-hover/heading:text-[#cc6428]">
                        {section.title}
                      </h2>
                    </div>
                     <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,330px))] gap-8 xl:grid-cols-2 xl:gap-9 2xl:grid-cols-3">
                      {section.products.map((product, productIndex) => (
                        <ProductPlaceholder
                          key={product}
                          name={product}
                          index={sectionIndex * 4 + productIndex}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <div className="p-10">
              <ReadyMockupBanner target="/editor" fullWidth />
            </div>
            <Footer />
          </section>
        </div>
      </main>
    </div>
  );
}
