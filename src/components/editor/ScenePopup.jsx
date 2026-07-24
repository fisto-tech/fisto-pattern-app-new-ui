import React, { useState, useEffect, useRef } from 'react';

import bg1 from '../../assets/images/Editor 1/Bg Images/bg1.webp';
import bg2 from '../../assets/images/Editor 1/Bg Images/bg2.webp';
import bg3 from '../../assets/images/Editor 1/Bg Images/bg3.webp';
import bg4 from '../../assets/images/Editor 1/Bg Images/bg4.webp';
import bg5 from '../../assets/images/Editor 1/Bg Images/bg5.webp';
import bg6 from '../../assets/images/Editor 1/Bg Images/bg6.webp';
import bg7 from '../../assets/images/Editor 1/Bg Images/bg7.webp';
import bg8 from '../../assets/images/Editor 1/Bg Images/bg8.webp';
import bg9 from '../../assets/images/Editor 1/Bg Images/bg9.webp';
import bg10 from '../../assets/images/Editor 1/Bg Images/bg10.webp';

const defaultBgImages = [bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8, bg9, bg10];

const hdriPresets = [
  "studio",
  "city",
  "sunset",
  "dawn",
  "night",
  "warehouse",
  "forest",
  "apartment",
  "park",
  "lobby",
];

export default function ScenePopup({
  bgColor, setBgColor,
  hdriPreset, setHdriPreset,
  envIntensity, setEnvIntensity,
  ambLight, setAmbLight,
  dirLight, setDirLight,
  shadowOpacity, setShadowOpacity,
  customHdri, setCustomHdri,
  bgImage, setBgImage,
  isScaledUp, onToggleScale, onClose,
  isHorizontal = false,
}) {
  const [showDefaultBgs, setShowDefaultBgs] = useState(false);
  const [loadingBgImage, setLoadingBgImage] = useState(null);
  const [showMoreControls, setShowMoreControls] = useState(false);
  const moreRef = useRef(null);
  
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMoreControls(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleHdriUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomHdri(url);
      setHdriPreset("custom");
    }
  };

  const handleBgImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBgImage(url);
    }
  };

  const handleApplyDefaultBg = (bg) => {
    if (bg === bgImage) return;
    setLoadingBgImage(bg);
    const img = new Image();
    img.src = bg;
    img.onload = () => {
      setBgImage(bg);
      setLoadingBgImage(null);
    };
    img.onerror = () => {
      setLoadingBgImage(null);
    };
  };

  return (
    <div className={`w-full h-fit shrink-0 flex flex-col z-20 transition-all duration-300 ${isHorizontal ? 'bg-transparent border-none shadow-none p-0' : 'bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-gray-100/80 overflow-hidden'}`}>
      <div className={`flex items-center justify-between ${isHorizontal ? 'border-b-0 p-0 mb-2' : 'p-4 border-b border-gray-100'}`}>
        {!isHorizontal && (
          <div className="flex items-center gap-1.5">
            {onToggleScale && (
              <button
                onClick={onToggleScale}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-orange-50 text-gray-500 hover:text-[#c05520] transition-colors border-none cursor-pointer"
                title={isScaledUp ? "Scale Down" : "Scale Up (Enlarge)"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  {isScaledUp ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 9L4.5 4.5m0 0H9m-4.5 0V9m10.5 6l4.5 4.5m0 0H15m4.5 0v-4.5"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15m-11.25 5.25h4.5m-4.5 0v-4.5m0 4.5L9 15"
                    />
                  )}
                </svg>
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 border-none cursor-pointer transition-colors"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <div className={isHorizontal ? "flex flex-col w-full" : "p-5 overflow-y-auto flex-1 flex flex-col gap-6 scroll-smooth"} style={{ scrollBehavior: 'smooth' }}>
        
        {/* Primary Row for Horizontal Mode or Standard Layout */}
        <div className={isHorizontal ? "flex items-center gap-6 overflow-x-auto no-scrollbar py-2.5 px-4.5" : "flex flex-col gap-6"}>
          {/* Background Color */}
          <div className={`flex ${isHorizontal ? 'items-center gap-3 shrink-0' : 'flex-col gap-3'}`}>
            <label className="text-[11px] font-bold text-gray-700 flex flex-col shrink-0 justify-between">
              <span>Color</span>
              {!isHorizontal && <span className="text-gray-400 font-normal">{bgColor}</span>}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded border border-gray-200 overflow-hidden cursor-pointer flex-shrink-0 flex items-center justify-center bg-gray-50 hover:bg-gray-100 group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500 absolute z-0 group-hover:scale-110 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 10-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M15 11.25v-2.25m0 2.25l-2.25 1.5M7.5 15l-1.5 1.5-.75-.75V12.5l2.25-1.5M7.5 15l1.5 2.25m0-2.25l-2.25-1.5M10.5 18l-1.5 1.5-.75-.75V15.5l2.25-1.5M10.5 18l1.5 2.25m0-2.25l-2.25-1.5" />
                </svg>
                <input 
                  type="color" 
                  value={bgColor} 
                  onChange={(e) => setBgColor(e.target.value)}
                  className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0 z-10"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {['#e6e2db', '#ffffff', '#1a1a1a', '#2c3e50', '#c05520'].map(color => {
                  const isSelected = bgColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setBgColor(color)}
                      className={`w-6 h-6 rounded border transition-transform hover:scale-110 cursor-pointer ${isSelected ? 'border-gray-900 shadow-sm' : 'border-gray-200'}`}
                      style={{ backgroundColor: color }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Custom Background Image */}
          <div className={`flex ${isHorizontal ? 'items-center gap-3 shrink-0' : 'flex-col gap-3'}`}>
            <label className="text-[11px] font-bold text-gray-700 shrink-0">Bg Image</label>
            <div className={isHorizontal ? "flex items-center gap-1.5" : "grid grid-cols-4 gap-2 mb-2"}>
              {defaultBgImages.slice(0, isHorizontal ? 5 : 10).map((bg, index) => (
                <div 
                  key={index}
                  onClick={() => handleApplyDefaultBg(bg)}
                  className={`relative w-8 h-8 rounded border cursor-pointer overflow-hidden shrink-0 group ${bgImage === bg ? 'border-[#c05520]' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <img src={bg} alt={`bg-${index}`} className="w-full h-full object-cover" />
                  {loadingBgImage === bg && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-transparent border-t-[#c05520] animate-spin" />
                    </div>
                  )}
                  {bgImage === bg && loadingBgImage !== bg && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white drop-shadow">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {bgImage ? (
              <div className={`flex items-center justify-between p-1.5 rounded-lg border border-[#c05520] bg-orange-50 shrink-0 ${isHorizontal ? 'gap-2' : 'gap-3 p-3'}`}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded shadow-inner bg-cover bg-center border border-gray-200"
                    style={{ backgroundImage: `url(${bgImage})` }}
                  />
                  {!isHorizontal && (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-800">Custom Image</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setBgImage(null)} 
                  className="w-5 h-5 rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center border border-gray-200 transition-colors cursor-pointer shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className={`flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors shrink-0 ${isHorizontal ? 'p-1 px-2.5 text-[10px]' : 'p-2.5 w-full text-sm'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`${isHorizontal ? 'w-3 h-3' : 'w-4 h-4'} text-gray-500`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75h19.5m-19.5 0A2.25 2.25 0 012.25 13.5v-9a2.25 2.25 0 012.25-2.25h15A2.25 2.25 0 0121.75 4.5v9a2.25 2.25 0 01-2.25 2.25m-19.5 0v.75c0 .414.336.75.75.75h18a.75.75 0 00.75-.75v-.75m-19.5 0A2.25 2.25 0 004.5 18h15a2.25 2.25 0 002.25-2.25M12 12v-9m0 0l-3 3m3-3l3 3" />
                </svg>
                <span className="font-semibold text-gray-600">Upload Image</span>
                <input type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* HDRI Preset */}
          <div className={`flex ${isHorizontal ? 'items-center gap-3 shrink-0' : 'flex-col gap-3'}`}>
            <label className="text-[11px] font-bold text-gray-700 shrink-0">HDRI</label>
            
            {customHdri ? (
              <div className={`flex items-center justify-between p-1.5 rounded-lg border border-[#c05520] bg-orange-50 shrink-0 ${isHorizontal ? 'gap-2' : 'gap-3 p-3'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center text-[#c05520] shadow-inner text-[10px]">
                    ☁
                  </div>
                  {!isHorizontal && <span className="text-xs font-bold text-gray-800">Custom HDR</span>}
                </div>
                <button 
                  onClick={() => { setCustomHdri(null); setHdriPreset("studio"); }} 
                  className="w-5 h-5 rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center border border-gray-200 transition-colors cursor-pointer shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className={`flex ${isHorizontal ? 'items-center gap-2 shrink-0' : 'flex-col gap-2'}`}>
                <select 
                  value={hdriPreset} 
                  onChange={(e) => {
                    setHdriPreset(e.target.value);
                    if (e.target.value !== "custom") setCustomHdri(null);
                  }}
                  className={`rounded-lg border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#c05520] cursor-pointer ${isHorizontal ? 'p-1 py-1 px-2 w-24' : 'w-full p-2.5'}`}
                >
                  {hdriPresets.map(preset => (
                    <option key={preset} value={preset}>
                      {preset.charAt(0).toUpperCase() + preset.slice(1)}
                    </option>
                  ))}
                </select>
                <label className={`flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors ${isHorizontal ? 'p-1 px-2 text-[10px] shrink-0' : 'p-2 w-full text-xs'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-gray-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span>Upload HDR</span>
                  <input type="file" accept=".hdr" onChange={handleHdriUpload} className="hidden" />
                </label>
              </div>
            )}
          </div>

          {/* More Expand Toggle Button (Horizontal mode only) */}
          {isHorizontal && (
            <div className="relative shrink-0 ml-auto">
              <button
                onClick={() => setShowMoreControls(!showMoreControls)}
                className={`px-3 py-1.5 rounded-xl border-2 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm ${
                  showMoreControls 
                    ? 'border-[#c05520] bg-orange-50 text-[#c05520]' 
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span>More</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 transition-transform duration-200 ${showMoreControls ? 'rotate-180' : ''}`}>
                  <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Expandable Sliders Drawer (Horizontal Mode) — wrapped with moreRef so inside clicks don't trigger outside-click dismissal */}
        {isHorizontal && showMoreControls && (
          <div ref={moreRef} className="border-t border-gray-200/80 p-3 bg-gray-50/50 flex items-center justify-center gap-8 w-full animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
            {/* Env intensity */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-[10px] font-bold text-gray-600 flex justify-between gap-1 w-12 shrink-0">
                Env <span>{envIntensity.toFixed(1)}</span>
              </label>
              <input 
                type="range" min="0" max="2" step="0.1" 
                value={envIntensity} 
                onChange={(e) => setEnvIntensity(parseFloat(e.target.value))}
                className="accent-[#c05520] w-24 cursor-pointer"
              />
            </div>

            {/* Ambient */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-[10px] font-bold text-gray-600 flex justify-between gap-1 w-16 shrink-0">
                Ambient <span>{ambLight.toFixed(1)}</span>
              </label>
              <input 
                type="range" min="0" max="2" step="0.1" 
                value={ambLight} 
                onChange={(e) => setAmbLight(parseFloat(e.target.value))}
                className="accent-[#c05520] w-24 cursor-pointer"
              />
            </div>

            {/* Dir Light */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-[10px] font-bold text-gray-600 flex justify-between gap-1 w-16 shrink-0">
                Dir Light <span>{dirLight.toFixed(1)}</span>
              </label>
              <input 
                type="range" min="0" max="3" step="0.1" 
                value={dirLight} 
                onChange={(e) => setDirLight(parseFloat(e.target.value))}
                className="accent-[#c05520] w-24 cursor-pointer"
              />
            </div>

            {/* Shadow */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-[10px] font-bold text-gray-600 flex justify-between gap-1 w-16 shrink-0">
                Shadow <span>{shadowOpacity.toFixed(1)}</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.05" 
                value={shadowOpacity} 
                onChange={(e) => setShadowOpacity(parseFloat(e.target.value))}
                className="accent-[#c05520] w-24 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Standard Vertical Layout Sliders (non-horizontal mode) */}
        {!isHorizontal && (
          <div className="flex flex-col gap-6 mt-1 p-5">
            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-bold text-gray-600 flex justify-between gap-1 w-full">
                Env <span>{envIntensity.toFixed(1)}</span>
              </label>
              <input 
                type="range" min="0" max="2" step="0.1" 
                value={envIntensity} 
                onChange={(e) => setEnvIntensity(parseFloat(e.target.value))}
                className="accent-[#c05520] w-full"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-bold text-gray-600 flex justify-between gap-1 w-full">
                Ambient <span>{ambLight.toFixed(1)}</span>
              </label>
              <input 
                type="range" min="0" max="2" step="0.1" 
                value={ambLight} 
                onChange={(e) => setAmbLight(parseFloat(e.target.value))}
                className="accent-[#c05520] w-full"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-bold text-gray-600 flex justify-between gap-1 w-full">
                Dir Light <span>{dirLight.toFixed(1)}</span>
              </label>
              <input 
                type="range" min="0" max="3" step="0.1" 
                value={dirLight} 
                onChange={(e) => setDirLight(parseFloat(e.target.value))}
                className="accent-[#c05520] w-full"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-[10px] font-bold text-gray-600 flex justify-between gap-1 w-full">
                Shadow <span>{shadowOpacity.toFixed(1)}</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.05" 
                value={shadowOpacity} 
                onChange={(e) => setShadowOpacity(parseFloat(e.target.value))}
                className="accent-[#c05520] w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
