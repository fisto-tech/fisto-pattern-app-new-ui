import { useState, useRef, useEffect } from 'react';

// Carton Box Models
import beverageCupUrl from "../../assets/models/Carton box/Beverage/Beverage Cup.glb?url";
import beverageCupImg from "../../assets/models/Carton box/Beverage/Beverage.webp";
import dieCutBoxUrl from "../../assets/models/Carton box/Die cut/Die cut.glb?url";
import dieCutBoxImg from "../../assets/models/Carton box/Die cut/iecutd.webp";
import foldingBoxUrl from "../../assets/models/Carton box/Folding/Folding.glb?url";
import foldingBoxImg from "../../assets/models/Carton box/Folding/Folding.webp";

// Drinkware Bottles Models
import glassBottleUrl from "../../assets/models/Drinkware Bottles/Glass Bottle/glass_Bottle.glb?url";
import glassBottleImg from "../../assets/models/Drinkware Bottles/Glass Bottle/Glass bottle1.webp";
import plasticWaterBottleUrl from "../../assets/models/Drinkware Bottles/Plastic water bottles/Plastic Water bottle.glb?url";
import plasticWaterBottleImg from "../../assets/models/Drinkware Bottles/Plastic water bottles/plastic water bottle.webp";
import softDrinksBottleUrl from "../../assets/models/Drinkware Bottles/Soft drinks/Soft drinks bottle.glb?url";
import softDrinksBottleImg from "../../assets/models/Drinkware Bottles/Soft drinks/05.waterbottle.webp";
import steelBottleUrl from "../../assets/models/Drinkware Bottles/Steel Bottle/Steel bottle.glb?url";
import steelBottleImg from "../../assets/models/Drinkware Bottles/Steel Bottle/Steel bottle.webp";

// Eco friendly Models
import biodegradableBagsUrl from "../../assets/models/Eco friendly/Bio degradable/Biodegradable bags.glb?url";
import biodegradableBagsImg from "../../assets/models/Eco friendly/Bio degradable/Biodegradable.webp";
import paperBagUrl from "../../assets/models/Eco friendly/Paper Bags/Paper Bag-1.glb?url";
import paperBagImg from "../../assets/models/Eco friendly/Paper Bags/02.Plastic Bag.webp";

// Fashion Wear Models
import tshirtUrl from "../../assets/models/Fashion Wear/T-shirt/t s1.glb?url";
import tshirtImg from "../../assets/models/Fashion Wear/T-shirt/tShirt.webp";
import hoodieUrl from "../../assets/models/Fashion Wear/hoodie/Hoodie2.glb?url";
import hoodieImg from "../../assets/models/Fashion Wear/hoodie/Hoodie.webp";

// Food Containers Models
import ovalContainerUrl from "../../assets/models/Food Containers/Oval/oval .glb?url";
import ovalContainerImg from "../../assets/models/Food Containers/Oval/Oval.webp";
import roundContainerUrl from "../../assets/models/Food Containers/Round/Round.glb?url";
import roundContainerImg from "../../assets/models/Food Containers/Round/02.Round.webp";
import tamperEvidentUrl from "../../assets/models/Food Containers/Tamper Evident/TE .glb?url";
import tamperEvidentImg from "../../assets/models/Food Containers/Tamper Evident/TE-3.webp";

// Food Packaging Models
import kraftPaperUrl from "../../assets/models/Food Packaging/Kraft Paper/Craft paper.glb?url";
import kraftPaperImg from "../../assets/models/Food Packaging/Kraft Paper/Kraft paper.webp";
import zipLockPouchesUrl from "../../assets/models/Food Packaging/zip lock Pouches bag/Zip lock Pouches.glb?url";
import zipLockPouchesImg from "../../assets/models/Food Packaging/zip lock Pouches bag/zip lock pouches.webp";

// Packaging tapes Models
import boxSealingTapeUrl from "../../assets/models/Packaging tapes/Box sealing Tape/Box_Tape.glb?url";
import boxSealingTapeImg from "../../assets/models/Packaging tapes/Box sealing Tape/Tape.webp";

export const MODELS = [
  // Food Containers
  { id: 'round-container', name: 'Round Container', modelUrl: roundContainerUrl, category: 'Food Containers', imageUrl: roundContainerImg },
  { id: 'tamper-evident', name: 'Tamper Evident Container', modelUrl: tamperEvidentUrl, category: 'Food Containers', imageUrl: tamperEvidentImg },
  { id: 'oval-container', name: 'Oval Containers', modelUrl: ovalContainerUrl, category: 'Food Containers', imageUrl: ovalContainerImg },

  // Food Packaging
  { id: 'zip-lock-pouches', name: 'Zip Lock Pouches', modelUrl: zipLockPouchesUrl, category: 'Food Packaging', imageUrl: zipLockPouchesImg },
  { id: 'kraft-paper', name: 'Kraft Paper Pouches', modelUrl: kraftPaperUrl, category: 'Food Packaging', imageUrl: kraftPaperImg },

  // Drinkware Bottles
  { id: 'plastic-water-bottle', name: 'Plastic Water Bottle', modelUrl: plasticWaterBottleUrl, category: 'Drinkware Bottles', imageUrl: plasticWaterBottleImg },
  { id: 'glass-bottle', name: 'Glass Water Bottle', modelUrl: glassBottleUrl, category: 'Drinkware Bottles', imageUrl: glassBottleImg },
  { id: 'soft-drinks-bottle', name: 'Soft Drink Bottles', modelUrl: softDrinksBottleUrl, category: 'Drinkware Bottles', imageUrl: softDrinksBottleImg },
  { id: 'steel-bottle', name: 'Steel Bottle', modelUrl: steelBottleUrl, category: 'Drinkware Bottles', imageUrl: steelBottleImg },

  // Carton Box
  { id: 'folding-box', name: 'Folding Carton Box', modelUrl: foldingBoxUrl, category: 'Carton box', imageUrl: foldingBoxImg },
  { id: 'die-cut-box', name: 'Die-Cut Carton Box', modelUrl: dieCutBoxUrl, category: 'Carton box', imageUrl: dieCutBoxImg },
  { id: 'beverage-cup', name: 'Beverage Carton Box', modelUrl: beverageCupUrl, category: 'Carton box', imageUrl: beverageCupImg },

  // Eco friendly
  { id: 'paper-bag', name: 'Paper Bags', modelUrl: paperBagUrl, category: 'Eco friendly', imageUrl: paperBagImg },
  { id: 'biodegradable-bags', name: 'Biodegradable Bags', modelUrl: biodegradableBagsUrl, category: 'Eco friendly', imageUrl: biodegradableBagsImg },

  // Packaging tapes
  { id: 'box-sealing-tape', name: 'Box Sealing Tape', modelUrl: boxSealingTapeUrl, category: 'Packaging tapes', imageUrl: boxSealingTapeImg },

  // Fashion Wear
  { id: 't-shirt', name: 'T-Shirts', modelUrl: tshirtUrl, category: 'Fashion Wear', imageUrl: tshirtImg },
  { id: 'hoodie', name: 'Hoodies', modelUrl: hoodieUrl, category: 'Fashion Wear', imageUrl: hoodieImg },
];

const CATEGORIES = [
  'Food Containers',
  'Food Packaging',
  'Drinkware Bottles',
  'Carton box',
  'Eco friendly',
  'Packaging tapes',
  'Fashion Wear'
];

const QUICK_TAGS = [
  'All',
  'Beverage Cup', 'Die cut', 'Folding',
  'Glass Bottle', 'Plastic Water Bottle', 'Soft drinks', 'Steel Bottle',
  'Bio degradable', 'Paper Bags',
  'T-shirt', 'Hoodie',
  'Oval', 'Round', 'Tamper Evident',
  'Kraft Paper', 'Zip lock Pouches',
  'Box sealing Tape'
];

const TAG_TO_MODEL_IDS = {
  'Die cut': ['die-cut-box'],
  'Glass Bottle': ['glass-bottle'],
  'Soft drinks': ['soft-drinks-bottle'],
  'Bio degradable': ['biodegradable-bags'],
  'Plastic Water Bottle': ['plastic-water-bottle'],
  'Beverage Cup': ['beverage-cup']
};

export default function ModelsPopup({
  onSelectModel,
  currentModelUrl,
  isScaledUp,
  onToggleScale,
  onClose,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const activeModelRef = useRef(null);

  useEffect(() => {
    if (activeModelRef.current) {
      activeModelRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'center'
      });
    }
  }, [currentModelUrl]);

  const filteredModels = MODELS.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          model.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTag = false;
    if (selectedTag === 'All') {
      matchesTag = true;
    } else {
      const mappedIds = TAG_TO_MODEL_IDS[selectedTag];
      if (mappedIds) {
        matchesTag = mappedIds.includes(model.id);
      } else {
        matchesTag = model.name.toLowerCase().includes(selectedTag.toLowerCase()) ||
                     model.category.toLowerCase().includes(selectedTag.toLowerCase());
      }
    }

    return matchesSearch && matchesTag;
  });

  const visibleTags = ['All', 'Folding', 'Round'];
  const displayTags = [...visibleTags];
  if (selectedTag && !visibleTags.includes(selectedTag)) {
    displayTags.push(selectedTag);
  }

  return (
    <div className="w-full h-full bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-gray-100/80 overflow-hidden flex flex-col z-20 transition-all duration-300">
      <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 m-0">Select Model</h2>
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
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-[#c05520] hover:bg-[#a94a1c] text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              Import
              <input 
                type="file" 
                accept=".glb" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    onSelectModel(url);
                    e.target.value = '';
                  }
                }}
              />
            </label>
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
        </div>
        
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search models..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c05520] transition-colors bg-gray-50"
          />
        </div>

        {/* Quick select horizontal chips with Drop Arrow */}
        <div className="flex gap-1.5 py-1 items-center justify-between relative">
          <div className="flex gap-1.5 overflow-hidden flex-wrap max-h-8">
            {displayTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-200 border ${
                    isSelected 
                      ? 'bg-[#c05520] text-white border-[#c05520] shadow-sm scale-[1.02]' 
                      : 'bg-gray-50 text-gray-600 border-gray-200/80 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="relative shrink-0">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`p-1.5 rounded-lg border text-gray-500 hover:text-gray-900 bg-gray-50 border-gray-200 hover:bg-gray-100 cursor-pointer flex items-center justify-center transition-all ${isDropdownOpen ? 'bg-gray-100 border-gray-300' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto py-1.5 flex flex-col">
                  {QUICK_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(tag);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-4 py-2 text-left text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer ${selectedTag === tag ? 'text-[#c05520] bg-orange-50/50' : 'text-gray-700'}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-6">
        {CATEGORIES.map((category) => {
          const catModels = filteredModels.filter(m => m.category === category);
          if (catModels.length === 0) return null;

          return (
            <div key={category} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-l-4 border-[#c05520] pl-2.5 py-0.5">
                <h4 className="text-xs font-bold tracking-wider uppercase text-gray-800 m-0">
                  {category}
                </h4>
                <span className="text-[12px] bg-orange-50 text-[#c05520] font-bold px-1.5 py-0.5 rounded-md">
                  {catModels.length}
                </span>
              </div>
              
              <div className={`grid gap-3 ${isScaledUp ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-2'}`}>
                {catModels.map((model) => {
                  const isActive = currentModelUrl === model.modelUrl;
                  const img = model.imageUrl;
                  return (
                    <button 
                      key={model.id}
                      ref={isActive ? activeModelRef : null}
                      onClick={() => onSelectModel(model.modelUrl)}
                      title={model.name}
                      className={`aspect-square rounded-2xl relative overflow-hidden transition-all cursor-pointer border-2 p-0 ${
                        isActive ? 'border-[#c05520] shadow-sm' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {img ? (
                        <img src={img} alt={model.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                      {isActive && (
                        <div className="absolute bottom-2 right-2 w-5 h-5 bg-[#c05520] rounded-full flex items-center justify-center shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
