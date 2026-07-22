import React, { useState } from 'react';

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
  bgImage, setBgImage
}) {
  const [showDefaultBgs, setShowDefaultBgs] = useState(false);
  const [loadingBgImage, setLoadingBgImage] = useState(null);
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
    <div className="w-[280px] sm:w-[350px] h-full shrink-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-gray-100/80 overflow-hidden flex flex-col z-20">
      <div className="p-5 pb-3 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 m-0">Environment</h2>
      </div>

      <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-6 scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
        
        {/* Background Color */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-gray-700 flex justify-between">
            Background Color
            <span className="text-gray-400 font-normal">{bgColor}</span>
          </label>
          <div className="flex items-center gap-3 w-full">
            <div className="relative w-10 h-10 rounded shadow-sm border border-gray-200 overflow-hidden cursor-pointer flex-shrink-0 flex items-center justify-center bg-gray-50 hover:bg-gray-100 group">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 absolute z-0 group-hover:scale-110 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11.25l1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 10-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M15 11.25v-2.25m0 2.25l-2.25 1.5M7.5 15l-1.5 1.5-.75-.75V12.5l2.25-1.5M7.5 15l1.5 2.25m0-2.25l-2.25-1.5M10.5 18l-1.5 1.5-.75-.75V15.5l2.25-1.5M10.5 18l1.5 2.25m0-2.25l-2.25-1.5" />
              </svg>
              <input 
                type="color" 
                value={bgColor} 
                onChange={(e) => setBgColor(e.target.value)}
                className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0 z-10"
              />
            </div>
            <div className="flex-1 grid grid-cols-5 gap-2">
              {['#e6e2db', '#ffffff', '#1a1a1a', '#2c3e50', '#c05520'].map(color => {
                const isSelected = bgColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setBgColor(color)}
                    className={`w-full aspect-square rounded-md border-2 transition-transform hover:scale-110 cursor-pointer ${isSelected ? 'border-gray-900 shadow-md' : 'border-gray-200'}`}
                    style={{ backgroundColor: color }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Custom Background Image */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-gray-700">Background Image</label>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-2">
            {defaultBgImages.map((bg, index) => (
              <div 
                key={index}
                onClick={() => handleApplyDefaultBg(bg)}
                className={`relative aspect-square rounded-lg border-2 cursor-pointer overflow-hidden group ${bgImage === bg ? 'border-[#c05520]' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <img src={bg} alt={`bg-${index}`} className="w-full h-full object-cover" />
                {loadingBgImage === bg && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center z-10">
                    <div className="w-4 h-4 rounded-full border-2 border-transparent border-t-[#c05520] animate-spin" />
                  </div>
                )}
                {bgImage === bg && loadingBgImage !== bg && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white drop-shadow">
                      <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {bgImage ? (
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#c05520] bg-orange-50">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg shadow-inner bg-cover bg-center border border-gray-200"
                  style={{ backgroundImage: `url(${bgImage})` }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800">Custom Image</span>
                  <span className="text-[11px] font-medium text-gray-500">Active Background</span>
                </div>
              </div>
              <button 
                onClick={() => setBgImage(null)} 
                className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center border border-gray-200 transition-colors cursor-pointer shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-2.5 w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75h19.5m-19.5 0A2.25 2.25 0 012.25 13.5v-9a2.25 2.25 0 012.25-2.25h15A2.25 2.25 0 0121.75 4.5v9a2.25 2.25 0 01-2.25 2.25m-19.5 0v.75c0 .414.336.75.75.75h18a.75.75 0 00.75-.75v-.75m-19.5 0A2.25 2.25 0 004.5 18h15a2.25 2.25 0 002.25-2.25M12 12v-9m0 0l-3 3m3-3l3 3" />
              </svg>
              <span className="text-sm font-semibold text-gray-600">Upload Background Image</span>
              <input type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" />
            </label>
          )}
        </div>


        {/* HDRI Preset */}
        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-gray-700">HDRI Environment</label>
          
          {customHdri ? (
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#c05520] bg-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-[#c05520] shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800">Custom HDR</span>
                  <span className="text-[11px] font-medium text-gray-500">Active Environment</span>
                </div>
              </div>
              <button 
                onClick={() => { setCustomHdri(null); setHdriPreset("studio"); }} 
                className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center border border-gray-200 transition-colors cursor-pointer shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <select 
                value={hdriPreset} 
                onChange={(e) => {
                  setHdriPreset(e.target.value);
                  if (e.target.value !== "custom") setCustomHdri(null);
                }}
                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#c05520] focus:ring-1 focus:ring-[#c05520] cursor-pointer"
              >
                {hdriPresets.map(preset => (
                  <option key={preset} value={preset}>
                    {preset.charAt(0).toUpperCase() + preset.slice(1)}
                  </option>
                ))}
              </select>
              <label className="flex items-center justify-center gap-2 p-2.5 w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-sm font-semibold text-gray-600">Upload Custom .HDR</span>
                <input type="file" accept=".hdr" onChange={handleHdriUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Sliders */}
        <div className="flex flex-col gap-6 mt-1">
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-gray-600 flex justify-between">
              Environment Intensity <span>{envIntensity.toFixed(2)}</span>
            </label>
            <input 
              type="range" min="0" max="2" step="0.1" 
              value={envIntensity} 
              onChange={(e) => setEnvIntensity(parseFloat(e.target.value))}
              className="w-full accent-[#c05520]"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-gray-600 flex justify-between">
              Ambient Light <span>{ambLight.toFixed(2)}</span>
            </label>
            <input 
              type="range" min="0" max="2" step="0.1" 
              value={ambLight} 
              onChange={(e) => setAmbLight(parseFloat(e.target.value))}
              className="w-full accent-[#c05520]"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-gray-600 flex justify-between">
              Directional Light <span>{dirLight.toFixed(2)}</span>
            </label>
            <input 
              type="range" min="0" max="3" step="0.1" 
              value={dirLight} 
              onChange={(e) => setDirLight(parseFloat(e.target.value))}
              className="w-full accent-[#c05520]"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-gray-600 flex justify-between">
              Shadow Opacity <span>{shadowOpacity.toFixed(2)}</span>
            </label>
            <input 
              type="range" min="0" max="1" step="0.05" 
              value={shadowOpacity} 
              onChange={(e) => setShadowOpacity(parseFloat(e.target.value))}
              className="w-full accent-[#c05520]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
