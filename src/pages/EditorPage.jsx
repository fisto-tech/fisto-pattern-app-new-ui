import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import EditorScreen1 from "../components/editor/EditorScreen1";
import EditorScreen2 from "../components/editor/EditorScreen2";
import { MODELS } from "../components/editor/ModelsPopup";
import roundContainerUrl from "../assets/models/Food Containers/Round/Round.glb?url";
import { getSingleModelUrl } from "../components/editor/LayoutPopup";
import cap1Url from "../assets/models/Drinkware Bottles/Caps/Cap1.glb?url";
import cap2Url from "../assets/models/Drinkware Bottles/Caps/Cap2.glb?url";
import cap3Url from "../assets/models/Drinkware Bottles/Caps/Cap3.glb?url";
import cap4Url from "../assets/models/Drinkware Bottles/Caps/Cap4.glb?url";
import cap5Url from "../assets/models/Drinkware Bottles/Caps/Cap5.glb?url";
import cap6Url from "../assets/models/Drinkware Bottles/Caps/Cap6.glb?url";
import cap7Url from "../assets/models/Drinkware Bottles/Caps/Cap7.glb?url";
import cap8Url from "../assets/models/Drinkware Bottles/Caps/Cap8.glb?url";

import cap1Img from "../assets/models/Drinkware Bottles/Caps/Cap1.webp";
import cap2Img from "../assets/models/Drinkware Bottles/Caps/Cap2.webp";
import cap3Img from "../assets/models/Drinkware Bottles/Caps/Cap3.webp";
import cap4Img from "../assets/models/Drinkware Bottles/Caps/Cap4.webp";
import cap5Img from "../assets/models/Drinkware Bottles/Caps/Cap5.webp";
import cap6Img from "../assets/models/Drinkware Bottles/Caps/Cap6.webp";
import cap7Img from "../assets/models/Drinkware Bottles/Caps/Cap7.webp";
import cap8Img from "../assets/models/Drinkware Bottles/Caps/Cap8.webp";

export const CAPS = [
  { id: "cap-1", name: "Cap 1", url: cap1Url, imageUrl: cap1Img },
  { id: "cap-2", name: "Cap 2", url: cap2Url, imageUrl: cap2Img },
  { id: "cap-3", name: "Cap 3", url: cap3Url, imageUrl: cap3Img },
  { id: "cap-4", name: "Cap 4", url: cap4Url, imageUrl: cap4Img },
  { id: "cap-5", name: "Cap 5", url: cap5Url, imageUrl: cap5Img },
  { id: "cap-6", name: "Cap 6", url: cap6Url, imageUrl: cap6Img },
  { id: "cap-7", name: "Cap 7", url: cap7Url, imageUrl: cap7Img },
  { id: "cap-8", name: "Cap 8", url: cap8Url, imageUrl: cap8Img },
];

export default function EditorPage() {
  const location = useLocation();
  const [currentScreen, setCurrentScreen] = useState(1);
  const [modelUrl, setModelUrlState] = useState(() => {
    const initial = location.state?.initialModelUrl || roundContainerUrl;
    return typeof initial === "string"
      ? initial
          .replace("Biodegradable%20%20bags.glb", "Biodegradable%20bags.glb")
          .replace("Biodegradable  bags.glb", "Biodegradable bags.glb")
      : initial;
  });

  const setModelUrl = (url) => {
    const cleaned =
      typeof url === "string"
        ? url
            .replace("Biodegradable%20%20bags.glb", "Biodegradable%20bags.glb")
            .replace("Biodegradable  bags.glb", "Biodegradable bags.glb")
        : url;
    setModelUrlState(cleaned);
  };
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [selectedCapUrl, setSelectedCapUrl] = useState("none");

  // Global scene background state (from Screen 1)
  const [sceneBgColor, setSceneBgColor] = useState("#e6e2db");
  const [sceneBgImage, setSceneBgImage] = useState(null);

  // Lifted environment and lighting states
  const [hdriPreset, setHdriPreset] = useState("studio");
  const [envIntensity, setEnvIntensity] = useState(0.4);
  const [ambLight, setAmbLight] = useState(0.3);
  const [dirLight, setDirLight] = useState(0.8);
  const [shadowOpacity, setShadowOpacity] = useState(0.25);
  const [customHdri, setCustomHdri] = useState(null);

  useEffect(() => {
    if (modelUrl && modelUrl.toLowerCase().includes("glass_bottle")) {
      setHdriPreset("apartment");
      setShadowOpacity(0.25);
      setEnvIntensity(1.0);
    } else {
      setHdriPreset("studio");
      setShadowOpacity(0.25);
      setEnvIntensity(0.4);
    }
  }, [modelUrl]);

  // Key to force Screen 2 canvas re-mount on reset
  const [canvasResetKey, setCanvasResetKey] = useState(0);

  // Lift activeTab state here to preserve it when switching screens
  const [activeTab, setActiveTab] = useState("edit");
  const [multiWindow, setMultiWindow] = useState(false);
  const [openTabs, setOpenTabs] = useState({
    models: false,
    layout: false,
    edit: true,
    textures: false,
    scene: false,
    gallery: false,
  });

  const handleSetActiveTab = (tab) => {
    if (!tab) {
      if (multiWindow) {
        // Toggle off all or none
      } else {
        setActiveTab(null);
        setOpenTabs({
          models: false,
          layout: false,
          edit: false,
          textures: false,
          scene: false,
          gallery: false,
        });
      }
      return;
    }
    
    if (multiWindow) {
      setOpenTabs((prev) => ({
        ...prev,
        [tab]: !prev[tab],
      }));
    } else {
      setActiveTab(tab);
      setOpenTabs({
        models: tab === "models",
        layout: tab === "layout",
        edit: tab === "edit",
        textures: tab === "textures",
        scene: tab === "scene",
        gallery: tab === "gallery",
      });
    }
  };

  // Unified state for size, textures, colors, and physical materials
  const [editorState, setEditorState] = useState({
    textures: {},
    colors: {},
    materials: {},
    customSize: null,
    lastApplied: {},
    metallic: {},
    roughness: {},
    uvEditsApplied: false,
  });

  // History stack
  const history = useRef([editorState]);
  const historyIndex = useRef(0);
  const [historyVersion, setHistoryVersion] = useState(0);
  const colorDebounceRef = useRef(null);
  const sliderDebounceRef = useRef(null);

  const pushHistory = (newStateUpdates) => {
    setEditorState((prevState) => {
      const nextState = { ...prevState, ...newStateUpdates };
      const currentStack = history.current.slice(0, historyIndex.current + 1);
      const lastItem = currentStack[currentStack.length - 1];
      const isDuplicate =
        lastItem &&
        lastItem.textures === nextState.textures &&
        lastItem.colors === nextState.colors &&
        lastItem.materials === nextState.materials &&
        lastItem.customSize === nextState.customSize &&
        lastItem.metallic === nextState.metallic &&
        lastItem.roughness === nextState.roughness;

      if (!isDuplicate) {
        history.current = [...currentStack, nextState];
        historyIndex.current = history.current.length - 1;
        setHistoryVersion((v) => v + 1);
      }
      return nextState;
    });
  };

  const handleUndo = () => {
    if (historyIndex.current > 0) {
      historyIndex.current -= 1;
      setEditorState(history.current[historyIndex.current]);
      setHistoryVersion((v) => v + 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current += 1;
      setEditorState(history.current[historyIndex.current]);
      setHistoryVersion((v) => v + 1);
    }
  };

  const canUndo = historyIndex.current > 0;
  const canRedo = historyIndex.current < history.current.length - 1;

  const splitState = (state) => {
    const newState = {
      ...state,
      textures: { ...state.textures },
      colors: { ...state.colors },
      materials: { ...state.materials },
      lastApplied: { ...state.lastApplied },
      metallic: { ...state.metallic },
      roughness: { ...state.roughness },
    };

    const isBottle =
      modelUrl &&
      (modelUrl.toLowerCase().includes("plastic") ||
        modelUrl.toLowerCase().includes("glass") ||
        modelUrl.toLowerCase().includes("soft"));

    if (isBottle) {
      const subMats = ["Lid Label", "Body Label", "Lid", "Body"];
      const keys = [
        "textures",
        "colors",
        "materials",
        "lastApplied",
        "metallic",
        "roughness",
      ];
      keys.forEach((key) => {
        if (newState[key]["all"] !== undefined) {
          const val = newState[key]["all"];
          subMats.forEach((name) => {
            if (newState[key][name] === undefined) {
              newState[key][name] = val;
            }
          });
          delete newState[key]["all"];
        }
      });
    }

    return newState;
  };

  const handleApplyMetallic = (materialId, value) => {
    const targetMat = materialId && materialId !== "none" ? materialId : "all";
    setEditorState((prevState) => {
      const splitPrev = splitState(prevState);
      const nextMetallic = { ...splitPrev.metallic };
      const targets = targetMat === "all" ? ["all", "Lid Label", "Body Label", "Lid", "Body"] : [targetMat];
      targets.forEach((t) => {
        nextMetallic[t] = value;
      });

      const nextState = {
        ...splitPrev,
        metallic: nextMetallic,
      };

      if (sliderDebounceRef.current) clearTimeout(sliderDebounceRef.current);
      sliderDebounceRef.current = setTimeout(() => {
        history.current = history.current.slice(0, historyIndex.current + 1);
        history.current.push(nextState);
        historyIndex.current = history.current.length - 1;
        setHistoryVersion((v) => v + 1);
      }, 300);

      return nextState;
    });
  };

  const handleApplyRoughness = (materialId, value) => {
    const targetMat = materialId && materialId !== "none" ? materialId : "all";
    setEditorState((prevState) => {
      const splitPrev = splitState(prevState);
      const nextRoughness = { ...splitPrev.roughness };
      const targets = targetMat === "all" ? ["all", "Lid Label", "Body Label", "Lid", "Body"] : [targetMat];
      targets.forEach((t) => {
        nextRoughness[t] = value;
      });

      const nextState = {
        ...splitPrev,
        roughness: nextRoughness,
      };

      if (sliderDebounceRef.current) clearTimeout(sliderDebounceRef.current);
      sliderDebounceRef.current = setTimeout(() => {
        history.current = history.current.slice(0, historyIndex.current + 1);
        history.current.push(nextState);
        historyIndex.current = history.current.length - 1;
        setHistoryVersion((v) => v + 1);
      }, 300);

      return nextState;
    });
  };

  const handleResetAll = () => {
    const defaultState = {
      textures: {},
      colors: {},
      materials: {},
      customSize: null,
      lastApplied: {},
      metallic: {},
      roughness: {},
      uvEditsApplied: false,
    };
    setEditorState(defaultState);
    history.current = [defaultState];
    historyIndex.current = 0;
    setCanvasResetKey((k) => k + 1);
    setHistoryVersion((v) => v + 1);

    // Reset Scene / Environment settings to default values
    setSceneBgColor("#e6e2db");
    setSceneBgImage(null);
    if (modelUrl && modelUrl.toLowerCase().includes("glass_bottle")) {
      setHdriPreset("apartment");
      setShadowOpacity(0.25);
      setEnvIntensity(1.0);
    } else {
      setHdriPreset("studio");
      setShadowOpacity(0.25);
      setEnvIntensity(0.4);
    }
    setAmbLight(0.3);
    setDirLight(0.8);
    setCustomHdri(null);
  };

  const handleClearUvEdits = () => {
    setEditorState((prevState) => {
      // Clear textures (decals/designs) and reset uvEditsApplied flag
      const nextTextures = {};
      const nextLastApplied = { ...prevState.lastApplied };

      // Wipe texture application records
      Object.keys(nextLastApplied).forEach((key) => {
        if (nextLastApplied[key] === "texture") {
          delete nextLastApplied[key];
        }
      });

      const nextState = {
        ...prevState,
        textures: nextTextures,
        lastApplied: nextLastApplied,
        uvEditsApplied: false,
      };

      history.current = history.current.slice(0, historyIndex.current + 1);
      history.current.push(nextState);
      historyIndex.current = history.current.length - 1;
      setHistoryVersion((v) => v + 1);
      setCanvasResetKey((k) => k + 1);

      return nextState;
    });
  };

  const onLoadScene = (scene) => {
    if (scene.modelUrl) setModelUrl(scene.modelUrl);
    if (scene.sceneBgColor !== undefined) setSceneBgColor(scene.sceneBgColor);
    if (scene.sceneBgImage !== undefined) setSceneBgImage(scene.sceneBgImage);
    if (scene.editorState) {
      setEditorState(scene.editorState);
      history.current = [scene.editorState];
      historyIndex.current = 0;
      setHistoryVersion((v) => v + 1);
    }
    if (scene.hdriPreset !== undefined) setHdriPreset(scene.hdriPreset);
    if (scene.envIntensity !== undefined) setEnvIntensity(scene.envIntensity);
    if (scene.ambLight !== undefined) setAmbLight(scene.ambLight);
    if (scene.dirLight !== undefined) setDirLight(scene.dirLight);
    if (scene.shadowOpacity !== undefined)
      setShadowOpacity(scene.shadowOpacity);
    if (scene.customHdri !== undefined) setCustomHdri(scene.customHdri);
    setCanvasResetKey((k) => k + 1);
  };

  // Transition from Screen 1 to Screen 2
  const handleProceedToTextureEditor = (materialName) => {
    setSelectedMaterial(materialName || null);
    setCurrentScreen(2);
  };

  // Optional: Transition back to Screen 1
  const handleBackToModelViewer = (textureDataUrl, colorHex) => {
    let targetMat = selectedMaterial || "all";
    if (targetMat === "none") {
      targetMat = "all";
    }

    const isBottleModel =
      modelUrl &&
      (modelUrl.toLowerCase().includes("plastic") ||
        modelUrl.toLowerCase().includes("glass") ||
        modelUrl.toLowerCase().includes("soft"));

    const isWearableModel =
      modelUrl &&
      (modelUrl.toLowerCase().includes("t s1") ||
        modelUrl.toLowerCase().includes("hoodie") ||
        MODELS.some(
          (m) => m.modelUrl === modelUrl && m.category === "Fashion Wear",
        ));

    let newTextures = { ...editorState.textures };
    let newColors = { ...editorState.colors };
    let newMaterials = { ...editorState.materials };
    let newLastApplied = { ...editorState.lastApplied };
    let updated = false;

    // DYNAMIC SPLIT: Only if it's a bottle/container model and targetMat is "all"
    if (isBottleModel && targetMat === "all") {
      const subMats = ["Lid Label", "Body Label", "Lid", "Body"];
      subMats.forEach((name) => {
        if (
          newTextures["all"] !== undefined &&
          newTextures[name] === undefined
        ) {
          newTextures[name] = newTextures["all"];
        }
        if (newColors["all"] !== undefined && newColors[name] === undefined) {
          newColors[name] = newColors["all"];
        }
        if (
          newMaterials["all"] !== undefined &&
          newMaterials[name] === undefined
        ) {
          newMaterials[name] = newMaterials["all"];
        }
        if (
          newLastApplied["all"] !== undefined &&
          newLastApplied[name] === undefined
        ) {
          newLastApplied[name] = newLastApplied["all"];
        }
      });

      // Clean up the global "all" keys
      delete newTextures["all"];
      delete newColors["all"];
      delete newMaterials["all"];
      delete newLastApplied["all"];
    }

    if (typeof textureDataUrl === "string" || textureDataUrl === null) {
      if (textureDataUrl === null) {
        if (isBottleModel && targetMat === "all") {
          delete newTextures["Lid Label"];
          delete newTextures["Body Label"];
          updated = true;
        } else {
          delete newTextures[targetMat];
          updated = true;
        }
      } else {
        updated = true;
        if (isBottleModel && targetMat === "all") {
          newTextures["Lid Label"] = textureDataUrl;
          newTextures["Body Label"] = textureDataUrl;
          newLastApplied["Lid Label"] = "texture";
          newLastApplied["Body Label"] = "texture";
        } else {
          newTextures[targetMat] = textureDataUrl;
          newLastApplied[targetMat] = "texture";
        }
      }
    }

    if (typeof colorHex === "string" || colorHex === null) {
      if (colorHex === "none" || colorHex === null) {
        if (isBottleModel && targetMat === "all") {
          delete newColors["Lid Label"];
          delete newColors["Body Label"];
          updated = true;
        } else {
          delete newColors[targetMat];
          updated = true;
        }
      } else {
        updated = true;
        if (isBottleModel && targetMat === "all") {
          newColors["Lid Label"] = colorHex;
          newColors["Body Label"] = colorHex;
          newLastApplied["Lid Label"] = "color";
          newLastApplied["Body Label"] = "color";
        } else {
          newColors[targetMat] = colorHex;
          // IMPORTANT: Only clear the texture for targetMat!
          // Keep other label textures unchanged!
          if (!isWearableModel) {
            delete newTextures[targetMat];
          }
          newLastApplied[targetMat] = "color";
        }
      }
    }

    if (updated) {
      pushHistory({
        textures: newTextures,
        colors: newColors,
        materials: newMaterials,
        lastApplied: newLastApplied,
        uvEditsApplied: true,
      });
    }

    setSelectedMaterial("all");
    setCurrentScreen(1);
  };

  const handleApplyColor = (materialId, colorHex) => {
    const targetMat = materialId && materialId !== "none" ? materialId : "all";
    const isWearableModel =
      modelUrl &&
      (modelUrl.toLowerCase().includes("t s1") ||
        modelUrl.toLowerCase().includes("hoodie") ||
        MODELS.some(
          (m) => m.modelUrl === modelUrl && m.category === "Fashion Wear",
        ));

    setEditorState((prevState) => {
      const splitPrev = splitState(prevState);
      const nextColors = { ...splitPrev.colors };
      const nextLastApplied = { ...splitPrev.lastApplied };
      const nextMaterials = { ...splitPrev.materials };
      const nextTextures = { ...splitPrev.textures };

      if (targetMat === "all") {
        if (colorHex === null) {
          // Complete reset of colors/materials overrides so model returns to pure original textures/colors
          Object.keys(nextColors).forEach((key) => delete nextColors[key]);
          Object.keys(nextLastApplied).forEach((key) => delete nextLastApplied[key]);
          if (!isWearableModel) {
            Object.keys(nextMaterials).forEach((key) => delete nextMaterials[key]);
            Object.keys(nextTextures).forEach((key) => delete nextTextures[key]);
          }
        } else {
          nextColors["all"] = colorHex;
          nextLastApplied["all"] = "color";
          if (!isWearableModel) {
            nextMaterials["all"] = null;
            delete nextTextures["all"];
            // Clear all per-material color/material overrides so they don't block the new global color
            Object.keys(nextColors).forEach((key) => {
              if (key !== "all") delete nextColors[key];
            });
            Object.keys(nextMaterials).forEach((key) => {
              if (key !== "all") delete nextMaterials[key];
            });
            Object.keys(nextTextures).forEach((key) => {
              if (key !== "all") delete nextTextures[key];
            });
            Object.keys(nextLastApplied).forEach((key) => {
              if (key !== "all") delete nextLastApplied[key];
            });
          }
        }
      } else {
        if (colorHex === null) {
          delete nextColors[targetMat];
          delete nextLastApplied[targetMat];
          if (!isWearableModel) {
            delete nextMaterials[targetMat];
            delete nextTextures[targetMat];
          }
        } else {
          nextColors[targetMat] = colorHex;
          nextLastApplied[targetMat] = "color";
          if (!isWearableModel) {
            nextMaterials[targetMat] = null;
            delete nextTextures[targetMat];
          }
        }
      }

      const nextState = {
        ...splitPrev,
        colors: nextColors,
        materials: nextMaterials,
        textures: nextTextures,
        lastApplied: nextLastApplied,
      };

      if (colorDebounceRef.current) clearTimeout(colorDebounceRef.current);
      colorDebounceRef.current = setTimeout(() => {
        history.current = history.current.slice(0, historyIndex.current + 1);
        history.current.push(nextState);
        historyIndex.current = history.current.length - 1;
        setHistoryVersion((v) => v + 1);
      }, 300);

      return nextState;
    });
  };

  const handleApplyMaterial = (materialId, materialType) => {
    const targetMat = materialId && materialId !== "none" ? materialId : "all";
    const isWearableModel =
      modelUrl &&
      (modelUrl.toLowerCase().includes("t s1") ||
        modelUrl.toLowerCase().includes("hoodie") ||
        MODELS.some(
          (m) => m.modelUrl === modelUrl && m.category === "Fashion Wear",
        ));

    setEditorState((prevState) => {
      const splitPrev = splitState(prevState);
      const nextColors = { ...splitPrev.colors };
      const nextTextures = { ...splitPrev.textures };
      const nextMaterials = { ...splitPrev.materials };
      const nextLastApplied = { ...splitPrev.lastApplied };

      if (targetMat === "all") {
        if (materialType === null) {
          delete nextMaterials["all"];
          delete nextLastApplied["all"];
          delete nextMaterials["Lid Label"];
          delete nextLastApplied["Lid Label"];
          delete nextMaterials["Body Label"];
          delete nextLastApplied["Body Label"];
          delete nextTextures["all"];
          delete nextTextures["Lid Label"];
          delete nextTextures["Body Label"];
          delete nextLastApplied["Lid Label"];
          delete nextLastApplied["Body Label"];
        } else if (materialType.isCustom || materialType.url) {
          nextTextures["all"] = materialType.url || materialType;
          nextLastApplied["all"] = "texture";
          delete nextColors["all"];
          delete nextMaterials["all"];
          Object.keys(nextColors).forEach((key) => {
            if (key !== "all") delete nextColors[key];
          });
          Object.keys(nextTextures).forEach((key) => {
            if (key !== "all") delete nextTextures[key];
          });
          Object.keys(nextMaterials).forEach((key) => {
            if (key !== "all") delete nextMaterials[key];
          });
          Object.keys(nextLastApplied).forEach((key) => {
            if (key !== "all") delete nextLastApplied[key];
          });
        } else {
          nextMaterials["all"] = materialType;
          nextLastApplied["all"] = "material";
          delete nextColors["all"];
          if (!isWearableModel) {
            delete nextTextures["all"];
          }
          Object.keys(nextColors).forEach((key) => {
            if (key !== "all") delete nextColors[key];
          });
          Object.keys(nextMaterials).forEach((key) => {
            if (key !== "all") delete nextMaterials[key];
          });
          Object.keys(nextLastApplied).forEach((key) => {
            if (key !== "all") delete nextLastApplied[key];
          });
          if (!isWearableModel) {
            Object.keys(nextTextures).forEach((key) => {
              if (key !== "all") delete nextTextures[key];
            });
          }
        }
      } else {
        if (materialType === null) {
          delete nextMaterials[targetMat];
          delete nextTextures[targetMat];
          delete nextLastApplied[targetMat];
        } else if (materialType.isCustom || materialType.url) {
          nextTextures[targetMat] = materialType.url || materialType;
          nextLastApplied[targetMat] = "texture";
          delete nextColors[targetMat];
          delete nextMaterials[targetMat];
        } else {
          nextMaterials[targetMat] = materialType;
          nextLastApplied[targetMat] = "material";
          delete nextColors[targetMat];
          if (!isWearableModel) {
            delete nextTextures[targetMat];
          }
        }
      }

      const nextState = {
        ...splitPrev,
        colors: nextColors,
        textures: nextTextures,
        materials: nextMaterials,
        lastApplied: nextLastApplied,
      };

      history.current = history.current.slice(0, historyIndex.current + 1);
      history.current.push(nextState);
      historyIndex.current = history.current.length - 1;
      setHistoryVersion((v) => v + 1);

      return nextState;
    });
  };

  const handleApplyCustomSize = (size) => {
    pushHistory({ customSize: size });
  };

  return (
    <div className="w-full h-full overflow-hidden relative">
      {/* Screen 1: 3D Editor — always rendered/visible */}
      <div className="absolute inset-0 z-10">
        <EditorScreen1
          modelUrl={modelUrl}
          setModelUrl={setModelUrl}
          appliedTextures={editorState.textures}
          appliedColors={editorState.colors}
          appliedMaterials={editorState.materials}
          appliedLastApplied={editorState.lastApplied}
          appliedCustomSize={editorState.customSize}
          appliedMetallic={editorState.metallic}
          appliedRoughness={editorState.roughness}
          onApplyMetallic={handleApplyMetallic}
          onApplyRoughness={handleApplyRoughness}
          selectedMaterial={selectedMaterial}
          setSelectedMaterial={setSelectedMaterial}
          sceneBgColor={sceneBgColor}
          setSceneBgColor={setSceneBgColor}
          sceneBgImage={sceneBgImage}
          setSceneBgImage={setSceneBgImage}
          hdriPreset={hdriPreset}
          setHdriPreset={setHdriPreset}
          envIntensity={envIntensity}
          setEnvIntensity={setEnvIntensity}
          ambLight={ambLight}
          setAmbLight={setAmbLight}
          dirLight={dirLight}
          setDirLight={setDirLight}
          shadowOpacity={shadowOpacity}
          setShadowOpacity={setShadowOpacity}
          customHdri={customHdri}
          setCustomHdri={setCustomHdri}
          onLoadScene={onLoadScene}
          onProceed={handleProceedToTextureEditor}
          onApplyColor={handleApplyColor}
          onApplyMaterial={handleApplyMaterial}
          onApplyCustomSize={handleApplyCustomSize}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onResetAll={handleResetAll}
          canUndo={canUndo}
          canRedo={canRedo}
          isActive={currentScreen === 1}
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
          multiWindow={multiWindow}
          setMultiWindow={setMultiWindow}
          openTabs={openTabs}
          selectedCapUrl={selectedCapUrl}
          onSelectCap={setSelectedCapUrl}
          uvEditsApplied={editorState.uvEditsApplied}
          onClearUvEdits={handleClearUvEdits}
        />
      </div>

      {/* Screen 2: UV Texture Editor — renders as floating popup overlay */}
      {currentScreen === 2 && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <EditorScreen2
            modelUrl={modelUrl}
            setModelUrl={setModelUrl}
            appliedMaterials={editorState.materials}
            appliedColors={editorState.colors}
            appliedTextures={editorState.textures}
            appliedLastApplied={editorState.lastApplied}
            activeTab={activeTab}
            onBack={handleBackToModelViewer}
            isActive={currentScreen === 2}
            canvasResetKey={canvasResetKey}
            sceneBgColor={sceneBgColor}
            sceneBgImage={sceneBgImage}
            selectedCapUrl={selectedCapUrl}
            onSelectCap={setSelectedCapUrl}
            selectedMaterial={selectedMaterial}
            isPopupMode={true}
            onClosePopup={() => setCurrentScreen(1)}
          />
        </div>
      )}
    </div>
  );
}
