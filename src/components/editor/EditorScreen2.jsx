import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Canvas from "./Canvas";
import RightPanel from "./RightPanel";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import * as THREE from "three";
import UploadsPopup, { DEFAULT_ASSET_COLLECTIONS } from "./UploadsPopup";
import TapeLayoutScreen from "./TapeLayoutScreen";

// ─── Font options & Loading ───────────────────────────────────────────────────
const GOOGLE_FONTS = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Oswald",
  "Source Sans Pro",
  "Slabo 27px",
  "Raleway",
  "PT Sans",
  "Merriweather",
  "Roboto Condensed",
  "Noto Sans",
  "Ubuntu",
  "Roboto Slab",
  "Lora",
  "Playfair Display",
  "Nunito",
  "Poppins",
  "Arimo",
  "Titillium Web",
  "Muli",
  "PT Serif",
  "Mukta",
  "Rubik",
  "Bitter",
  "Work Sans",
  "Quicksand",
  "Fira Sans",
  "Inconsolata",
  "Oxygen",
  "Dosis",
  "Cabin",
  "Anton",
  "Josefin Sans",
  "Libre Baskerville",
  "Arvo",
  "Hind",
  "Pacifico",
  "Crimson Text",
  "Varela Round",
  "Hind Siliguri",
  "Merriweather Sans",
  "Asap",
  "Yantramanav",
  "Dancing Script",
  "Signika",
  "Heebo",
  "Ubuntu Condensed",
  "Karla",
  "Abhaya Libre",
  "Expletus Sans",
  "Alegreya",
  "EB Garamond",
  "Zilla Slab",
  "Bungee",
  "Alfa Slab One",
  "Creepster",
  "Permanent Marker",
  "Orbitron",
  "Outfit",
].sort();

const BASE_TYPO_PRESETS = [
  {
    name: "bold",
    label: "Classic Bold",
    props: {
      bold: true,
      color: "#1a1a1a",
      shadow: true,
      shadowColor: "rgba(0,0,0,0.15)",
      shadowBlur: 8,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      stroke: false,
      style3d: false,
      textStyleName: "bold"
    }
  },
  {
    name: "outline",
    label: "Minimal Outline",
    props: {
      bold: true,
      color: "#ffffff",
      stroke: true,
      strokeColor: "#1a1a1a",
      strokeWidth: 6,
      shadow: false,
      style3d: false,
      textStyleName: "outline"
    }
  },
  {
    name: "script",
    label: "Chic Script",
    props: {
      fontFamily: '"Pacifico", cursive',
      bold: false,
      italic: false,
      color: "#c0623a",
      shadow: true,
      shadowColor: "rgba(192,98,58,0.2)",
      shadowBlur: 6,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      stroke: false,
      style3d: false,
      textStyleName: "script"
    }
  },
  {
    name: "brush",
    label: "Creative Brush",
    props: {
      fontFamily: '"Permanent Marker", sans-serif',
      bold: false,
      color: "#27272a",
      shadow: false,
      stroke: false,
      style3d: false,
      textStyleName: "brush"
    }
  },
  {
    name: "college",
    label: "College Varsity",
    props: {
      fontFamily: '"Alfa Slab One", serif',
      bold: false,
      color: "#ffffff",
      stroke: true,
      strokeColor: "#c0623a",
      strokeWidth: 8,
      letterSpacing: 4,
      shadow: true,
      shadowColor: "rgba(0,0,0,0.15)",
      shadowBlur: 4,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      style3d: false,
      textStyleName: "college"
    }
  },
  {
    name: "neon",
    label: "Neon Glow",
    props: {
      fontFamily: '"Orbitron", sans-serif',
      bold: true,
      color: "#ffffff",
      stroke: true,
      strokeColor: "#f43f5e",
      strokeWidth: 4,
      shadow: true,
      shadowColor: "#f43f5e",
      shadowBlur: 20,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      style3d: false,
      textStyleName: "neon"
    }
  },
  {
    name: "3d",
    label: "Retro 3D Shadow",
    props: {
      fontFamily: '"Bungee", sans-serif',
      bold: false,
      color: "#f59e0b",
      stroke: true,
      strokeColor: "#1e293b",
      strokeWidth: 5,
      style3d: true,
      style3dColor: "#1e293b",
      style3dDepth: 8,
      shadow: false,
      textStyleName: "3d"
    }
  },
  {
    name: "retro",
    label: "70s Retro Offset",
    props: {
      fontFamily: '"Dancing Script", cursive',
      bold: true,
      color: "#0d9488",
      shadow: true,
      shadowColor: "#f43f5e",
      shadowBlur: 0,
      shadowOffsetX: 6,
      shadowOffsetY: 6,
      stroke: true,
      strokeColor: "#ffffff",
      strokeWidth: 3,
      style3d: false,
      textStyleName: "retro"
    }
  },
  {
    name: "creepy",
    label: "Spooky Halloween",
    props: {
      fontFamily: '"Creepster", cursive',
      bold: false,
      color: "#eab308",
      stroke: true,
      strokeColor: "#1a1a1a",
      strokeWidth: 6,
      shadow: true,
      shadowColor: "#22c55e",
      shadowBlur: 15,
      style3d: false,
      textStyleName: "creepy"
    }
  },
  {
    name: "bubblegum",
    label: "Bubblegum Pop",
    props: {
      fontFamily: '"Outfit", sans-serif',
      bold: true,
      color: "#ec4899",
      stroke: true,
      strokeColor: "#ffffff",
      strokeWidth: 5,
      shadow: true,
      shadowColor: "#db2777",
      shadowBlur: 0,
      shadowOffsetX: 5,
      shadowOffsetY: 5,
      style3d: false,
      textStyleName: "bubblegum"
    }
  },
  {
    name: "glitch",
    label: "Vaporwave Glitch",
    props: {
      fontFamily: '"Orbitron", sans-serif',
      bold: true,
      color: "#06b6d4",
      shadow: true,
      shadowColor: "#ec4899",
      shadowBlur: 0,
      shadowOffsetX: -4,
      shadowOffsetY: 4,
      stroke: false,
      style3d: false,
      textStyleName: "glitch"
    }
  },
  {
    name: "editorial",
    label: "Elegant Editorial",
    props: {
      fontFamily: '"Playfair Display", serif',
      italic: true,
      bold: true,
      color: "#1e293b",
      stroke: true,
      strokeColor: "#f8fafc",
      strokeWidth: 3,
      shadow: true,
      shadowColor: "rgba(0,0,0,0.1)",
      shadowBlur: 4,
      style3d: false,
      textStyleName: "editorial"
    }
  },
  {
    name: "gold_rush",
    label: "Embose Gold Rush",
    props: {
      fontFamily: '"Alfa Slab One", serif',
      color: "#eab308",
      stroke: true,
      strokeColor: "#78350f",
      strokeWidth: 4,
      shadow: true,
      shadowColor: "#ca8a04",
      shadowBlur: 6,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      style3d: false,
      textStyleName: "gold_rush"
    }
  },
  {
    name: "sunset",
    label: "Sunset Silhouette",
    props: {
      fontFamily: '"Anton", sans-serif',
      color: "#f97316",
      stroke: true,
      strokeColor: "#7c2d12",
      strokeWidth: 4,
      shadow: true,
      shadowColor: "#facc15",
      shadowBlur: 10,
      style3d: false,
      textStyleName: "sunset"
    }
  },
  {
    name: "gothic",
    label: "Midnight Gothic",
    props: {
      fontFamily: '"EB Garamond", serif',
      bold: true,
      color: "#ffffff",
      stroke: true,
      strokeColor: "#111827",
      strokeWidth: 5,
      shadow: true,
      shadowColor: "rgba(0,0,0,0.5)",
      shadowBlur: 8,
      shadowOffsetX: 3,
      shadowOffsetY: 5,
      style3d: false,
      textStyleName: "gothic"
    }
  },
  {
    name: "comic",
    label: "Cartoon Comic",
    props: {
      fontFamily: '"Outfit", sans-serif',
      bold: true,
      color: "#facc15",
      stroke: true,
      strokeColor: "#000000",
      strokeWidth: 8,
      shadow: true,
      shadowColor: "#000000",
      shadowBlur: 0,
      shadowOffsetX: 6,
      shadowOffsetY: 6,
      style3d: false,
      textStyleName: "comic"
    }
  },
  {
    name: "cyber_green",
    label: "Cyberpunk Glow",
    props: {
      fontFamily: '"Orbitron", sans-serif',
      bold: true,
      color: "#10b981",
      stroke: true,
      strokeColor: "#064e3b",
      strokeWidth: 4,
      shadow: true,
      shadowColor: "#10b981",
      shadowBlur: 12,
      letterSpacing: 4,
      style3d: false,
      textStyleName: "cyber_green"
    }
  },
  {
    name: "coffee",
    label: "Chunky Coffee",
    props: {
      fontFamily: '"Alfa Slab One", serif',
      color: "#fed7aa",
      stroke: true,
      strokeColor: "#451a03",
      strokeWidth: 6,
      shadow: true,
      shadowColor: "#451a03",
      shadowBlur: 0,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      style3d: false,
      textStyleName: "coffee"
    }
  },
  {
    name: "candy",
    label: "Cotton Candy",
    props: {
      fontFamily: '"Dancing Script", cursive',
      bold: true,
      color: "#a855f7",
      stroke: true,
      strokeColor: "#fdf2f8",
      strokeWidth: 4,
      shadow: true,
      shadowColor: "#f472b6",
      shadowBlur: 10,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      style3d: false,
      textStyleName: "candy"
    }
  },
  {
    name: "eclipse",
    label: "Midnight Eclipse",
    props: {
      fontFamily: '"Orbitron", sans-serif',
      bold: true,
      color: "#1e1b4b",
      stroke: true,
      strokeColor: "#818cf8",
      strokeWidth: 3,
      shadow: true,
      shadowColor: "#312e81",
      shadowBlur: 12,
      style3d: false,
      textStyleName: "eclipse"
    }
  },
  {
    name: "sage",
    label: "Forest Sage",
    props: {
      fontFamily: '"Lora", serif',
      italic: true,
      color: "#14532d",
      stroke: true,
      strokeColor: "#dcfce7",
      strokeWidth: 3,
      shadow: true,
      shadowColor: "rgba(20,83,45,0.15)",
      shadowBlur: 6,
      shadowOffsetX: 3,
      shadowOffsetY: 3,
      style3d: false,
      textStyleName: "sage"
    }
  },
  {
    name: "arcade",
    label: "Retro Arcade",
    props: {
      fontFamily: '"Bungee", sans-serif',
      color: "#ec4899",
      stroke: true,
      strokeColor: "#000000",
      strokeWidth: 6,
      style3d: true,
      style3dColor: "#06b6d4",
      style3dDepth: 6,
      shadow: false,
      textStyleName: "arcade"
    }
  },
  {
    name: "rose_gold",
    label: "Rose Gold Glam",
    props: {
      fontFamily: '"Playfair Display", serif',
      bold: true,
      color: "#fda4af",
      stroke: true,
      strokeColor: "#881337",
      strokeWidth: 2.5,
      shadow: true,
      shadowColor: "#ffe4e6",
      shadowBlur: 8,
      shadowOffsetX: 1,
      shadowOffsetY: 1,
      style3d: false,
      textStyleName: "rose_gold"
    }
  },
  {
    name: "western",
    label: "Sheriff Western",
    props: {
      fontFamily: '"Alfa Slab One", serif',
      color: "#b45309",
      stroke: true,
      strokeColor: "#fef3c7",
      strokeWidth: 5,
      shadow: true,
      shadowColor: "#451a03",
      shadowBlur: 0,
      shadowOffsetX: 5,
      shadowOffsetY: 5,
      style3d: false,
      textStyleName: "western"
    }
  },
  {
    name: "frozen",
    label: "Frozen Icicle",
    props: {
      fontFamily: '"Montserrat", sans-serif',
      bold: true,
      color: "#e0f2fe",
      stroke: true,
      strokeColor: "#0284c7",
      strokeWidth: 4,
      shadow: true,
      shadowColor: "#38bdf8",
      shadowBlur: 14,
      style3d: false,
      textStyleName: "frozen"
    }
  },
  {
    name: "tattoo",
    label: "Classic Tattoo",
    props: {
      fontFamily: '"Playfair Display", serif',
      bold: true,
      italic: true,
      color: "#111827",
      stroke: true,
      strokeColor: "#dc2626",
      strokeWidth: 3.5,
      shadow: true,
      shadowColor: "rgba(0,0,0,0.3)",
      shadowBlur: 4,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      style3d: false,
      textStyleName: "tattoo"
    }
  },
  {
    name: "graffiti",
    label: "Graffiti Spray",
    props: {
      fontFamily: '"Permanent Marker", sans-serif',
      color: "#eab308",
      stroke: true,
      strokeColor: "#7c2d12",
      strokeWidth: 5,
      shadow: true,
      shadowColor: "#000000",
      shadowBlur: 0,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      style3d: false,
      textStyleName: "graffiti"
    }
  },
  {
    name: "cyber_purple",
    label: "Cyber Violet Glow",
    props: {
      fontFamily: '"Orbitron", sans-serif',
      bold: true,
      color: "#ffffff",
      stroke: true,
      strokeColor: "#c084fc",
      strokeWidth: 4,
      shadow: true,
      shadowColor: "#a855f7",
      shadowBlur: 20,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      style3d: false,
      textStyleName: "cyber_purple"
    }
  },
  {
    name: "caramel",
    label: "Warm Caramel",
    props: {
      fontFamily: '"Dancing Script", cursive',
      bold: true,
      color: "#78350f",
      stroke: true,
      strokeColor: "#fef3c7",
      strokeWidth: 4,
      shadow: true,
      shadowColor: "rgba(120,53,15,0.15)",
      shadowBlur: 6,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      style3d: false,
      textStyleName: "caramel"
    }
  },
  {
    name: "platinum",
    label: "Luxury Platinum",
    props: {
      fontFamily: '"Playfair Display", serif',
      italic: true,
      bold: true,
      color: "#f8fafc",
      stroke: true,
      strokeColor: "#334155",
      strokeWidth: 4,
      shadow: true,
      shadowColor: "rgba(148,163,184,0.3)",
      shadowBlur: 10,
      shadowOffsetX: 3,
      shadowOffsetY: 3,
      style3d: false,
      textStyleName: "platinum"
    }
  }
];

const EXTRA_DESIGNS_RAW = [
  { name: "ocean_breeze", label: "Ocean Breeze", font: "Pacifico", color: "#06b6d4", stroke: true, strokeColor: "#e0f7fa", strokeWidth: 4, shadow: true, shadowColor: "#0891b2", shadowBlur: 8 },
  { name: "electric_lemon", label: "Electric Lemon", font: "Orbitron", color: "#fef08a", stroke: true, strokeColor: "#ca8a04", strokeWidth: 4, shadow: true, shadowColor: "#facc15", shadowBlur: 15 },
  { name: "lava_flow", label: "Lava Flow", font: "Anton", color: "#ef4444", stroke: true, strokeColor: "#7f1d1d", strokeWidth: 5, shadow: true, shadowColor: "#f97316", shadowBlur: 10 },
  { name: "mint_fresh", label: "Mint Fresh", font: "Dancing Script", color: "#10b981", stroke: true, strokeColor: "#d1fae5", strokeWidth: 4, shadow: true, shadowColor: "#047857", shadowBlur: 8 },
  { name: "strawberry_cream", label: "Strawberry Cream", font: "Pacifico", color: "#f472b6", stroke: true, strokeColor: "#fff1f2", strokeWidth: 3, shadow: true, shadowColor: "#db2777", shadowBlur: 6 },
  { name: "royal_sapphire", label: "Royal Sapphire", font: "Playfair Display", color: "#1d4ed8", stroke: true, strokeColor: "#dbeafe", strokeWidth: 4, shadow: true, shadowColor: "#1e3a8a", shadowBlur: 10 },
  { name: "vintage_denim", label: "Vintage Denim", font: "Alfa Slab One", color: "#2563eb", stroke: true, strokeColor: "#ffffff", strokeWidth: 5, shadow: true, shadowColor: "#1e3a8a", shadowBlur: 0, shadowOffsetX: 4, shadowOffsetY: 4 },
  { name: "desert_sand", label: "Desert Sand", font: "Lora", color: "#d97706", stroke: true, strokeColor: "#fef3c7", strokeWidth: 3, shadow: true, shadowColor: "#78350f", shadowBlur: 6 },
  { name: "orchid_mist", label: "Orchid Mist", font: "Dancing Script", color: "#d8b4fe", stroke: true, strokeColor: "#581c87", strokeWidth: 3, shadow: true, shadowColor: "#a855f7", shadowBlur: 10 },
  { name: "toxic_waste", label: "Toxic Waste", font: "Creepster", color: "#22c55e", stroke: true, strokeColor: "#052e16", strokeWidth: 6, shadow: true, shadowColor: "#a3e635", shadowBlur: 12 },
  { name: "space_cadet", label: "Space Cadet", font: "Orbitron", color: "#e0e7ff", stroke: true, strokeColor: "#312e81", strokeWidth: 4, shadow: true, shadowColor: "#4f46e5", shadowBlur: 12 },
  { name: "peachy_keen", label: "Peachy Keen", font: "Pacifico", color: "#f97316", stroke: true, strokeColor: "#fff7ed", strokeWidth: 4, shadow: true, shadowColor: "#ea580c", shadowBlur: 6 },
  { name: "velvet_rose", label: "Velvet Rose", font: "Playfair Display", color: "#991b1b", stroke: true, strokeColor: "#ffe4e6", strokeWidth: 3, shadow: true, shadowColor: "#991b1b", shadowBlur: 8 },
  { name: "neon_toxic", label: "Neon Toxic", font: "Orbitron", color: "#ffffff", stroke: true, strokeColor: "#22c55e", strokeWidth: 4, shadow: true, shadowColor: "#22c55e", shadowBlur: 20 },
  { name: "retro_sunset", label: "Retro Sunset", font: "Anton", color: "#fdba74", stroke: true, strokeColor: "#7c2d12", strokeWidth: 4, shadow: true, shadowColor: "#ea580c", shadowBlur: 10 },
  { name: "luxury_ruby", label: "Luxury Ruby", font: "Playfair Display", color: "#be123c", stroke: true, strokeColor: "#f1f5f9", strokeWidth: 4, shadow: true, shadowColor: "rgba(190,18,60,0.3)", shadowBlur: 10 },
  { name: "sage_garden", label: "Sage Garden", font: "Lora", color: "#166534", stroke: true, strokeColor: "#f0fdf4", strokeWidth: 3, shadow: true, shadowColor: "#14532d", shadowBlur: 6 },
  { name: "cherry_blossom", label: "Cherry Blossom", font: "Dancing Script", color: "#fbcfe8", stroke: true, strokeColor: "#be185d", strokeWidth: 3, shadow: true, shadowColor: "#f472b6", shadowBlur: 8 },
  { name: "electric_violet", label: "Electric Violet", font: "Orbitron", color: "#8b5cf6", stroke: true, strokeColor: "#1e1b4b", strokeWidth: 4, shadow: true, shadowColor: "#c084fc", shadowBlur: 15 },
  { name: "cream_soda", label: "Cream Soda", font: "Pacifico", color: "#fef08a", stroke: true, strokeColor: "#854d0e", strokeWidth: 3, shadow: true, shadowColor: "#fef08a", shadowBlur: 8 },
  { name: "chocolate_fudge", label: "Chocolate Fudge", font: "Alfa Slab One", color: "#3f2f2f", stroke: true, strokeColor: "#ffedd5", strokeWidth: 4, shadow: true, shadowColor: "#3f2f2f", shadowBlur: 6 },
  { name: "skyline", label: "Midnight Skyline", font: "Orbitron", color: "#3b82f6", stroke: true, strokeColor: "#1e1b4b", strokeWidth: 4, shadow: true, shadowColor: "#60a5fa", shadowBlur: 12 },
  { name: "banana_split", label: "Banana Split", font: "Bungee", color: "#fef08a", stroke: true, strokeColor: "#78350f", strokeWidth: 6, shadow: true, shadowColor: "#ea580c", shadowBlur: 0, shadowOffsetX: 4, shadowOffsetY: 4 },
  { name: "forest_moss", label: "Forest Moss", font: "Permanent Marker", color: "#14532d", stroke: true, strokeColor: "#dcfce7", strokeWidth: 4, shadow: false },
  { name: "candy_apple", label: "Candy Apple", font: "Anton", color: "#dc2626", stroke: true, strokeColor: "#ffffff", strokeWidth: 4, shadow: true, shadowColor: "#7f1d1d", shadowBlur: 8 },
  { name: "silver_bullet", label: "Silver Bullet", font: "Orbitron", color: "#f1f5f9", stroke: true, strokeColor: "#475569", strokeWidth: 4, shadow: true, shadowColor: "#94a3b8", shadowBlur: 10 },
  { name: "copper_canyon", label: "Copper Canyon", font: "Alfa Slab One", color: "#c2410c", stroke: true, strokeColor: "#ffedd5", strokeWidth: 5, shadow: true, shadowColor: "#7c2d12", shadowBlur: 8 },
  { name: "amethyst", label: "Amethyst Aura", font: "Playfair Display", color: "#a855f7", stroke: true, strokeColor: "#faf5ff", strokeWidth: 3, shadow: true, shadowColor: "#7e22ce", shadowBlur: 12 },
  { name: "tangerine", label: "Tangerine Dream", font: "Pacifico", color: "#f97316", stroke: true, strokeColor: "#fff7ed", strokeWidth: 3.5, shadow: true, shadowColor: "#ea580c", shadowBlur: 8 },
  { name: "pistachio", label: "Sweet Pistachio", font: "Dancing Script", color: "#86efac", stroke: true, strokeColor: "#14532d", strokeWidth: 3.5, shadow: true, shadowColor: "#22c55e", shadowBlur: 8 },
  { name: "coral_reef", label: "Coral Reef", font: "Montserrat", color: "#ff7a59", stroke: true, strokeColor: "#ffffff", strokeWidth: 4, shadow: true, shadowColor: "#ff7a59", shadowBlur: 10 },
  { name: "blueberry", label: "Blueberry Jam", font: "Pacifico", color: "#2563eb", stroke: true, strokeColor: "#ffffff", strokeWidth: 4, shadow: true, shadowColor: "#1d4ed8", shadowBlur: 8 },
  { name: "dusty_rose", label: "Dusty Rose", font: "Lora", color: "#fda4af", stroke: true, strokeColor: "#4c0519", strokeWidth: 3, shadow: true, shadowColor: "#fda4af", shadowBlur: 6 },
  { name: "limelight", label: "Lime Light", font: "Orbitron", color: "#84cc16", stroke: true, strokeColor: "#065f46", strokeWidth: 4, shadow: true, shadowColor: "#84cc16", shadowBlur: 12 },
  { name: "gold_dust", label: "Gold Dust", font: "Playfair Display", color: "#fbbf24", stroke: true, strokeColor: "#78350f", strokeWidth: 3, shadow: true, shadowColor: "#fbbf24", shadowBlur: 10 },
  { name: "charcoal", label: "Charcoal Sketch", font: "Permanent Marker", color: "#18181b", stroke: true, strokeColor: "#f4f4f5", strokeWidth: 3, shadow: false },
  { name: "glacier", label: "Glacier Ice", font: "Outfit", color: "#e0f2fe", stroke: true, strokeColor: "#0284c7", strokeWidth: 4, shadow: true, shadowColor: "#38bdf8", shadowBlur: 10 },
  { name: "sunflower", label: "Bright Sunflower", font: "Anton", color: "#eab308", stroke: true, strokeColor: "#451a03", strokeWidth: 4, shadow: true, shadowColor: "#ca8a04", shadowBlur: 8 },
  { name: "bubble_tea", label: "Bubble Tea", font: "Pacifico", color: "#d97706", stroke: true, strokeColor: "#ffedd5", strokeWidth: 4, shadow: true, shadowColor: "#b45309", shadowBlur: 6 },
  { name: "hot_chili", label: "Hot Chili", font: "Permanent Marker", color: "#ef4444", stroke: true, strokeColor: "#7f1d1d", strokeWidth: 4, shadow: true, shadowColor: "#ef4444", shadowBlur: 8 },
  { name: "cotton_candy_alt", label: "Sweet Fluff", font: "Dancing Script", color: "#f472b6", stroke: true, strokeColor: "#faf5ff", strokeWidth: 4, shadow: true, shadowColor: "#c084fc", shadowBlur: 8 },
  { name: "galaxy", label: "Galaxy Star", font: "Orbitron", color: "#ffffff", stroke: true, strokeColor: "#3b82f6", strokeWidth: 4, shadow: true, shadowColor: "#8b5cf6", shadowBlur: 20 },
  { name: "espresso", label: "Espresso Bold", font: "Alfa Slab One", color: "#451a03", stroke: true, strokeColor: "#fef3c7", strokeWidth: 4, shadow: true, shadowColor: "#451a03", shadowBlur: 6 },
  { name: "pumpkin", label: "Pumpkin Spice", font: "Pacifico", color: "#ea580c", stroke: true, strokeColor: "#ffedd5", strokeWidth: 4, shadow: true, shadowColor: "#c2410c", shadowBlur: 8 },
  { name: "matcha", label: "Matcha Green", font: "Lora", color: "#65a30d", stroke: true, strokeColor: "#f7fee7", strokeWidth: 3, shadow: true, shadowColor: "#4d7c0f", shadowBlur: 6 },
  { name: "teal_glow", label: "Teal Glow", font: "Orbitron", color: "#ffffff", stroke: true, strokeColor: "#0d9488", strokeWidth: 4, shadow: true, shadowColor: "#0d9488", shadowBlur: 20 },
  { name: "mustard", label: "Vintage Mustard", font: "Alfa Slab One", color: "#eab308", stroke: true, strokeColor: "#ffffff", strokeWidth: 5, shadow: true, shadowColor: "#854d0e", shadowBlur: 0, shadowOffsetX: 4, shadowOffsetY: 4 },
  { name: "neon_orange", label: "Radioactive", font: "Orbitron", color: "#ffffff", stroke: true, strokeColor: "#f97316", strokeWidth: 4, shadow: true, shadowColor: "#f97316", shadowBlur: 20 },
  { name: "plum", label: "Sugar Plum", font: "Dancing Script", color: "#86198f", stroke: true, strokeColor: "#fdf4ff", strokeWidth: 4, shadow: true, shadowColor: "#a21caf", shadowBlur: 8 },
  { name: "pearl", label: "Ocean Pearl", font: "Playfair Display", color: "#f8fafc", stroke: true, strokeColor: "#94a3b8", strokeWidth: 3, shadow: true, shadowColor: "#cbd5e1", shadowBlur: 10 }
];

const EXTRA_PRESETS = EXTRA_DESIGNS_RAW.map((raw) => ({
  name: raw.name,
  label: raw.label,
  props: {
    fontFamily: `"${raw.font}", sans-serif`,
    bold: raw.bold || false,
    italic: raw.italic || false,
    underline: false,
    color: raw.color,
    stroke: raw.stroke || false,
    strokeColor: raw.strokeColor || "#000000",
    strokeWidth: raw.strokeWidth || 4,
    shadow: raw.shadow !== undefined ? raw.shadow : true,
    shadowColor: raw.shadowColor || "#000000",
    shadowBlur: raw.shadowBlur || 0,
    shadowOffsetX: raw.shadowOffsetX || 0,
    shadowOffsetY: raw.shadowOffsetY || 0,
    style3d: false,
    style3dColor: "#000000",
    style3dDepth: 0,
    textStyleName: raw.name
  }
}));

const TYPO_PRESETS = [
  ...BASE_TYPO_PRESETS,
  ...EXTRA_PRESETS
];

function PresetDropdown({ presets, textProps, selectedLayerText, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const originalPropsRef = useRef(null);

  const activePreset = useMemo(() => {
    return presets.find((p) => p.name === textProps.textStyleName) || presets[0];
  }, [presets, textProps.textStyleName]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        if (isOpen && originalPropsRef.current) {
          onSelect(originalPropsRef.current);
          originalPropsRef.current = null;
        }
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onSelect]);

  useEffect(() => {
    presets.forEach((p) => {
      if (p.props.fontFamily) {
        loadFont(p.props.fontFamily);
      }
    });
  }, [presets]);

  const handleOpenDropdown = () => {
    originalPropsRef.current = { ...textProps };
    setIsOpen((prev) => !prev);
  };

  const renderPresetPreview = (preset) => {
    return (
      <div
        className="font-bold text-base select-none text-left truncate max-w-[65%]"
        style={{
          fontFamily: preset.props.fontFamily ? preset.props.fontFamily.replace(/['"]/g, "") : "Outfit, sans-serif",
          fontWeight: preset.props.bold ? "bold" : "normal",
          fontStyle: preset.props.italic ? "italic" : "normal",
          textDecoration: preset.props.underline ? "underline" : "none",
          color: preset.props.color || "#000000",
          letterSpacing: (preset.props.letterSpacing || 0) / 10 + "px",
          WebkitTextStroke: preset.props.stroke
            ? `0.5px ${preset.props.strokeColor}`
            : "none",
          textShadow: preset.props.style3d
            ? `0.5px 0.5px ${preset.props.style3dColor}, 1px 1px ${preset.props.style3dColor}, 1.5px 1.5px ${preset.props.style3dColor}`
            : preset.props.shadow && preset.props.shadowBlur > 10 && preset.props.shadowOffsetX === 0
            ? `0 0 5px ${preset.props.shadowColor}`
            : preset.props.shadow && preset.props.shadowBlur === 0 && preset.props.shadowOffsetX !== 0
            ? `${preset.props.shadowOffsetX / 2}px ${preset.props.shadowOffsetY / 2}px 0px ${preset.props.shadowColor}`
            : preset.name === "glitch"
            ? `-2px 2px 0px ${preset.props.shadowColor}`
            : preset.props.shadow
            ? `${preset.props.shadowOffsetX / 15}px ${preset.props.shadowOffsetY / 15}px ${preset.props.shadowBlur / 15}px ${preset.props.shadowColor}`
            : "none",
        }}
      >
        {selectedLayerText ? (selectedLayerText.length > 15 ? selectedLayerText.substring(0, 15) + "..." : selectedLayerText) : "Text"}
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleOpenDropdown}
        className="w-full flex items-center justify-between gap-3 px-3 py-1.5 rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100/80 transition-all cursor-pointer outline-none shadow-sm"
      >
        {renderPresetPreview(activePreset)}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-gray-500 capitalize">
            {activePreset.label}
          </span>
          <svg
            className={`w-4 h-4 text-gray-800 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-xl border border-gray-200 shadow-xl z-50 max-h-[300px] overflow-y-auto p-1.5 flex flex-col gap-1.5"
          onMouseLeave={() => {
            if (originalPropsRef.current) {
              onSelect(originalPropsRef.current);
            }
          }}
        >
          {presets.map((preset) => {
            const isSelected = textProps.textStyleName === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onMouseEnter={() => {
                  onSelect(preset.props);
                }}
                onClick={() => {
                  originalPropsRef.current = null;
                  onSelect(preset.props);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border-2 transition-all cursor-pointer outline-none ${
                  isSelected
                    ? "border-[#c0623a] bg-orange-50/30 shadow-sm"
                    : "border-transparent bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {renderPresetPreview(preset)}
                <span className="text-[10px] font-bold text-gray-800 capitalize text-right ml-2 shrink-0">
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const loadFont = (fontFamily) => {
  if (!fontFamily) return;
  const family = fontFamily.split(",")[0].replace(/['"]/g, "").trim();
  const fontId = `font-${family.replace(/\s+/g, "-")}`;
  if (!document.getElementById(fontId)) {
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/\s+/g, "+")}:ital,wght@0,400;0,700;1,400;1,700&display=swap`;
    document.head.appendChild(link);
  }
};

const FontSelect = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadFont(value);
  }, [value]);

  useEffect(() => {
    if (isOpen) {
      // Preload all fonts so they render correctly in the dropdown list
      GOOGLE_FONTS.forEach((font) => loadFont(`"${font}", sans-serif`));
    }
  }, [isOpen]);

  const filteredFonts = GOOGLE_FONTS.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase()),
  );
  const displayValue = value.split(",")[0].replace(/['"]/g, "").trim();

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 font-medium flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
        style={{ fontFamily: value }}
      >
        <span>{displayValue}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 bottom-full mb-1 w-full bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden flex flex-col max-h-[300px]">
          <div className="p-2 border-b border-gray-100 shrink-0 bg-gray-50/50">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3.5 h-3.5 text-gray-800 absolute left-2.5 top-1/2 -translate-y-1/2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fonts..."
                className="w-full bg-white border border-gray-200 rounded-lg py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:border-[#c0623a] transition-colors"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            {filteredFonts.map((font) => (
              <div
                key={font}
                onClick={() => {
                  const fontVal = `"${font}", sans-serif`;
                  loadFont(fontVal);
                  onChange(fontVal);
                  setIsOpen(false);
                  setSearch("");
                }}
                onMouseEnter={() => loadFont(`"${font}", sans-serif`)}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-[#fff5f0] hover:text-[#c0623a] rounded-lg cursor-pointer transition-colors"
                style={{ fontFamily: `"${font}", sans-serif` }}
              >
                {font}
              </div>
            ))}
            {filteredFonts.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-800 text-center">
                No fonts found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function EditorScreen2({
  onBack,
  isActive,
  modelUrl,
  setModelUrl,
  appliedMaterials,
  appliedColors,
  appliedLastApplied,
  canvasResetKey,
  sceneBgColor,
  sceneBgImage,
  selectedCapUrl,
  onSelectCap,
  selectedMaterial,
  isPopupMode = false,
  onClosePopup,
  isEmbeddedMode = false,
  onLiveTextureUpdate,
  activeTab,
  setActiveTab,
  onExpandedPanelChange,
}) {
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [textExpanded, setTextExpanded] = useState(false);
  const [selectedUploadType, setSelectedUploadType] = useState("logo"); // for embedded horizontal uploads bar
  const [defaultAssetTab, setDefaultAssetTab] = useState("T-Shirt"); // for default assets row
  const [showDefaultAssets, setShowDefaultAssets] = useState(false);   // expand toggle
  const embeddedFileInputRef = useRef(null);
  const [showTapeLayout, setShowTapeLayout] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const textureCanvasRef = useRef(null);
  const [textureVersion, setTextureVersion] = useState(0);
  const canvasRef = useRef(null);

  // Popup-mode fullscreen state
  const [isFullscreenPopup, setIsFullscreenPopup] = useState(false);

  // Popup size state (resizable)
  const [popupSize, setPopupSize] = useState({ width: 900, height: 600 });
  const popupResizeRef = useRef({
    resizing: false,
    dir: 'se',
    startX: 0,
    startY: 0,
    origWidth: 0,
    origHeight: 0,
  });

  // Auto-collapse text expanded row when switching away from text tab
  useEffect(() => {
    if (activeTab !== "text") {
      setTextExpanded(false);
    }
    if (activeTab !== "uploads") {
      setShowDefaultAssets(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (onExpandedPanelChange) {
      onExpandedPanelChange(textExpanded || showDefaultAssets);
    }
  }, [textExpanded, showDefaultAssets, onExpandedPanelChange]);

  // Attach window-level listeners so resize works even when cursor moves outside handle
  useEffect(() => {
    const onMove = (e) => {
      const r = popupResizeRef.current;
      if (!r.resizing) return;
      const dx = e.clientX - r.startX;
      const dy = e.clientY - r.startY;
      const dir = r.dir;
      setPopupSize((prev) => {
        let newW = prev.width;
        let newH = prev.height;
        if (dir.includes('e')) newW = Math.max(520, Math.min(window.innerWidth - 40, r.origWidth + dx));
        if (dir.includes('s')) newH = Math.max(400, Math.min(window.innerHeight - 40, r.origHeight + dy));
        if (dir.includes('w')) newW = Math.max(520, Math.min(window.innerWidth - 40, r.origWidth - dx));
        if (dir.includes('n')) newH = Math.max(400, Math.min(window.innerHeight - 40, r.origHeight - dy));
        return { width: newW, height: newH };
      });
    };
    const onUp = () => { popupResizeRef.current.resizing = false; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  const startResize = (dir) => (e) => {
    if (isFullscreenPopup) return;
    e.stopPropagation();
    e.preventDefault();
    popupResizeRef.current = {
      resizing: true,
      dir,
      startX: e.clientX,
      startY: e.clientY,
      origWidth: popupSize.width,
      origHeight: popupSize.height,
    };
  };

  // Popup drag state
  const popupDragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

  const handlePopupDragStart = (e) => {
    if (isFullscreenPopup) return;
    popupDragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: popupPos.x, origY: popupPos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePopupDragMove = (e) => {
    if (!popupDragRef.current.dragging) return;
    const dx = e.clientX - popupDragRef.current.startX;
    const dy = e.clientY - popupDragRef.current.startY;
    setPopupPos({ x: popupDragRef.current.origX + dx, y: popupDragRef.current.origY + dy });
  };
  const handlePopupDragEnd = (e) => {
    popupDragRef.current.dragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const [wireframe, setWireframe] = useState(false);
  const [showUv, setShowUv] = useState(true);
  const [fullUv, setFullUv] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [selectedColor, setSelectedColor] = useState("none");
  const [isFrameSelected, setIsFrameSelected] = useState(false);
  const [currentSelectedFaces, setCurrentSelectedFaces] = useState(new Set());
  const [pendingTapeLayoutDataUrl, setPendingTapeLayoutDataUrl] =
    useState(null);

  // Tape layout floating container dragging
  const [tapeLayoutPos, setTapeLayoutPos] = useState({
    x: typeof window !== "undefined" ? window.innerWidth / 2 - 128 : 0,
    y: 100,
  });
  const [isDraggingTape, setIsDraggingTape] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startPosX: 0, startPosY: 0 });

  // Right Panel vertical dragging
  const [rightPanelY, setRightPanelY] = useState(24);
  const [isDraggingRightPanel, setIsDraggingRightPanel] = useState(false);
  const rightPanelDragStart = useRef({ mouseY: 0, startY: 0 });
  const rightPanelRef = useRef(null);

  const handleRightPanelPointerDown = (e) => {
    if (e.button !== 0) return;
    setIsDraggingRightPanel(true);
    rightPanelDragStart.current = {
      mouseY: e.clientY,
      startY: rightPanelY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleRightPanelPointerMove = (e) => {
    if (!isDraggingRightPanel) return;
    const dy = e.clientY - rightPanelDragStart.current.mouseY;
    let newY = rightPanelDragStart.current.startY + dy;

    if (typeof window !== "undefined") {
      const panelHeight = rightPanelRef.current
        ? rightPanelRef.current.offsetHeight
        : 500;
      const maxY = window.innerHeight - panelHeight - 24;
      newY = Math.max(24, Math.min(newY, maxY));
    }
    setRightPanelY(newY);
  };

  const handleRightPanelPointerUp = (e) => {
    if (isDraggingRightPanel) {
      setIsDraggingRightPanel(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  useEffect(() => {
    if (pendingTapeLayoutDataUrl && typeof window !== "undefined") {
      setTapeLayoutPos({ x: window.innerWidth / 2 - 128, y: 100 });
    }
  }, [pendingTapeLayoutDataUrl]);

  const handleTapePointerDown = (e) => {
    setIsDraggingTape(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPosX: tapeLayoutPos.x,
      startPosY: tapeLayoutPos.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDraggingTape) return;
    const handleMove = (e) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      let newX = dragStartRef.current.startPosX + dx;
      let newY = dragStartRef.current.startPosY + dy;

      // Add boundary constraints
      if (typeof window !== "undefined") {
        const maxX = window.innerWidth - 256; // 256px is roughly w-64
        const maxY = window.innerHeight - 100;
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(80, Math.min(newY, maxY)); // Protect top navbar (80px)
      }

      setTapeLayoutPos({ x: newX, y: newY });
    };
    const handleUp = () => setIsDraggingTape(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [isDraggingTape]);

  // ── Left panel tab ───────────────────────────────────────────────────────
  const [leftTab, setLeftTab] = useState("uploads"); // 'uploads' | 'text'

  // ── Uploaded images ──────────────────────────────────────────────────────
  const [uploadedImages, setUploadedImages] = useState(() => {
    try {
      const saved = localStorage.getItem("fisto_uploaded_images");
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return parsed.filter(item => {
        const url = typeof item === "string" ? item : item.url;
        return url && !url.startsWith("blob:");
      });
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "fisto_uploaded_images",
        JSON.stringify(uploadedImages),
      );
    } catch (e) {
      console.error("Failed to save uploaded images to local storage:", e);
    }
  }, [uploadedImages]);

  // Reset local state when canvasResetKey changes (user clicked "Clear Design")
  const prevResetKeyRef = useRef(canvasResetKey);
  useEffect(() => {
    if (canvasResetKey !== prevResetKeyRef.current) {
      prevResetKeyRef.current = canvasResetKey;
      setSelectedLayer(null);
      setIsFrameSelected(false);
      setCurrentSelectedFaces(new Set());
      setPendingTapeLayoutDataUrl(null);
      setShowTapeLayout(false);
      setBgColor("#ffffff");
      setSelectedColor("none");
      setTextProps({
        color: "#000000",
        fontSize: 80,
        fontFamily: "Outfit, sans-serif",
        bold: false,
        italic: false,
        underline: false,
      });
    }
  }, [canvasResetKey]);

  // ── Currently selected layer (for text formatting panel) ─────────────────
  const [selectedLayer, setSelectedLayer] = useState(null);

  const handleFaceColorChange = (color) => {
    if (canvasRef.current && canvasRef.current.applyFaceColor) {
      canvasRef.current.applyFaceColor(color);
    }
  };

  useEffect(() => {
    if (isActive) {
      setSelectedColor("none");
    }
  }, [isActive]);

  useEffect(() => {
    GOOGLE_FONTS.forEach((font) => loadFont(`"${font}", sans-serif`));
  }, []);

  // Text formatting controls state (mirrors selected layer)
  const [textProps, setTextProps] = useState({
    color: "#000000",
    fontSize: 80,
    fontFamily: "Outfit, sans-serif",
    bold: false,
    italic: false,
    underline: false,
    bend: 0,
    letterSpacing: 0,
    stroke: false,
    strokeColor: "#000000",
    strokeWidth: 4,
    shadow: false,
    shadowColor: "#000000",
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    style3d: false,
    style3dColor: "#000000",
    style3dDepth: 0,
    textStyleName: "none",
  });

  const [showAdvancedText, setShowAdvancedText] = useState(false);

  useEffect(() => {
    if (isEmbeddedMode && canvasRef.current) {
      const timer = setTimeout(() => {
        const hasArtwork = canvasRef.current.hasArtwork?.() ?? false;
        const hasSelection = canvasRef.current.hasSelectedFace?.() ?? false;
        let dataUrl = null;
        if ((hasArtwork || hasSelection) && canvasRef.current.getLiveTexture) {
          dataUrl = canvasRef.current.getLiveTexture();
        } else if (hasArtwork && textureCanvasRef.current) {
          dataUrl = textureCanvasRef.current.toDataURL("image/png");
        }
        if (onLiveTextureUpdate) {
          onLiveTextureUpdate(selectedMaterial, dataUrl);
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [textureVersion, isEmbeddedMode, selectedMaterial, onLiveTextureUpdate]);

  // ── Export Modal State ───────────────────────────────────────────────────
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportGlbChecked, setExportGlbChecked] = useState(false);
  const [exportPngChecked, setExportPngChecked] = useState(false);
  const [exportSvgChecked, setExportSvgChecked] = useState(true);
  const [exportPdfChecked, setExportPdfChecked] = useState(false);

  const handleExport = async () => {
    if (
      !exportGlbChecked &&
      !exportPngChecked &&
      !exportSvgChecked &&
      !exportPdfChecked
    ) {
      alert("Please select at least one option to export.");
      return;
    }
    setIsExporting(true);

    try {
      if (exportGlbChecked) {
        if (!modelUrl || !textureCanvasRef?.current) return;
        const loader = new GLTFLoader();
        loader.load(modelUrl, (gltf) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.flipY = true;
          texture.needsUpdate = true;
          scene.traverse((obj) => {
            if (!obj.isMesh) return;
            const mats = Array.isArray(obj.material)
              ? obj.material
              : [obj.material];
            mats.forEach((mat) => {
              if (mat && "map" in mat) {
                mat.map = texture;
                mat.needsUpdate = true;
              }
            });
          });
          const exporter = new GLTFExporter();
          exporter.parse(
            scene,
            (glb) => {
              const blob = new Blob([glb], { type: "model/gltf-binary" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "model-export.glb";
              a.click();
              URL.revokeObjectURL(url);
            },
            (err) => console.error("GLTFExporter error:", err),
            { binary: true },
          );
        });
      }

      if (exportPngChecked) {
        if (canvasRef?.current) {
          const url = canvasRef.current.exportAsPNG();
          const a = document.createElement("a");
          a.href = url;
          a.download = "texture-canvas.png";
          a.click();
        }
      }

      if (exportSvgChecked) {
        if (canvasRef?.current) {
          const svgContent = canvasRef.current.exportAsSVG();
          const blob = new Blob([svgContent], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "texture-layered.svg";
          a.click();
          URL.revokeObjectURL(url);
        }
      }

      if (exportPdfChecked) {
        if (canvasRef?.current) {
          const url = await canvasRef.current.exportAsPDF();
          const a = document.createElement("a");
          a.href = url;
          a.download = "texture-layered.pdf";
          a.click();
        }
      }
    } catch (err) {
      console.error("Export Error:", err);
    } finally {
      setIsExporting(false);
      setShowExportModal(false);
    }
  };

  const handleSelectedLayerChange = useCallback((layer) => {
    setSelectedLayer(layer);
    if (layer && layer.text !== undefined) {
      setTextProps({
        color: layer.color || "#000000",
        fontSize: layer.fontSize || 80,
        fontFamily: layer.fontFamily || "Outfit, sans-serif",
        bold: layer.bold || false,
        italic: layer.italic || false,
        underline: layer.underline || false,
        bend: layer.bend || 0,
        letterSpacing: layer.letterSpacing || 0,
        stroke: layer.stroke || false,
        strokeColor: layer.strokeColor || "#000000",
        strokeWidth: layer.strokeWidth || 4,
        shadow: layer.shadow || false,
        shadowColor: layer.shadowColor || "#000000",
        shadowBlur: layer.shadowBlur || 0,
        shadowOffsetX: layer.shadowOffsetX || 0,
        shadowOffsetY: layer.shadowOffsetY || 0,
        style3d: layer.style3d || false,
        style3dColor: layer.style3dColor || "#000000",
        style3dDepth: layer.style3dDepth || 0,
        textStyleName: layer.textStyleName || "none",
      });
      if (activeTab !== "text") setActiveTab("text");
      if (leftTab !== "text") setLeftTab("text");
    } else if (layer) {
      if (activeTab !== "uploads") setActiveTab("uploads");
      if (leftTab !== "uploads") setLeftTab("uploads");
    }
  }, [activeTab, setActiveTab, leftTab]);

  const applyTextProp = useCallback(
    (key, value) => {
      const next = { ...textProps, [key]: value };
      setTextProps(next);
      canvasRef.current?.updateSelectedTextProps({ [key]: value });
    },
    [textProps],
  );

  const applyTextPropsMulti = useCallback(
    (propsObj) => {
      const next = { ...textProps, ...propsObj };
      setTextProps(next);
      canvasRef.current?.updateSelectedTextProps(propsObj);
    },
    [textProps],
  );

  const handleSave = () => {
    const finalColor = selectedColor !== "none" ? bgColor : undefined;
    const hasArtwork = canvasRef.current?.hasArtwork?.() ?? false;
    if (hasArtwork && canvasRef.current?.getCleanTexture) {
      const dataUrl = canvasRef.current.getCleanTexture();
      onBack(dataUrl, finalColor);
    } else if (hasArtwork && textureCanvasRef.current) {
      const dataUrl = textureCanvasRef.current.toDataURL("image/png");
      onBack(dataUrl, finalColor);
    } else {
      // No artwork on canvas — pass null so EditorPage removes the texture
      // for only this material (not all materials)
      onBack(null, finalColor);
    }
  };

  const isTextLayer = selectedLayer && selectedLayer.text !== undefined;

  // Inner content (used in both popup and full-screen modes)
  const innerContent = (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white">
      <div className="flex flex-1 overflow-hidden bg-[#f5efe6]">
        {/* ── Left Side Panel ────────────────────────────────────────── */}
        {!isEmbeddedMode ? (
          <div
            className={`absolute z-20 transition-all duration-300 flex flex-col shrink-0 pointer-events-none left-0 top-0 h-full py-6 pl-6 pr-0 gap-4 ${
              showLeftPanel
                ? "w-[350px] opacity-100"
                : "w-0 opacity-0 overflow-hidden"
            }`}
          >
            {/* Header Actions / Embedded Apply buttons */}
            <div className="flex justify-start items-center gap-3 w-full shrink-0 pointer-events-auto">
              {/* Back button */}
              <button
                onClick={onBack}
                className="w-14 h-12 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center border-none cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-800"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                  />
                </svg>
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-1.5 gap-1 shrink-0 items-center pointer-events-auto">
              <button
                onClick={() => setLeftTab("uploads")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-none cursor-pointer
                ${leftTab === "uploads" ? "bg-[#c0623a] text-white shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-800"}`}
              >
                Uploads
              </button>
              <button
                onClick={() => setLeftTab("text")}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border-none cursor-pointer
                ${leftTab === "text" ? "bg-[#c0623a] text-white shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-800"}`}
              >
                Text
              </button>

              {/* Collapse button */}
              <button
                onClick={() => setShowLeftPanel(false)}
                className="py-1 px-1.5 rounded-xl bg-gray-100 hover:bg-gray-200/80 transition-all border-none cursor-pointer flex items-center justify-center shrink-0 text-gray-500 hover:text-gray-800 hover:scale-105 active:scale-95"
                title="Collapse Panel"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-7 h-7"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 9l-3 3 3 3"
                  />
                </svg>
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden flex flex-col pointer-events-auto">
              {leftTab === "uploads" && (
                <UploadsPopup
                  onUpload={(file, url, fitType, uploadType, isDefault) => {
                    const addToRecent = (finalUrl) => {
                      if (
                        finalUrl &&
                        !isDefault &&
                        !uploadedImages.some(
                          (i) => (typeof i === "string" ? i : i.url) === finalUrl,
                        )
                      ) {
                        setUploadedImages((prev) => [
                          { url: finalUrl, type: uploadType || "design" },
                          ...prev,
                        ]);
                      }
                      const target = file || finalUrl;
                      if (target) {
                        canvasRef.current?.uploadImage(target, fitType);
                      }
                    };

                    if (file && !isDefault) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        addToRecent(reader.result);
                      };
                      reader.readAsDataURL(file);
                    } else {
                      addToRecent(url);
                    }
                  }}
                  uploadedImages={uploadedImages}
                  selectedLayer={selectedLayer}
                  isImageSelected={
                    selectedLayer && selectedLayer.text === undefined
                  }
                  isFrameSelected={isFrameSelected}
                  faceColor={
                    currentSelectedFaces.size > 0
                      ? canvasRef.current?.getFaceColor?.(Array.from(currentSelectedFaces)[0]) || null
                      : null
                  }
                  onApplyFaceColor={handleFaceColorChange}
                  onApplyFit={(fitType) => {
                    canvasRef.current?.applyFitToSelectedImage(fitType);
                  }}
                  onUpdateTextureGaps={(rowGap, colGap) => {
                    canvasRef.current?.updateSelectedTextureGaps(rowGap, colGap);
                  }}
                  onDeleteUploadedImage={(url) => {
                    setUploadedImages((prev) =>
                      prev.filter(
                        (item) =>
                          (typeof item === "string" ? item : item.url) !== url,
                      ),
                    );
                  }}
                  onTogglePinUploadedImage={(url) => {
                    setUploadedImages((prev) =>
                      prev.map((item) => {
                        if (typeof item === "string") {
                          return item === url
                            ? { url: item, type: "design", pinned: true }
                            : item;
                        }
                        if (item.url === url) {
                          return { ...item, pinned: !item.pinned };
                        }
                        return item;
                      }),
                    );
                  }}
                  modelUrl={modelUrl}
                  onOpenTapeLayout={() => setShowTapeLayout(true)}
                />
              )}

              {leftTab === "text" && (
                <div className="w-full h-full min-h-0 bg-white rounded-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-y-auto flex flex-col p-6 gap-6">
                  {/* Add Text button */}
                  <div className="w-full pb-4 border-b border-gray-100 shrink-0">
                    <button
                      onClick={() => {
                        canvasRef.current?.addText("Your Text");
                      }}
                      className="w-full py-3 rounded-xl bg-[#c0623a] hover:bg-[#a65330] text-white font-semibold text-sm flex items-center justify-center gap-2 border-none cursor-pointer transition-colors shadow-sm"
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
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                      Add Text Box
                    </button>
                    <p className="text-[12px] text-gray-800 text-center mt-2">
                      Double-click a text layer to edit its content
                    </p>
                  </div>

                  {/* Formatting panel — only shows when text layer selected */}
                  {isTextLayer ? (
                    <div className="flex flex-col gap-4">
                      {/* Typography Style Presets Custom Dropdown */}
                      <div className="border-b border-gray-100 pb-4">
                        <label className="block text-[11px] font-semibold text-gray-500 mb-2.5 uppercase tracking-wide">
                          Typography Style Presets
                        </label>
                        <PresetDropdown
                          presets={TYPO_PRESETS}
                          textProps={textProps}
                          selectedLayerText={selectedLayer?.text}
                          onSelect={(presetProps) => applyTextPropsMulti(presetProps)}
                        />
                      </div>

                      {/* Font Family */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                          Font
                        </label>
                        <FontSelect
                          value={textProps.fontFamily}
                          onChange={(val) => applyTextProp("fontFamily", val)}
                        />
                      </div>

                      {/* Font Size */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                          Size — {textProps.fontSize}px
                        </label>
                        <input
                          type="range"
                          min={20}
                          max={300}
                          step={2}
                          value={textProps.fontSize}
                          onChange={(e) =>
                            applyTextProp("fontSize", Number(e.target.value))
                          }
                          className="w-full accent-[#c0623a] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-gray-800 mt-0.5">
                          <span>20px</span>
                          <span>300px</span>
                        </div>
                      </div>

                      {/* Bold / Italic / Underline */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                          Style
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => applyTextProp("bold", !textProps.bold)}
                            className={`flex-1 flex items-center justify-center py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all ${textProps.bold ? "bg-[#c0623a] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                          >
                            B
                          </button>
                          <button
                            onClick={() =>
                              applyTextProp("italic", !textProps.italic)
                            }
                            className={`flex-1 flex items-center justify-center py-2 rounded-xl text-sm border-none cursor-pointer transition-all ${textProps.italic ? "bg-[#c0623a] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                          >
                            <span className="font-serif italic font-bold leading-none text-base">
                              I
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              applyTextProp("underline", !textProps.underline)
                            }
                            className={`flex-1 flex items-center justify-center py-2 rounded-xl text-sm font-bold underline border-none cursor-pointer transition-all ${textProps.underline ? "bg-[#c0623a] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                          >
                            U
                          </button>
                        </div>
                      </div>

                      {/* Color */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                          Text Color
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-200 shrink-0 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                            <input
                              type="color"
                              value={textProps.color}
                              onInput={(e) =>
                                applyTextProp("color", e.target.value)
                              }
                              className="absolute -inset-2 w-[200%] h-[200%] p-0 border-none cursor-pointer outline-none"
                            />
                          </div>
                          <span className="text-sm font-mono text-gray-700 bg-gray-100 rounded-lg px-3 py-1.5 uppercase tracking-wider">
                            {textProps.color}
                          </span>
                        </div>
                      </div>

                    {/* Preset Colors */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Preset Colors
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "#000000",
                          "#ffffff",
                          "#c0623a",
                          "#2563eb",
                          "#16a34a",
                          "#dc2626",
                          "#9333ea",
                          "#f59e0b",
                          "#64748b",
                          "#f472b6",
                        ].map((c) => (
                          <button
                            key={c}
                            onClick={() => applyTextProp("color", c)}
                            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer"
                            style={{
                              background: c,
                              borderColor:
                                textProps.color === c ? "#c0623a" : "#e5e7eb",
                              boxShadow:
                                textProps.color === c
                                  ? "0 0 0 2px #c0623a44"
                                  : undefined,
                            }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Collapsible Advanced Settings (Curve, Spacing, Alignments, Effects) */}
                    <div className="border-t border-gray-100 pt-3">
                      <button
                        onClick={() => setShowAdvancedText(!showAdvancedText)}
                        className="w-full flex items-center justify-between py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wide border-none bg-transparent cursor-pointer hover:text-gray-800 transition-colors"
                      >
                        <span>More Effects & Spacing</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={`w-4 h-4 transition-transform duration-200 ${showAdvancedText ? 'rotate-180' : ''}`}
                        >
                          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {showAdvancedText && (
                        <div className="flex flex-col gap-4 mt-3 pb-2 transition-all">
                          {/* Blend (Arch) */}
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                              Blend (Arch) — {textProps.bend}
                            </label>
                            <input
                              type="range"
                              min={-100}
                              max={100}
                              step={1}
                              value={textProps.bend}
                              onChange={(e) =>
                                applyTextProp("bend", Number(e.target.value))
                              }
                              className="w-full accent-[#c0623a] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-gray-800 mt-0.5">
                              <span>Up</span>
                              <span>Straight</span>
                              <span>Down</span>
                            </div>
                          </div>

                          {/* Letter Spacing */}
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                              Letter Spacing — {textProps.letterSpacing}
                            </label>
                            <input
                              type="range"
                              min={-20}
                              max={100}
                              step={1}
                              value={textProps.letterSpacing}
                              onChange={(e) =>
                                applyTextProp("letterSpacing", Number(e.target.value))
                              }
                              className="w-full accent-[#c0623a] cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-gray-800 mt-0.5">
                              <span>Tight</span>
                              <span>Normal</span>
                              <span>Loose</span>
                            </div>
                          </div>

                          {/* Alignment Options */}
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                              Alignment (to Selection)
                            </label>
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    canvasRef.current?.alignSelectedLayer("left", null)
                                  }
                                  className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 border-none cursor-pointer transition-all"
                                  title="Align Left"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() =>
                                    canvasRef.current?.alignSelectedLayer("center", null)
                                  }
                                  className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 border-none cursor-pointer transition-all"
                                  title="Align Center Horizontal"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() =>
                                    canvasRef.current?.alignSelectedLayer("right", null)
                                  }
                                  className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 border-none cursor-pointer transition-all"
                                  title="Align Right"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
                                  </svg>
                                </button>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    canvasRef.current?.alignSelectedLayer(null, "top")
                                  }
                                  className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 border-none cursor-pointer transition-all"
                                  title="Align Top"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() =>
                                    canvasRef.current?.alignSelectedLayer(null, "center")
                                  }
                                  className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 border-none cursor-pointer transition-all"
                                  title="Align Center Vertical"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() =>
                                    canvasRef.current?.alignSelectedLayer(null, "bottom")
                                  }
                                  className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 border-none cursor-pointer transition-all"
                                  title="Align Bottom"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Stroke Color */}
                          {textProps.stroke && (
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                Stroke Color
                              </label>
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-200 shrink-0 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                                  <input
                                    type="color"
                                    value={textProps.strokeColor || "#000000"}
                                    onInput={(e) =>
                                      applyTextProp("strokeColor", e.target.value)
                                    }
                                    className="absolute -inset-2 w-[200%] h-[200%] p-0 border-none cursor-pointer outline-none"
                                  />
                                </div>
                                <span className="text-sm font-mono text-gray-700 bg-gray-100 rounded-lg px-3 py-1.5 uppercase tracking-wider">
                                  {textProps.strokeColor || "#000000"}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Shadow / Glow Color */}
                          {textProps.shadow && (
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                Shadow / Glow Color
                              </label>
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-200 shrink-0 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                                  <input
                                    type="color"
                                    value={textProps.shadowColor || "#000000"}
                                    onInput={(e) =>
                                      applyTextProp("shadowColor", e.target.value)
                                    }
                                    className="absolute -inset-2 w-[200%] h-[200%] p-0 border-none cursor-pointer outline-none"
                                  />
                                </div>
                                <span className="text-sm font-mono text-gray-700 bg-gray-100 rounded-lg px-3 py-1.5 uppercase tracking-wider">
                                  {textProps.shadowColor || "#000000"}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* 3D Extrusion Color */}
                          {textProps.style3d && (
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                                3D Extrusion Color
                              </label>
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-200 shrink-0 shadow-sm cursor-pointer hover:scale-105 transition-transform">
                                  <input
                                    type="color"
                                    value={textProps.style3dColor || "#000000"}
                                    onInput={(e) =>
                                      applyTextProp("style3dColor", e.target.value)
                                    }
                                    className="absolute -inset-2 w-[200%] h-[200%] p-0 border-none cursor-pointer outline-none"
                                  />
                                </div>
                                <span className="text-sm font-mono text-gray-700 bg-gray-100 rounded-lg px-3 py-1.5 uppercase tracking-wider">
                                  {textProps.style3dColor || "#000000"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="#d1d5db"
                              className="w-10 h-10"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                        />
                      </svg>
                      <p className="text-sm text-gray-600 font-medium">
                        Select a text layer on the canvas to format it
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        ) : (
          /* EMBEDDED MODE: Compact panels above bottom bar */
          (activeTab === "uploads" || activeTab === "text") && (
            <>
              {/* ── UPLOADS: slim horizontal toolbar ── */}
              {activeTab === "uploads" && (
                <div className="fixed bottom-[62px] left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-200/80 pointer-events-auto overflow-hidden w-fit max-w-[96vw] w-max">

                  {/* ── Primary row ── */}
                  <div className="py-2.5 px-3 flex flex-row items-center gap-3 overflow-x-auto no-scrollbar">

                    {/* Hidden file input */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={embeddedFileInputRef}
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file || !file.type.startsWith("image/")) return;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64Url = reader.result;
                          if (!uploadedImages.some((i) => (typeof i === "string" ? i : i.url) === base64Url)) {
                            setUploadedImages((prev) => [{ url: base64Url, type: selectedUploadType }, ...prev]);
                          }
                          canvasRef.current?.uploadImage(base64Url, undefined);
                        };
                        reader.readAsDataURL(file);
                        e.target.value = "";
                      }}
                    />

                    {/* Upload button */}
                    <button
                      onClick={() => embeddedFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#c0623a] hover:bg-[#a65330] text-white font-bold text-xs border-none cursor-pointer transition-colors shadow-sm shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      Upload Image
                    </button>

                    <div className="w-px h-5 bg-gray-200 shrink-0" />

                    {/* Fit controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-semibold text-gray-800 uppercase whitespace-nowrap">Fit</span>
                      <div className="flex gap-1">
                        {[["contain", "Contain"], ["cover", "Cover"], ["texture", "Tile"]].map(([val, label]) => (
                          <button
                            key={val}
                            onClick={() => canvasRef.current?.applyFitToSelectedImage(val)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border-none cursor-pointer transition-all ${
                              selectedLayer?.fitType === val
                                ? "bg-[#c0623a] text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Uploaded thumbnails */}
                    {uploadedImages.length > 0 && (
                      <>
                        <div className="w-px h-5 bg-gray-200 shrink-0" />
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-semibold text-gray-800 uppercase whitespace-nowrap">Recent</span>
                          <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-[220px]">
                            {uploadedImages.slice(0, 8).map((item, idx) => {
                              const url = typeof item === "string" ? item : item.url;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => canvasRef.current?.uploadImage(url, undefined)}
                                  className="w-9 h-9 rounded-lg border-2 border-gray-200 hover:border-[#c0623a] overflow-hidden shrink-0 cursor-pointer transition-all bg-gray-50 p-0"
                                  title="Apply image"
                                >
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="w-px h-5 bg-gray-200 shrink-0" />

                    {/* Assets toggle button */}
                    <button
                      onClick={() => setShowDefaultAssets((v) => !v)}
                      title="Default Assets"
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border-none cursor-pointer text-xs font-bold transition-all shrink-0 ${showDefaultAssets ? "bg-[#c0623a] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
                    >
                      Assets
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 transition-transform ${showDefaultAssets ? "rotate-180" : ""}`}>
                        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"/>
                      </svg>
                    </button>

                  </div>

                  {/* ── Default Assets expanded row ── */}
                  {showDefaultAssets && (
                    <div className="border-t border-gray-100">
                      {/* Sub-tab selector */}
                      <div className="px-3 pt-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                        {Object.keys(DEFAULT_ASSET_COLLECTIONS).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setDefaultAssetTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-none cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                              defaultAssetTab === tab
                                ? "bg-[#c0623a] text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                      {/* Thumbnail row */}
                      <div className="py-2 px-3 flex gap-1.5 overflow-x-auto no-scrollbar">
                        {(DEFAULT_ASSET_COLLECTIONS[defaultAssetTab]?.() || []).map((src, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              canvasRef.current?.uploadImage(src, "cover");
                            }}
                            className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-[#c0623a] overflow-hidden shrink-0 cursor-pointer transition-all bg-gray-50 p-0"
                            title="Apply pattern"
                          >
                            <img src={src} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TEXT: slim horizontal toolbar + expandable second row ── */}
              {activeTab === "text" && (
                <div className={`fixed bottom-[62px] left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-200/80 pointer-events-auto transition-all duration-300 flex flex-col ${isTextLayer ? "w-max" : "w-fit w-max"}`}>

                  {/* Primary row */}
                  <div className="py-2.5 px-3 flex flex-row items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar">
                    {/* Add Text */}
                    <button
                      onClick={() => canvasRef.current?.addText("Your Text")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#c0623a] hover:bg-[#a65330] text-white font-bold text-xs border-none cursor-pointer transition-colors shadow-sm shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Add Text
                    </button>

                    {isTextLayer && (
                      <>
                        <div className="w-px h-5 bg-gray-200 shrink-0" />

                        {/* Font */}
                        <div className="shrink-0 min-w-[110px]">
                          <FontSelect
                            value={textProps.fontFamily}
                            onChange={(val) => applyTextProp("fontFamily", val)}
                          />
                        </div>

                        <div className="w-px h-5 bg-gray-200 shrink-0" />

                        {/* Size */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-semibold text-gray-800 uppercase whitespace-nowrap">Size</span>
                          <input
                            type="range" min={20} max={300} step={2}
                            value={textProps.fontSize}
                            onChange={(e) => applyTextProp("fontSize", Number(e.target.value))}
                            className="w-20 accent-[#c0623a] cursor-pointer"
                          />
                          <span className="text-[10px] font-mono text-gray-600 w-7 shrink-0">
                            {typeof textProps.fontSize === "number" ? textProps.fontSize.toFixed(1) : textProps.fontSize}
                          </span>
                        </div>

                        <div className="w-px h-5 bg-gray-200 shrink-0" />

                        {/* B / I / U */}
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => applyTextProp("bold", !textProps.bold)} className={`w-7 h-7 rounded-lg text-xs font-bold border-none cursor-pointer transition-all ${textProps.bold ? "bg-[#c0623a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>B</button>
                          <button onClick={() => applyTextProp("italic", !textProps.italic)} className={`w-7 h-7 rounded-lg text-xs font-bold italic border-none cursor-pointer transition-all ${textProps.italic ? "bg-[#c0623a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>I</button>
                          <button onClick={() => applyTextProp("underline", !textProps.underline)} className={`w-7 h-7 rounded-lg text-xs font-bold underline border-none cursor-pointer transition-all ${textProps.underline ? "bg-[#c0623a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>U</button>
                        </div>

                        <div className="w-px h-5 bg-gray-200 shrink-0" />

                        {/* Color */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-semibold text-gray-800 uppercase whitespace-nowrap">Color</span>
                          <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-gray-200 shrink-0 cursor-pointer hover:scale-105 transition-transform">
                            <input
                              type="color" value={textProps.color}
                              onInput={(e) => applyTextProp("color", e.target.value)}
                              className="absolute -inset-2 w-[200%] h-[200%] p-0 border-none cursor-pointer"
                            />
                          </div>
                          <span className="text-[10px] font-mono text-gray-500 uppercase">{textProps.color}</span>
                        </div>

                        <div className="w-px h-5 bg-gray-200 shrink-0" />

                        {/* Align */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-semibold text-gray-800 uppercase whitespace-nowrap">Align</span>
                          <div className="flex gap-0.5">
                            <button onClick={() => canvasRef.current?.alignSelectedLayer("left", null)} title="Left" className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 border-none cursor-pointer flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path strokeLinecap="round" d="M3 6h18M3 10h12M3 14h18M3 18h12"/></svg>
                            </button>
                            <button onClick={() => canvasRef.current?.alignSelectedLayer("center", null)} title="Center" className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 border-none cursor-pointer flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path strokeLinecap="round" d="M3 6h18M6 10h12M3 14h18M6 18h12"/></svg>
                            </button>
                            <button onClick={() => canvasRef.current?.alignSelectedLayer("right", null)} title="Right" className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 border-none cursor-pointer flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5"><path strokeLinecap="round" d="M3 6h18M9 10h12M3 14h18M9 18h12"/></svg>
                            </button>
                          </div>
                        </div>

                        {/* More / Less toggle */}
                        <button
                          onClick={() => setTextExpanded((v) => !v)}
                          title="More options"
                          className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border-none cursor-pointer text-[10px] font-bold transition-all shrink-0 ml-auto ${textExpanded ? "bg-[#c0623a] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
                        >
                          {textExpanded ? "Less" : "More"}
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 transition-transform ${textExpanded ? "rotate-180" : ""}`}>
                            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"/>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>

                  {/* Expanded advanced controls (Row 1 & Row 2 stacked) */}
                  {isTextLayer && textExpanded && (
                    <>
                      {/* Row 1: Arch, Spacing, Presets */}
                      <div className="border-t border-gray-100 py-2.5 px-3 flex flex-row items-center gap-3">
                        {/* Arch / Bend */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-semibold text-gray-800 uppercase whitespace-nowrap">Arch</span>
                          <input
                            type="range" min={-100} max={100} step={1}
                            value={textProps.bend}
                            onChange={(e) => applyTextProp("bend", Number(e.target.value))}
                            className="w-24 accent-[#c0623a] cursor-pointer"
                          />
                          <span className="text-[10px] font-mono text-gray-600 w-7 shrink-0 text-right">{textProps.bend}</span>
                        </div>

                        <div className="w-px h-5 bg-gray-200 shrink-0" />

                        {/* Letter Spacing */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-semibold text-gray-800 uppercase whitespace-nowrap">Spacing</span>
                          <input
                            type="range" min={-20} max={100} step={1}
                            value={textProps.letterSpacing}
                            onChange={(e) => applyTextProp("letterSpacing", Number(e.target.value))}
                            className="w-24 accent-[#c0623a] cursor-pointer"
                          />
                          <span className="text-[10px] font-mono text-gray-600 w-7 shrink-0 text-right">{textProps.letterSpacing}</span>
                        </div>

                        <div className="w-px h-5 bg-gray-200 shrink-0" />

                        {/* Preset Styles */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-semibold text-gray-800 uppercase whitespace-nowrap">Presets</span>
                          <PresetDropdown
                            presets={TYPO_PRESETS}
                            textProps={textProps}
                            selectedLayerText={selectedLayer?.text}
                            onSelect={(presetProps) => applyTextPropsMulti(presetProps)}
                          />
                        </div>
                      </div>

                      {/* Row 2: Outline & Shadow configurations */}
                      <div className="border-t border-gray-100 py-2.5 px-3 flex flex-row items-center gap-3">
                        {/* Outline Toggle */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-semibold text-gray-800 uppercase whitespace-nowrap">Outline</span>
                          <button
                            onClick={() => applyTextProp("stroke", !textProps.stroke)}
                            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors border-none ${textProps.stroke ? "bg-[#c0623a]" : "bg-gray-300"}`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${textProps.stroke ? "translate-x-4" : ""}`} />
                          </button>
                        </div>

                        {/* Outline Color */}
                        <div className="w-px h-5 bg-gray-200 shrink-0" />
                        <div className={`flex items-center gap-1.5 shrink-0 transition-opacity ${textProps.stroke ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                          <span className="text-[10px] font-semibold text-gray-800 uppercase whitespace-nowrap">Outline Color</span>
                          <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-gray-200 shrink-0 cursor-pointer hover:scale-105 transition-transform">
                            <input
                              type="color" value={textProps.strokeColor || "#000000"}
                              onInput={(e) => applyTextProp("strokeColor", e.target.value)}
                              className="absolute -inset-2 w-[200%] h-[200%] p-0 border-none cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="w-px h-5 bg-gray-200 shrink-0" />

                        {/* Shadow Toggle */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-semibold text-gray-800 uppercase whitespace-nowrap">Shadow</span>
                          <button
                            onClick={() => applyTextProp("shadow", !textProps.shadow)}
                            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors border-none ${textProps.shadow ? "bg-[#c0623a]" : "bg-gray-300"}`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${textProps.shadow ? "translate-x-4" : ""}`} />
                          </button>
                        </div>

                        {/* Shadow Color */}
                        <div className="w-px h-5 bg-gray-200 shrink-0" />
                        <div className={`flex items-center gap-1.5 shrink-0 transition-opacity ${textProps.shadow ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                          <span className="text-[10px] font-semibold text-gray-800 uppercase whitespace-nowrap">Shadow Color</span>
                          <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-gray-200 shrink-0 cursor-pointer hover:scale-105 transition-transform">
                            <input
                              type="color" value={textProps.shadowColor || "#000000"}
                              onInput={(e) => applyTextProp("shadowColor", e.target.value)}
                              className="absolute -inset-2 w-[200%] h-[200%] p-0 border-none cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )
        )}

        {/* ── Center Canvas ─────────────────────────────────────────────── */}
        <div
          className={`flex-1 flex flex-col min-w-0 relative transition-all duration-300 ${
            isEmbeddedMode ? "h-[calc(100vh-162px)] mt-20 mb-[82px]" : "h-full"
          }`}
          style={{
            paddingRight: 0,
          }}
        >
          {isEmbeddedMode && (
            <div className="absolute top-4 right-6 z-40 flex items-center gap-2 pointer-events-auto">
              <button
                onClick={handleSave}
                className="py-2.5 px-4 rounded-xl bg-[#c05520] hover:bg-[#a04619] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 border-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.8} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Apply Changes
              </button>
              <button
                onClick={() => onBack && onBack()}
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer border border-gray-200"
              >
                Cancel
              </button>
            </div>
          )}
          {/* Floating Left Panel Trigger when collapsed */}
          {!showLeftPanel && !isEmbeddedMode && (
            <div className={`absolute left-6 z-30 flex flex-col gap-3 ${isEmbeddedMode ? "top-24" : "top-6"}`}>
              {/* Back button - only in normal mode */}
              {!isEmbeddedMode && (
                <button
                  onClick={onBack}
                  className="w-14 h-12 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center border-none cursor-pointer hover:bg-gray-50 text-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
                  title="Go Back"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                    />
                  </svg>
                </button>
              )}
              {/* Open button */}
              <button
                onClick={() => setShowLeftPanel(true)}
                className="w-14 h-12 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex items-center justify-center border-none cursor-pointer hover:bg-gray-50 text-gray-800 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                title="Open Design Panel"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-7.5 h-7.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9l3 3-3 3"
                  />
                </svg>
              </button>
            </div>
          )}

          {showTapeLayout && (
            <TapeLayoutScreen
              onCancel={() => setShowTapeLayout(false)}
              onSave={(dataUrl) => {
                setShowTapeLayout(false);
                if (dataUrl) {
                  setPendingTapeLayoutDataUrl(dataUrl);
                }
              }}
            />
          )}

          {/* Floating Tape Layout Apply Container */}
          {pendingTapeLayoutDataUrl && (
            <div
              style={{ top: tapeLayoutPos.y, left: tapeLayoutPos.x }}
              className="fixed z-50 bg-white p-4 rounded-2xl shadow-xl border border-gray-200 flex flex-col items-center gap-4 w-64"
            >
              <div
                className="w-full flex justify-between items-center cursor-move touch-none"
                onPointerDown={handleTapePointerDown}
              >
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider select-none pointer-events-none">
                  Tape Layout
                </span>
                <button
                  onClick={() => setPendingTapeLayoutDataUrl(null)}
                  className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 border-none cursor-pointer z-10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="w-full h-20 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden p-2">
                <img
                  src={pendingTapeLayoutDataUrl}
                  alt="Tape Preview"
                  className="max-w-full max-h-full object-contain drop-shadow-sm"
                />
              </div>
              <button
                disabled={currentSelectedFaces.size === 0}
                onClick={() => {
                  if (canvasRef.current && canvasRef.current.uploadImage) {
                    canvasRef.current.uploadImage(
                      pendingTapeLayoutDataUrl,
                      "cover",
                    );
                    setPendingTapeLayoutDataUrl(null);
                    setLeftTab("uploads");
                  } else {
                    setPendingTapeLayoutDataUrl(null);
                  }
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all border-none ${
                  currentSelectedFaces.size > 0
                    ? "bg-[#c0623a] text-white hover:bg-[#a54f2c] cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                    : "bg-gray-100 text-gray-800 cursor-not-allowed"
                }`}
              >
                {currentSelectedFaces.size > 0
                  ? "Apply to Frame"
                  : "Select Frame First"}
              </button>
            </div>
          )}

          <Canvas
            key={canvasResetKey}
            ref={canvasRef}
            textureCanvasRef={textureCanvasRef}
            onTextureUpdated={() => setTextureVersion((v) => v + 1)}
            modelUrl={modelUrl}
            setModelUrl={setModelUrl}
            showUv={showUv}
            fullUv={fullUv}
            bgColor={bgColor}
            isActive={isActive}
            appliedMaterials={appliedMaterials}
            onSelectedLayerChange={handleSelectedLayerChange}
            onFaceSelectionChange={(faces) => {
              setIsFrameSelected(faces.size > 0);
              setCurrentSelectedFaces(faces);
            }}
            onOpenTapeLayout={() => setShowTapeLayout(true)}
          />
        </div>

        {/* ── Right Panel ───────────────────────────────────────────────── */}
        {!isEmbeddedMode && (
          <div
            className={`
            absolute z-40 h-fit pointer-events-none
            right-0 pb-6 pr-6
            ${showMobilePanel ? "block" : "hidden lg:block"}
          `}
            style={{
              top: `${rightPanelY}px`,
              transition: isDraggingRightPanel
                ? "none"
                : "top 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease",
            }}
          >
            <div
              ref={rightPanelRef}
              className="h-fit rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 bg-white flex flex-col pointer-events-auto"
            >
            {/* Drag Handle for Vertical Repositioning */}
            <div
              className="w-full h-5 flex items-center justify-center cursor-ns-resize hover:bg-gray-50 active:cursor-grabbing border-b border-gray-100 select-none bg-white transition-colors"
              onPointerDown={handleRightPanelPointerDown}
              onPointerMove={handleRightPanelPointerMove}
              onPointerUp={handleRightPanelPointerUp}
              title="Drag Vertically"
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <RightPanel
              canvasRef={canvasRef}
              textureCanvasRef={textureCanvasRef}
              textureVersion={textureVersion}
              modelUrl={modelUrl}
              appliedMaterials={appliedMaterials}
              appliedColors={appliedColors}
              appliedLastApplied={appliedLastApplied}
              wireframe={wireframe}
              setWireframe={setWireframe}
              showUv={showUv}
              setShowUv={setShowUv}
              fullUv={fullUv}
              setFullUv={setFullUv}
              bgColor={bgColor}
              setBgColor={setBgColor}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              sceneBgColor={sceneBgColor}
              sceneBgImage={sceneBgImage}
              hideExport={false}
              onExportClick={() => setShowExportModal(true)}
              onSave={handleSave}
              isActive={isActive}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
              selectedCapUrl={selectedCapUrl}
              onSelectCap={onSelectCap}
              selectedMaterial={selectedMaterial}
            />
          </div>
        </div>
        )}

        {/* Mobile overlay backdrop */}
        {showMobilePanel && (
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setShowMobilePanel(false)}
          />
        )}
      </div>

      {/* Export Options Popup (Left Side) */}
      {showExportModal && (
        <>
          {/* Invisible overlay for click-outside to close */}
          <div
            className="fixed inset-0 z-[999]"
            onClick={() => setShowExportModal(false)}
          />
          <div
            className="absolute top-6 z-[1000] pointer-events-auto transition-all duration-300"
            style={{ right: showPreview ? "380px" : "240px" }}
          >
            <div className="bg-white rounded-[15px] p-6 w-[340px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col gap-5 relative border border-gray-100">
              <button
                onClick={() => setShowExportModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center border-none text-gray-800 hover:text-gray-600 cursor-pointer transition-colors"
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
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="flex flex-col gap-1 pr-6">
                <h3 className="text-lg font-bold text-gray-900 m-0">
                  Export Design
                </h3>
                <p className="text-xs text-gray-500 m-0">
                  Choose your preferred format(s)
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={exportGlbChecked}
                    onChange={(e) => setExportGlbChecked(e.target.checked)}
                    className="w-5 h-5 accent-[#c05520] cursor-pointer rounded"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      Export as GLB
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Download the 3D model with your design applied
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={exportPngChecked}
                    onChange={(e) => setExportPngChecked(e.target.checked)}
                    className="w-5 h-5 accent-[#c05520] cursor-pointer rounded"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      Export as PNG (Texture)
                    </span>
                    <span className="text-[11px] text-gray-500">
                      High-res image of the flat canvas texture
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={exportSvgChecked}
                    onChange={(e) => setExportSvgChecked(e.target.checked)}
                    className="w-5 h-5 accent-[#c05520] cursor-pointer rounded"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      Export as SVG
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Vector graphics with layers & UV wireframe
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={exportPdfChecked}
                    onChange={(e) => setExportPdfChecked(e.target.checked)}
                    className="w-5 h-5 accent-[#c05520] cursor-pointer rounded"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      Export as PDF
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Document containing vector layers & UV wireframe
                    </span>
                  </div>
                </label>
              </div>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-3.5 rounded-2xl bg-[#c05520] hover:bg-[#a04619] disabled:bg-gray-300 text-white font-bold text-base transition-colors border-none cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                <span>Exporting...</span>
                  </>
                ) : (
                  <span>Download Now</span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // ─── Return: Popup mode wraps innerContent in a floating panel ───────────
  if (isPopupMode) {
    return (
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        {/* Backdrop when fullscreen */}
        {isFullscreenPopup && (
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-auto"
            onClick={() => setIsFullscreenPopup(false)}
          />
        )}

        {/* The floating popup panel */}
        <div
          className={`pointer-events-auto bg-white rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.22)] border border-gray-200/80 overflow-hidden flex flex-col ${
            isFullscreenPopup
              ? "fixed inset-4"
              : "absolute"
          }`}
          style={
            isFullscreenPopup
              ? { zIndex: 10000 }
              : {
                  width: `${popupSize.width}px`,
                  height: `${popupSize.height}px`,
                  top: '50%',
                  left: '50%',
                  transform: `translate(calc(-50% + ${popupPos.x}px), calc(-50% + ${popupPos.y}px))`,
                  zIndex: 10000,
                  transition: 'box-shadow 0.2s',
                }
          }
        >
          {/* Popup Title Bar (drag handle) */}
          <div
            className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white shrink-0 select-none ${!isFullscreenPopup ? 'cursor-grab active:cursor-grabbing' : ''}`}
            onPointerDown={handlePopupDragStart}
            onPointerMove={handlePopupDragMove}
            onPointerUp={handlePopupDragEnd}
            style={{ touchAction: 'none', userSelect: 'none' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#c05520]/10 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="#c05520" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5h16.5V3.75H3.75Zm4.5 4.5h7.5v7.5h-7.5v-7.5Z" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-bold text-gray-900">UV Texture Editor</span>
                <span className="ml-2 text-[9px] font-black uppercase tracking-widest bg-[#c05520]/10 text-[#c05520] px-1.5 py-0.5 rounded-full">LIVE</span>
              </div>
              {!isFullscreenPopup && (
                <span className="text-[10px] text-gray-800 ml-2 hidden sm:block">Drag to move · corners to resize</span>
              )}
            </div>
            <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
              {/* Apply & Close */}
              <button
                onClick={handleSave}
                className="px-3.5 py-1.5 rounded-lg bg-[#c05520] hover:bg-[#a04619] text-white text-xs font-bold border-none cursor-pointer transition-all shadow-sm"
              >
                Apply & Close
              </button>
              {/* Fullscreen toggle */}
              <button
                onClick={() => setIsFullscreenPopup((s) => !s)}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-orange-50 text-gray-500 hover:text-[#c05520] border-none cursor-pointer transition-colors"
                title={isFullscreenPopup ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreenPopup ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-5.25M15 15v4.5M15 15h4.5M15 15l5.25 5.25" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0l-6-6" />
                  </svg>
                )}
              </button>
              {/* Close without applying */}
              <button
                onClick={() => onClosePopup?.()}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 border-none cursor-pointer transition-colors"
                title="Close without applying"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Popup body */}
          <div className="flex-1 overflow-hidden relative">
            {innerContent}
          </div>

          {/* ── Resize handles: 4 corners + 4 edges (hidden in fullscreen) ── */}
          {!isFullscreenPopup && (
            <>
              {/* Corners */}
              <div onPointerDown={startResize('se')} className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-50" style={{ touchAction: 'none' }} />
              <div onPointerDown={startResize('sw')} className="absolute bottom-0 left-0 w-5 h-5 cursor-sw-resize z-50" style={{ touchAction: 'none' }} />
              <div onPointerDown={startResize('ne')} className="absolute top-0 right-0 w-5 h-5 cursor-ne-resize z-50" style={{ touchAction: 'none' }} />
              <div onPointerDown={startResize('nw')} className="absolute top-0 left-0 w-5 h-5 cursor-nw-resize z-50" style={{ touchAction: 'none' }} />
              {/* Edges */}
              <div onPointerDown={startResize('e')} className="absolute top-5 right-0 bottom-5 w-2 cursor-e-resize z-50" style={{ touchAction: 'none' }} />
              <div onPointerDown={startResize('w')} className="absolute top-5 left-0 bottom-5 w-2 cursor-w-resize z-50" style={{ touchAction: 'none' }} />
              <div onPointerDown={startResize('s')} className="absolute bottom-0 left-5 right-5 h-2 cursor-s-resize z-50" style={{ touchAction: 'none' }} />
              <div onPointerDown={startResize('n')} className="absolute top-0 left-5 right-5 h-2 cursor-n-resize z-50" style={{ touchAction: 'none' }} />
              {/* Visual grip dots at bottom-right */}
              <div className="absolute bottom-1.5 right-1.5 pointer-events-none z-50">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-300">
                  <circle cx="9" cy="3" r="1" fill="currentColor" />
                  <circle cx="9" cy="6" r="1" fill="currentColor" />
                  <circle cx="9" cy="9" r="1" fill="currentColor" />
                  <circle cx="6" cy="6" r="1" fill="currentColor" />
                  <circle cx="6" cy="9" r="1" fill="currentColor" />
                  <circle cx="3" cy="9" r="1" fill="currentColor" />
                </svg>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Normal full-screen mode
  return innerContent;
}

