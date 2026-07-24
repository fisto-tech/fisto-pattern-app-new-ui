import { useRef, useState, useCallback, useEffect } from 'react';

// ── T-Shirt Graphics (14 images) ─────────────────────────────────────────────
import tsg1  from "../../assets/images/Editor 2/t-shirtGraphics/1.webp";
// import tsg2  from "../../assets/images/Editor 2/t-shirtGraphics/2.webp";
import tsg3  from "../../assets/images/Editor 2/t-shirtGraphics/3.webp";
import tsg4  from "../../assets/images/Editor 2/t-shirtGraphics/4.webp";
import tsg5  from "../../assets/images/Editor 2/t-shirtGraphics/5.webp";
import tsg6  from "../../assets/images/Editor 2/t-shirtGraphics/6.webp";
import tsg7  from "../../assets/images/Editor 2/t-shirtGraphics/7.webp";
import tsg8  from "../../assets/images/Editor 2/t-shirtGraphics/8.webp";
import tsg9  from "../../assets/images/Editor 2/t-shirtGraphics/9.webp";
import tsg10 from "../../assets/images/Editor 2/t-shirtGraphics/10.webp";
import tsg11 from "../../assets/images/Editor 2/t-shirtGraphics/11.webp";
import tsg12 from "../../assets/images/Editor 2/t-shirtGraphics/12.webp";
import tsg13 from "../../assets/images/Editor 2/t-shirtGraphics/13.webp";
// import  from "../../assets/images/Editor 2/t-shirtGraphics/14.webp";

export const tShirtGraphics = [tsg1,tsg3,tsg4,tsg5,tsg6,tsg7,tsg8,tsg9,tsg10,tsg11,tsg12,tsg13];

// ── Carry Bag Graphics (9 images) ─────────────────────────────────────────────
import cb1 from "../../assets/images/Editor 2/carryBag/1.jpg";
import cb2 from "../../assets/images/Editor 2/carryBag/2.jpg";
import cb3 from "../../assets/images/Editor 2/carryBag/3.jpg";
import cb4 from "../../assets/images/Editor 2/carryBag/4.jpg";
import cb5 from "../../assets/images/Editor 2/carryBag/5.jpg";
import cb6 from "../../assets/images/Editor 2/carryBag/6.jpg";
import cb7 from "../../assets/images/Editor 2/carryBag/7.jpg";
import cb8 from "../../assets/images/Editor 2/carryBag/8.jpg";
import cb9 from "../../assets/images/Editor 2/carryBag/9.jpg";

export const carryBagGraphics = [cb1, cb2, cb3, cb4, cb5, cb6, cb7, cb8, cb9];

// ── Floral Graphics (glob import) ─────────────────────────────────────────────
const floralImagesGlob = import.meta.glob("../../assets/images/Editor 2/Floral/*.{webp,WEBP}", { eager: true, import: "default" });
export const floralGraphics = Object.values(floralImagesGlob);

// ── Damask Graphics (glob import) ─────────────────────────────────────────────
const damaskImagesGlob = import.meta.glob("../../assets/images/Editor 2/Da Mask/*.{png,jpg,jpeg,PNG,JPG,JPEG,webp,WEBP}", { eager: true, import: "default" });
export const damaskGraphics = Object.values(damaskImagesGlob);

// ── Exported collection map ───────────────────────────────────────────────────
export const DEFAULT_ASSET_COLLECTIONS = {
  'T-Shirt': () => tShirtGraphics,
  'Carry Bag': () => carryBagGraphics,
  'Floral': () => floralGraphics,
  'Damask': () => damaskGraphics,
};

// ── Upload type options ───────────────────────────────────────────────────────
const UPLOAD_TYPES = [
  {
    id: 'logo',
    label: 'Logo',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
  },
  {
    id: 'pattern',
    label: 'Pattern',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
  },
  {
    id: 'design',
    label: 'Design',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
];

// ── User asset categories ─────────────────────────────────────────────────────
const USER_CATEGORIES = ['All', 'Design', 'Logo', 'Pattern'];

// ── Default asset sub-tabs ────────────────────────────────────────────────────
const DEFAULT_TABS = ['T-Shirt', 'Carry Bag', 'Floral', 'Damask'];

// ── Small pill tab ────────────────────────────────────────────────────────────
function PillTab({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: active ? 700 : 500,
        background: active ? '#c0623a' : 'transparent',
        color: active ? '#fff' : '#000000',
        border: active ? 'none' : '1.5px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'all 0.18s',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{
          background: active ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
          color: active ? '#fff' : '#9ca3af',
          fontSize: '10px',
          fontWeight: 700,
          borderRadius: '10px',
          padding: '1px 6px',
          lineHeight: 1.4,
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Image tile ────────────────────────────────────────────────────────────────
function ImageTile({ url, alt, onClick, onContextMenu, pinned }) {
  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      style={{
        aspectRatio: '1/1',
        borderRadius: '10px',
        border: '1.5px solid #e5e7eb',
        overflow: 'hidden',
        background: '#f9fafb',
        padding: 0,
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#c0623a';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(192,98,58,0.18)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <img 
        src={url} 
        alt={alt} 
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} 
      />
      {pinned && (
        <div style={{
          position: 'absolute', top: 4, right: 4, background: '#c0623a', color: '#fff',
          borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 5px rgba(0,0,0,0.15)', zIndex: 10
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" style={{ width: 10, height: 10 }}>
            <path d="M16 12V4h1v-2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
          </svg>
        </div>
      )}
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ label }) {
  return (
    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '28px 0', color: '#9ca3af', fontSize: '12px' }}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 32, height: 32, margin: '0 auto 8px', display: 'block', opacity: 0.4 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75 9 9l4.5 4.5 3-3 5.25 5.25M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
      </svg>
      {label}
    </div>
  );
}

const getDefaultTabForModel = (modelUrl) => {
  if (!modelUrl) return 'T-Shirt';
  const urlLower = modelUrl.toLowerCase();
  
  if (urlLower.includes('tape')) {
    return 'Floral';
  }
  if (urlLower.includes('drinkware') || urlLower.includes('bottle') || urlLower.includes('soft drink')) {
    return 'T-Shirt';
  }
  if (urlLower.includes('t-shirt') || urlLower.includes('tshirt') || urlLower.includes('hoodie') || urlLower.includes('fashion')) {
    return 'T-Shirt';
  }
  if (urlLower.includes('container') || urlLower.includes('round') || urlLower.includes('oval') || urlLower.includes('te ') || urlLower.includes('tamper')) {
    return 'Floral';
  }
  if (
    urlLower.includes('bag') || 
    urlLower.includes('box') || 
    urlLower.includes('die') || 
    urlLower.includes('folding') || 
    urlLower.includes('kraft') || 
    urlLower.includes('pouch') || 
    urlLower.includes('zip')
  ) {
    return 'Carry Bag';
  }
  return 'T-Shirt';
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function UploadsPopup({
  onUpload,
  uploadedImages = [],
  isImageSelected,
  isFrameSelected,
  faceColor,
  onApplyFaceColor,
  onApplyFit,
  selectedLayer,
  onUpdateTextureGaps,
  onDeleteUploadedImage,
  onTogglePinUploadedImage,
  modelUrl,
  onOpenTapeLayout,
  compact = false,
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedType, setSelectedType] = useState(() => {
    if (modelUrl && modelUrl.toLowerCase().includes('tape')) {
      return 'pattern';
    }
    return 'logo';
  });
  const [mainTab, setMainTab] = useState('your'); // 'your' | 'default'
  const [userCategory, setUserCategory] = useState('All');
  const [defaultTab, setDefaultTab] = useState('T-Shirt');
  const [visibleCount, setVisibleCount] = useState(9);

  useEffect(() => {
    if (modelUrl) {
      setDefaultTab(getDefaultTabForModel(modelUrl));
    }
  }, [modelUrl]);

  useEffect(() => {
    setVisibleCount(9);
    const timer = setTimeout(() => {
      setVisibleCount(999);
    }, 200);
    return () => clearTimeout(timer);
  }, [defaultTab]);
  const [contextMenu, setContextMenu] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
  const [rowGap, setRowGap] = useState(0);
  const [colGap, setColGap] = useState(0);
  const [isYourDropdownOpen, setIsYourDropdownOpen] = useState(false);
  const [isDefaultDropdownOpen, setIsDefaultDropdownOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const checkOverflow = () => {
      // 310px threshold fits 4 category pills + gaps without overflow
      if (el.clientWidth < 310) {
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    };

    checkOverflow();
    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (selectedLayer && selectedLayer.fitType === 'texture') {
      setRowGap(selectedLayer.rowGap || 0);
      setColGap(selectedLayer.colGap || 0);
    }
  }, [selectedLayer]);

  // ── Categorised user uploads (stored per type) ─────────────────────────────
  // uploadedImages is [{url, type}] or just strings for backward-compat
  const normalizeUploads = (imgs) =>
    imgs.map(item => {
      const obj = typeof item === 'string' ? { url: item, type: 'design' } : item;
      return {
        ...obj,
        type: (obj.type === 'image' || obj.type === 'designes' || obj.type === 'designs') ? 'design' : obj.type,
        pinned: !!obj.pinned
      };
    });
  const allUploads = normalizeUploads(uploadedImages);

  // Sort uploads so that pinned items are displayed first
  const sortedAllUploads = [...allUploads].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const categoryCounts = USER_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'All'
      ? sortedAllUploads.length
      : sortedAllUploads.filter(i => i.type === cat.toLowerCase()).length;
    return acc;
  }, {});

  const visibleCategories = showDropdown
    ? USER_CATEGORIES.filter((c, i) => i < 2 || c === userCategory)
    : USER_CATEGORIES;

  const dropdownCategories = USER_CATEGORIES.filter(c => !visibleCategories.includes(c));

  const filteredUploads = userCategory === 'All'
    ? sortedAllUploads
    : sortedAllUploads.filter(i => i.type === userCategory.toLowerCase());

  const logoUploads = sortedAllUploads.filter(i => i.type === 'logo');
  const patternUploads = sortedAllUploads.filter(i => i.type === 'pattern');
  const designUploads = sortedAllUploads.filter(i => i.type === 'design');

  const visibleDefaultTabs = (defaultTab === 'Floral' || defaultTab === 'Damask')
    ? ['Floral', 'Damask']
    : defaultTab === 'Carry Bag'
    ? ['Carry Bag', 'T-Shirt']
    : ['T-Shirt', 'Carry Bag'];
  const dropdownDefaultTabs = DEFAULT_TABS.filter(c => !visibleDefaultTabs.includes(c));

  // ── Default assets by sub-tab ──────────────────────────────────────────────
  const defaultAssets = {
    'T-Shirt': tShirtGraphics,
    'Material': [],      // add material imports here when available
    'Carry Bag': carryBagGraphics,
    'Floral': floralGraphics,
    'Damask': damaskGraphics,
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleApplyFit = (fitType) => {
    if (!isImageSelected) {
      setWarningMessage('Please select a frame and image first');
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = setTimeout(() => setWarningMessage(''), 5000);
      return;
    }
    onApplyFit(fitType);
  };

  useEffect(() => () => { if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current); }, []);

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    window.addEventListener('contextmenu', close);
    return () => { window.removeEventListener('click', close); window.removeEventListener('contextmenu', close); };
  }, [contextMenu]);

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onUpload(file, url, undefined, selectedType);
  }, [onUpload, selectedType]);

  const handleFileChange = (e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ''; };
  const handleDragOver  = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); if (!e.currentTarget.contains(e.relatedTarget)) setIsDragOver(false); };
  const handleDrop      = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f); };

  const accentBg    = '#c0623a';
  const accentLight = '#fff5f0';
  const borderClr   = '#e5e7eb';

  return (
    <div style={compact ? { width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' } : { width: '100%', height: '100%', minHeight: 0, background: '#fff', borderRadius: 15, boxShadow: '0 8px 30px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* ── Scrollable Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px 20px 20px', display: 'flex', flexDirection: 'column', gap: 2, scrollbarWidth: 'thin' }}>

        {onOpenTapeLayout && modelUrl?.toLowerCase().includes('tape') && (
          <div className="mb-4">
            <button
              onClick={onOpenTapeLayout}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-[#c05520] bg-transparent hover:bg-orange-50 transition-all duration-300 cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-orange-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-[#c05520]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0l-6-6"
                    />
                  </svg>
                </div>
                <span className="font-bold text-[#c05520] text-[15px] tracking-wide">
                  Tape Layout
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4 text-[#c05520] group-hover:translate-x-1 transition-transform"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        )}

        {/* ── 1. Upload Type Selector ── */}
        <div style={{ flexShrink: 0 }} className='mb-4'>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Upload as</p>
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            {UPLOAD_TYPES.map(t => {
              const active = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 10px',
                    borderRadius: 12,
                    border: active ? 'none' : `1px solid ${borderClr}`,
                    background: active ? accentBg : '#f3f4f6',
                    color: active ? '#ffffff' : '#4b5563',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 11,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', scale: '0.85' }}>{t.icon}</span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. Drop Zone ── */}
        {selectedType && (
          <>
            <div
              onDragOver={handleDragOver} onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                flexShrink: 0,
                border: `2px dashed ${isDragOver ? accentBg : borderClr}`,
                borderRadius: 12,
                padding: '14px 10px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                background: isDragOver ? accentLight : '#f9fafb',
                transition: 'all 0.18s',
                transform: isDragOver ? 'scale(1.01)' : 'scale(1)',
              }}
            >
              <div style={{ transform: isDragOver ? 'translateY(-4px)' : 'translateY(0)', transition: 'transform 0.2s' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8}
                  stroke={isDragOver ? accentBg : '#9ca3af'} style={{ width: 28, height: 28, marginBottom: 4, display: 'block', margin: '0 auto 4px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              {isDragOver ? (
                <p style={{ fontSize: 12, fontWeight: 700, color: accentBg, margin: 0 }}>Drop to upload!</p>
              ) : (
                <>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', margin: '0 0 2px' }}>
                    Drag &amp; drop your <strong style={{ color: accentBg }}>{UPLOAD_TYPES.find(t => t.id === selectedType)?.label}</strong> here
                  </p>
                  <p style={{ fontSize: 10, color: '#9ca3af', margin: '0 0 10px' }}>or click to browse</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    style={{ padding: '6px 18px', background: accentBg, color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <style>{`
                      @keyframes uploadIntimation {
                        0% { transform: translateY(2px); }
                        50% { transform: translateY(-2px); }
                        100% { transform: translateY(2px); }
                      }
                    `}</style>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={2.2} 
                      stroke="currentColor" 
                      style={{ 
                        width: 14, 
                        height: 14,
                        animation: 'uploadIntimation 1.5s ease-in-out infinite'
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    Upload {UPLOAD_TYPES.find(t => t.id === selectedType)?.label}
                  </button>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
            </div>
            <p className='mb-4' style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', marginTop: 3, flexShrink: 0 }}>Supports PNG, JPG, WEBP, SVG</p>
          </>
        )}

        {/* ── Image Formatting ── */}
        <div style={{ flexShrink: 0, borderBottom: `1px solid ${borderClr}`, paddingBottom: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Image Formatting</p>
          </div>
          <div style={{ background: '#f3f4f6', padding: 4, borderRadius: 10, display: 'flex', gap: 4 }}>
            {['contain', 'cover', 'texture'].map(fit => {
              const active = isImageSelected && selectedLayer?.fitType === fit;
              return (
                <button key={fit} onClick={() => handleApplyFit(fit)} style={{
                  flex: 1, padding: '7px 6px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: active ? '#fff' : 'transparent',
                  color: active ? accentBg : '#000000',
                  fontSize: 11, fontWeight: active ? 700 : 500,
                  boxShadow: active ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                }}>
                  {fit === 'contain' && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 13, height: 13 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeDasharray="3 3" />
                      <rect x="5" y="7" width="14" height="10" rx="1" stroke="currentColor" fill="currentColor" fillOpacity="0.1" />
                    </svg>
                  )}
                  {fit === 'cover' && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 13, height: 13 }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeDasharray="3 3" />
                      <rect x="1" y="5" width="22" height="14" rx="1.5" stroke="currentColor" fill="currentColor" fillOpacity="0.15" />
                    </svg>
                  )}
                  {fit === 'texture' && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 13, height: 13 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75a2.25 2.25 0 0 1 2.25-2.25H6a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V8.25a2.25 2.25 0 0 1-2.25 2.25H18A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H18A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                    </svg>
                  )}
                  {fit === 'texture' ? 'Tile Pattern' : fit.charAt(0).toUpperCase() + fit.slice(1)}
                </button>
              );
            })}
          </div>
          

          {warningMessage && (
            <div style={{ marginTop: 8, fontSize: 11, color: accentBg, background: accentLight, border: `1px solid #ffebd8`, borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 15, height: 15, flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span style={{ fontWeight: 600 }}>{warningMessage}</span>
            </div>
          )}
        </div>

        {/* ── 3. Assets Section (Your / Default Tabs) ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

          {/* Main Tab Row */}
          <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${borderClr}`, marginBottom: 14, flexShrink: 0 }}>
            {[{ id: 'your', label: 'Your Assets' }, { id: 'default', label: 'Default Assets' }].map(tab => {
              const active = mainTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setMainTab(tab.id)} style={{
                  flex: 1, padding: '8px 4px', border: 'none', background: 'transparent',
                  borderBottom: active ? `2.5px solid ${accentBg}` : '2.5px solid transparent',
                  color: active ? accentBg : '#6b7280',
                  fontSize: 12, fontWeight: active ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.15s', marginBottom: -1,
                }}>
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── YOUR ASSETS ── */}
          {mainTab === 'your' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Category chips with count */}
              <div 
                ref={containerRef}
                style={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'space-between', position: 'relative', flexShrink: 0, width: '100%' }}
              >
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'nowrap' }}>
                  {visibleCategories.map(cat => (
                    <PillTab
                      key={cat}
                      label={cat}
                      active={userCategory === cat}
                      count={categoryCounts[cat]}
                      onClick={() => setUserCategory(cat)}
                    />
                  ))}
                </div>

                {showDropdown && dropdownCategories.length > 0 && (
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <button
                      onClick={() => setIsYourDropdownOpen(!isYourDropdownOpen)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        background: isYourDropdownOpen ? '#f3f4f6' : 'transparent',
                        color: '#6b7280',
                        border: '1.5px solid #e5e7eb',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 12, height: 12 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {isYourDropdownOpen && (
                      <>
                        <div
                          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                          onClick={() => setIsYourDropdownOpen(false)}
                        />
                        <div style={{
                          position: 'absolute', right: 0, top: '100%', marginTop: '6px',
                          width: '140px', background: '#fff', border: '1px solid #e5e7eb',
                          borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                          zIndex: 50, maxHeight: '200px', overflowY: 'auto', padding: '6px 0',
                          display: 'flex', flexDirection: 'column',
                        }}>
                          {dropdownCategories.map(cat => (
                            <button
                              key={cat}
                              onClick={() => {
                                setUserCategory(cat);
                                setIsYourDropdownOpen(false);
                              }}
                              style={{
                                width: '100%', padding: '8px 16px', border: 'none', background: 'transparent',
                                textAlign: 'left', fontSize: '11px', fontWeight: 600,
                                color: userCategory === cat ? '#c0623a' : '#374151',
                                cursor: 'pointer',
                              }}
                            >
                              {cat} ({categoryCounts[cat]})
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              {/* Grid / Grouped Content */}
              {userCategory === 'All' ? (
                sortedAllUploads.length === 0 ? (
                  <EmptyState label="No assets uploaded yet." />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {logoUploads.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Logos</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                          {logoUploads.map((item, idx) => (
                            <ImageTile
                              key={idx}
                              url={item.url}
                              alt={`Logo ${idx}`}
                              pinned={item.pinned}
                              onClick={() => onUpload(null, item.url)}
                              onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX + 2, y: e.clientY + 2, item }); }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {patternUploads.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Patterns</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                          {patternUploads.map((item, idx) => (
                            <ImageTile
                              key={idx}
                              url={item.url}
                              alt={`Pattern ${idx}`}
                              pinned={item.pinned}
                              onClick={() => onUpload(null, item.url)}
                              onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX + 2, y: e.clientY + 2, item }); }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {designUploads.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '11px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Design</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                          {designUploads.map((item, idx) => (
                            <ImageTile
                              key={idx}
                              url={item.url}
                              alt={`Image ${idx}`}
                              pinned={item.pinned}
                              onClick={() => onUpload(null, item.url)}
                              onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX + 2, y: e.clientY + 2, item }); }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {filteredUploads.length === 0 ? (
                    <EmptyState label={`No ${userCategory} assets uploaded yet.`} />
                  ) : (
                    filteredUploads.map((item, idx) => (
                      <ImageTile
                        key={idx}
                        url={item.url}
                        alt={`Upload ${idx}`}
                        pinned={item.pinned}
                        onClick={() => onUpload(null, item.url)}
                        onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX + 2, y: e.clientY + 2, item }); }}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── DEFAULT ASSETS ── */}
          {mainTab === 'default' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Sub-tab chips */}
              <div 
                style={{ display: 'flex', gap: '5px', alignItems: 'center', justifyContent: 'space-between', position: 'relative', flexShrink: 0, width: '100%' }}
              >
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'nowrap' }}>
                  {visibleDefaultTabs.map(tab => (
                    <PillTab
                      key={tab}
                      label={tab}
                      active={defaultTab === tab}
                      count={defaultAssets[tab].length}
                      onClick={() => setDefaultTab(tab)}
                    />
                  ))}
                </div>

                {dropdownDefaultTabs.length > 0 && (
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <button
                      onClick={() => setIsDefaultDropdownOpen(!isDefaultDropdownOpen)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        background: isDefaultDropdownOpen ? '#f3f4f6' : 'transparent',
                        color: '#6b7280',
                        border: '1.5px solid #e5e7eb',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 12, height: 12 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {isDefaultDropdownOpen && (
                      <>
                        <div
                          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                          onClick={() => setIsDefaultDropdownOpen(false)}
                        />
                        <div style={{
                          position: 'absolute', right: 0, top: '100%', marginTop: '6px',
                          width: '140px', background: '#fff', border: '1px solid #e5e7eb',
                          borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                          zIndex: 50, maxHeight: '200px', overflowY: 'auto', padding: '6px 0',
                          display: 'flex', flexDirection: 'column',
                        }}>
                          {dropdownDefaultTabs.map(tab => (
                            <button
                              key={tab}
                              onClick={() => {
                                setDefaultTab(tab);
                                setIsDefaultDropdownOpen(false);
                              }}
                              style={{
                                width: '100%', padding: '8px 16px', border: 'none', background: 'transparent',
                                textAlign: 'left', fontSize: '11px', fontWeight: 600,
                                color: defaultTab === tab ? '#c0623a' : '#374151',
                                cursor: 'pointer',
                              }}
                            >
                              {tab} ({defaultAssets[tab].length})
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              {/* Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {defaultAssets[defaultTab].length === 0 ? (
                  <EmptyState label={`No ${defaultTab} assets yet.`} />
                ) : (
                  defaultAssets[defaultTab].slice(0, visibleCount).map((url, idx) => (
                    <ImageTile
                      key={idx}
                      url={url}
                      alt={`${defaultTab} ${idx + 1}`}
                      onClick={() => onUpload(null, url, undefined, undefined, true)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Context Menu ── */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed', zIndex: 9999, top: contextMenu.y, left: contextMenu.x,
            background: '#fff', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            border: `1px solid ${borderClr}`, padding: '6px 0', minWidth: 140,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ padding: '4px 12px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Options</div>
          
          <button 
            onClick={() => { 
              if (onTogglePinUploadedImage) {
                onTogglePinUploadedImage(contextMenu.item.url);
              }
              setContextMenu(null); 
            }}
            style={{ width: '100%', padding: '8px 12px', fontSize: 12, fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = accentLight; e.currentTarget.style.color = accentBg; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" style={{ width: 13, height: 13, flexShrink: 0 }}>
              <path d="M16 12V4h1v-2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
            </svg>
            {contextMenu.item?.pinned ? 'Unpin' : 'Pin to Top'}
          </button>

          <button 
            onClick={() => { 
              if (onDeleteUploadedImage) {
                onDeleteUploadedImage(contextMenu.item.url);
              }
              setContextMenu(null); 
            }}
            style={{ width: '100%', padding: '8px 12px', fontSize: 12, fontWeight: 500, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 7, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 13, height: 13, flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
