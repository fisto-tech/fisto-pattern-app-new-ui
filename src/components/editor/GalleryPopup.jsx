import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MODELS } from "./ModelsPopup";

export default function GalleryPopup({ onLoadScene, isScaledUp, onToggleScale, onClose, isHorizontal = false }) {
  const [scenes, setScenes] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const uniqueScenes = scenes.filter((scene, index, self) =>
    self.findIndex((s) => s.id === scene.id || (s.name === scene.name && s.modelUrl === scene.modelUrl)) === index
  );

  useEffect(() => {
    loadSavedScenes();

    const handleSceneSaved = () => {
      loadSavedScenes();
    };

    window.addEventListener("fisto_scene_saved", handleSceneSaved);
    return () => {
      window.removeEventListener("fisto_scene_saved", handleSceneSaved);
    };
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
    setDeleteConfirmId(id);
  };

  const executeDelete = (id) => {
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

  const deleteModalMarkup = deleteConfirmId && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-100 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#dc2626" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </div>
        <h3 className="text-gray-900 font-extrabold text-lg mb-2">Delete Design?</h3>
        <p className="text-gray-500 text-sm mb-6 font-medium leading-relaxed">
          Are you sure you want to delete this saved design? This action cannot be undone.
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs border-none cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              executeDelete(deleteConfirmId);
              setDeleteConfirmId(null);
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-xs border-none cursor-pointer transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`w-full h-fit shrink-0 flex flex-col z-20 transition-all duration-300 ${isHorizontal ? 'bg-transparent border-none shadow-none p-0 overflow-visible' : 'bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.08)] border border-gray-100/80 p-5 overflow-hidden'}`}>
      {/* Header */}
      <div className={`shrink-0 flex items-center justify-between ${isHorizontal ? 'border-b-0 p-0 mb-2' : 'mb-4 pb-3 border-b border-gray-100'}`}>
        <div>
          <h2 className="text-xs font-bold text-gray-900 tracking-tight flex items-center gap-2 m-0">
            <span>Saved Gallery</span>
            <span className="text-[10px] bg-[#c05520]/10 text-[#c05520] px-1.5 py-0.2 rounded-full font-bold">
              {uniqueScenes.length}
            </span>
          </h2>
        </div>
        {isHorizontal && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#c05520] font-bold text-[10px] border-none cursor-pointer transition-all ml-auto"
          >
            <span>{expanded ? "Less" : "More"}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        )}
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

      {/* Scrollable List container (Only shown when collapsed) */}
      {(!isHorizontal || !expanded) && (
        <div className={isHorizontal ? "overflow-x-auto no-scrollbar flex-1 py-1" : "flex-1 overflow-y-auto rounded-xl pr-1"}>
          {uniqueScenes.length === 0 ? (
            <div className="text-center text-gray-400 py-4 text-xs">
              No Saved Scenes
            </div>
          ) : (
            <div className={isHorizontal ? "flex items-center gap-3 pr-8" : "grid grid-cols-1 gap-4.5 pb-4"}>
              {uniqueScenes.map((scene) => {
                const thumbnail = getModelThumbnail(scene.modelUrl);
                const modelName = getModelName(scene.modelUrl);
                return (
                  <div
                    key={scene.id}
                    onClick={() => onLoadScene(scene)}
                    className={`group relative flex items-center gap-2.5 border border-gray-100 hover:border-[#c05520]/25 rounded-xl cursor-pointer transition-all duration-200 shrink-0 ${isHorizontal ? 'p-1.5 pr-2.5 bg-gray-50/50 w-44' : 'p-3 bg-gray-50/70 hover:bg-gray-50'}`}
                  >
                    {/* Thumbnail */}
                    <div className={`rounded-lg bg-white border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 relative shadow-sm ${isHorizontal ? 'w-10 h-10' : 'w-16 h-16'}`}>
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={modelName}
                          className="w-full h-full object-contain p-0.5 group-hover:scale-110 transition-transform duration-200"
                        />
                      ) : (
                        <span className="text-[14px]">📦</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-bold text-gray-800 text-xs truncate group-hover:text-[#c05520] transition-colors">
                        {scene.name}
                      </h4>
                      <p className="text-[9px] text-[#c05520] font-bold mt-0.5 truncate uppercase tracking-wide">
                        {modelName}
                      </p>
                      {!isHorizontal && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          {formatDate(scene.createdAt)}
                        </p>
                      )}
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteScene(scene.id, e)}
                      className={`rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-100 flex items-center justify-center transition-all duration-150 absolute right-2 top-1/2 -translate-y-1/2 shadow-sm ${isHorizontal ? 'w-6 h-6 opacity-100' : 'w-8 h-8 opacity-0 group-hover:opacity-100'}`}
                      title="Delete Saved Scene"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="w-3 h-3"
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
      )}

      {/* Expanded Grid (revealed below when expanded is true, stretching w-full) */}
      {isHorizontal && expanded && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-2 w-full">
          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">All Saved Designs</div>
          <div className="max-h-[110px] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pr-1 pb-1">
            {uniqueScenes.map((scene) => {
              const thumbnail = getModelThumbnail(scene.modelUrl);
              const modelName = getModelName(scene.modelUrl);
              return (
                <div
                  key={scene.id}
                  onClick={() => onLoadScene(scene)}
                  className="group relative flex items-center gap-2 border border-gray-100 hover:border-[#c05520]/25 rounded-xl cursor-pointer p-1.5 bg-gray-50/50 hover:bg-gray-50 transition-all duration-200"
                >
                  {/* Thumbnail */}
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 relative shadow-sm">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={modelName}
                        className="w-full h-full object-contain p-0.5 group-hover:scale-110 transition-transform duration-200"
                      />
                    ) : (
                      <span className="text-[11px]">📦</span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className="font-bold text-gray-800 text-[10px] truncate group-hover:text-[#c05520] transition-colors">
                      {scene.name}
                    </h4>
                    <p className="text-[7.5px] text-[#c05520] font-bold mt-0.5 truncate uppercase tracking-wide">
                      {modelName}
                    </p>
                  </div>
                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteScene(scene.id, e)}
                    className="w-5.5 h-5.5 rounded-full bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-100 flex items-center justify-center transition-all duration-150 absolute right-1.5 top-1/2 -translate-y-1/2 shadow-sm"
                    title="Delete Saved Scene"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-2.5 h-2.5"
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
        </div>
      )}

      {/* Delete Confirmation Modal (Using createPortal to render outside parents' overflow-hidden wrappers) */}
      {deleteConfirmId && typeof document !== "undefined" &&
        createPortal(deleteModalMarkup, document.body)
      }
    </div>
  );
}
