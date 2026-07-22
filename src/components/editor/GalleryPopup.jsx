import { useState, useEffect } from "react";
import { MODELS } from "./ModelsPopup";

export default function GalleryPopup({ onLoadScene }) {
  const [scenes, setScenes] = useState([]);

  useEffect(() => {
    loadSavedScenes();
  }, []);

  const loadSavedScenes = () => {
    try {
      const stored = localStorage.getItem("fisto_saved_scenes");
      if (stored) {
        setScenes(JSON.parse(stored));
      } else {
        setScenes([]);
      }
    } catch (err) {
      console.error("Error reading saved scenes:", err);
      setScenes([]);
    }
  };

  const handleDeleteScene = (id, e) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem("fisto_saved_scenes");
      if (stored) {
        const parsed = JSON.parse(stored);
        const filtered = parsed.filter((s) => s.id !== id);
        localStorage.setItem("fisto_saved_scenes", JSON.stringify(filtered));
        setScenes(filtered);
      }
    } catch (err) {
      console.error("Error deleting scene:", err);
    }
  };

  const getModelThumbnail = (modelUrl) => {
    const matched = MODELS.find((m) => m.modelUrl === modelUrl);
    return matched ? matched.imageUrl : null;
  };

  const getModelName = (modelUrl) => {
    const matched = MODELS.find((m) => m.modelUrl === modelUrl);
    return matched ? matched.name : "3D Model";
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="w-full h-full bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-gray-100/80 p-6 flex flex-col overflow-hidden z-20">
      {/* Header */}
      <div className="mb-5 shrink-0">
        <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <span>Saved Gallery</span>
          <span className="text-xs bg-[#c05520]/10 text-[#c05520] px-2 py-0.5 rounded-full font-bold">
            {scenes.length}
          </span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Quickly restore your customized 3D models and lighting presets.
        </p>
      </div>

      {/* Scrollable List container */}
      <div className="flex-1 overflow-y-auto rounded-xl pr-1">
        {scenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center h-full">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-[#9f9891]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-gray-700 text-sm">No Saved Scenes</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-[200px] leading-relaxed">
              Use the Save button at the top right to store your current designs.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4.5 pb-4">
            {scenes.map((scene) => {
              const thumbnail = getModelThumbnail(scene.modelUrl);
              const modelName = getModelName(scene.modelUrl);
              return (
                <div
                  key={scene.id}
                  onClick={() => onLoadScene(scene)}
                  className="group relative flex items-center gap-4 p-3 bg-gray-50/70 hover:bg-gray-50 border border-gray-100 hover:border-[#c05520]/25 rounded-2xl cursor-pointer transition-all duration-200"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 relative shadow-sm">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={modelName}
                        className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-200"
                      />
                    ) : (
                      <span className="text-[20px]">📦</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-[#c05520] transition-colors">
                      {scene.name}
                    </h4>
                    <p className="text-[10px] text-[#c05520] font-bold tracking-wider uppercase mt-0.5 truncate">
                      {modelName}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDate(scene.createdAt)}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteScene(scene.id, e)}
                    className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 absolute right-3 top-1/2 -translate-y-1/2 shadow-sm"
                    title="Delete Saved Scene"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
