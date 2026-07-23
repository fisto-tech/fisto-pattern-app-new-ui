import React, { useMemo, useState } from 'react';
import { MODELS } from './ModelsPopup';
import { getCleanCapFileName } from '../../utils/capConfigs';

// Use import.meta.glob to efficiently find all GLB and PNG files in layouts
const layoutModelsGlob = import.meta.glob('../../assets/layouts/**/*.glb', { eager: true, import: 'default' });
const layoutImagesGlob = import.meta.glob('../../assets/layouts/**/*.webp', { eager: true, import: 'default' });

const LAYOUT_MAPPING = {
  'beverage-cup': 'Carton Boxes/Beverage Bottle',
  'die-cut-box': 'Carton Boxes/Die Cut',
  'folding-box': 'Carton Boxes/Folding',
  'glass-bottle': 'Drinkware bottles/Glass bottle',
  'plastic-water-bottle': 'Drinkware bottles/Plastic Bottle',
  'soft-drinks-bottle': 'Drinkware bottles/soft drinks',
  'steel-bottle': 'Drinkware bottles/Steel Bottle',
  'biodegradable-bags': 'Eco friendly/Bio degradable',
  'paper-bag': 'Eco friendly/Paper Bag',
  't-shirt': 'Fashion wear/T shirt',
  'hoodie': 'Fashion wear/Hoodie',
  'oval-container': 'Food Container/Oval',
  'round-container': 'Food Container/Round',
  'tamper-evident': 'Food Container/TE',
  'kraft-paper': 'Food Packaging/Kraft Paper',
  'zip-lock-pouches': 'Food Packaging/Zip lock',
  'box-sealing-tape': 'Packaging tapes/Sealing tapes'
};

export function getSingleModelUrl(layoutModelUrl) {
  if (!layoutModelUrl) return layoutModelUrl;
  let found = MODELS.find(m => m.modelUrl === layoutModelUrl);
  if (found) return layoutModelUrl;

  const layoutPath = Object.keys(layoutModelsGlob).find(p => layoutModelsGlob[p] === layoutModelUrl);
  if (layoutPath) {
     const mappedEntry = Object.entries(LAYOUT_MAPPING).find(([id, path]) => layoutPath.includes(path));
     if (mappedEntry) {
        const baseModel = MODELS.find(m => m.id === mappedEntry[0]);
        if (baseModel) return baseModel.modelUrl;
     }
  }
  return layoutModelUrl;
}

export default function LayoutPopup({
  currentModelUrl,
  onSelectLayout,
  selectedCapUrl,
  currentCapOffsets = {},
  updateCapOffset,
  updateCapUniformScale,
  onSaveCapConfig,
  isLayoutSelected = false,
  isScaledUp = false,
  onToggleScale,
  onClose,
  isHorizontal = false,
}) {
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleSaveConfig = () => {
    if (onSaveCapConfig) {
      onSaveCapConfig();
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopyCapConfigs = () => {
    let allCapConfigs = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cap_offset_')) {
        try {
          const val = JSON.parse(localStorage.getItem(key));
          const parts = key.replace('cap_offset_', '').split('_');
          const capFile = parts.pop();
          let rawModelKey = parts.join('_');
          const cleanKey = decodeURIComponent(rawModelKey.split('?')[0]);
          if (!allCapConfigs[cleanKey]) allCapConfigs[cleanKey] = {};
          allCapConfigs[cleanKey][capFile] = val;
        } catch (e) {
          console.error(e);
        }
      }
    }
    const formattedJs = `export const BOTTLE_CAP_CONFIGS = ${JSON.stringify(allCapConfigs, null, 2)};`;
    navigator.clipboard.writeText(formattedJs);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const currentModel = useMemo(() => {
    const directMatch = MODELS.find((m) => m.modelUrl === currentModelUrl);
    if (directMatch) return directMatch;

    const layoutPath = Object.keys(layoutModelsGlob).find(p => layoutModelsGlob[p] === currentModelUrl);
    if (layoutPath) {
       const mappedEntry = Object.entries(LAYOUT_MAPPING).find(([id, path]) => layoutPath.includes(path));
       if (mappedEntry) {
          return MODELS.find(m => m.id === mappedEntry[0]);
       }
    }
    return MODELS[0];
  }, [currentModelUrl]);

  const availableLayouts = useMemo(() => {
    if (!currentModel || !LAYOUT_MAPPING[currentModel.id]) return [];
    const prefix = `../../assets/layouts/${LAYOUT_MAPPING[currentModel.id]}/`;
    
    const modelPaths = Object.keys(layoutModelsGlob).filter(p => p.startsWith(prefix));
    
    return modelPaths.map((modelPath, index) => {
      const baseName = modelPath.substring(modelPath.lastIndexOf('/') + 1).replace(/\.glb$/, '');
      const imagePath = modelPath.replace(/\.glb$/, '.webp');
      
      let imageUrl = layoutImagesGlob[imagePath];
      if (!imageUrl) {
         const cleanBase = baseName.replace(/\s+/g, '');
         const fuzzyPath = Object.keys(layoutImagesGlob).find(p => 
            p.startsWith(prefix) && p.replace(/\s+/g, '').includes(cleanBase)
         );
         if (fuzzyPath) imageUrl = layoutImagesGlob[fuzzyPath];
      }

      return {
        id: `layout-${index + 1}`,
        name: `Layout ${index + 1}`,
        modelUrl: layoutModelsGlob[modelPath],
        imageUrl: imageUrl || null
      };
    });
  }, [currentModel]);

  return (
    <div className={`w-full h-fit max-h-full shrink-0 flex flex-col z-20 transition-all duration-300 ${isHorizontal ? 'bg-transparent border-none shadow-none p-0' : 'bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-gray-100/80 overflow-hidden'}`}>
      <div className={`flex justify-between items-center ${isHorizontal ? 'border-b-0 p-0 mb-2' : 'p-4 pb-3 border-b border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-gray-900 m-0">Layouts</h2>
          <span className="text-[10px] bg-orange-50 text-[#c05520] px-1.5 py-0.2 rounded font-bold">
            {availableLayouts.length}
          </span>
        </div>

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

      <div className={isHorizontal ? "overflow-x-auto no-scrollbar flex-1 py-1 px-1" : "px-5 pb-5 overflow-y-auto flex-1"}>
        {availableLayouts.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            No layouts available for this model.
          </div>
        ) : (
          <div className={isHorizontal ? "flex items-center gap-3" : "grid grid-cols-2 gap-3"}>
            {/* Default / Single model button */}
            {currentModel && (
              <button
                type="button"
                onClick={() => onSelectLayout(currentModel.modelUrl)}
                className={`relative overflow-hidden rounded-lg cursor-pointer transition-all hover:opacity-90 flex flex-col items-center justify-center shrink-0 border border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-100/50 ${
                  isHorizontal ? 'w-16 h-16' : 'aspect-[1.2]'
                } ${
                  currentModelUrl === currentModel.modelUrl ? 'ring-2 ring-[#c05520] ring-offset-2 border-solid' : ''
                }`}
              >
                {currentModel.imageUrl ? (
                  <img src={currentModel.imageUrl} alt="Default" className="w-8 h-8 object-contain opacity-75" />
                ) : (
                  <span className="text-[10px] font-bold text-gray-500">Default</span>
                )}
                <div className="absolute bottom-0.5 inset-x-0 text-center text-[8px] font-bold text-gray-500 bg-white/80 py-0.2">
                  Default
                </div>
                {currentModelUrl === currentModel.modelUrl && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#c05520] rounded-full flex items-center justify-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-2.5 h-2.5">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            )}

            {availableLayouts.map((layout) => {
              const isActive = layout.modelUrl === currentModelUrl;
              return (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => onSelectLayout(layout.modelUrl)}
                  className={`relative overflow-hidden rounded-lg cursor-pointer transition-all hover:opacity-90 flex items-center justify-center shrink-0 ${
                    isHorizontal ? 'w-16 h-16' : 'aspect-[1.2]'
                  } ${
                    isActive ? 'ring-2 ring-[#c05520] ring-offset-2' : ''
                  }`}
                >
                  {layout.imageUrl ? (
                    <img src={layout.imageUrl} alt={layout.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-gray-400">No Preview</span>
                  )}
                  {isActive && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#c05520] rounded-full flex items-center justify-center shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-2.5 h-2.5">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Layout Cap Configuration Panel (Text-input based) */}
      {selectedCapUrl && selectedCapUrl !== "none" && isLayoutSelected && (
        <div className={isHorizontal ? "p-2 px-3 border border-gray-100 rounded-xl bg-gray-50/70 flex items-center gap-4 text-xs mt-1 shrink-0 overflow-x-auto no-scrollbar" : "p-4 border-t border-gray-100 bg-gray-50/70 flex flex-col gap-2.5"}>
          <div className="flex flex-col gap-0.5 shrink-0">
            <span className="text-[10px] font-bold text-gray-800">
              Cap Settings ({getCleanCapFileName(selectedCapUrl)})
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <button
                type="button"
                onClick={handleSaveConfig}
                className={`text-[9px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer shadow-sm border-none ${
                  isSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#c05520] hover:bg-[#a04418] text-white'
                }`}
              >
                {isSaved ? 'Saved ✓' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCopyCapConfigs}
                title="Copy all cap configs as JS object"
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer shadow-sm border border-gray-200 ${
                  isCopied
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {isCopied ? 'Copied ✓' : 'Copy JS'}
              </button>
            </div>
          </div>

          <div className={isHorizontal ? "flex items-center gap-3 text-xs flex-1" : "grid grid-cols-2 gap-2 text-xs"}>
            <div className="flex flex-col gap-0.5 shrink-0">
              <label className="text-[9px] text-gray-500 font-medium">Uniform Scale</label>
              <input
                type="number"
                step="0.01"
                value={currentCapOffsets.scaleX ?? 0}
                onChange={(e) => updateCapUniformScale && updateCapUniformScale(parseFloat(e.target.value) || 0)}
                className="w-14 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-800 font-mono text-[10px] focus:outline-none focus:border-[#c05520]"
                placeholder="1.00"
              />
            </div>

            <div className="flex flex-col gap-0.5 shrink-0">
              <label className="text-[9px] text-gray-500 font-medium">Pos Y (Height)</label>
              <input
                type="number"
                step="0.001"
                value={currentCapOffsets.posY ?? 0}
                onChange={(e) => updateCapOffset && updateCapOffset("posY", parseFloat(e.target.value) || 0)}
                className="w-14 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-800 font-mono text-[10px] focus:outline-none focus:border-[#c05520]"
                placeholder="0.000"
              />
            </div>

            <div className="flex flex-col gap-0.5 shrink-0">
              <label className="text-[9px] text-gray-500 font-medium">Pos X (Offset)</label>
              <input
                type="number"
                step="0.001"
                value={currentCapOffsets.posX ?? 0}
                onChange={(e) => updateCapOffset && updateCapOffset("posX", parseFloat(e.target.value) || 0)}
                className="w-14 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-800 font-mono text-[10px] focus:outline-none focus:border-[#c05520]"
                placeholder="0.000"
              />
            </div>

            <div className="flex flex-col gap-0.5 shrink-0">
              <label className="text-[9px] text-gray-500 font-medium">Pos Z (Offset)</label>
              <input
                type="number"
                step="0.001"
                value={currentCapOffsets.posZ ?? 0}
                onChange={(e) => updateCapOffset && updateCapOffset("posZ", parseFloat(e.target.value) || 0)}
                className="w-14 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-800 font-mono text-[10px] focus:outline-none focus:border-[#c05520]"
                placeholder="0.000"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
