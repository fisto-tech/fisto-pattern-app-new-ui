import {
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
  Suspense,
  forwardRef,
  useImperativeHandle,
} from "react";
import { gsap } from "gsap";
import {
  Canvas as R3FCanvas,
  useThree,
  useLoader,
  useFrame,
} from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Html,
  useProgress,
  Environment,
  GizmoHelper,
  GizmoViewport,
  TransformControls,
} from "@react-three/drei";
import SafeEnvironment from "./SafeEnvironment";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { CAPS } from "../../pages/EditorPage";
import { BOTTLE_CAP_CONFIGS, getCleanCapFileName } from "../../utils/capConfigs";
import { textureCache } from "../../utils/TextureCache";

const layoutModelsGlob = import.meta.glob('../../assets/layouts/**/*.glb', { eager: true, import: 'default' });

function CustomHdriEnvironment({ url, intensity }) {
  const texture = useLoader(RGBELoader, url);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return (
    <Environment
      map={texture}
      background={false}
      environmentIntensity={intensity}
    />
  );
}



function BackgroundImage({ url }) {
  const { scene } = useThree();
  const texture = useLoader(THREE.TextureLoader, url);

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.background = texture;
    }
    return () => {
      scene.background = null;
    };
  }, [texture, scene]);

  return null;
}

function DebouncedSlider({ label, value, onChange }) {
  const [localVal, setLocalVal] = useState(value);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleChange = (e) => {
    const newVal = parseFloat(e.target.value);
    setLocalVal(newVal);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(newVal);
    }, 50); // 50ms throttle/debounce allows smoother UI
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
        <span>{label}</span>
        <span>{Math.round(localVal * 100)}%</span>
      </div>
      <input
        type="range"
        // min="0"
        max="1"
        step="0.01"
        value={localVal}
        onChange={handleChange}
        className="w-full accent-[#c05520] cursor-pointer h-1 bg-gray-100 rounded-lg appearance-none"
      />
    </div>
  );
}

import LeftSidebar from "./LeftSidebar";
import BottomBar from "./BottomBar";
import ModelsPopup, { MODELS } from "./ModelsPopup";
import LayoutPopup, { getSingleModelUrl } from "./LayoutPopup";
import modelPositionsConfig from "./modelPositions.json";
import ScenePopup from "./ScenePopup";
import GalleryPopup from "./GalleryPopup";
import { getTextureLibrary } from "../../utils/TextureLibrary";
import blockIcon from "../../assets/images/Editor 1/Icons/block.webp";

import cursorIcon from "../../assets/images/Icons/cursor.webp";
import handIcon from "../../assets/images/Icons/hand.webp";

// ---- Loading overlay (outside canvas, driven by state or drei's useProgress) ----
function ModelLoadingOverlay({ isLoading }) {
  const { progress } = useProgress();
  if (!isLoading) return null;
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#e6e2db]/80 backdrop-blur-[2px] pointer-events-none">
      {/* Spinner ring */}
      <div className="relative w-16 h-16 mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-[#c05520]/20" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#c05520] animate-spin"
          style={{ animationDuration: "0.9s" }}
        />
        {/* Inner dot */}
        <div className="absolute inset-[18px] rounded-full bg-[#c05520]/20" />
      </div>
      <p className="text-[#c05520] font-bold text-base tracking-wide">
        Model Loading
      </p>
      <p className="text-[#c05520]/60 text-xs mt-1 font-medium">
        {Math.round(progress)}%
      </p>
    </div>
  );
}

function HdriLoadingOverlay({ isModelLoading }) {
  const { active } = useProgress();
  // Show this overlay when Suspense is active but the main model isn't loading
  // (which happens when HDRI Environments are being downloaded/compiled)
  if (isModelLoading || !active) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#e6e2db]/60 backdrop-blur-[2px] pointer-events-none">
      <div className="relative w-14 h-14 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-[#c05520]/20" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#c05520] animate-spin"
          style={{ animationDuration: "1s" }}
        />
        <div className="absolute inset-[14px] rounded-full bg-[#c05520]/20" />
      </div>
      <p className="text-[#c05520] font-bold text-base tracking-wide">
        Applying Environment...
      </p>
    </div>
  );
}

function TextureActiveOverlay() {
  const { active } = useProgress();
  return (
    <div className="absolute inset-0 bg-[#c05520]/20 flex items-center justify-center backdrop-blur-[1px]">
      {active ? (
        <svg
          className="animate-spin h-5 w-5 text-white drop-shadow-md"
          xmlns="http://www.w3.org/2000/svg"
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
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 text-white drop-shadow-md"
        >
          <path
            fillRule="evenodd"
            d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );
}

export function isMeasurementMesh(obj, meshCount) {
  if (!obj || !obj.isMesh) return false;
  if (meshCount <= 1) return false;
  const name = obj.name || "";
  if (!/^(plane|text)/i.test(name)) return false;
  const nameLower = name.toLowerCase();
  if (
    nameLower.includes("label") ||
    nameLower.includes("wrapper") ||
    nameLower.includes("design")
  )
    return false;
  const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
  const hasLabelMat = mats.some((m) => {
    if (!m) return false;
    const matName = (m.name || "").toLowerCase();
    return (
      matName.includes("label") ||
      matName.includes("wrapper") ||
      matName.includes("design")
    );
  });
  if (hasLabelMat) return false;
  return true;
}

function CapInstance({
  id,
  url,
  transform,
  appliedColors,
  currentCapOffsets,
}) {
  const { scene } = useGLTF(url);
  const ref = useRef();
  const innerRef = useRef();
  const clonedCap = useMemo(() => {
    if (!scene) return null;
    return cloneSkeleton(scene);
  }, [scene]);

  const capLocalBounds = useMemo(() => {
    if (!scene) return { centerX: 0, centerY: 0, centerZ: 0 };

    // Temporarily reset scene transforms to get local coordinate system bounding box
    const originalPos = scene.position.clone();
    const originalRot = scene.rotation.clone();
    const originalScale = scene.scale.clone();

    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.scale.set(1, 1, 1);
    scene.updateMatrixWorld(true);

    const box = new THREE.Box3();
    let hasMesh = false;

    scene.traverse((child) => {
      if (child.isMesh) {
        if (!child.geometry.boundingBox) {
          child.geometry.computeBoundingBox();
        }
        const meshBox = child.geometry.boundingBox.clone();
        meshBox.applyMatrix4(child.matrixWorld);
        if (!hasMesh) {
          box.copy(meshBox);
          hasMesh = true;
        } else {
          box.union(meshBox);
        }
      }
    });

    // Restore transforms
    scene.position.copy(originalPos);
    scene.rotation.copy(originalRot);
    scene.scale.copy(originalScale);
    scene.updateMatrixWorld(true);

    if (!hasMesh) {
      return { centerX: 0, centerY: 0, centerZ: 0 };
    }

    const centerX = (box.min.x + box.max.x) / 2;
    const centerY = (box.min.y + box.max.y) / 2;
    const centerZ = (box.min.z + box.max.z) / 2;

    return {
      centerX: isFinite(centerX) ? centerX : 0,
      centerY: isFinite(centerY) ? centerY : 0,
      centerZ: isFinite(centerZ) ? centerZ : 0,
    };
  }, [scene]);

  useEffect(() => {
    if (!clonedCap) return;
    clonedCap.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const mArray = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];
      mArray.forEach((m) => {
        const capKey = Object.keys(appliedColors || {}).find((k) =>
          k.toLowerCase().includes("cap"),
        );
        const color = capKey
          ? appliedColors[capKey]
          : appliedColors?.["all"] || null;
        if (color && color !== "transparent") {
          m.color.setHex(parseInt(color.replace("#", "0x")));
        }
      });
    });
  }, [clonedCap, appliedColors]);

  useEffect(() => {
    if (!ref.current || !innerRef.current || !clonedCap || !transform) return;
    const outer = ref.current;
    const inner = innerRef.current;

    outer.position.copy(transform.position);
    outer.rotation.copy(transform.rotation);
    outer.scale.copy(transform.scale);

    const scaleMult = transform.isLayout ? (transform.scale.y || 1) : 1;
    inner.position.set(
      currentCapOffsets.posX * scaleMult,
      currentCapOffsets.posY * scaleMult,
      currentCapOffsets.posZ * scaleMult,
    );
    inner.scale.set(
      currentCapOffsets.scaleX,
      currentCapOffsets.scaleY,
      currentCapOffsets.scaleZ,
    );
  }, [clonedCap, transform, currentCapOffsets]);

  if (!clonedCap) return null;

  return (
    <group ref={ref}>
      <group ref={innerRef}>
        <group
          position={[
            -capLocalBounds.centerX,
            -capLocalBounds.centerY,
            -capLocalBounds.centerZ,
          ]}
        >
          <primitive object={clonedCap} dispose={null} />
        </group>
      </group>
    </group>
  );
}

function CustomCap({ url, transform, appliedColors, currentCapOffsets }) {
  if (!transform || !url || url === "none") return null;

  return (
    <CapInstance
      url={url}
      transform={transform}
      appliedColors={appliedColors}
      currentCapOffsets={currentCapOffsets}
    />
  );
}

function calculateNeckDimensions(clonedScene, capMeshes) {
  let mainBodyMesh = null;
  let maxVolume = -1;

  clonedScene.traverse((obj) => {
    if (obj.isMesh && !obj.userData.isDecal) {
      const nameLower = obj.name.toLowerCase();
      const isCap =
        capMeshes.includes(obj) ||
        nameLower.includes("cap") ||
        nameLower.includes("lid") ||
        nameLower.includes("circle003");
      if (!isCap && !isMeasurementMesh(obj, 10)) {
        if (!obj.geometry.boundingBox) {
          obj.geometry.computeBoundingBox();
        }
        const size = obj.geometry.boundingBox.getSize(new THREE.Vector3());
        const volume = size.x * size.y * size.z;
        if (volume > maxVolume) {
          maxVolume = volume;
          mainBodyMesh = obj;
        }
      }
    }
  });

  if (!mainBodyMesh) {
    return { topY: 1.0, radius: 0.025 };
  }

  const localMatrix = new THREE.Matrix4();
  let curr = mainBodyMesh;
  while (curr && curr !== clonedScene) {
    curr.updateMatrix();
    localMatrix.premultiply(curr.matrix);
    curr = curr.parent;
  }

  const posAttr = mainBodyMesh.geometry.attributes.position;
  if (!posAttr) {
    return { topY: 1.0, radius: 0.025 };
  }

  let minY = Infinity;
  let maxY = -Infinity;
  const tempV = new THREE.Vector3();
  for (let i = 0; i < posAttr.count; i++) {
    tempV.fromBufferAttribute(posAttr, i);
    tempV.applyMatrix4(localMatrix);
    if (tempV.y < minY) minY = tempV.y;
    if (tempV.y > maxY) maxY = tempV.y;
  }

  const totalHeight = maxY - minY;
  const threshold = Math.max(0.01, totalHeight * 0.01); // Top 1% of the bottle height

  let minX = Infinity,
    maxX = -Infinity;
  let minZ = Infinity,
    maxZ = -Infinity;
  let topCount = 0;

  for (let i = 0; i < posAttr.count; i++) {
    tempV.fromBufferAttribute(posAttr, i);
    tempV.applyMatrix4(localMatrix);
    if (tempV.y >= maxY - threshold) {
      if (tempV.x < minX) minX = tempV.x;
      if (tempV.x > maxX) maxX = tempV.x;
      if (tempV.z < minZ) minZ = tempV.z;
      if (tempV.z > maxZ) maxZ = tempV.z;
      topCount++;
    }
  }

  let radius = totalHeight * 0.05;
  if (topCount > 2) {
    radius = (maxX - minX + (maxZ - minZ)) / 4;
  }

  // Safety boundaries relative to the overall bottle size
  const minNeckRadius = totalHeight * 0.005;
  const maxNeckRadius = totalHeight * 0.25;

  if (radius < minNeckRadius || radius > maxNeckRadius) {
    radius = totalHeight * 0.045;
  }

  return {
    topY: maxY,
    radius: radius,
  };
}

function isModelPart(origMatName, objName) {
  const origLower = (origMatName || "").toLowerCase();
  const objLower = (objName || "").toLowerCase();

  // Environmental/studio mesh blacklist - these are NOT product parts
  const envKeywords = ["ground", "floor", "backdrop", "wall", "shadow", "camera", "light", "studio", "scene", "room", "env", "plane001", "cube001", "cube002", "cube003", "cube004", "cube005"];

  if (envKeywords.some(k => origLower.includes(k) || objLower.includes(k))) {
    return false;
  }

  // If material/object name is empty or very generic, still allow it (it might be a product mesh)
  // This covers cases like "Default", color names like "Red", "VIOLET", etc.
  // As long as it's not an environmental mesh, treat it as a product part
  return true;
}

function resolveAppliedValue(appliedObj, cleanId, isCapMesh, origMatName, objName) {
  if (!appliedObj) return null;

  if (!isModelPart(origMatName, cleanId || objName)) {
    return null;
  }

  // 1. Direct match
  if (cleanId && appliedObj[cleanId] !== undefined) {
    return appliedObj[cleanId];
  }

  // 2. Cap/Lid match
  const cleanIdLower = (cleanId || "").toLowerCase();
  const origMatNameLower = (origMatName || "").toLowerCase();
  const objNameLower = (objName || "").toLowerCase();
  const isLidOrCap = isCapMesh ||
    cleanIdLower.includes("lid") ||
    cleanIdLower.includes("cap") ||
    cleanIdLower.includes("top") ||
    origMatNameLower.includes("lid") ||
    origMatNameLower.includes("cap") ||
    objNameLower.includes("lid") ||
    objNameLower.includes("cap");

  if (isLidOrCap) {
    if (appliedObj["cap"] !== undefined) return appliedObj["cap"];
    if (appliedObj["Lid"] !== undefined) return appliedObj["Lid"];
    if (appliedObj["lid"] !== undefined) return appliedObj["lid"];
  }

  // 3. Label match
  const isLabel = cleanIdLower.includes("label") ||
    cleanIdLower.includes("wrapper") ||
    cleanIdLower.includes("design") ||
    cleanIdLower.includes("artwork") ||
    origMatNameLower.includes("label") ||
    origMatNameLower.includes("wrapper") ||
    origMatNameLower.includes("design") ||
    origMatNameLower.includes("artwork");

  if (isLabel) {
    if (appliedObj["Label"] !== undefined) return appliedObj["Label"];
    if (appliedObj["label"] !== undefined) return appliedObj["label"];
    if (appliedObj["Body Label"] !== undefined) return appliedObj["Body Label"];
    if (appliedObj["Lid Label"] !== undefined) return appliedObj["Lid Label"];
  }

  // 4. Body/Tub/Pack match
  const isBody = cleanIdLower.includes("body") ||
    cleanIdLower.includes("tub") ||
    cleanIdLower.includes("pack") ||
    cleanIdLower.includes("foil") ||
    cleanIdLower.includes("sleeve") ||
    origMatNameLower.includes("tub") ||
    origMatNameLower.includes("body") ||
    origMatNameLower.includes("pack") ||
    origMatNameLower.includes("foil") ||
    origMatNameLower.includes("sleeve") ||
    (!isLidOrCap && !isLabel); // fallback for structural parts

  if (isBody) {
    if (appliedObj["Body"] !== undefined) return appliedObj["Body"];
    if (appliedObj["body"] !== undefined) return appliedObj["body"];
    if (appliedObj["tub"] !== undefined) return appliedObj["tub"];
    if (appliedObj["pack"] !== undefined) return appliedObj["pack"];
  }

  // 5. Fallback to all
  if (appliedObj["all"] !== undefined) {
    return appliedObj["all"];
  }

  return null;
}

function AutoSizedModelWithDimensions({
  modelUrl,
  appliedTextures,
  appliedColors,
  appliedMaterials,
  appliedLastApplied,
  appliedMetallic,
  appliedRoughness,
  shadowEnabled,
  customSize,
  selectedMaterialId,
  onMaterialsLoaded,
  onBaseDimensionsLoaded,
  onSceneLoaded,
  onTextureLoadStart,
  onTextureLoadEnd,
  showMeasurements,
  selectedCapUrl,
  isLidOpen,
  onCapHover,
  onCapLeave,
  showDefaultLabels,
  // Color brush props
  colorBrushActive,
  brushColor,
  onBrushApply,
  currentCapOffsets,
  onFloorYLoaded,
}) {
  const { scene } = useGLTF(modelUrl);
  const { gl, invalidate, camera } = useThree();

  const isWearableModel = useMemo(() => {
    return (
      modelUrl &&
      (modelUrl.toLowerCase().includes("t s1") ||
        modelUrl.toLowerCase().includes("hoodie") ||
        MODELS.some(
          (m) => m.modelUrl === modelUrl && m.category === "Fashion Wear",
        ))
    );
  }, [modelUrl]);

  const isTapeModel = useMemo(() => {
    return modelUrl && modelUrl.toLowerCase().includes("tape");
  }, [modelUrl]);

  useEffect(() => {
    const isGlassBottle =
      modelUrl && modelUrl.toLowerCase().includes("glass_bottle");
    gl.toneMapping = isGlassBottle
      ? THREE.NeutralToneMapping
      : THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = isGlassBottle ? 1.0 : 0.9;
    invalidate();
  }, [modelUrl, gl, invalidate]);

  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const clone = cloneSkeleton(scene);
    clone.updateMatrixWorld(true);

    // First pass: find all label and structural meshes and their world Y positions
    const labelMeshes = [];
    const structuralMeshes = [];
    clone.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const mArray = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];
      const isLabel = mArray.some((m) => {
        if (!m || !m.name) return false;
        const matLower = m.name.toLowerCase();
        return (
          matLower.includes("label") ||
          matLower.includes("wrapper") ||
          matLower.includes("design") ||
          matLower.includes("artwork")
        );
      });

      const box = new THREE.Box3().setFromObject(obj);
      const center = new THREE.Vector3();
      box.getCenter(center);

      if (isLabel) {
        labelMeshes.push({ obj, y: center.y });
      } else {
        structuralMeshes.push({ obj, y: center.y });
      }
    });

    // Sort by height (highest first)
    labelMeshes.sort((a, b) => b.y - a.y);
    structuralMeshes.sort((a, b) => b.y - a.y);

    // Second pass: clone materials and assign clean names
    clone.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;

      obj.material = Array.isArray(obj.material)
        ? obj.material.map((mat) => mat?.clone())
        : obj.material.clone();

      // Hide environmental backdrop platforms/grounds or redundant helper meshes in layout models
      const isLayout = !MODELS.some((m) => m.modelUrl === modelUrl);
      if (isLayout) {
        const nameLower = (obj.name || "").toLowerCase();
        const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
        const matNameLower = (mat?.name || "").toLowerCase();

        if (!obj.geometry.boundingBox) {
          obj.geometry.computeBoundingBox();
        }
        const size = obj.geometry.boundingBox.getSize(new THREE.Vector3());
        const isHuge = size.x > 100 || size.z > 100;

        const isRedundantLidOrLabel =
          (nameLower.includes("lid") || nameLower.includes("cap") || nameLower.includes("label")) &&
          (matNameLower === "none" || matNameLower === "default" || matNameLower === "" || matNameLower.includes("none"));

        const isEnvMesh =
          isHuge ||
          nameLower.includes("ground") ||
          nameLower.includes("floor") ||
          nameLower.includes("backdrop") ||
          nameLower.includes("wall") ||
          nameLower.includes("shadow") ||
          nameLower.includes("camera") ||
          nameLower.includes("light") ||
          nameLower.includes("stage") ||
          nameLower.includes("studio") ||
          nameLower.includes("platform");

        if (isRedundantLidOrLabel || isEnvMesh) {
          obj.visible = false;
          return;
        }
      }

      const origMatArray = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];
      origMatArray.forEach((m) => {
        if (m) {
          if (!m.userData) m.userData = {};
          if (m.userData.originalMaterialName === undefined) {
            m.userData.originalMaterialName = m.name;
          }
        }
      });

      const matNameForCheck = obj.material.name || (Array.isArray(obj.material) ? obj.material[0]?.name : null);
      const matOrigNameForCheck = obj.material.userData?.originalMaterialName || (Array.isArray(obj.material) ? obj.material[0]?.userData?.originalMaterialName : null);
      if (!isModelPart(matNameForCheck || matOrigNameForCheck, obj.name || obj.parent?.name)) {
        return;
      }

      const labelIndex = labelMeshes.findIndex((x) => x.obj === obj);
      if (labelIndex !== -1) {
        // This is a label mesh, give it a clean UI name
        const mArray = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];
        mArray.forEach((m) => {
          if (labelMeshes.length === 1) {
            m.name = "Label";
          } else {
            const nameLower = (obj.name || "").toLowerCase();
            const parentNameLower = (obj.parent?.name || "").toLowerCase();
            const matNameLower = (
              m.name ||
              m.userData?.originalMaterialName ||
              ""
            ).toLowerCase();
            const isLidLabel =
              nameLower.includes("lid") ||
              nameLower.includes("cap") ||
              nameLower.includes("top") ||
              parentNameLower.includes("lid") ||
              parentNameLower.includes("cap") ||
              parentNameLower.includes("top") ||
              matNameLower.includes("lid") ||
              matNameLower.includes("cap") ||
              matNameLower.includes("top");

            m.name = isLidLabel ? "Lid Label" : "Body Label";
          }
        });
      } else {
        // This is a structural mesh, separate Lid and Body materials if they share the same one!
        const structIndex = structuralMeshes.findIndex((x) => x.obj === obj);
        if (structIndex !== -1) {
          const mArray = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];
          mArray.forEach((m) => {
            if (structuralMeshes.length === 1) {
              m.name = "Body";
            } else if (structuralMeshes.length === 2) {
              m.name = structIndex === 0 ? "Lid" : "Body";
            } else {
              const nameLower = (obj.name || "").toLowerCase();
              const parentNameLower = (obj.parent?.name || "").toLowerCase();
              const matNameLower = (
                m.name ||
                m.userData?.originalMaterialName ||
                ""
              ).toLowerCase();
              const isLid =
                nameLower.includes("lid") ||
                nameLower.includes("cap") ||
                nameLower.includes("top") ||
                parentNameLower.includes("lid") ||
                parentNameLower.includes("cap") ||
                parentNameLower.includes("top") ||
                matNameLower.includes("lid") ||
                matNameLower.includes("cap") ||
                matNameLower.includes("top");
              m.name = isLid ? "Lid" : "Body";
            }
          });
        }
      }
    });
    if (modelUrl && modelUrl.toLowerCase().includes("biodegradable")) {
      clone.rotation.x = Math.PI / 2;
      clone.updateMatrixWorld(true);
    }
    return clone;
  }, [scene, modelUrl]);

  const isLabelOverlayModel = useMemo(() => {
    if (!clonedScene) return false;
    const model = MODELS.find((m) => m.modelUrl === modelUrl);
    if (model) {
      return (
        model.category === "Food Containers" ||
        model.category === "Drinkware Bottles"
      );
    }
    let matches = false;
    clonedScene.traverse((obj) => {
      if (obj.isMesh) {
        const nameLower = (obj.name || "").toLowerCase();
        const matNameLower = obj.material
          ? (Array.isArray(obj.material)
            ? obj.material[0].name
            : obj.material.name || ""
          ).toLowerCase()
          : "";
        if (
          nameLower.includes("bottle") ||
          nameLower.includes("container") ||
          nameLower.includes("cup") ||
          nameLower.includes("glass") ||
          nameLower.includes("plastic") ||
          matNameLower.includes("bottle") ||
          matNameLower.includes("container") ||
          matNameLower.includes("cup") ||
          matNameLower.includes("glass") ||
          matNameLower.includes("plastic")
        ) {
          matches = true;
        }
      }
    });
    return matches;
  }, [clonedScene, modelUrl]);

  const lidGroupRef = useRef(null);
  const originalSceneRotationRef = useRef(null);
  const containerHeightRef = useRef(0.1);
  const transitionGroupRef = useRef(null);

  useEffect(() => {
    if (clonedScene) {
      originalSceneRotationRef.current = clonedScene.rotation.clone();
    } else {
      originalSceneRotationRef.current = null;
    }
  }, [clonedScene]);

  // Handle slide-in and spin animation on load
  useEffect(() => {
    if (!clonedScene || !transitionGroupRef.current) return;

    const group = transitionGroupRef.current;

    // Randomize direction: 'left', 'right', 'top', 'bottom'
    const directions = ["left", "right", "top", "bottom"];
    const chosenDir = directions[Math.floor(Math.random() * directions.length)];

    let startX = 0;
    let startY = 0;
    let startZ = 0;
    const distance = 4; // slide distance

    if (chosenDir === "left") {
      startX = -distance;
    } else if (chosenDir === "right") {
      startX = distance;
    } else if (chosenDir === "top") {
      startY = distance;
    } else if (chosenDir === "bottom") {
      startY = -distance;
    }

    // Randomize initial rotation for a cool spinning entry
    const startRotX = (Math.random() - 0.5) * Math.PI * 1.5;
    const startRotY = (Math.random() - 0.5) * Math.PI * 1.5;
    const startRotZ = (Math.random() - 0.5) * Math.PI * 1.5;

    // Set initial state
    group.position.set(startX, startY, startZ);
    group.rotation.set(startRotX, startRotY, startRotZ);
    group.scale.set(0.01, 0.01, 0.01); // start small for a pop-in effect

    // Kill existing tweens
    gsap.killTweensOf(group.position);
    gsap.killTweensOf(group.rotation);
    gsap.killTweensOf(group.scale);

    // Animate to final position (0, 0, 0), rotation (0, 0, 0), scale (1, 1, 1)
    gsap.to(group.position, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.5,
      ease: "power4.out",
      onUpdate: () => invalidate(),
    });

    gsap.to(group.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.5,
      ease: "power4.out",
      onUpdate: () => invalidate(),
    });

    gsap.to(group.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.5,
      ease: "power4.out",
      onUpdate: () => invalidate(),
    });
  }, [clonedScene, invalidate]);

  useEffect(() => {
    if (!clonedScene) {
      lidGroupRef.current = null;
      return;
    }

    // Clean up any existing group
    const existingGroup = clonedScene.getObjectByName("dynamicLidGroup");
    if (existingGroup) {
      const children = [...existingGroup.children];
      children.forEach((child) => {
        clonedScene.attach(child);
      });
      clonedScene.remove(existingGroup);
    }

    const isLayoutModel = !MODELS.some((m) => m.modelUrl === modelUrl);
    if (isLayoutModel) {
      lidGroupRef.current = null;
      return;
    }

    // Clean up any previously split lidLabel meshes
    const splitLidLabels = [];
    clonedScene.traverse((obj) => {
      if (obj.userData.isSplitLidLabel) {
        splitLidLabels.push(obj);
      }
    });
    splitLidLabels.forEach((obj) => {
      const baseName = obj.name.replace("_lidPart", "");
      let hasOriginal = false;
      clonedScene.traverse((sibling) => {
        if (
          sibling.name === baseName &&
          sibling.userData.originalGeometry instanceof THREE.BufferGeometry
        ) {
          hasOriginal = true;
        }
      });
      if (hasOriginal && obj.parent) {
        obj.parent.remove(obj);
      }
    });

    // Restore original geometries if they were split in a previous run
    clonedScene.traverse((obj) => {
      if (obj.isMesh && obj.userData.originalGeometry) {
        if (obj.userData.originalGeometry instanceof THREE.BufferGeometry) {
          obj.geometry = obj.userData.originalGeometry;
        }
        delete obj.userData.originalGeometry;
      }
    });

    // 1. Compute overall bounds to find topThresholdY
    let containerMinY = Infinity;
    let containerMaxY = -Infinity;

    // Temporarily detach from parent to ensure matrixWorld is calculated in local space,
    // ignoring the transition slide-in animation which could tilt/scale the scene.
    const originalParent = clonedScene.parent;
    if (originalParent) clonedScene.parent = null;
    clonedScene.updateMatrixWorld(true);
    if (originalParent) clonedScene.parent = originalParent;

    clonedScene.traverse((obj) => {
      if (obj.isMesh && !obj.userData.isDecal && !isMeasurementMesh(obj, 10)) {
        if (!obj.geometry.boundingBox) {
          obj.geometry.computeBoundingBox();
        }

        const tempBox = new THREE.Box3()
          .copy(obj.geometry.boundingBox)
          .applyMatrix4(obj.matrixWorld);
        if (tempBox.min.y < containerMinY) containerMinY = tempBox.min.y;
        if (tempBox.max.y > containerMaxY) containerMaxY = tempBox.max.y;
      }
    });

    const containerHeight = containerMaxY - containerMinY;
    containerHeightRef.current = containerHeight;
    const topThresholdY = containerMaxY - 0.15 * containerHeight;

    // Helper to split geometry based on height threshold
    const splitGeometry = (geometry, thresholdY, matrixWorld) => {
      const posAttr = geometry.attributes.position;
      const uvAttr = geometry.attributes.uv;
      const normalAttr = geometry.attributes.normal;
      const indexAttr = geometry.index;

      const topPos = [];
      const topUv = [];
      const topNormal = [];

      const botPos = [];
      const botUv = [];
      const botNormal = [];

      const tempV = new THREE.Vector3();
      const count = indexAttr ? indexAttr.count : posAttr.count;

      for (let i = 0; i < count; i += 3) {
        const idx0 = indexAttr ? indexAttr.getX(i) : i;
        const idx1 = indexAttr ? indexAttr.getX(i + 1) : i + 1;
        const idx2 = indexAttr ? indexAttr.getX(i + 2) : i + 2;

        tempV.fromBufferAttribute(posAttr, idx0).applyMatrix4(matrixWorld);
        const y0 = tempV.y;
        tempV.fromBufferAttribute(posAttr, idx1).applyMatrix4(matrixWorld);
        const y1 = tempV.y;
        tempV.fromBufferAttribute(posAttr, idx2).applyMatrix4(matrixWorld);
        const y2 = tempV.y;

        const avgY = (y0 + y1 + y2) / 3;
        const isTop = avgY >= thresholdY;

        const destPos = isTop ? topPos : botPos;
        const destUv = isTop ? topUv : botUv;
        const destNormal = isTop ? topNormal : botNormal;

        const pushVertex = (idx) => {
          destPos.push(posAttr.getX(idx), posAttr.getY(idx), posAttr.getZ(idx));
          if (uvAttr) destUv.push(uvAttr.getX(idx), uvAttr.getY(idx));
          if (normalAttr)
            destNormal.push(
              normalAttr.getX(idx),
              normalAttr.getY(idx),
              normalAttr.getZ(idx),
            );
        };

        pushVertex(idx0);
        pushVertex(idx1);
        pushVertex(idx2);
      }

      const createGeom = (pos, uv, norm) => {
        if (pos.length === 0) return null;
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        if (uv.length > 0)
          g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
        if (norm.length > 0)
          g.setAttribute("normal", new THREE.Float32BufferAttribute(norm, 3));
        return g;
      };

      return {
        top: createGeom(topPos, topUv, topNormal),
        bottom: createGeom(botPos, botUv, botNormal),
      };
    };

    // 2. Identify all lid meshes and split combined label/wrapper meshes
    const lidMeshes = [];
    const meshesToProcess = [];
    clonedScene.traverse((obj) => {
      if (obj.isMesh && !obj.userData.isDecal) {
        meshesToProcess.push(obj);
      }
    });

    meshesToProcess.forEach((obj) => {
      const nameLower = obj.name.toLowerCase();
      const mat = obj.material;
      const matNameLower = mat
        ? (Array.isArray(mat) ? mat[0].name : mat.name || "").toLowerCase()
        : "";

      const isLid =
        nameLower.includes("lid") ||
        matNameLower.includes("lid") ||
        nameLower.includes("cap") ||
        matNameLower.includes("cap") ||
        nameLower.includes("circle003") ||
        matNameLower.includes("circle003");
      const isLabel =
        nameLower.includes("label") ||
        matNameLower.includes("label") ||
        nameLower.includes("wrapper") ||
        matNameLower.includes("wrapper") ||
        nameLower.includes("design") ||
        matNameLower.includes("design");

      if (isLid) {
        lidMeshes.push(obj);
      } else if (isLabel) {
        if (!obj.geometry.boundingBox) {
          obj.geometry.computeBoundingBox();
        }
        const tempBox = new THREE.Box3()
          .copy(obj.geometry.boundingBox)
          .applyMatrix4(obj.matrixWorld);

        const spansHeight =
          tempBox.max.y - tempBox.min.y > 0.35 * containerHeight;
        const hasTopPart = tempBox.max.y >= topThresholdY;
        const hasBottomPart = tempBox.min.y < topThresholdY;

        const renameMaterial = (mat, newName) => {
          if (!mat) return mat;
          const renameSingle = (m) => {
            const newMat = new THREE.MeshStandardMaterial({
              color: m.color ? m.color.clone() : new THREE.Color(0xffffff),
              roughness: m.roughness !== undefined ? m.roughness : 0.5,
              metalness: m.metalness !== undefined ? m.metalness : 0.1,
              transparent: m.transparent !== undefined ? m.transparent : false,
              opacity: m.opacity !== undefined ? m.opacity : 1.0,
              side: m.side !== undefined ? m.side : THREE.DoubleSide,
            });
            newMat.name = newName;

            let hasMap = false;
            if (m.map) {
              newMat.map = m.map;
              hasMap = true;
            }
            if (m.normalMap) {
              newMat.normalMap = m.normalMap;
              hasMap = true;
            }
            if (m.roughnessMap) {
              newMat.roughnessMap = m.roughnessMap;
              hasMap = true;
            }
            if (m.metalnessMap) {
              newMat.metalnessMap = m.metalnessMap;
              hasMap = true;
            }
            if (m.aoMap) {
              newMat.aoMap = m.aoMap;
              hasMap = true;
            }

            if (m.userData) {
              newMat.userData = { ...m.userData };
            }

            if (hasMap) {
              newMat.needsUpdate = true;
            }

            return newMat;
          };
          if (Array.isArray(mat)) {
            return mat.map(renameSingle);
          } else {
            return renameSingle(mat);
          }
        };

        if (spansHeight && hasTopPart && hasBottomPart) {
          const split = splitGeometry(
            obj.geometry,
            topThresholdY,
            obj.matrixWorld,
          );
          if (split.top && split.bottom) {
            obj.userData.originalGeometry = obj.geometry;
            obj.geometry = split.bottom;

            const bodyMat = renameMaterial(obj.material, "Body Label");
            const lidMat = renameMaterial(obj.material, "Lid Label");

            obj.material = bodyMat;

            const lidLabel = new THREE.Mesh(split.top, lidMat);
            lidLabel.name = obj.name + "_lidPart";
            lidLabel.userData.isSplitLidLabel = true;

            obj.parent.add(lidLabel);
            lidLabel.position.copy(obj.position);
            lidLabel.rotation.copy(obj.rotation);
            lidLabel.scale.copy(obj.scale);
            lidLabel.matrix.copy(obj.matrix);
            lidLabel.matrixWorld.copy(obj.matrixWorld);

            lidMeshes.push(lidLabel);
          } else if (split.top) {
            obj.material = renameMaterial(obj.material, "Lid Label");
            lidMeshes.push(obj);
          } else {
            obj.material = renameMaterial(obj.material, "Body Label");
          }
        } else if (hasTopPart && !hasBottomPart) {
          obj.material = renameMaterial(obj.material, "Lid Label");
          lidMeshes.push(obj);
        } else if (hasBottomPart && !hasTopPart) {
          obj.material = renameMaterial(obj.material, "Body Label");
        }
      }
    });

    if (lidMeshes.length === 0) {
      lidGroupRef.current = null;
      return;
    }

    // Create a new group
    const lidGroup = new THREE.Group();
    lidGroup.name = "dynamicLidGroup";
    clonedScene.add(lidGroup);

    clonedScene.updateMatrixWorld(true);
    lidGroup.updateMatrixWorld(true);

    lidMeshes.forEach((mesh) => {
      lidGroup.attach(mesh);
    });

    lidGroupRef.current = lidGroup;
  }, [clonedScene]);

  useEffect(() => {
    const lidGroup = lidGroupRef.current;
    if (!lidGroup || !clonedScene) return;

    // Calculate static overall size of the lid meshes in local coordinates
    const overallBox = new THREE.Box3();
    lidGroup.children.forEach((child) => {
      if (child.isMesh) {
        if (!child.geometry.boundingBox) {
          child.geometry.computeBoundingBox();
        }
        overallBox.expandByPoint(child.geometry.boundingBox.min);
        overallBox.expandByPoint(child.geometry.boundingBox.max);
      }
    });
    const overallSize = overallBox.getSize(new THREE.Vector3());
    // Position the lid to rest on the container's mouth rim when opened
    const liftHeight = overallSize.x * 0.25;
    const slideOffset = overallSize.x * 0.45;

    // Retrieve original scene rotation
    if (!originalSceneRotationRef.current) {
      originalSceneRotationRef.current = clonedScene.rotation.clone();
    }
    const origSceneRot = originalSceneRotationRef.current;

    gsap.killTweensOf(lidGroup.position);
    gsap.killTweensOf(lidGroup.rotation);
    gsap.killTweensOf(clonedScene.rotation);

    const timeline = gsap.timeline({ onUpdate: () => invalidate() });
    const isLayoutModel = !MODELS.some((m) => m.modelUrl === modelUrl);
    const shouldOpen = isLidOpen && !isLayoutModel;

    if (shouldOpen) {
      // Animate lid group
      timeline
        .to(
          lidGroup.position,
          {
            y: liftHeight,
            x: -slideOffset,
            z: 0,
            duration: 1.0,
            ease: "power2.out",
          },
          0,
        )
        .to(
          lidGroup.rotation,
          {
            z: 0.64,
            x: 0,
            y: 0,
            duration: 1.0,
            ease: "power2.out",
          },
          0,
        );
    } else {
      // Return lid group
      timeline
        .to(
          lidGroup.position,
          {
            y: 0,
            x: 0,
            z: 0,
            duration: 1.0,
            ease: "power2.inOut",
          },
          0,
        )
        .to(
          lidGroup.rotation,
          {
            z: 0,
            x: 0,
            y: 0,
            duration: 1.0,
            ease: "power2.inOut",
          },
          0,
        );
    }
  }, [isLidOpen, modelUrl, clonedScene, invalidate]);

  const [capTransforms, setCapTransforms] = useState([]);

  useEffect(() => {
    if (!clonedScene) return;
    let capMeshes = [];
    clonedScene.traverse((obj) => {
      if (obj.isMesh) {
        const nameLower = obj.name.toLowerCase();
        const hasCapInName =
          nameLower.includes("cap") ||
          nameLower.includes("circle003") ||
          nameLower.includes("lid");
        const hasCapInMaterial =
          obj.material &&
          (Array.isArray(obj.material)
            ? obj.material.some(
              (m) =>
                m.name &&
                (m.name.toLowerCase().includes("cap") ||
                  m.name.toLowerCase().includes("lid")),
            )
            : obj.material.name &&
            (obj.material.name.toLowerCase().includes("cap") ||
              obj.material.name.toLowerCase().includes("lid")));
        if (hasCapInName || hasCapInMaterial) {
          capMeshes.push(obj);
        }
      }
    });

    if (capMeshes.length > 0) {
      if (selectedCapUrl && selectedCapUrl !== "none") {
        capMeshes.forEach((mesh) => {
          mesh.visible = false;
        });

        const isLayoutModel = !MODELS.some((m) => m.modelUrl === modelUrl);

        if (!isLayoutModel) {
          // ORIGINAL MODEL: Preserve exact original cap position and scale logic untouched
          const anchor =
            capMeshes.find(
              (m) =>
                m.name.toLowerCase().includes("circle003") ||
                m.name.toLowerCase().includes("cap"),
            ) || capMeshes[0];

          const localMatrix = new THREE.Matrix4();
          let curr = anchor;
          while (curr && curr !== clonedScene) {
            curr.updateMatrix();
            localMatrix.premultiply(curr.matrix);
            curr = curr.parent;
          }

          const pos = new THREE.Vector3();
          const quart = new THREE.Quaternion();
          const scl = new THREE.Vector3();
          localMatrix.decompose(pos, quart, scl);

          const neck = calculateNeckDimensions(clonedScene, capMeshes);
          const scale = (neck.radius * 2) / 0.05;
          const model = MODELS.find((m) => m.modelUrl === modelUrl);
          const modelKey = model ? model.id : "default";

          let rotationEuler = new THREE.Euler().setFromQuaternion(quart);
          if (modelKey === "steel-bottle") {
            rotationEuler.x += Math.PI;
          }

          setCapTransforms([
            {
              id: "single_cap_anchor",
              position: pos,
              rotation: rotationEuler,
              scale: scl,
            },
          ]);
        } else {
          // LAYOUT MODELS: Compute cap anchors per layout bottle
          const anchorMeshes = [];
          capMeshes.forEach((mesh) => {
            if (!mesh.geometry) return;
            if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
            mesh.updateMatrixWorld(true);

            const box = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const threshold = Math.max(0.01, maxDim * 0.75);

            const isDuplicateSubpart = anchorMeshes.some((existing) => {
              if (!existing.geometry.boundingBox) existing.geometry.computeBoundingBox();
              const existingBox = existing.geometry.boundingBox.clone().applyMatrix4(existing.matrixWorld);
              const existingCenter = existingBox.getCenter(new THREE.Vector3());
              return existingCenter.distanceTo(center) < threshold;
            });

            if (!isDuplicateSubpart) {
              anchorMeshes.push(mesh);
            }
          });

          const transforms = anchorMeshes.map((mesh, index) => {
            mesh.updateMatrixWorld(true);
            const localMatrix = new THREE.Matrix4();
            let curr = mesh;
            while (curr && curr !== clonedScene) {
              curr.updateMatrix();
              localMatrix.premultiply(curr.matrix);
              curr = curr.parent;
            }

            const pos = new THREE.Vector3();
            const quart = new THREE.Quaternion();
            const scl = new THREE.Vector3();
            localMatrix.decompose(pos, quart, scl);

            let rotationEuler = new THREE.Euler().setFromQuaternion(quart);
            const isSteelBottle = modelUrl && (modelUrl.includes("Steel") || modelUrl.includes("steel"));
            if (isSteelBottle) {
              // For steel bottle layout models, compute the top of the mesh bounding box
              if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
              const meshBox = mesh.geometry.boundingBox.clone();
              // Top Y in local mesh space transformed to model space
              const topLocal = new THREE.Vector3(
                (meshBox.min.x + meshBox.max.x) / 2,
                meshBox.max.y,
                (meshBox.min.z + meshBox.max.z) / 2
              );
              topLocal.applyMatrix4(localMatrix);
              pos.copy(topLocal);

              // Rotate 180 deg around local X axis so cap stands right-side up while matching bottle tilt angle
              const steelQuat = quart.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI));
              rotationEuler.setFromQuaternion(steelQuat);
            }

            return {
              id: `cap_mesh_${mesh.uuid || index}`,
              position: pos,
              rotation: rotationEuler,
              scale: scl,
              isLayout: true,
            };
          });

          setCapTransforms(transforms);
        }
      } else {
        capMeshes.forEach((mesh) => {
          mesh.visible = true;
        });
        setCapTransforms([]);
      }
    } else {
      setCapTransforms([]);
    }
  }, [clonedScene, selectedCapUrl, modelUrl]);

  // Cap hover raycasting â€” detect when mouse is over a cap/lid mesh
  const capRaycaster = useMemo(() => new THREE.Raycaster(), []);
  const capHoverRef = useRef(false);
  useEffect(() => {
    if (!clonedScene || !gl) return;
    const canvas = gl.domElement;

    // Collect cap meshes
    const capMeshes = [];
    clonedScene.traverse((obj) => {
      if (!obj.isMesh) return;
      const nameLower = obj.name.toLowerCase();
      const hasCapInName =
        nameLower.includes("cap") ||
        nameLower.includes("circle003") ||
        nameLower.includes("lid");
      const hasCapInMaterial =
        obj.material &&
        (Array.isArray(obj.material)
          ? obj.material.some(
            (m) =>
              m.name &&
              (m.name.toLowerCase().includes("cap") ||
                m.name.toLowerCase().includes("lid")),
          )
          : obj.material.name &&
          (obj.material.name.toLowerCase().includes("cap") ||
            obj.material.name.toLowerCase().includes("lid")));
      if (hasCapInName || hasCapInMaterial) {
        capMeshes.push(obj);
      }
    });

    if (capMeshes.length === 0) return;

    const getCapMaterialKey = () => {
      return "cap";
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      capRaycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
      // Raycast against cap meshes
      const hits = capRaycaster.intersectObjects(capMeshes, false);
      if (hits.length > 0) {
        if (!capHoverRef.current) {
          capHoverRef.current = true;
          if (onCapHover) onCapHover(e.clientX, e.clientY, getCapMaterialKey());
        }
      } else {
        if (capHoverRef.current) {
          capHoverRef.current = false;
          if (onCapLeave) onCapLeave();
        }
      }
    };
    const handleMouseLeave = () => {
      if (capHoverRef.current) {
        capHoverRef.current = false;
        if (onCapLeave) onCapLeave();
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [clonedScene, gl, camera, onCapHover, onCapLeave, capRaycaster]);

  // â”€â”€ Color Brush Raycaster â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Collects all non-decal, non-measurement meshes for brush picking
  const brushRaycaster = useMemo(() => new THREE.Raycaster(), []);
  // Map: materialId â†’ original color (THREE.Color) for restoring previews
  const brushPreviewRef = useRef(null); // { meshes, materialId, origColors }

  useEffect(() => {
    if (!clonedScene || !gl) return;
    const canvas = gl.domElement;

    // Build list of pickable meshes (all non-decal, non-measurement)
    const pickable = [];
    clonedScene.traverse((obj) => {
      if (obj.isMesh && !obj.userData.isDecal && obj.material) {
        pickable.push(obj);
      }
    });

    const restorePreview = () => {
      if (!brushPreviewRef.current) return;
      const { meshes, origColors } = brushPreviewRef.current;
      meshes.forEach((m, i) => {
        const ms = Array.isArray(m.material) ? m.material : [m.material];
        const { base, decal } = origColors[i];

        ms.forEach((mat, j) => {
          mat.color.copy(base[j].color);
          mat.opacity = base[j].opacity;
          mat.transparent = base[j].transparent;
          mat.map = base[j].map;
          mat.normalMap = base[j].normalMap;
          mat.roughnessMap = base[j].roughnessMap;
          mat.metalnessMap = base[j].metalnessMap;
          mat.aoMap = base[j].aoMap;
          mat.bumpMap = base[j].bumpMap;
          mat.roughness = base[j].roughness;
          mat.metalness = base[j].metalness;
          mat.needsUpdate = true;
        });

        if (decal && m.userData.decalMesh) {
          m.userData.decalMesh.visible = decal.visible;
          const dMat = m.userData.decalMesh.material;
          dMat.color.copy(decal.color);
          dMat.map = decal.map;
          dMat.normalMap = decal.normalMap;
          dMat.roughnessMap = decal.roughnessMap;
          dMat.metalnessMap = decal.metalnessMap;
          dMat.aoMap = decal.aoMap;
          dMat.bumpMap = decal.bumpMap;
          dMat.roughness = decal.roughness;
          dMat.metalness = decal.metalness;
          dMat.needsUpdate = true;
        }
      });
      brushPreviewRef.current = null;
      invalidate();
    };

    // Track mouse down coordinates to distinguish click from drag (rotation)
    let mouseDownCoords = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      mouseDownCoords = { x: e.clientX, y: e.clientY };
    };

    const handleBrushMove = (e) => {
      if (!colorBrushActive || !brushColor) return;

      const rect = canvas.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      brushRaycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
      const hits = brushRaycaster.intersectObjects(pickable, false);

      if (hits.length === 0) {
        restorePreview();
        return;
      }

      const hitMesh = hits[0].object;
      const mArr = Array.isArray(hitMesh.material)
        ? hitMesh.material
        : [hitMesh.material];

      const matIndex =
        hits[0].face && hits[0].face.materialIndex !== undefined
          ? hits[0].face.materialIndex
          : 0;
      const hitMat = mArr[matIndex];
      const matId = hitMat?.name || hitMat?.uuid || "all";

      // Skip re-preview if same material
      if (brushPreviewRef.current?.materialId === matId) return;

      // Restore old preview first
      restorePreview();

      // Find all meshes that share the same material name
      const sharedMeshes = pickable.filter((obj) => {
        const ms = Array.isArray(obj.material) ? obj.material : [obj.material];
        return ms.some((m) => (m.name || m.uuid) === matId);
      });

      const isRemove = brushColor === "__remove__" || brushColor === "__none__";
      const previewHex = brushColor === "transparent" ? "#ffffff" : brushColor;

      // Save original colors and apply preview tint
      const origColors = sharedMeshes.map((obj) => {
        const ms = Array.isArray(obj.material) ? obj.material : [obj.material];
        const saved = ms.map((m) => ({
          color: m.color.clone(),
          opacity: m.opacity,
          transparent: m.transparent,
          map: m.map,
          normalMap: m.normalMap,
          roughnessMap: m.roughnessMap,
          metalnessMap: m.metalnessMap,
          aoMap: m.aoMap,
          bumpMap: m.bumpMap,
          roughness: m.roughness,
          metalness: m.metalness,
        }));

        let savedDecal = null;
        if (obj.userData.decalMesh && obj.userData.decalMesh.visible) {
          const dMat = obj.userData.decalMesh.material;
          savedDecal = {
            color: dMat.color.clone(),
            map: dMat.map,
            normalMap: dMat.normalMap,
            roughnessMap: dMat.roughnessMap,
            metalnessMap: dMat.metalnessMap,
            aoMap: dMat.aoMap,
            bumpMap: dMat.bumpMap,
            roughness: dMat.roughness,
            metalness: dMat.metalness,
            visible: obj.userData.decalMesh.visible,
          };

          if (isRemove) {
            obj.userData.decalMesh.visible = false;
          } else {
            dMat.color.copy(new THREE.Color(previewHex));
            dMat.map = null;
            dMat.normalMap = null;
            dMat.roughnessMap = null;
            dMat.metalnessMap = null;
            dMat.aoMap = null;
            dMat.bumpMap = null;
            dMat.roughness = 0.5;
            dMat.metalness = 0.1;
            dMat.needsUpdate = true;
          }
        }

        const previewColor = isRemove ? null : new THREE.Color(previewHex);
        ms.forEach((m) => {
          const isTargetMat = (m.name || m.uuid) === matId;
          if (!isTargetMat) return; // ONLY tint the hovered material!

          if (isRemove) {
            m.color.setHex(
              m.userData.originalColorHex !== undefined
                ? m.userData.originalColorHex
                : 0xffffff,
            );
            m.map =
              m.userData.originalMap !== undefined
                ? m.userData.originalMap
                : null;
            m.opacity =
              m.userData.originalOpacity !== undefined
                ? m.userData.originalOpacity
                : 1.0;
            m.transparent =
              m.userData.originalTransparent !== undefined
                ? m.userData.originalTransparent
                : false;

            // Restore original physical properties
            m.roughness =
              m.userData.originalRoughness !== undefined
                ? m.userData.originalRoughness
                : 0.5;
            m.metalness =
              m.userData.originalMetalness !== undefined
                ? m.userData.originalMetalness
                : 0.1;
            m.normalMap = null;
            m.roughnessMap = null;
            m.metalnessMap = null;
            m.aoMap = null;
            m.bumpMap = null;
          } else {
            m.color.copy(previewColor);
            m.map = null;
            m.normalMap = null;
            m.roughnessMap = null;
            m.metalnessMap = null;
            m.aoMap = null;
            m.bumpMap = null;
            m.roughness = 0.5;
            m.metalness = 0.1;
            m.transparent = false;
            m.opacity = 1.0;
          }
          m.needsUpdate = true;
        });
        return { base: saved, decal: savedDecal };
      });

      brushPreviewRef.current = {
        meshes: sharedMeshes,
        materialId: matId,
        origColors,
      };
      invalidate();
    };

    const handleBrushClick = (e) => {
      if (!colorBrushActive || !brushColor) return;

      // Calculate distance between mousedown and mouseup
      const dx = e.clientX - mouseDownCoords.x;
      const dy = e.clientY - mouseDownCoords.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // If moved more than 4 pixels, treat it as rotation drag and skip painting
      if (dist > 4) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      brushRaycaster.setFromCamera({ x: ndcX, y: ndcY }, camera);
      const hits = brushRaycaster.intersectObjects(pickable, false);
      if (hits.length === 0) return;

      const hitMesh = hits[0].object;
      const mArr = Array.isArray(hitMesh.material)
        ? hitMesh.material
        : [hitMesh.material];

      const matIndex =
        hits[0].face && hits[0].face.materialIndex !== undefined
          ? hits[0].face.materialIndex
          : 0;
      const hitMat = mArr[matIndex];
      const matId = hitMat?.name || hitMat?.uuid || "all";

      // Restore preview before applying so state-driven effect takes over
      restorePreview();

      // Map special sentinel values to the actual color values expected by the state
      const effectiveColor =
        brushColor === "__remove__" || brushColor === "__none__"
          ? null
          : brushColor;
      if (onBrushApply && effectiveColor !== null)
        onBrushApply(matId, effectiveColor);
    };

    const handleBrushLeave = () => {
      if (colorBrushActive) restorePreview();
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleBrushMove);
    canvas.addEventListener("click", handleBrushClick);
    canvas.addEventListener("mouseleave", handleBrushLeave);
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleBrushMove);
      canvas.removeEventListener("click", handleBrushClick);
      canvas.removeEventListener("mouseleave", handleBrushLeave);
      restorePreview();
    };
  }, [
    clonedScene,
    gl,
    camera,
    colorBrushActive,
    brushColor,
    onBrushApply,
    brushRaycaster,
    invalidate,
  ]);

  useEffect(() => {
    if (clonedScene && onSceneLoaded) {
      onSceneLoaded(clonedScene);
    }
  }, [clonedScene, onSceneLoaded]);

  // Handle toggling measurements visibility
  useEffect(() => {
    if (!clonedScene) return;

    let meshCount = 0;
    clonedScene.traverse((obj) => {
      if (obj.isMesh) meshCount++;
    });

    clonedScene.traverse((obj) => {
      if (isMeasurementMesh(obj, meshCount)) {
        obj.visible = !!showMeasurements;
      }
    });
    invalidate();
  }, [clonedScene, showMeasurements, invalidate]);

  // Apply shadow settings whenever shadowEnabled changes
  useEffect(() => {
    if (!clonedScene) return;
    clonedScene.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = !!shadowEnabled;
      obj.receiveShadow = !!shadowEnabled;
    });
  }, [clonedScene, shadowEnabled]);

  // Extract materials
  useEffect(() => {
    if (!clonedScene) return;

    let meshCount = 0;
    clonedScene.traverse((obj) => {
      if (obj.isMesh && !obj.userData.isDecal) meshCount++;
    });

    const mats = [];
    clonedScene.traverse((obj) => {
      if (!obj.isMesh || !obj.material || obj.userData.isDecal) return;

      if (isMeasurementMesh(obj, meshCount)) return;

      const mArray = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];
      mArray.forEach((m) => {
        const id = m.name || m.uuid;
        if (!mats.some((x) => x.id === id)) {
          mats.push({ id, name: m.name || `Material (${m.uuid.slice(0, 4)})` });
        }
      });
    });
    if (onMaterialsLoaded) onMaterialsLoaded(mats);
  }, [clonedScene, onMaterialsLoaded]);

  // Highlight selected material with an outline (EdgesGeometry)
  useEffect(() => {
    if (!clonedScene) return;
    clonedScene.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const mArray = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];

      let isSelected = false;
      mArray.forEach((m) => {
        const id = m.name || m.uuid;
        if (selectedMaterialId && id === selectedMaterialId) {
          isSelected = true;
        }
      });

      if (isSelected) {
        if (!obj.userData.outlineMesh) {
          const edges = new THREE.EdgesGeometry(obj.geometry);
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0x4a90e2, linewidth: 2 }),
          );
          // Scale it slightly up to ensure it shows outside the mesh
          line.scale.set(1.002, 1.002, 1.002);
          obj.add(line);
          obj.userData.outlineMesh = line;
        }
        obj.userData.outlineMesh.visible = true;
      } else {
        if (obj.userData.outlineMesh) {
          obj.userData.outlineMesh.visible = false;
        }
      }
    });
  }, [clonedScene, selectedMaterialId]);

  // Recompute floorY (shadow catcher height) in same local-coord useMemo
  const { baseTransform, baseDims, floorY } = useMemo(() => {
    if (!clonedScene)
      return { baseTransform: { scale: 1, offset: [0, 0, 0] }, baseDims: null, floorY: -0.005 };
    const box = new THREE.Box3();
    let hasValidMesh = false;
    clonedScene.traverse((obj) => {
      if (obj.isMesh && !obj.userData.isDecal && !isMeasurementMesh(obj, 10)) {
        if (obj.visible === false) return;
        if (!obj.geometry.boundingBox) {
          obj.geometry.computeBoundingBox();
        }
        const tempBox = new THREE.Box3()
          .copy(obj.geometry.boundingBox)
          .applyMatrix4(obj.matrixWorld);
        box.union(tempBox);
        hasValidMesh = true;
      }
    });
    if (!hasValidMesh) {
      box.setFromObject(clonedScene);
    }
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 3.0 / maxDim;

    const dims = {
      length: Math.round(size.x * 1000),
      height: Math.round(size.y * 1000),
      width: Math.round(size.z * 1000),
    };

    const isLayoutModel = !MODELS.some((m) => m.modelUrl === modelUrl);

    const offsetY = isLayoutModel ? 0 : -box.min.y * scale;

    // floorY in world space: localMinY * scale + offsetY
    // For normal models: box.min.y * scale - box.min.y * scale = 0 (ground level)
    // For layout models: box.min.y * scale + 0 = box.min.y * scale
    const computedFloorY = box.min.y * scale + offsetY - 0.001;

    return {
      baseTransform: {
        scale,
        offset: isLayoutModel
          ? [0, 0, 0]
          : [-center.x * scale, offsetY, -center.z * scale],
      },
      baseDims: dims,
      floorY: computedFloorY,
    };
  }, [clonedScene, modelUrl]);

  // Pass dimensions up
  useEffect(() => {
    if (baseDims && onBaseDimensionsLoaded) {
      onBaseDimensionsLoaded(baseDims);
    }
  }, [baseDims, onBaseDimensionsLoaded]);

  // Pass floor Y to parent for shadow catcher placement (computed in local coordinate space)
  useEffect(() => {
    if (onFloorYLoaded) onFloorYLoaded(floorY);
  }, [floorY, onFloorYLoaded]);

  // Calculate non-uniform custom scale
  const customScale = useMemo(() => {
    if (!baseDims || !customSize) return [1, 1, 1];
    return [
      customSize.length ? customSize.length / baseDims.length : 1,
      customSize.height ? customSize.height / baseDims.height : 1,
      customSize.width ? customSize.width / baseDims.width : 1,
    ];
  }, [baseDims, customSize]);

  // Optimize texture loader by memoizing it and tracking loading state
  const callbacksRef = useRef({ onTextureLoadStart, onTextureLoadEnd });
  callbacksRef.current = { onTextureLoadStart, onTextureLoadEnd };

  // Keep track of pending texture loads to hide loading spinner when ALL textures have resolved
  const pendingLoadsRef = useRef(0);

  const startTextureLoad = useCallback(() => {
    pendingLoadsRef.current++;
    if (callbacksRef.current.onTextureLoadStart) {
      callbacksRef.current.onTextureLoadStart();
    }
  }, []);

  const endTextureLoad = useCallback(() => {
    pendingLoadsRef.current = Math.max(0, pendingLoadsRef.current - 1);
    if (
      pendingLoadsRef.current === 0 &&
      callbacksRef.current.onTextureLoadEnd
    ) {
      // Short delay for GPU upload to finish before hiding the spinner
      setTimeout(() => {
        if (
          pendingLoadsRef.current === 0 &&
          callbacksRef.current.onTextureLoadEnd
        ) {
          callbacksRef.current.onTextureLoadEnd();
        }
      }, 300);
    }
  }, []);

  useEffect(() => {
    if (!clonedScene) return;

    let meshCount = 0;
    clonedScene.traverse((obj) => {
      if (obj.isMesh && !obj.userData.isDecal) meshCount++;
    });

    // Pre-calculate label meshes and properties once to avoid O(N^2) traverses
    const labelMeshNamesAndMats = new Set();
    let hasLabelMeshCached = false;
    clonedScene.traverse((o) => {
      if (o.isMesh && !o.userData.isDecal) {
        const n = (o.name || "").toLowerCase();
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        const hasLabelMat = mats.some((m) => {
          if (!m) return false;
          const matName = (m.name || "").toLowerCase();
          return (
            matName.includes("label") ||
            matName.includes("wrapper") ||
            matName.includes("design") ||
            matName.includes("artwork")
          );
        });
        if (
          n.includes("label") ||
          n.includes("wrapper") ||
          n.includes("design") ||
          n.includes("artwork") ||
          hasLabelMat
        ) {
          hasLabelMeshCached = true;
          labelMeshNamesAndMats.add(o.uuid);
        }
      }
    });

    clonedScene.traverse((obj) => {
      if (!obj.isMesh || !obj.material || obj.userData.isDecal) return;

      if (isMeasurementMesh(obj, meshCount)) return;

      // Relink or clear stale serialized decalMesh reference (can happen when importing a previously exported scene)
      if (
        obj.userData.decalMesh &&
        !(obj.userData.decalMesh instanceof THREE.Mesh)
      ) {
        obj.userData.decalMesh = null;
      }
      if (!obj.userData.decalMesh) {
        const existingDecal = obj.children.find(
          (c) => c.isMesh && c.userData.isDecal,
        );
        if (existingDecal) {
          obj.userData.decalMesh = existingDecal;
        }
      }

      const mArray = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];

      let hasCustomization = false;

      mArray.forEach((m) => {
        const id = m.name || m.uuid;
        const cleanId = (m.name || m.uuid || "").replace(/\.\d+$/, "");
        const n = (obj.name || "").toLowerCase();
        const matName = (m.name || "").toLowerCase().replace(/\.\d+$/, "");
        const origMatName = (m.userData?.originalMaterialName || m.name || "")
          .toLowerCase()
          .replace(/\.\d+$/, "");

        // Trust the physical object name (if it contains "lid" or "cap") over incorrect Blender material mappings
        const isCapMesh =
          origMatName === "lid" ||
          origMatName === "lid-metal" ||
          origMatName === "cap" ||
          n.includes("lid") ||
          n.includes("cap");

        // Dynamically resolve correctly mapped lookup ID to heal layout model material misassignments
        let lookupId = cleanId;
        if (isCapMesh) {
          lookupId = "cap";
        } else {
          if (
            cleanId === "lid" ||
            cleanId === "lid-metal" ||
            cleanId === "cap"
          ) {
            const bodyKey = Object.keys(
              appliedColors || appliedMaterials || appliedTextures || {},
            ).find((k) => k !== "cap" && k !== "all");
            if (bodyKey) lookupId = bodyKey;
          }
        }

        // If originalMap is a stale JSON object from import, clean up cached values to force re-caching
        if (
          m.userData.originalMap &&
          !(m.userData.originalMap instanceof THREE.Texture)
        ) {
          delete m.userData.originalColorHex;
          delete m.userData.originalMap;
          delete m.userData.originalRoughness;
          delete m.userData.originalMetalness;
          delete m.userData.originalTransparent;
          delete m.userData.originalOpacity;
          delete m.userData.originalSide;
          delete m.userData.originalTransmission;
        }

        // Store original color and map if not stored yet
        if (m.userData.originalColorHex === undefined) {
          m.userData.originalColorHex = m.color ? m.color.getHex() : 0xffffff;
          m.userData.originalMap = m.map;
          m.userData.originalRoughness = m.roughness;
          m.userData.originalMetalness = m.metalness;
          m.userData.originalTransparent = m.transparent;
          m.userData.originalOpacity = m.opacity;
          m.userData.originalSide = m.side;
          m.userData.originalTransmission =
            m.transmission !== undefined ? m.transmission : 0;
        }

        const last = resolveAppliedValue(appliedLastApplied, cleanId, isCapMesh, origMatName, obj.name);

        let colorHex =
          last === "material"
            ? null
            : resolveAppliedValue(appliedColors, cleanId, isCapMesh, origMatName, obj.name);

        let materialType =
          last === "color"
            ? null
            : resolveAppliedValue(appliedMaterials, cleanId, isCapMesh, origMatName, obj.name);

        let textureUrl = null;
        if (appliedTextures) {
          let potentialUrl = null;
          if (typeof appliedTextures === "string") {
            potentialUrl = isCapMesh ? null : appliedTextures;
          } else {
            potentialUrl = resolveAppliedValue(appliedTextures, cleanId, isCapMesh, origMatName, obj.name);
          }

          if (potentialUrl) {
            const isCustomDesign = potentialUrl.startsWith("data:image");
            const specificLast = resolveAppliedValue(appliedLastApplied, cleanId, isCapMesh, origMatName, obj.name);
            const explicitTexture = typeof appliedTextures === "object" && resolveAppliedValue(appliedTextures, cleanId, isCapMesh, origMatName, obj.name);
            if (
              isCustomDesign ||
              specificLast === "texture" ||
              last !== "color" ||
              (explicitTexture && last === "color")
            ) {
              textureUrl = potentialUrl;
            }
          }
        }

        if (textureUrl || colorHex) {
          hasCustomization = true;
        }

        // Check cache using both obj.name and material uuid / name
        const shouldApply =
          !hasLabelMeshCached ||
          labelMeshNamesAndMats.has(obj.uuid) ||
          (() => {
            return (
              n.includes("label") ||
              n.includes("wrapper") ||
              n.includes("design") ||
              n.includes("artwork") ||
              matName.includes("label") ||
              matName.includes("wrapper") ||
              matName.includes("design") ||
              matName.includes("artwork")
            );
          })();

        // If it's a label mesh but has no explicit color/material, inherit from the lid/body
        // so its background doesn't remain white when the rest of the model is colored.
        // BUT do not inherit color if this sub-material has its own custom textureUrl!
        if (
          shouldApply &&
          !colorHex &&
          !materialType &&
          (appliedColors || appliedMaterials) &&
          !textureUrl
        ) {
          const tryInherit = (appliedObj) => {
            if (!appliedObj) return null;
            const keys = Object.keys(appliedObj).filter(
              (k) => k !== "all" && k !== "cap",
            );
            if (keys.length === 0) return null;

            const labelName = (obj.name + "_" + m.name).toLowerCase();
            const isLidLabel =
              labelName.includes("lid") ||
              labelName.includes("cap") ||
              labelName.includes("circle003") ||
              labelName.includes("top");
            const isBodyLabel =
              labelName.includes("body") ||
              labelName.includes("base") ||
              labelName.includes("bottom") ||
              labelName.includes("circle001") ||
              labelName.includes("cylinder");

            const lidKey = keys.find(
              (k) =>
                k.toLowerCase().includes("lid") ||
                k.toLowerCase().includes("cap") ||
                k.toLowerCase().includes("circle003") ||
                k.toLowerCase().includes("circle004"),
            );
            const bodyKey = keys.find(
              (k) =>
                k.toLowerCase().includes("body") ||
                k.toLowerCase().includes("base") ||
                k.toLowerCase().includes("cylinder") ||
                k.toLowerCase().includes("circle001") ||
                k.toLowerCase().includes("circle002"),
            );

            if (isLidLabel && !isBodyLabel && lidKey) return appliedObj[lidKey];
            if (isBodyLabel && !isLidLabel && bodyKey)
              return appliedObj[bodyKey];

            // Fallback position check
            if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
            const center = new THREE.Vector3();
            obj.geometry.boundingBox.getCenter(center);

            if (center.y > 0.04) {
              return lidKey ? appliedObj[lidKey] : null;
            } else {
              return bodyKey ? appliedObj[bodyKey] : null;
            }
          };
          if (!colorHex && last !== "material")
            colorHex = tryInherit(appliedColors);
          if (!materialType && last !== "color")
            materialType = tryInherit(appliedMaterials);
        }

        const allowCustomization = shouldApply || isCapMesh;

        if (!allowCustomization) {
          if (obj.userData.decalMesh) {
            obj.userData.decalMesh.visible = false;
          }
        } else {
          // --- HANDLE DECAL MESH FOR CANVAS EDITS ---
          if (!obj.userData.decalMesh) {
            const decalMat = new THREE.MeshStandardMaterial({
              transparent: true,
              depthWrite: false,
              polygonOffset: true,
              polygonOffsetFactor: -1,
              polygonOffsetUnits: -4,
            });
            const decal = new THREE.Mesh(obj.geometry, decalMat);
            decal.userData.isDecal = true;
            obj.add(decal);
            obj.userData.decalMesh = decal;
          }

          const decalMat = obj.userData.decalMesh.material;
          if (textureUrl) {
            obj.userData.decalMesh.visible = true;
            if (decalMat.userData.currentTextureUrl !== textureUrl) {
              decalMat.userData.currentTextureUrl = textureUrl;
              startTextureLoad();
              textureCache
                .load(textureUrl, {
                  colorSpace: THREE.SRGBColorSpace,
                  flipY: textureUrl.startsWith("data:image"),
                })
                .then((texture) => {
                  if (modelUrl && modelUrl.toLowerCase().includes("tape")) {
                    // Treat tape like other models: no rotation, just wrap it so it repeats!
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                  } else {
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;
                  }
                  if (decalMat.map) decalMat.map.dispose();
                  decalMat.map = texture;
                  decalMat.color.setHex(0xffffff);
                  decalMat.needsUpdate = true;
                  endTextureLoad();
                  invalidate();
                })
                .catch(() => {
                  endTextureLoad();
                });
            }
          } else {
            obj.userData.decalMesh.visible = false;
            if (decalMat.map) decalMat.map.dispose();
            decalMat.map = null;
            decalMat.userData.currentTextureUrl = null;
            decalMat.needsUpdate = true;
            invalidate();
          }
        }

        // --- HANDLE BASE MESH (PBR OR COLOR) ---
        if (colorHex) {
          // Reset PBR material state
          m.userData.currentPbrId = null;
          if (m.normalMap) m.normalMap.dispose();
          if (m.roughnessMap) m.roughnessMap.dispose();
          if (m.metalnessMap) m.metalnessMap.dispose();
          if (m.aoMap) m.aoMap.dispose();
          m.normalMap = null;
          m.roughnessMap = null;
          m.metalnessMap = null;
          m.aoMap = null;
          m.vertexColors = false;

          if (colorHex === "transparent") {
            m.transparent = true;
            m.opacity = 0.35;
            m.roughness = 0.1;
            m.metalness = 0.1;
            if ("transmission" in m) m.transmission = 0.9;
            m.color.setHex(0xffffff);
          } else {
            const wasOriginallyTransparent =
              m.userData.originalTransparent ||
              (m.userData.originalTransmission &&
                m.userData.originalTransmission > 0);
            if (wasOriginallyTransparent) {
              m.transparent = true;
              m.opacity =
                m.userData.originalOpacity !== undefined
                  ? m.userData.originalOpacity
                  : 0.35;
              m.roughness =
                m.userData.originalRoughness !== undefined
                  ? m.userData.originalRoughness
                  : 0.1;
              m.metalness =
                m.userData.originalMetalness !== undefined
                  ? m.userData.originalMetalness
                  : 0.1;
              if ("transmission" in m) {
                m.transmission =
                  m.userData.originalTransmission !== undefined
                    ? m.userData.originalTransmission
                    : 0.9;
              }
            } else {
              m.transparent = false;
              m.opacity = 1.0;
              m.roughness =
                m.userData.originalRoughness !== undefined
                  ? m.userData.originalRoughness
                  : 0.5;
              m.metalness =
                m.userData.originalMetalness !== undefined
                  ? m.userData.originalMetalness
                  : 0.1;
              if ("transmission" in m) m.transmission = 0;
            }
            m.color.set(colorHex);
          }
          // If a color is applied (explicitly or inherited), REMOVE the default label map!
          // The user explicitly stated that applying a color should wipe out the "Your Design Here" text and background!
          // BUT only do this if there is no custom textureUrl being applied to this mesh!
          // AND only if the color was explicitly set on this label/material itself (not inherited from the body/structure).
          if (!textureUrl) {
            const explicitColor = resolveAppliedValue(appliedColors, cleanId, isCapMesh, origMatName, obj.name);
            const hasExplicitColor = explicitColor !== null && explicitColor !== undefined;
            if (hasExplicitColor) {
              if (m.map) m.map.dispose();
              m.map = null;
            }
          }
          m.needsUpdate = true;
          invalidate();
        } else {
          // Restore original transparency settings
          const hasCustomDesign = !!textureUrl;
          m.transparent =
            m.userData.originalTransparent !== undefined
              ? m.userData.originalTransparent
              : false;
          m.opacity =
            m.userData.originalOpacity !== undefined
              ? m.userData.originalOpacity
              : 1.0;
          m.roughness =
            m.userData.originalRoughness !== undefined
              ? m.userData.originalRoughness
              : 0.5;
          m.metalness =
            m.userData.originalMetalness !== undefined
              ? m.userData.originalMetalness
              : 0.1;
          if (
            m.userData.originalTransmission !== undefined &&
            "transmission" in m
          ) {
            m.transmission = m.userData.originalTransmission;
          }

          // Reset color if no custom color is specified
          if (typeof materialType === "object" && materialType !== null) {
            m.color.setHex(0xffffff); // PBR active: base color white
          } else {
            m.color.setHex(m.userData.originalColorHex); // Restore original
          }

          if (!materialType) {
            // Restore Originals (No custom color, no PBR material)
            m.userData.currentPbrId = null;
            m.vertexColors =
              m.userData.originalVertexColors !== undefined
                ? m.userData.originalVertexColors
                : false;
            if (textureUrl) {
              m.map = null;
            } else {
              if (hasCustomDesign || (shouldApply && !showDefaultLabels)) {
                m.map = null;
              } else {
                m.map = m.userData.originalMap;
              }
            }
            if (m.normalMap) m.normalMap.dispose();
            if (m.roughnessMap) m.roughnessMap.dispose();
            if (m.metalnessMap) m.metalnessMap.dispose();
            if (m.aoMap) m.aoMap.dispose();
            m.normalMap = null;
            m.roughnessMap = null;
            m.metalnessMap = null;
            m.aoMap = null;
          }
          m.needsUpdate = true;
          invalidate();
        }

        // Apply custom materials properties
        if (typeof materialType === "string") {
          // If a material preset is applied, remove the default label map
          if (m.map) m.map.dispose();
          m.map = null;

          // It's a legacy default material
          if (materialType === "kraft") {
            m.roughness = 0.9;
            m.metalness = 0.1;
            if (!textureUrl && last !== "color") m.color.setHex(0xbc9476);
          } else if (materialType === "glossy") {
            m.roughness = 0.1;
            m.metalness = 0.1;
            if (!textureUrl && last !== "color") m.color.setHex(0xffffff);
          } else if (materialType === "matte") {
            m.roughness = 0.8;
            m.metalness = 0.1;
            if (!textureUrl && last !== "color") m.color.setHex(0x222222);
          } else if (materialType === "metallic") {
            m.roughness = 0.2;
            m.metalness = 0.9;
            if (!textureUrl && last !== "color") m.color.setHex(0xaaaaaa);
          }
        } else if (typeof materialType === "object" && materialType !== null) {
          // It's a PBR texture object from the TextureLibrary
          if (m.userData.currentPbrId !== materialType.id) {
            m.userData.currentPbrId = materialType.id;
            m.userData.currentTextureUrl = null; // Clear active simple texture

            // Set base color to white so textures show accurately
            m.color.setHex(0xffffff);

            // Dispose old maps first
            if (m.map) m.map.dispose();
            if (m.normalMap) m.normalMap.dispose();
            if (m.roughnessMap) m.roughnessMap.dispose();
            if (m.metalnessMap) m.metalnessMap.dispose();
            if (m.aoMap) m.aoMap.dispose();
            if (m.bumpMap) m.bumpMap.dispose();

            // Initialize maps
            m.map = null;
            m.normalMap = null;
            m.roughnessMap = null;
            m.metalnessMap = null;
            m.aoMap = null;
            m.bumpMap = null;
            m.vertexColors = false;

            const loadMap = (url, mapType, isColorSpace) => {
              if (!url) return;
              startTextureLoad();
              textureCache
                .load(url)
                .then((texture) => {
                  texture.wrapS = THREE.RepeatWrapping;
                  texture.wrapT = THREE.RepeatWrapping;
                  texture.flipY = false;
                  const imageAspect =
                    texture.image?.width && texture.image?.height
                      ? texture.image.width / texture.image.height
                      : 1;
                  const repeatBase = 3;
                  texture.repeat.set(repeatBase, repeatBase * imageAspect);
                  if (isColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
                  if (m[mapType]) m[mapType].dispose();
                  m[mapType] = texture;

                  if (mapType !== "map" && obj.userData.decalMesh) {
                    const dMat = obj.userData.decalMesh.material;
                    if (isWearableModel) {
                      dMat[mapType] = texture;
                      dMat.needsUpdate = true;
                    }
                  }

                  m.needsUpdate = true;
                  endTextureLoad();
                  invalidate();
                })
                .catch(() => {
                  endTextureLoad();
                });
            };

            // Load available maps
            if (materialType.maps.albedo)
              loadMap(materialType.maps.albedo, "map", true);
            if (materialType.maps.normal)
              loadMap(materialType.maps.normal, "normalMap", false);
            if (materialType.maps.roughness)
              loadMap(materialType.maps.roughness, "roughnessMap", false);
            if (materialType.maps.metallic)
              loadMap(materialType.maps.metallic, "metalnessMap", false);
            if (materialType.maps.ao)
              loadMap(materialType.maps.ao, "aoMap", false);
            if (materialType.maps.height) {
              loadMap(materialType.maps.height, "bumpMap", false);
              m.bumpScale = 0.03;
            }

            // Set physical properties to full effect to let maps dictate appearance
            m.roughness = materialType.maps.roughness ? 1.0 : 0.65;
            m.metalness = materialType.maps.metallic ? 1.0 : 0.0;
            m.needsUpdate = true;
          }
        } else {
          // No material specified, restore originals
          m.userData.currentPbrId = null;
          m.roughness =
            m.userData.originalRoughness !== undefined
              ? m.userData.originalRoughness
              : 0.5;
          m.metalness =
            m.userData.originalMetalness !== undefined
              ? m.userData.originalMetalness
              : 0.1;

          // Only clear custom PBR maps if they exist, but leave m.map intact if it came from texture picker
          m.normalMap = null;
          m.roughnessMap = null;
          m.metalnessMap = null;
          m.aoMap = null;
        }

        // Apply custom metallic/roughness overrides if set
        const customMetallic = resolveAppliedValue(appliedMetallic, cleanId, isCapMesh, origMatName, obj.name);
        const customRoughness = resolveAppliedValue(appliedRoughness, cleanId, isCapMesh, origMatName, obj.name);

        if (customMetallic !== undefined) {
          m.metalness = customMetallic;
        }
        if (customRoughness !== undefined) {
          m.roughness = customRoughness;
        }

        // Sync physical properties and PBR maps to the decal mesh so Editor 2 graphics
        // perfectly match the underlying texture and look realistic.
        if (obj.userData.decalMesh) {
          const dMat = obj.userData.decalMesh.material;
          if (isWearableModel) {
            dMat.roughness = m.roughness;
            dMat.metalness = m.metalness;
            dMat.normalMap = m.normalMap;
            dMat.roughnessMap = m.roughnessMap;
            dMat.metalnessMap = m.metalnessMap;
            dMat.aoMap = m.aoMap;
            dMat.bumpMap = m.bumpMap;
            dMat.bumpScale = m.bumpScale;
          } else {
            dMat.roughness = 0.5;
            dMat.metalness = 0.1;
            dMat.normalMap = null;
            dMat.roughnessMap = null;
            dMat.metalnessMap = null;
            dMat.aoMap = null;
            dMat.bumpMap = null;
            dMat.bumpScale = 1;
          }
          dMat.needsUpdate = true;
        }

        if (shouldApply) {
          m.blending = THREE.NormalBlending;

          // Force the label base mesh to be fully invisible if default labels are toggled off
          // and no custom texture (decal) or custom color is present, BUT only for label overlay models.
          // Otherwise, it renders as a solid colored wrapper that blocks the structural body.
          if (
            !showDefaultLabels &&
            !textureUrl &&
            !colorHex &&
            isLabelOverlayModel
          ) {
            m.transparent = true;
            m.opacity = 0;
            if ("transmission" in m) m.transmission = 0;
          }
        }
      });

      // Update visibility of the main label mesh based on customization and toggle state
      const isLabelMesh = labelMeshNamesAndMats.has(obj.uuid);
      if (isLabelMesh) {
        const hideLabelMesh =
          !showDefaultLabels && !hasCustomization && isLabelOverlayModel;
        obj.visible = !hideLabelMesh;
      }
    });
  }, [
    clonedScene,
    appliedTextures,
    appliedColors,
    appliedMaterials,
    appliedLastApplied,
    appliedMetallic,
    appliedRoughness,
    showDefaultLabels,
    isWearableModel,
    isLabelOverlayModel,
  ]);

  if (!clonedScene) return null;

  return (
    <group position={baseTransform.offset} scale={baseTransform.scale}>
      <group ref={transitionGroupRef}>
        <group scale={customScale}>
          <primitive object={clonedScene} />
          {selectedCapUrl && selectedCapUrl !== "none" && capTransforms.length > 0 && (
            capTransforms.map((t) => (
              <CustomCap
                key={t.id}
                url={selectedCapUrl}
                transform={t}
                appliedColors={appliedColors}
                currentCapOffsets={currentCapOffsets}
              />
            ))
          )}
        </group>
      </group>
    </group>
  );
}

// â”€â”€â”€ Screen-space measurement overlay helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function _setMLine(svg, id, x1, y1, x2, y2) {
  const el = svg.querySelector(`[data-m="${id}"]`);
  if (!el) return;
  el.setAttribute("x1", x1);
  el.setAttribute("y1", y1);
  el.setAttribute("x2", x2);
  el.setAttribute("y2", y2);
}

function _setMText(svg, id, x, y, text) {
  const textEl = svg.querySelector(`[data-m-t="${id}"]`);
  if (!textEl) return;
  textEl.setAttribute("x", x);
  textEl.setAttribute("y", y);
  textEl.textContent = text;
  const bgEl = svg.querySelector(`[data-m-bg="${id}"]`);
  if (bgEl) {
    try {
      const bbox = textEl.getBBox();
      bgEl.setAttribute("x", bbox.x - 10);
      bgEl.setAttribute("y", bbox.y - 5);
      bgEl.setAttribute("width", bbox.width + 20);
      bgEl.setAttribute("height", bbox.height + 10);
    } catch (_) { }
  }
}

function MeasurementTracker({
  activeSceneRef,
  measureOverlayRef,
  baseDimensions,
}) {
  const { camera, size, invalidate } = useThree();

  // Force one render on mount so measurements appear immediately
  useEffect(() => {
    invalidate();
  }, [invalidate]);

  useFrame(() => {
    if (!activeSceneRef.current || !measureOverlayRef.current) return;

    const scene = activeSceneRef.current;

    // Ensure world matrices are current (critical for first-frame correctness)
    scene.updateWorldMatrix(true, true);

    // Compute bounding box excluding baked measurement nodes
    const box = new THREE.Box3();
    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      const name = obj.name || "";
      if (/^(plane|text)/i.test(name)) return;
      box.expandByObject(obj);
    });
    if (box.isEmpty()) {
      // fallback: use whole scene
      box.setFromObject(scene);
    }
    if (box.isEmpty()) return;

    const { min, max } = box;
    const W = size.width;
    const H = size.height;

    const project = (x, y, z) => {
      const v = new THREE.Vector3(x, y, z).project(camera);
      return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H };
    };

    // 3D bounding box corners projected to 2D
    const tfl = project(min.x, max.y, max.z); // top-front-left
    const tfr = project(max.x, max.y, max.z); // top-front-right
    const tbl = project(min.x, max.y, min.z); // top-back-left
    const bfl = project(min.x, min.y, max.z); // bottom-front-left
    const bfr = project(max.x, min.y, max.z); // bottom-front-right
    const bbr = project(max.x, min.y, min.z); // bottom-back-right

    const overlay = measureOverlayRef.current;
    if (!overlay) return;

    const lenLabel = baseDimensions?.length
      ? `${baseDimensions.length} mm`
      : "";
    const wLabel = baseDimensions?.width ? `${baseDimensions.width} mm` : "";
    const hLabel = baseDimensions?.height ? `${baseDimensions.height} mm` : "";

    // â”€â”€ Top Length (horizontal line above top face) â”€â”€
    const tlOffset = 28;
    const tlY = Math.min(tfl.y, tfr.y, tbl.y) - tlOffset;
    _setMLine(overlay, "tl-el", tfl.x, tfl.y, tfl.x, tlY);
    _setMLine(overlay, "tl-er", tfr.x, tfr.y, tfr.x, tlY);
    _setMLine(overlay, "tl", tfl.x, tlY, tfr.x, tlY);
    _setMText(
      overlay,
      "tl",
      (tfl.x + tfr.x) / 2,
      tlY - 6,
      lenLabel ? `Top Length - ${lenLabel}` : "Top Length",
    );

    // â”€â”€ Top Breadth (oblique line on left side of top face) â”€â”€
    _setMLine(overlay, "tb", tfl.x, tfl.y, tbl.x, tbl.y);
    const tbMx = (tfl.x + tbl.x) / 2;
    const tbMy = (tfl.y + tbl.y) / 2;
    _setMText(
      overlay,
      "tb",
      tbMx - 6,
      tbMy - 8,
      wLabel ? `Top Breadth - ${wLabel}` : "Top Breadth",
    );

    // â”€â”€ Height (vertical line on the left) â”€â”€
    const hOffset = -32;
    const hX = Math.min(bfl.x, tfl.x) + hOffset;
    _setMLine(overlay, "h-eb", bfl.x, bfl.y, hX + 12, bfl.y);
    _setMLine(overlay, "h-et", tfl.x, tfl.y, hX + 12, tfl.y);
    _setMLine(overlay, "h", hX, bfl.y, hX, tfl.y);
    // tick marks
    _setMLine(overlay, "h-tb", hX - 6, bfl.y, hX + 6, bfl.y);
    _setMLine(overlay, "h-tt", hX - 6, tfl.y, hX + 6, tfl.y);
    _setMText(
      overlay,
      "h",
      hX - 6,
      (bfl.y + tfl.y) / 2,
      hLabel ? `H - ${hLabel}` : "H",
    );

    // â”€â”€ Base Length (horizontal line below bottom face) â”€â”€
    const blOffset = 28;
    const blY = Math.max(bfl.y, bfr.y) + blOffset;
    _setMLine(overlay, "bl-el", bfl.x, bfl.y, bfl.x, blY);
    _setMLine(overlay, "bl-er", bfr.x, bfr.y, bfr.x, blY);
    _setMLine(overlay, "bl", bfl.x, blY, bfr.x, blY);
    _setMText(
      overlay,
      "bl",
      (bfl.x + bfr.x) / 2,
      blY + 6,
      lenLabel ? `Base Length - ${lenLabel}` : "Base Length",
    );

    // â”€â”€ Base Breadth (oblique line on right side of bottom face) â”€â”€
    _setMLine(overlay, "bb", bfr.x, bfr.y, bbr.x, bbr.y);
    const bbMx = (bfr.x + bbr.x) / 2;
    const bbMy = (bfr.y + bbr.y) / 2;
    _setMText(
      overlay,
      "bb",
      bbMx + 8,
      bbMy + 14,
      wLabel ? `Base Breadth - ${wLabel}` : "Base Breadth",
    );
  });

  return null;
}

const isLightColor = (color) => {
  if (!color) return false;
  const c = color.toLowerCase().trim();
  if (c === "transparent" || c === "white" || c === "#ffffff" || c === "#fff")
    return true;
  if (c.startsWith("rgb")) {
    const match = c.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0]);
      const g = parseInt(match[1]);
      const b = parseInt(match[2]);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 180;
    }
  }
  if (c.startsWith("#") && c.length === 7) {
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 180;
  }
  return false;
};

function LightingAndShadows({ shadowEnabled, activeScene, ambLight, dirLight }) {
  const { invalidate } = useThree();
  const dirLightRef = useRef();

  useEffect(() => {
    const light = dirLightRef.current;
    if (light && light.shadow && light.shadow.camera) {
      // Preserved exact original shadow camera bounds to ensure 100% identical shadow position
      light.shadow.camera.left = -15;
      light.shadow.camera.right = 15;
      light.shadow.camera.top = 10;
      light.shadow.camera.bottom = -10;
      light.shadow.camera.updateProjectionMatrix();
      invalidate();
    }
  }, [activeScene, shadowEnabled, invalidate]);

  return (
    <>
      <ambientLight intensity={ambLight} />
      <directionalLight
        ref={dirLightRef}
        position={[5, 10, 5]}
        intensity={shadowEnabled ? dirLight : dirLight * 0.75}
        castShadow={shadowEnabled}
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={25}
        shadow-camera-near={0.1}
        shadow-bias={-0.0001}
        shadow-radius={2}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
    </>
  );
}

export default function EditorScreen1({
  modelUrl,
  setModelUrl,
  appliedTextures,
  appliedColors,
  appliedMaterials,
  appliedLastApplied,
  appliedCustomSize,
  appliedMetallic,
  appliedRoughness,
  onApplyMetallic,
  onApplyRoughness,
  selectedMaterial,
  setSelectedMaterial,
  sceneBgColor: bgColor,
  setSceneBgColor: setBgColor,
  sceneBgImage: bgImage,
  setSceneBgImage: setBgImage,
  hdriPreset,
  setHdriPreset,
  envIntensity,
  setEnvIntensity,
  ambLight,
  setAmbLight,
  dirLight,
  setDirLight,
  shadowOpacity,
  setShadowOpacity,
  customHdri,
  setCustomHdri,
  onLoadScene,
  onProceed,
  onApplyColor,
  onApplyMaterial,
  onApplyCustomSize,
  onUndo,
  onRedo,
  onResetAll,
  canUndo,
  canRedo,
  isActive,
  activeTab,
  setActiveTab,
  selectedCapUrl,
  onSelectCap,
  uvEditsApplied,
  onClearUvEdits,
}) {
  const isBottleModel = useMemo(() => {
    if (!modelUrl) return false;
    const model = MODELS.find((m) => m.modelUrl === modelUrl);
    if (model) {
      return model.category === "Drinkware Bottles";
    }
    const urlLower = modelUrl.toLowerCase();
    return (
      urlLower.includes("plastic") ||
      urlLower.includes("glass") ||
      urlLower.includes("soft") ||
      urlLower.includes("steel") ||
      urlLower.includes("bottle")
    );
  }, [modelUrl]);
  const isWearableModel = useMemo(() => {
    return (
      modelUrl &&
      (modelUrl.toLowerCase().includes("t s1") ||
        modelUrl.toLowerCase().includes("hoodie") ||
        MODELS.some(
          (m) => m.modelUrl === modelUrl && m.category === "Fashion Wear",
        ))
    );
  }, [modelUrl]);
  const isTapeModel = useMemo(() => {
    return modelUrl && modelUrl.toLowerCase().includes("tape");
  }, [modelUrl]);
  const isLayoutModel = useMemo(() => {
    return !MODELS.some((m) => m.modelUrl === modelUrl);
  }, [modelUrl]);
  const [showTools, setShowTools] = useState(false);
  const [isLidOpen, setIsLidOpen] = useState(false);
  const [capPanelPosition, setCapPanelPosition] = useState({ x: 0, y: 0 });
  const [isCapPanelMinimized, setIsCapPanelMinimized] = useState(false);
  const [isDraggingCapPanel, setIsDraggingCapPanel] = useState(false);
  const capPanelDragStart = useRef({ startX: 0, startY: 0, posX: 0, posY: 0 });
  const capPanelRef = useRef(null);

  const handleCapPanelPointerDown = (e) => {
    setIsDraggingCapPanel(true);
    capPanelDragStart.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: capPanelPosition.x,
      posY: capPanelPosition.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleCapPanelPointerMove = (e) => {
    if (!isDraggingCapPanel) return;
    const dx = e.clientX - capPanelDragStart.current.startX;
    const dy = e.clientY - capPanelDragStart.current.startY;
    let newX = capPanelDragStart.current.posX + dx;
    let newY = capPanelDragStart.current.posY + dy;

    if (capPanelRef.current) {
      const rect = capPanelRef.current.getBoundingClientRect();
      const parentWidth = window.innerWidth;
      const parentHeight = window.innerHeight;

      // Initial position: right-24 is 96px, top-[10vh] is parentHeight * 0.1
      const initialLeft = parentWidth - rect.width - 96;
      const initialTop = parentHeight * 0.1;

      const leftBound = -initialLeft + 16;
      const rightBound = parentWidth - (initialLeft + rect.width) - 16;
      const topBound = -initialTop + 16;
      const bottomBound = parentHeight - (initialTop + rect.height) - 16;

      newX = Math.max(leftBound, Math.min(rightBound, newX));
      newY = Math.max(topBound, Math.min(bottomBound, newY));
    }
    setCapPanelPosition({ x: newX, y: newY });
  };

  const handleCapPanelPointerUp = (e) => {
    if (isDraggingCapPanel) {
      setIsDraggingCapPanel(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };
  const [showCustomSize, setShowCustomSize] = useState(false);
  const [showDefaultLabels, setShowDefaultLabels] = useState(true);
  const [showCameraViews, setShowCameraViews] = useState(false);
  const orbitControlsRef = useRef(null);
  const cameraRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Cap hover color panel state
  const [capHoverPos, setCapHoverPos] = useState(null); // { x, y } â€” locked once panel is shown
  const [capHoverMaterialKey, setCapHoverMaterialKey] = useState(null);
  const capHideTimerRef = useRef(null); // debounce timer to keep panel alive
  const isOverPanelRef = useRef(false); // true while cursor is inside the color panel

  const handleCapHover = useCallback((x, y, matKey) => {
    // Cancel any pending hide
    if (capHideTimerRef.current) {
      clearTimeout(capHideTimerRef.current);
      capHideTimerRef.current = null;
    }
    // Only pin position on first entry (don't chase cursor once panel is visible)
    setCapHoverPos((prev) => prev || { x, y });
    setCapHoverMaterialKey(matKey);
  }, []);

  const handleCapLeave = useCallback(() => {
    // Debounce: give 350ms for user to move onto the panel
    capHideTimerRef.current = setTimeout(() => {
      if (!isOverPanelRef.current) {
        setCapHoverPos(null);
        setCapHoverMaterialKey(null);
      }
      capHideTimerRef.current = null;
    }, 350);
  }, []);

  const [modelMaterials, setModelMaterials] = useState([]);

  // Clear UV Edits confirmation modal state
  const [showConfirmClearUv, setShowConfirmClearUv] = useState(false);

  // Model switch confirmation state
  const [pendingModelUrl, setPendingModelUrl] = useState(null);
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);

  useEffect(() => {
    if (activeTab === "edit" && modelUrl) {
      const singleModelUrl = getSingleModelUrl(modelUrl);
      if (singleModelUrl !== modelUrl) {
        setModelUrl(singleModelUrl);
      }
    }
  }, [activeTab, modelUrl, setModelUrl]);

  // Custom size logic
  const [baseDimensions, setBaseDimensions] = useState(null);
  const [customSizeInput, setCustomSizeInput] = useState({
    length: 180,
    width: 60,
    height: 160,
  });

  const getModelCenterY = () => {
    if (!baseDimensions) return 0;
    const currentHeight = appliedCustomSize?.height || baseDimensions.height;
    const maxDim =
      Math.max(
        baseDimensions.length,
        baseDimensions.height,
        baseDimensions.width,
      ) / 1000;
    const scale = 3.0 / maxDim;
    return ((currentHeight / 1000) * scale) / 2 + 0.3;
  };

  // Zoom state
  const [zoomPercent, setZoomPercent] = useState(60);
  const [showLegend, setShowLegend] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const activeSceneRef = useRef(null);
  const measureOverlayRef = useRef(null);

  useEffect(() => {
    if (baseDimensions && cameraRef.current && orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      const camera = cameraRef.current;

      const savedConfig =
        modelPositionsConfig && modelPositionsConfig[modelUrl];

      if (savedConfig) {
        const { target, azimuth, polar, distance } = savedConfig;
        controls.target.set(target[0], target[1], target[2]);

        const spherical = new THREE.Spherical(
          distance || 4 / 0.6,
          polar,
          azimuth,
        );
        spherical.makeSafe();
        const offsetVec = new THREE.Vector3().setFromSpherical(spherical);

        camera.position.copy(controls.target).add(offsetVec);
        camera.lookAt(controls.target);

        controls.setAzimuthalAngle(azimuth);
        controls.setPolarAngle(polar);

        const calculatedZoom = Math.round((4 / distance) * 100);
        setZoomPercent(calculatedZoom || 60);
      } else {
        setZoomPercent(60);
        const newDist = 4 / 0.6;
        const targetY = getModelCenterY();

        controls.target.set(0, targetY, 0);
        camera.position.set(0, targetY, newDist);
        camera.lookAt(0, targetY, 0);
        controls.setAzimuthalAngle(0);
        controls.setPolarAngle(Math.PI / 2);
      }
      controls.update();
    }
  }, [baseDimensions, modelUrl]);

  // Save scene states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSceneName, setSaveSceneName] = useState("");
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [pendingSceneObject, setPendingSceneObject] = useState(null);
  const [duplicateSceneIndex, setDuplicateSceneIndex] = useState(-1);

  const handleSaveScene = (forceOverwrite = false) => {
    const nameToSave =
      saveSceneName.trim() || `Scene ${new Date().toLocaleDateString()}`;
    const newScene = {
      id: "scene-" + Date.now(),
      name: nameToSave,
      createdAt: new Date().toISOString(),
      modelUrl,
      sceneBgColor: bgColor,
      sceneBgImage: bgImage,
      editorState: {
        textures: appliedTextures,
        colors: appliedColors,
        materials: appliedMaterials,
        customSize: appliedCustomSize,
        lastApplied: appliedLastApplied,
      },
      hdriPreset,
      envIntensity,
      ambLight,
      dirLight,
      shadowOpacity,
      customHdri,
    };

    try {
      const stored = localStorage.getItem("fisto_saved_scenes");
      const parsed = stored ? JSON.parse(stored) : [];

      const existingIndex = parsed.findIndex(
        (s) => s.name.trim().toLowerCase() === nameToSave.trim().toLowerCase()
      );

      if (existingIndex !== -1 && !forceOverwrite) {
        setPendingSceneObject(newScene);
        setDuplicateSceneIndex(existingIndex);
        setShowOverwriteConfirm(true);
        return;
      }

      if (existingIndex !== -1 && forceOverwrite) {
        // Keep original ID to overwrite in place
        newScene.id = parsed[existingIndex].id;
        parsed[existingIndex] = newScene;
      } else {
        parsed.push(newScene);
      }

      localStorage.setItem("fisto_saved_scenes", JSON.stringify(parsed));
      setSaveSceneName("");
      setShowSaveModal(false);
      setShowOverwriteConfirm(false);
      setPendingSceneObject(null);
      setDuplicateSceneIndex(-1);
      setActiveTab("gallery");
    } catch (err) {
      console.error("Error saving scene:", err);
    }
  };

  const handleZoom = (step) => {
    let newPct = zoomPercent + step;
    if (newPct < 50) newPct = 50;
    if (newPct > 150) newPct = 150;

    const controls = orbitControlsRef.current;
    const camera = cameraRef.current;
    if (controls && camera) {
      const newDist = 4 / (newPct / 100);
      const offset = new THREE.Vector3().subVectors(
        camera.position,
        controls.target,
      );
      offset.setLength(newDist);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      setZoomPercent(newPct);
    }
  };

  // Export Modal states and handlers
  const captureRef = useRef(null);
  const [activeScene, setActiveScene] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportGlbChecked, setExportGlbChecked] = useState(false);
  const [exportPngChecked, setExportPngChecked] = useState(true);
  const [exportJpgChecked, setExportJpgChecked] = useState(false);
  const [exportPdfChecked, setExportPdfChecked] = useState(false);

  const textureLibraryRaw = useMemo(() => getTextureLibrary(), []);

  const textureLibrary = useMemo(() => {
    const lib = [...textureLibraryRaw];
    if (modelUrl) {
      const url = modelUrl.toLowerCase();
      let firstCategory = null;

      if (
        url.includes("round") ||
        url.includes("food container") ||
        url.includes("oval") ||
        url.includes("jar") ||
        url.includes("tape")
      ) {
        firstCategory = "Floral";
      } else if (
        url.includes("bottle") ||
        url.includes("flask") ||
        url.includes("tumbler") ||
        url.includes("can") ||
        url.includes("cup")
      ) {
        firstCategory = "Metal";
      } else if (
        url.includes("biodegradable") ||
        url.includes("die cut") ||
        url.includes("cart") ||
        url.includes("box") ||
        url.includes("mailer")
      ) {
        firstCategory = "Paper";
      }

      if (firstCategory) {
        const idx = lib.findIndex((c) => c.category === firstCategory);
        if (idx !== -1) {
          const item = lib.splice(idx, 1)[0];
          lib.unshift(item);
        }
      }
    }
    return lib;
  }, [textureLibraryRaw, modelUrl]);

  const [activeTextureCategory, setActiveTextureCategory] = useState(
    textureLibrary[0]?.category || "Wood",
  );

  useEffect(() => {
    if (textureLibrary.length > 0) {
      setActiveTextureCategory(textureLibrary[0].category);
    }
  }, [textureLibrary]);

  const [isTextureDropdownOpen, setIsTextureDropdownOpen] = useState(false);

  const [isModelLoading, setIsModelLoading] = useState(false);
  const textureTimeoutRef = useRef(null);
  const textureFallbackTimeoutRef = useRef(null);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (textureTimeoutRef.current) clearTimeout(textureTimeoutRef.current);
      if (textureFallbackTimeoutRef.current)
        clearTimeout(textureFallbackTimeoutRef.current);
    };
  }, []);

  // Fade and slide in entry animations for editor UI panels
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".editor-left-container",
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      );
      gsap.fromTo(
        ".editor-right-actions",
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.1 },
      );
      gsap.fromTo(
        ".editor-right-tools",
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.2 },
      );
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (modelUrl) {
      setIsModelLoading(true);
    }
  }, [modelUrl]);

  const getModelName = () => {
    if (!modelUrl) return "model";
    const base = modelUrl.split("/").pop() || "model";
    let name = base.substring(0, base.lastIndexOf(".")) || base;
    name = name.replace(/-[A-Za-z0-9_]{8}$/, ""); // Strip Vite hashes
    return decodeURIComponent(name);
  };

  const handleExport = () => {
    if (
      !exportGlbChecked &&
      !exportPngChecked &&
      !exportJpgChecked &&
      !exportPdfChecked
    ) {
      alert("Please select at least one option to export.");
      return;
    }

    setIsExporting(true);

    if (exportGlbChecked) {
      if (activeScene) {
        const exporter = new GLTFExporter();
        exporter.parse(
          activeScene,
          (glb) => {
            const blob = new Blob([glb], { type: "model/gltf-binary" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${getModelName()}.glb`;
            a.click();
            URL.revokeObjectURL(url);
            if (!exportPngChecked && !exportJpgChecked && !exportPdfChecked) {
              setIsExporting(false);
              setShowExportModal(false);
            }
          },
          (err) => {
            console.error("GLTFExporter error:", err);
            setIsExporting(false);
          },
          { binary: true },
        );
      } else {
        alert("3D Model is still loading. Please wait.");
        setIsExporting(false);
      }
    }

    if (exportPngChecked || exportJpgChecked || exportPdfChecked) {
      setTimeout(() => {
        if (captureRef.current) {
          captureRef.current.capture({
            png: exportPngChecked,
            jpg: exportJpgChecked,
            pdf: exportPdfChecked,
          });
        } else {
          alert("Could not capture 3D Canvas screen.");
        }
        setIsExporting(false);
        setShowExportModal(false);
      }, 100);
    } else if (!exportGlbChecked) {
      setShowExportModal(false);
    }
  };

  // Initialize custom size inputs when base dimensions load
  const handleBaseDimensionsLoaded = useCallback((dims) => {
    setBaseDimensions(dims);
    setCustomSizeInput(dims); // default inputs to base size
  }, []);

  const handleMaterialsLoaded = useCallback((mats) => {
    setModelMaterials(mats);
    setIsModelLoading(false);
  }, []);

  const handleTextureLoadStart = useCallback(() => {
    setIsModelLoading(true);
  }, []);

  const handleTextureLoadEnd = useCallback(() => {
    setIsModelLoading(false);
  }, []);

  const handleSceneLoaded = useCallback((scene) => {
    activeSceneRef.current = scene;
    setActiveScene(scene);
  }, []);

  const [modelMinY, setModelMinY] = useState(-0.005);

  // Receives the correctly-scaled floor Y from AutoSizedModelWithDimensions
  const handleFloorYLoaded = useCallback((floorY) => {
    setModelMinY(floorY);
  }, []);



  // Tools state
  const [zoom, setZoom] = useState(1);
  const [toolMode, setToolMode] = useState("cursor");
  const [shadowEnabled, setShadowEnabled] = useState(true);

  // Color brush / paint mode state
  const [colorBrushActive, setColorBrushActive] = useState(false);
  const [brushColor, setBrushColor] = useState("__none__");
  const [flashColorPicker, setFlashColorPicker] = useState(false);
  const [pickerMessage, setPickerMessage] = useState("");

  // Helper to load cap offsets from localStorage
  const getInitialCapOffsets = () => {
    const base = {};
    Object.keys(BOTTLE_CAP_CONFIGS).forEach((modelKey) => {
      base[modelKey] = { ...BOTTLE_CAP_CONFIGS[modelKey] };
      // Load any individual cap offsets saved in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const localKey = localStorage.key(i);
        if (localKey && localKey.startsWith(`cap_offset_${modelKey}_`)) {
          const capFile = localKey.replace(`cap_offset_${modelKey}_`, "");
          try {
            const parsed = JSON.parse(localStorage.getItem(localKey));
            base[modelKey][capFile] = {
              posX: parsed.posX ?? 0,
              posY: parsed.posY ?? 0,
              posZ: parsed.posZ ?? 0,
              scaleX: parsed.scaleX ?? 1,
              scaleY: parsed.scaleY ?? 1,
              scaleZ: parsed.scaleZ ?? 1,
            };
          } catch (e) {
            console.error(e);
          }
        }
      }
    });
    return base;
  };

  const [wireframe, setWireframe] = useState(false);
  const [isScaledUp, setIsScaledUp] = useState(false);
  // Dev cap sizing and positioning offsets state (grouped by modelId)
  const [capModelOffsets, setCapModelOffsets] = useState(getInitialCapOffsets);

  const currentModelKey = useMemo(() => {
    if (!modelUrl) return "default";
    const model = MODELS.find((m) => m.modelUrl === modelUrl);
    if (model) return model.id;
    // For layout models, find the original source path from layoutModelsGlob
    const cleanUrl = modelUrl.split("?")[0];
    const layoutPath = Object.keys(layoutModelsGlob).find(p => layoutModelsGlob[p] === cleanUrl || layoutModelsGlob[p] === modelUrl);
    if (layoutPath) {
      const baseName = layoutPath.substring(layoutPath.lastIndexOf('/') + 1).replace(/\.glb$/, '');
      return `layout_${baseName}`;
    }
    const urlParts = cleanUrl.split("/");
    const fileName = decodeURIComponent(urlParts.pop() || "layout");
    return `layout_${fileName.replace(/\.glb$/i, "")}`;
  }, [modelUrl]);

  const currentCapOffsets = useMemo(() => {
    const modelConfig = capModelOffsets[currentModelKey] || {};
    const capFile = getCleanCapFileName(selectedCapUrl);
    return (
      modelConfig[capFile] ||
      modelConfig["default"] || {
        posX: 0,
        posY: 0,
        posZ: 0,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
      }
    );
  }, [capModelOffsets, currentModelKey, selectedCapUrl]);

  const updateCapOffset = (field, val) => {
    const capFile = getCleanCapFileName(selectedCapUrl);
    setCapModelOffsets((prev) => {
      const modelConfig = prev[currentModelKey] || {};
      const current = modelConfig[capFile] ||
        modelConfig["default"] || {
        posX: 0,
        posY: 0,
        posZ: 0,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
      };
      return {
        ...prev,
        [currentModelKey]: {
          ...modelConfig,
          [capFile]: {
            ...current,
            [field]: val,
          },
        },
      };
    });
  };

  const updateCapUniformScale = (val) => {
    const capFile = getCleanCapFileName(selectedCapUrl);
    setCapModelOffsets((prev) => {
      const modelConfig = prev[currentModelKey] || {};
      const current = modelConfig[capFile] ||
        modelConfig["default"] || {
        posX: 0,
        posY: 0,
        posZ: 0,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
      };
      return {
        ...prev,
        [currentModelKey]: {
          ...modelConfig,
          [capFile]: {
            ...current,
            scaleX: val,
            scaleY: val,
            scaleZ: val,
          },
        },
      };
    });
  };

  const saveCapConfig = () => {
    const capFile = getCleanCapFileName(selectedCapUrl);
    const localKey = `cap_offset_${currentModelKey}_${capFile}`;
    localStorage.setItem(localKey, JSON.stringify(currentCapOffsets));
    setPickerMessage(`Saved cap config for ${capFile}`);
    setTimeout(() => setPickerMessage(""), 2500);
  };

  // Disable color brush when switching away from the edit tab
  useEffect(() => {
    if (activeTab !== "edit") {
      setColorBrushActive(false);
      setBrushColor("__none__");
    }
  }, [activeTab]);

  // Sync inputs when applied size changes via undo/redo
  useEffect(() => {
    if (appliedCustomSize) {
      setCustomSizeInput(appliedCustomSize);
    }
  }, [appliedCustomSize]);

  // Keyboard shortcuts for EditorScreen1
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "SELECT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      const isModKey = e.metaKey || e.ctrlKey;

      // Undo: Cmd/Ctrl + Z
      if (isModKey && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        if (canUndo && onUndo) onUndo();
      }

      // Redo: Cmd/Ctrl + Y or Cmd/Ctrl + Shift + Z
      if (
        (isModKey && e.key.toLowerCase() === "y") ||
        (isModKey && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        if (canRedo && onRedo) onRedo();
      }

      // V or S -> select/cursor tool
      if (
        !isModKey &&
        (e.key.toLowerCase() === "v" || e.key.toLowerCase() === "s")
      ) {
        e.preventDefault();
        handleSetToolMode("cursor");
      }

      // H -> hand/pan tool
      if (!isModKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        handleSetToolMode("hand");
      }

      // R -> reset view
      if (!isModKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        if (orbitControlsRef.current && cameraRef.current) {
          orbitControlsRef.current.target.set(0, getModelCenterY(), 0);
          orbitControlsRef.current.update();
        }
      }

      // E -> open export modal
      if (!isModKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setShowExportModal(true);
      }

      // Escape -> close export modal, reset tool settings
      if (e.key === "Escape") {
        e.preventDefault();
        setShowExportModal(false);
        setShowSwitchDialog(false);
        setShowCustomSize(false);
        setSelectedMaterial("");
        setActiveTab("edit");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canUndo, canRedo, onUndo, onRedo, activeTab, setActiveTab]);

  const handleCameraView = (view) => {
    if (!orbitControlsRef.current) return;
    const ctrl = orbitControlsRef.current;
    switch (view) {
      case "front":
        ctrl.setAzimuthalAngle(0);
        ctrl.setPolarAngle(Math.PI / 2);
        break;
      case "top":
        ctrl.setAzimuthalAngle(0);
        ctrl.setPolarAngle(0);
        break;
      case "front-right":
        ctrl.setAzimuthalAngle(Math.PI / 4);
        ctrl.setPolarAngle(Math.PI / 3);
        break;
    }
  };

  const handleSetToolMode = (mode) => setToolMode(mode);

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* 3D Canvas Background */}
      <div
        id="three-canvas-container"
        className="absolute inset-0 z-0 transition-colors duration-300"
        style={{
          cursor: colorBrushActive
            ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='5' fill='${encodeURIComponent(brushColor)}' stroke='white' stroke-width='1'/%3E%3Cpath d='M12 2v4M12 18v4M2 12h4M18 12h4' stroke='%23333' stroke-width='1' stroke-linecap='round'/%3E%3C/svg%3E") 16 16, crosshair`
            : toolMode === "hand"
              ? "grab"
              : "default",
          backgroundColor: bgColor,
        }}
      >
        <R3FCanvas
          camera={{ position: [0, 0.5, 6.667], fov: 45 }}
          dpr={[1, Math.min(2, window.devicePixelRatio || 2)]}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
          shadows={shadowEnabled ? { type: THREE.PCFSoftShadowMap } : false}
          frameloop="demand"
          performance={{ min: 0.5 }}
          onPointerMissed={() => setSelectedMaterial(null)}
          onCreated={({ gl, camera }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.9;
            gl.setClearColor(
              new THREE.Color(bgColor === "transparent" ? "#ffffff" : bgColor),
              bgColor === "transparent" ? 0 : 1,
            );
            if (shadowEnabled) {
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
            }
            cameraRef.current = camera;
          }}
        >
          {!bgImage && bgColor !== "transparent" && (
            <color attach="background" args={[bgColor]} />
          )}
          {bgImage && (
            <Suspense fallback={null}>
              <BackgroundImage url={bgImage} />
            </Suspense>
          )}
          <LightingAndShadows
            shadowEnabled={shadowEnabled}
            activeScene={activeScene}
            ambLight={ambLight}
            dirLight={dirLight}
          />
          {/* Shadow catcher plane */}
          {shadowEnabled && (
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, modelMinY, 0]}
              receiveShadow
            >
              <planeGeometry args={[20, 20]} />
              <shadowMaterial opacity={shadowOpacity} />
            </mesh>
          )}
          {customHdri ? (
            <CustomHdriEnvironment url={customHdri} intensity={envIntensity} />
          ) : (
            <SafeEnvironment
              preset={hdriPreset}
              environmentIntensity={envIntensity}
            />
          )}
          <OrbitControls
            ref={orbitControlsRef}
            makeDefault
            target={[0, getModelCenterY(), 0]}
            enableRotate={toolMode === "cursor"}
            enablePan={toolMode === "hand" && !colorBrushActive}
            enableZoom={true}
            screenSpacePanning={true}
            minDistance={4 / 1.5}
            maxDistance={4 / 0.5}
            onEnd={(e) => {
              const controls = e.target;
              if (controls && controls.object) {
                const dist = controls.object.position.distanceTo(
                  controls.target,
                );
                const pct = Math.round((4 / dist) * 100);
                setZoomPercent(Math.min(150, Math.max(50, pct)));
              }
            }}
            rotateSpeed={1}
            panSpeed={1.2}
            zoomSpeed={0.8}
            mouseButtons={{
              LEFT: toolMode === "hand" ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.ROTATE,
            }}
            touches={{
              ONE: toolMode === "hand" ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN,
            }}
          />
          <Suspense fallback={null}>
            {modelUrl && (
              <AutoSizedModelWithDimensions
                modelUrl={modelUrl}
                appliedTextures={appliedTextures}
                appliedColors={appliedColors}
                appliedMaterials={appliedMaterials}
                appliedLastApplied={appliedLastApplied}
                appliedMetallic={appliedMetallic}
                appliedRoughness={appliedRoughness}
                shadowEnabled={shadowEnabled}
                customSize={appliedCustomSize}
                selectedMaterialId={selectedMaterial}
                onMaterialsLoaded={handleMaterialsLoaded}
                onBaseDimensionsLoaded={handleBaseDimensionsLoaded}
                onSceneLoaded={handleSceneLoaded}
                onFloorYLoaded={handleFloorYLoaded}
                onTextureLoadStart={handleTextureLoadStart}
                onTextureLoadEnd={handleTextureLoadEnd}
                showMeasurements={showMeasurements}
                selectedCapUrl={selectedCapUrl}
                isLidOpen={isLidOpen}
                onCapHover={isBottleModel ? handleCapHover : undefined}
                onCapLeave={isBottleModel ? handleCapLeave : undefined}
                showDefaultLabels={showDefaultLabels}
                colorBrushActive={colorBrushActive}
                brushColor={brushColor}
                onBrushApply={(matId, color) => {
                  if (onApplyColor) onApplyColor(matId, color);
                }}
                currentCapOffsets={currentCapOffsets}
              />
            )}
          </Suspense>
          {showMeasurements && modelUrl && (
            <MeasurementTracker
              activeSceneRef={activeSceneRef}
              measureOverlayRef={measureOverlayRef}
              baseDimensions={baseDimensions}
            />
          )}
          <ScreenshotHelper
            ref={captureRef}
            filename={getModelName()}
            bgColor={bgColor}
            bgImage={bgImage}
          />
          <GizmoHelper
            alignment="top-left"
            margin={[activeTab ? 560 : 220, 80]}
          >
            <GizmoViewport
              axisColors={["#ef4444", "#22c55e", "#3b82f6"]}
              labelColor="white"
              scale={40}
            />
          </GizmoHelper>
        </R3FCanvas>

        {/* Lid Open/Close Button - Top Center */}
        {modelUrl &&
          !isLayoutModel &&
          (modelUrl.toLowerCase().includes("food container") ||
            modelUrl.toLowerCase().includes("food%20container") ||
            modelUrl.toLowerCase().includes("oval") ||
            modelUrl.toLowerCase().includes("round") ||
            modelUrl.toLowerCase().includes("tamper")) && (
            <div className="absolute top-[8vh] left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto flex items-center justify-center">
              <button
                onClick={() => setIsLidOpen(!isLidOpen)}
                className="flex items-center gap-2 bg-transparent text-gray-700 font-medium text-[15px] hover:text-[#c05520] transition-colors border-none cursor-pointer"
              >
                {isLidOpen ? (
                  <>
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
                        d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
                      />
                    </svg>
                    <span>Close Lid</span>
                  </>
                ) : (
                  <>
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
                        d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                      />
                    </svg>
                    <span>Open Lid</span>
                  </>
                )}
              </button>
            </div>
          )}

        {/* Measurement SVG Overlay */}
        {showMeasurements && modelUrl && (
          <svg
            ref={measureOverlayRef}
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 3 }}
          >
            {/* â”€â”€ Top Length â”€â”€ */}
            <line
              data-m="tl-el"
              stroke="#b84c00"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
            <line
              data-m="tl-er"
              stroke="#b84c00"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
            <line
              data-m="tl"
              stroke="#b84c00"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            <rect data-m-bg="tl" rx="12" fill="#c2520a" />
            <text
              data-m-t="tl"
              fill="white"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="auto"
            />

            {/* â”€â”€ Top Breadth â”€â”€ */}
            <line
              data-m="tb"
              stroke="#b84c00"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            <rect data-m-bg="tb" rx="12" fill="#c2520a" />
            <text
              data-m-t="tb"
              fill="white"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="auto"
            />

            {/* â”€â”€ Height â”€â”€ */}
            <line
              data-m="h-eb"
              stroke="#b84c00"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
            <line
              data-m="h-et"
              stroke="#b84c00"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
            <line
              data-m="h"
              stroke="#b84c00"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            <line data-m="h-tb" stroke="#b84c00" strokeWidth="2" />
            <line data-m="h-tt" stroke="#b84c00" strokeWidth="2" />
            <rect data-m-bg="h" rx="12" fill="#c2520a" />
            <text
              data-m-t="h"
              fill="white"
              fontSize="11"
              fontWeight="700"
              textAnchor="end"
              dominantBaseline="middle"
            />

            {/* â”€â”€ Base Length â”€â”€ */}
            <line
              data-m="bl-el"
              stroke="#b84c00"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
            <line
              data-m="bl-er"
              stroke="#b84c00"
              strokeWidth="1"
              strokeDasharray="4,3"
            />
            <line
              data-m="bl"
              stroke="#b84c00"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            <rect data-m-bg="bl" rx="12" fill="#c2520a" />
            <text
              data-m-t="bl"
              fill="white"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              dominantBaseline="hanging"
            />

            {/* â”€â”€ Base Breadth â”€â”€ */}
            <line
              data-m="bb"
              stroke="#b84c00"
              strokeWidth="1.5"
              strokeDasharray="4,3"
            />
            <rect data-m-bg="bb" rx="12" fill="#c2520a" />
            <text
              data-m-t="bb"
              fill="white"
              fontSize="11"
              fontWeight="700"
              textAnchor="start"
              dominantBaseline="hanging"
            />
          </svg>
        )}

        {/* Loading overlay sits on top of canvas */}
        {modelUrl && <ModelLoadingOverlay isLoading={isModelLoading} />}

        {/* Clear UV Edits Button - Bottom Right */}
        {modelUrl &&
          uvEditsApplied &&
          (Object.values(appliedTextures || {}).some(Boolean) ||
            Object.values(appliedColors || {}).some((v) => v && v !== "none") ||
            Object.values(appliedMaterials || {}).some(Boolean)) && (
            <div className="absolute bottom-[2vh] right-[2vh] z-10 pointer-events-auto">
              <button
                onClick={() => {
                  setShowConfirmClearUv(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#c0561f] hover:bg-[#fff] text-[#ffff] hover:text-[#c0561f] font-bold text-[13px] border border-[#c0561f] rounded-xl transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
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
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
                <span>Clear UV Edits</span>
              </button>
            </div>
          )}
      </div>

      {/* Floating UI Elements */}

      {/* Cap Hover Color Panel */}
      {isBottleModel && capHoverPos && (
        <div
          className="fixed z-50 pointer-events-auto"
          style={{ left: capHoverPos.x + 16, top: capHoverPos.y - 16 }}
          onMouseDown={() => {
            // Keep panel alive during click â€” cancel any pending hide
            if (capHideTimerRef.current) {
              clearTimeout(capHideTimerRef.current);
              capHideTimerRef.current = null;
            }
            isOverPanelRef.current = true;
          }}
          onMouseEnter={() => {
            isOverPanelRef.current = true;
            if (capHideTimerRef.current) {
              clearTimeout(capHideTimerRef.current);
              capHideTimerRef.current = null;
            }
          }}
          onMouseLeave={() => {
            isOverPanelRef.current = false;
            // Don't close if they are actively using the OS color picker
            if (
              document.activeElement &&
              document.activeElement.type === "color"
            ) {
              return;
            }
            capHideTimerRef.current = setTimeout(() => {
              setCapHoverPos(null);
              setCapHoverMaterialKey(null);
              capHideTimerRef.current = null;
            }, 200);
          }}
        >
          <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-1 ring-gray-100 p-3 flex flex-col gap-2.5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">Cap Color</span>
              {appliedColors?.[capHoverMaterialKey] && (
                <button
                  onClick={() =>
                    onApplyColor && onApplyColor(capHoverMaterialKey, null)
                  }
                  className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer flex items-center gap-0.5 transition-colors font-semibold"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-2.5 h-2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Reset
                </button>
              )}
            </div>

            {/* 5 color swatches + custom picker */}
            <div className="flex items-center gap-2">
              {/* Transparent */}
              {(() => {
                const isSelected =
                  appliedColors?.[capHoverMaterialKey] === "transparent";
                return (
                  <button
                    onClick={() =>
                      onApplyColor &&
                      onApplyColor(capHoverMaterialKey, "transparent")
                    }
                    className={`w-7 h-7 rounded-full border-2 flex-shrink-0 transition-transform hover:scale-110 cursor-pointer ${isSelected ? "border-[#c05520] shadow-md scale-110" : "border-gray-200"}`}
                    style={{
                      background:
                        "conic-gradient(#cbd5e1 25%, white 0 50%, #cbd5e1 0 75%, white 0)",
                      backgroundSize: "8px 8px",
                    }}
                    title="Transparent"
                  />
                );
              })()}
              {/* 4 preset swatches */}
              {["#e6e2db", "#1a1a1a", "#2c3e50", "#c05520"].map((color) => {
                const isSelected =
                  appliedColors?.[capHoverMaterialKey] === color;
                return (
                  <button
                    key={color}
                    onClick={() =>
                      onApplyColor && onApplyColor(capHoverMaterialKey, color)
                    }
                    className={`w-7 h-7 rounded-full border-2 flex-shrink-0 transition-transform hover:scale-110 cursor-pointer ${isSelected ? "border-[#c05520] shadow-md scale-110" : "border-gray-200"}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                );
              })}
              {/* Custom color picker â€” label wraps a zero-size input so the native picker opens reliably */}
              <label
                className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 hover:border-[#c05520] transition-colors flex-shrink-0 cursor-pointer flex items-center justify-center relative"
                title="Custom color"
              >
                <input
                  type="color"
                  value={
                    appliedColors?.[capHoverMaterialKey] &&
                      appliedColors[capHoverMaterialKey] !== "transparent"
                      ? appliedColors[capHoverMaterialKey]
                      : "#ffffff"
                  }
                  onChange={(e) =>
                    onApplyColor &&
                    onApplyColor(capHoverMaterialKey, e.target.value)
                  }
                  onBlur={() => {
                    // Close panel if mouse isn't over it when picker closes
                    if (!isOverPanelRef.current) {
                      setCapHoverPos(null);
                      setCapHoverMaterialKey(null);
                    }
                  }}
                  className="absolute opacity-0 pointer-events-none w-0 h-0"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-3 h-3 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Clear UV Edits Confirmation Modal */}
      {showConfirmClearUv && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-[#c0561f] flex items-center justify-center shrink-0">
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
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 m-0">Clear UV Edits?</h3>
                <p className="text-xs text-gray-500 m-0 mt-0.5">
                  Are you sure you want to clear all texture and color edits from this model? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setShowConfirmClearUv(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 border-none cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmClearUv(false);
                  if (onClearUvEdits) {
                    onClearUvEdits();
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#c0561f] hover:bg-[#a34718] border-none cursor-pointer transition-colors shadow-sm"
              >
                Clear Edits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="absolute top-6 left-6 right-6 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => navigate("/modelsMockup")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-gray-100/80 shadow-sm text-gray-700 hover:text-[#c05520] font-bold text-xs cursor-pointer transition-all"
            title="Back to Mockup Gallery"
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
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            <span>Back to Mockups</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-gray-100/80 shadow-sm">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 disabled:opacity-40 border-none bg-transparent cursor-pointer transition-colors"
            title="Undo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 disabled:opacity-40 border-none bg-transparent cursor-pointer transition-colors"
            title="Redo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
            </svg>
          </button>
          <div className="w-[1px] h-4 bg-gray-200 mx-1" />
          <button
            onClick={onResetAll}
            className="px-3 py-1 rounded-lg text-xs font-bold text-gray-600 hover:text-red-500 hover:bg-red-50 border-none bg-transparent cursor-pointer transition-colors"
          >
            Reset All
          </button>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Show Default Labels toggle â€” compact for top bar */}
          {!(
            (appliedTextures && Object.keys(appliedTextures).length > 0) ||
            (appliedColors && Object.keys(appliedColors).length > 0) ||
            (appliedMaterials && Object.keys(appliedMaterials).length > 0)
          ) && (
            <div className="bg-white/90 backdrop-blur-md rounded-xl px-3 py-1.5 border border-gray-100/80 shadow-sm flex items-center gap-2">
              <span
                className="text-xs font-semibold text-gray-600 select-none cursor-pointer whitespace-nowrap"
                onClick={() => setShowDefaultLabels(!showDefaultLabels)}
              >
                Labels
              </span>
              <div
                onClick={() => setShowDefaultLabels(!showDefaultLabels)}
                className={`w-9 h-5 flex shrink-0 items-center rounded-full p-0.5 cursor-pointer transition-colors ${showDefaultLabels ? "bg-[#c05520]" : "bg-gray-300"}`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${showDefaultLabels ? "translate-x-4" : ""}`}
                />
              </div>
            </div>
          )}
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-gray-100/80 shadow-sm text-gray-800 hover:text-[#c05520] font-bold text-xs cursor-pointer transition-all"
          >
            Save Scene
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 rounded-xl bg-[#c05520] hover:bg-[#a04619] border-none shadow-sm text-white font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Popups Bottom Drawer Container (Centered above bottom navigation bar) */}
      <div className="editor-popups-container fixed bottom-24 left-1/2 -translate-x-1/2 z-30 flex pointer-events-none max-w-[95vw]">
        <div
          className={`transition-all duration-300 ease-out overflow-hidden shrink-0 pointer-events-auto bg-white rounded-[24px] shadow-[0_16px_40px_rgba(0,0,0,0.12)] border border-gray-150 flex flex-col ${
            activeTab && activeTab !== "uv_editor"
              ? isScaledUp
                ? "w-[640px] h-[400px] p-5 opacity-100 translate-y-0 scale-100"
                : activeTab === "edit"
                  ? "w-[380px] h-[370px] p-5 opacity-100 translate-y-0 scale-100"
                  : "w-[380px] h-[340px] p-5 opacity-100 translate-y-0 scale-100"
              : "w-[380px] h-[340px] p-0 opacity-0 translate-y-8 scale-95 pointer-events-none border-none shadow-none"
          }`}
        >
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 min-h-0">
            {activeTab === "models" && (
              <ModelsPopup
                onSelectModel={(url) => {
                  if (url === modelUrl) return;
                  if (onResetAll) onResetAll();
                  setIsLidOpen(false);
                  if (onSelectCap) onSelectCap("none");
                  if (orbitControlsRef.current) {
                    orbitControlsRef.current.reset();
                    orbitControlsRef.current.setAzimuthalAngle(0);
                    orbitControlsRef.current.setPolarAngle(Math.PI / 2);
                    orbitControlsRef.current.target.set(0, getModelCenterY(), 0);
                    orbitControlsRef.current.update();
                  }
                  setModelUrl(url);
                }}
                currentModelUrl={modelUrl}
                isScaledUp={isScaledUp}
                onToggleScale={() => setIsScaledUp((s) => !s)}
                onClose={() => setActiveTab(null)}
              />
            )}
            {activeTab === "layout" && (
              <LayoutPopup
                currentModelUrl={modelUrl}
                selectedCapUrl={selectedCapUrl}
                currentCapOffsets={currentCapOffsets}
                updateCapOffset={updateCapOffset}
                updateCapUniformScale={updateCapUniformScale}
                onSaveCapConfig={saveCapConfig}
                isLayoutSelected={!MODELS.some((m) => m.modelUrl === modelUrl)}
                onSelectLayout={(url) => {
                  if (url === modelUrl) {
                    const singleModelUrl = getSingleModelUrl(modelUrl);
                    setModelUrl(singleModelUrl);
                    return;
                  }
                  setModelUrl(url);
                }}
                isScaledUp={isScaledUp}
                onToggleScale={() => setIsScaledUp((s) => !s)}
                onClose={() => setActiveTab(null)}
              />
            )}
            {activeTab === "scene" && (
              <ScenePopup
                bgColor={bgColor}
                setBgColor={setBgColor}
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
                bgImage={bgImage}
                setBgImage={setBgImage}
                isScaledUp={isScaledUp}
                onToggleScale={() => setIsScaledUp((s) => !s)}
                onClose={() => setActiveTab(null)}
              />
            )}
            {activeTab === "gallery" && (
              <GalleryPopup
                onLoadScene={(scene) => {
                  onLoadScene(scene);
                  setActiveTab(null);
                }}
                isScaledUp={isScaledUp}
                onToggleScale={() => setIsScaledUp((s) => !s)}
                onClose={() => setActiveTab(null)}
              />
            )}

            {/* Features (Edit) Popup Content wrapped inside bottom-sheet */}
            {activeTab === "edit" && !showCustomSize && (
              <div className="flex flex-col gap-4 flex-1 h-full">
                {/* Title & Close header */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#c05520]/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#c05520" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0 3.94 4.092l3.4-1.7a3 3 0 0 0 1.34-1.34l1.7-3.4a3 3 0 0 0-.843-3.666l-1.025-.82a3 3 0 0 0-3.666-.843l-3.4 1.7a3 3 0 0 0-1.34 1.34l-1.7 3.4Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold text-gray-900">Features</span>
                  </div>
                  <button
                    onClick={() => setActiveTab(null)}
                    className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 border-none cursor-pointer transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 pb-6 flex flex-col gap-4">
                  {/* Size block */}
                  <div className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-100 bg-gray-50/70">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0v1.5m0-1.5v-1.5m15 1.5v1.5m0-1.5v-1.5m-12 1.5v-1.5m3 1.5v-1.5m3 1.5v-1.5m3 1.5v-1.5" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18h12a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3Z" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-xs">Size</span>
                        <span className="text-[10px] font-medium text-gray-500">
                          {baseDimensions
                            ? `${baseDimensions.length} x ${baseDimensions.width} x ${baseDimensions.height} mm`
                            : "Loading..."}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Custom features button */}
                  <button
                    onClick={() => onProceed(selectedMaterial)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-[#c05520] bg-orange-50/20 hover:bg-orange-50/50 transition-colors cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6.5 h-6.5 rounded-lg bg-white shadow-sm flex items-center justify-center border border-orange-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-[#c05520]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                      </div>
                      <span className="font-bold text-[#c05520] text-xs">
                        Custom Features
                      </span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-[#c05520] animate-bounce-right-loop">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>

                  {/* Pick & Paint */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-700">Pick &amp; Paint</label>
                    <div className="flex items-center gap-2 justify-start">
                      <button
                        onClick={() => {
                          if (onApplyColor) onApplyColor("all", null);
                          setBrushColor("__none__");
                          setColorBrushActive(false);
                        }}
                        title="Remove applied colors"
                        className="w-7 h-7 rounded-lg border-2 border-red-200 bg-red-50/50 cursor-pointer flex items-center justify-center transition-all hover:scale-105"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#ef4444" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>

                      <button
                        onClick={() => {
                          setBrushColor("transparent");
                          setColorBrushActive(true);
                        }}
                        className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-105 cursor-pointer ${colorBrushActive && brushColor === "transparent" ? "border-[#c05520] shadow-sm" : "border-gray-200"}`}
                        style={{
                          background: "conic-gradient(#cbd5e1 25%, white 0 50%, #cbd5e1 0 75%, white 0)",
                          backgroundSize: "6px 6px",
                        }}
                        title="Paint transparent"
                      />

                      <div
                        className={`relative w-7 h-7 rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${colorBrushActive && brushColor !== "transparent" && brushColor !== "__none__" ? "border-[#c05520] shadow-sm" : "border-gray-200"}`}
                        style={{ background: brushColor === "__none__" ? "#f3f4f6" : brushColor }}
                        title="Pick custom color"
                      >
                        <input
                          type="color"
                          value={brushColor === "__none__" ? "#3b82f6" : brushColor}
                          onChange={(e) => {
                            setBrushColor(e.target.value);
                            setColorBrushActive(true);
                          }}
                          className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 opacity-0 cursor-pointer z-10"
                        />
                        {brushColor === "__none__" && (
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-pink-400 to-orange-400 opacity-80" />
                        )}
                      </div>

                      <button
                        onClick={() => {
                          if (!colorBrushActive && brushColor === "__none__") {
                            setPickerMessage("Pick a color first!");
                            setFlashColorPicker(true);
                            setTimeout(() => { setPickerMessage(""); setFlashColorPicker(false); }, 3000);
                            return;
                          }
                          setColorBrushActive((v) => !v);
                          setPickerMessage("");
                        }}
                        className={`flex items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${colorBrushActive ? "bg-[#c05520] text-white border-transparent" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122A3 3 0 0012 21M9.53 16.122L12 11M9.53 16.122l1.688-1.688m.782 5.09a3 3 0 004.09-3.94l.82-1.025m-4.91 4.965l-.82 1.025M12 11l5-5" />
                        </svg>
                        {colorBrushActive ? "Brush On" : "Pick Color"}
                      </button>
                    </div>
                    {pickerMessage && <span className="text-[10px] text-red-500 font-bold">{pickerMessage}</span>}
                  </div>

                  {/* Metallic & Roughness sliders */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                    <DebouncedSlider
                      label="Metallic"
                      value={appliedMetallic?.[selectedMaterial && selectedMaterial !== "none" ? selectedMaterial : "all"] ?? 0.1}
                      onChange={(val) => onApplyMetallic && onApplyMetallic(selectedMaterial, val)}
                    />
                    <DebouncedSlider
                      label="Roughness"
                      value={appliedRoughness?.[selectedMaterial && selectedMaterial !== "none" ? selectedMaterial : "all"] ?? 0.5}
                      onChange={(val) => onApplyRoughness && onApplyRoughness(selectedMaterial, val)}
                    />
                  </div>

                  {/* Texture library */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-700">Textures</span>
                        <div className="relative">
                          <button
                            onClick={() => setIsTextureDropdownOpen(!isTextureDropdownOpen)}
                            className="p-1 rounded bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 cursor-pointer flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                          </button>
                          {isTextureDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setIsTextureDropdownOpen(false)} />
                              <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto py-1">
                                {textureLibrary.map((category) => (
                                  <button
                                    key={category.category}
                                    onClick={() => {
                                      setActiveTextureCategory(category.category);
                                      setIsTextureDropdownOpen(false);
                                    }}
                                    className={`w-full px-3 py-1.5 text-left text-[11px] font-semibold hover:bg-gray-50 transition-colors cursor-pointer ${activeTextureCategory === category.category ? "text-[#c05520] bg-orange-50/50" : "text-gray-700"}`}
                                  >
                                    {category.category}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      {!!(appliedMaterials?.[selectedMaterial || "all"] || appliedMaterials?.["all"]) && (
                        <button
                          onClick={() => onApplyMaterial && onApplyMaterial(selectedMaterial, null)}
                          className="text-[10px] text-gray-500 hover:text-red-600 transition-colors cursor-pointer font-bold"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-3 max-h-[160px] overflow-y-auto pr-1">
                      {textureLibrary
                        .find((c) => c.category === activeTextureCategory)
                        ?.textures.map((texture) => (
                          <button
                            key={texture.id}
                            title={texture.name}
                            disabled={isModelLoading}
                            onClick={() => {
                              if (isModelLoading || !onApplyMaterial) return;
                              setIsModelLoading(true);
                              setTimeout(() => {
                                onApplyMaterial(selectedMaterial, texture);
                                setTimeout(() => setIsModelLoading(false), 800);
                              }, 50);
                            }}
                            className={`relative rounded-lg border-2 overflow-hidden aspect-square flex items-center justify-center transition-all ${appliedMaterials?.[selectedMaterial || "all"]?.id === texture.id ? "border-[#c05520]" : "border-transparent"}`}
                          >
                            {texture.preview ? (
                              <img src={texture.preview} alt={texture.name} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <div className="text-[8px] text-gray-400 p-0.5">{texture.name}</div>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


        {activeTab === "scene" && (
          <HdriLoadingOverlay isModelLoading={isModelLoading} />
        )}
      </div>


      {/* Right Floating Tools Pill â€” repositioned below top header */}
      <div className="editor-right-tools absolute right-[1.5vw] top-24 z-10 bg-white rounded-full p-2 shadow-lg flex flex-col gap-[0.6vw]">
        <Tooltip1 label="Select" side="left">
          <button
            onClick={() => handleSetToolMode("cursor")}
            className={`w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${toolMode === "cursor"
              ? "bg-gray-900 hover:bg-gray-700"
              : "bg-transparent hover:bg-gray-100"
              }`}
          >
            <img
              src={cursorIcon}
              alt="Cursor"
              className={`w-[1.1vw] h-[1.1vw] object-contain ${toolMode === "cursor" ? "invert brightness-0 saturate-100" : ""}`}
            />
          </button>
        </Tooltip1>
        <Tooltip1 label="Hand" side="left">
          <button
            onClick={() => handleSetToolMode("hand")}
            className={`w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${toolMode === "hand"
              ? "bg-gray-900 hover:bg-gray-700"
              : "bg-transparent hover:bg-gray-100"
              }`}
          >
            <img
              src={handIcon}
              alt="Hand"
              className={`w-[1.1vw] h-[1.1vw] object-contain ${toolMode === "hand" ? "invert brightness-0 saturate-100" : ""}`}
            />
          </button>
        </Tooltip1>

        <div className="w-6 h-px bg-gray-200 mx-auto" />

        <Tooltip1 label="Reset Position" side="left">
          <button
            onClick={() => {
              if (orbitControlsRef.current && cameraRef.current) {
                const controls = orbitControlsRef.current;
                const camera = cameraRef.current;

                const savedConfig =
                  modelPositionsConfig && modelPositionsConfig[modelUrl];

                if (savedConfig) {
                  const { target, azimuth, polar, distance } = savedConfig;
                  controls.target.set(target[0], target[1], target[2]);
                  const spherical = new THREE.Spherical(
                    distance || 4 / 0.6,
                    polar,
                    azimuth,
                  );
                  spherical.makeSafe();
                  const offsetVec = new THREE.Vector3().setFromSpherical(
                    spherical,
                  );
                  camera.position.copy(controls.target).add(offsetVec);
                  camera.lookAt(controls.target);
                  controls.setAzimuthalAngle(azimuth);
                  controls.setPolarAngle(polar);

                  const calculatedZoom = Math.round((4 / distance) * 100);
                  setZoomPercent(calculatedZoom || 60);
                } else {
                  setZoomPercent(60);
                  const targetY = getModelCenterY();
                  controls.target.set(0, targetY, 0);
                  camera.position.set(0, targetY, 4 / 0.6);
                  camera.lookAt(0, targetY, 0);
                  controls.setAzimuthalAngle(0);
                  controls.setPolarAngle(Math.PI / 2);
                }
                controls.update();
              }
              setToolMode("cursor");
            }}
            className="w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center border-none bg-transparent hover:bg-gray-100 cursor-pointer text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-[1.1vw] h-[1.1vw]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2.25v1.5m0 16.5v1.5m-9.75-9.75h1.5m16.5 0h1.5"
              />
            </svg>
          </button>
        </Tooltip1>

        <Tooltip1 label="Reset All Edits" side="left">
          <button
            onClick={() => {
              if (onResetAll) onResetAll();
              if (baseDimensions) setCustomSizeInput(baseDimensions);
              setToolMode("cursor");
            }}
            className="w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center border-none bg-transparent hover:bg-red-50 hover:text-red-500 cursor-pointer text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-[1.1vw] h-[1.1vw]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </button>
        </Tooltip1>

        {!showTools && (
          <>
            <div className="w-6 h-px bg-gray-200 mx-auto" />
            <style>{`
              @keyframes bounce-down {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(3px); }
              }
              .animate-bounce-down {
                animation: bounce-down 1.2s infinite ease-in-out;
              }
              
              /* Premium range input styling */
              input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #ffffff;
                border: 2px solid #c05520;
                box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                cursor: pointer;
                transition: transform 0.1s ease;
              }
              input[type="range"]::-webkit-slider-thumb:hover {
                transform: scale(1.2);
              }
              input[type="range"]::-moz-range-thumb {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #ffffff;
                border: 2px solid #c05520;
                box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                cursor: pointer;
                transition: transform 0.1s ease;
              }
              input[type="range"]::-moz-range-thumb:hover {
                transform: scale(1.2);
              }

                
                /* Auto-aligning right side panels using viewport units */
                .editor-right-tools {
                  width: 5.6vh !important;
                  top: 8vh !important;
                  right: 1.5vw !important;
                  padding: 0.9vh !important;
                  gap: 0.7vw !important;
                  background-color: #ffffff !important;
                  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
                  border-radius: 9999px !important;
                  display: flex !important;
                  flex-direction: column !important;
                  align-items: center !important;
                }
                .editor-right-tools button {
                  width: 4.2vh !important;
                  height: 4.2vh !important;
                  min-width: 4.2vh !important;
                  min-height: 4.2vh !important;
                  background-color: transparent !important;
                  box-shadow: none !important;
                  border: none !important;
                  border-radius: 9999px !important;
                  transition: all 0.2s ease !important;
                }
                .editor-right-tools button:hover {
                  background-color: #f3f4f6 !important;
                }
                /* Active state color override: keep dark circle when active */
                .editor-right-tools button[class*="bg-gray-900"] {
                  background-color: #111827 !important;
                }
                .editor-right-tools button[class*="bg-gray-900"]:hover {
                  background-color: #1f2937 !important;
                }
                .editor-right-tools img {
                  width: 2.4vh !important;
                  height: 2.4vh !important;
                }
                .editor-right-tools svg {
                  width: 2.4vh !important;
                  height: 2.4vh !important;
                }
                .editor-right-tools .text-\\[13px\\] {
                  font-size: 1.3vh !important;
                  line-height: 1.2 !important;
                }
                .editor-right-tools span {
                  font-size: 0.45vw !important;
                  line-height: 1.1 !important;
                }
                .editor-right-tools .bg-gray-200 {
                  display: block !important;
                  width: 2.2vh !important;
                  height: 1px !important;
                  margin-left: auto !important;
                  margin-right: auto !important;
                }
                
                .editor-right-actions {
                  top: 8vh !important;
                  right: 4.5vw !important;
                  padding: 0.55vh !important;
                  gap: 0.7vh !important;
                  background-color: #ffffff !important;
                  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
                  border-radius: 9999px !important;
                }
                .editor-right-actions button {
                  width: 4.2vh !important;
                  height: 4.2vh !important;
                  min-width: 4.2vh !important;
                  min-height: 4.2vh !important;
                  background-color: transparent !important;
                  box-shadow: none !important;
                  border: none !important;
                  border-radius: 9999px !important;
                  transition: all 0.2s ease !important;
                }
                .editor-right-actions button:hover {
                  background-color: #f3f4f6 !important;
                }
                .editor-right-actions svg {
                  width: 2.4vh !important;
                  height: 2.4vh !important;
                }
                .editor-right-actions .bg-gray-100 {
                  display: block !important;
                  width: 2vh !important;
                  height: 1px !important;
                  margin-left: auto !important;
                  margin-right: auto !important;
                }
                
                /* Responsive styles for Edit Popup Panel using viewport units */
                .editor-edit-popup {
                  width: 17.5vw !important;
                  padding: 0.9vw !important;
                  gap: 0.65vw !important;
                  border-radius: 1.4vw !important;
                }
                @keyframes bounce-right-loop {
                  0%, 100% {
                    transform: translateX(0);
                  }
                  50% {
                    transform: translateX(4px);
                  }
                }
                .animate-bounce-right-loop {
                  animation: bounce-right-loop 1s ease-in-out infinite !important;
                }
                @media (min-width: 1024px) {
                  /* Avoid scroll by removing max-height constraint on the grid on big screens */
                  .editor-edit-popup .grid.grid-cols-3 {
                    max-height: none !important;
                    overflow: visible !important;
                    padding-right: 0 !important;
                  }
                  /* Reduce internal container paddings */
                  .editor-edit-popup .bg-gray-50 {
                    padding: 0.6vw !important;
                    border-radius: 0.8vw !important;
                  }
                  .editor-edit-popup button.border-2 {
                    padding: 0.6vw !important;
                    border-radius: 0.8vw !important;
                  }
                }
                .editor-edit-popup .text-sm {
                  font-size: 0.8vw !important;
                }
                .editor-edit-popup .text-xs {
                  font-size: 0.7vw !important;
                }
                .editor-edit-popup .text-\\[15px\\] {
                  font-size: 0.85vw !important;
                }
                .editor-edit-popup select,
                .editor-edit-popup input {
                  font-size: 0.8vw !important;
                  padding: 0.6vw !important;
                  border-radius: 0.8vw !important;
                }
                .editor-edit-popup button {
                  border-radius: 0.8vw !important;
                  font-size: 0.85vw !important;
                }
                /* Category buttons inside the Texture Library tab */
                .editor-edit-popup .rounded-full {
                  font-size: 0.7vw !important;
                  padding: 0.35vw 0.7vw !important;
                }
                .editor-edit-popup span.text-\\[11px\\] {
                  font-size: 0.65vw !important;
                }
                .editor-edit-popup span.text-\\[10px\\] {
                  font-size: 0.6vw !important;
                }
                .editor-edit-popup label {
                  font-size: 0.8vw !important;
                }
              `}</style>
            <button
              onClick={() => setShowTools(true)}
              className="w-full rounded-full flex items-center justify-center border-none bg-transparent hover:bg-orange-50 text-[#c05520] cursor-pointer transition-colors p-1"
              title="More Tools"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4 animate-bounce-down"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </>
        )}

        {/* Collapsible Container for Remaining Tools */}
        <div
          className={`transition-all duration-300 flex flex-col gap-[0.6vw] items-center w-full ${showTools
            ? "max-h-[1000px] opacity-100 mt-1 overflow-visible"
            : "max-h-0 opacity-0 pointer-events-none overflow-hidden"
            }`}
        >
          <Tooltip1 label="Undo" side="left">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center border-none transition-colors ${canUndo ? "bg-transparent hover:bg-gray-100 cursor-pointer text-gray-600" : "bg-transparent text-gray-300 cursor-not-allowed"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-[1.1vw] h-[1.1vw]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                />
              </svg>
            </button>
          </Tooltip1>

          <Tooltip1 label="Redo" side="left">
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center border-none transition-colors ${canRedo ? "bg-transparent hover:bg-gray-100 cursor-pointer text-gray-600" : "bg-transparent text-gray-300 cursor-not-allowed"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-[1.1vw] h-[1.1vw]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
                />
              </svg>
            </button>
          </Tooltip1>

          <Tooltip1 label="Zoom In" side="left">
            <button
              onClick={() => handleZoom(10)}
              className="w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center border-none bg-transparent hover:bg-gray-100 cursor-pointer text-gray-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-[1.1vw] h-[1.1vw]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            </button>
          </Tooltip1>

          <div className="text-[11px] font-bold text-gray-400 text-center w-full select-none">
            {zoomPercent}%
          </div>

          <Tooltip1 label="Zoom Out" side="left">
            <button
              onClick={() => handleZoom(-10)}
              className="w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center border-none bg-transparent hover:bg-gray-100 cursor-pointer text-gray-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-[1.1vw] h-[1.1vw]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            </button>
          </Tooltip1>

          <div className="w-6 h-px bg-gray-200 mx-auto" />

          <Tooltip1
            label={shadowEnabled ? "Shadow Off" : "Shadow On"}
            side="left"
          >
            <button
              onClick={() => setShadowEnabled((s) => !s)}
              className={`w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${shadowEnabled
                ? "bg-gray-900 text-white hover:bg-gray-700"
                : "bg-transparent text-gray-500 hover:bg-gray-100"
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-[1.1vw] h-[1.1vw]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            </button>
          </Tooltip1>

          <div className="w-6 h-px bg-gray-200 mx-auto" />

          <Tooltip1 label="Measurements" side="left">
            <button
              onClick={() => {
                setShowMeasurements((m) => {
                  const nextVal = !m;
                  if (nextVal && setActiveTab) {
                    setActiveTab(null);
                  }
                  return nextVal;
                });
              }}
              className={`w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${showMeasurements
                ? "bg-gray-900 text-white hover:bg-gray-700"
                : "bg-transparent text-gray-500 hover:bg-gray-100"
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-[1.1vw] h-[1.1vw]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12h-15m0 0v1.5m0-1.5v-1.5m15 1.5v1.5m0-1.5v-1.5m-12 1.5v-1.5m3 1.5v-1.5m3 1.5v-1.5m3 1.5v-1.5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18h12a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3Z"
                />
              </svg>
            </button>
          </Tooltip1>

          <div className="w-6 h-px bg-gray-200 mx-auto" />

          <Tooltip1
            label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            side="left"
          >
            <button
              onClick={toggleFullscreen}
              className={`w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${isFullscreen
                ? "bg-gray-900 text-white hover:bg-gray-700"
                : "bg-transparent text-gray-500 hover:bg-gray-100"
                }`}
            >
              {isFullscreen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-[1.1vw] h-[1.1vw]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-5.25M15 15v4.5M15 15h4.5M15 15l5.25 5.25"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-[1.1vw] h-[1.1vw]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0l-6-6"
                  />
                </svg>
              )}
            </button>
          </Tooltip1>

          <div className="w-6 h-px bg-gray-200 mx-auto" />

          <Tooltip1 label="Help & Controls" side="left">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className={`w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center border-none cursor-pointer transition-colors ${showLegend
                ? "bg-gray-900 text-white hover:bg-gray-700"
                : "bg-transparent text-gray-500 hover:bg-gray-100"
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-[1.1vw] h-[1.1vw]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                />
              </svg>
            </button>
          </Tooltip1>

          <div className="w-6 h-px bg-gray-200 mx-auto" />

          {/* Close Tools Button (Shown as Last Item) */}
          <Tooltip1 label="Close Tools" side="left">
            <button
              onClick={() => setShowTools(false)}
              className="w-[1.8vw] h-[1.8vw] rounded-full flex items-center justify-center border-none bg-transparent hover:bg-orange-50 text-[#c05520] cursor-pointer transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-[1.1vw] h-[1.1vw]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 15.75 7.5-7.5 7.5 7.5"
                />
              </svg>
            </button>
          </Tooltip1>
        </div>
      </div>

      {/* Floating Right Side Cap Selector (Only for Bottle Models when in Edit mode) */}
      {activeTab === "edit" && isBottleModel && (
        <div
          ref={capPanelRef}
          className="absolute right-[7.4vw] top-[2.5vh] z-20 pointer-events-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 select-none flex flex-col gap-3 transition-all duration-300"
          style={{
            transform: `translate(${capPanelPosition.x}px, ${capPanelPosition.y}px)`,
            transition: isDraggingCapPanel
              ? "none"
              : "transform 0.1s ease, width 0.3s ease, height 0.3s ease, padding 0.3s ease",
            width: isCapPanelMinimized ? "130px" : "250px",
            padding: isCapPanelMinimized ? "8px 12px" : "20px",
          }}
        >
          {isCapPanelMinimized ? (
            /* Minimized State UI */
            <div
              className="flex items-center justify-between w-full cursor-grab active:cursor-grabbing gap-1"
              onPointerDown={handleCapPanelPointerDown}
              onPointerMove={handleCapPanelPointerMove}
              onPointerUp={handleCapPanelPointerUp}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                {/* Drag handle dots icon */}
                <svg
                  className="w-3.5 h-3.5 text-gray-400 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs font-bold text-gray-700 truncate">
                  Caps
                </span>
              </div>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCapPanelMinimized(false);
                }}
                className="w-5 h-5 rounded-md hover:bg-gray-100 flex items-center justify-center border-none text-gray-500 hover:text-gray-800 cursor-pointer shrink-0"
                title="Maximize"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          ) : (
            /* Maximized State UI */
            <>
              {/* Drag Handle */}
              <div
                className="w-full h-4 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-50 rounded-t-2xl border-b border-gray-50 select-none -mt-3 -mx-5 px-5 py-2.5 bg-gray-50/50"
                onPointerDown={handleCapPanelPointerDown}
                onPointerMove={handleCapPanelPointerMove}
                onPointerUp={handleCapPanelPointerUp}
                title="Drag Panel"
              >
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
              </div>

              <div className="flex flex-col gap-1 -mt-2">
                <div className="flex items-center justify-end">
                  <div className="flex items-center gap-1.5">
                    {/* Reset Position Button */}
                    {(capPanelPosition.x !== 0 || capPanelPosition.y !== 0) && (
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => setCapPanelPosition({ x: 0, y: 0 })}
                        className="w-5 h-5 rounded-md hover:bg-gray-100 flex items-center justify-center border-none text-gray-400 hover:text-[#c05520] cursor-pointer"
                        title="Reset to Original Position"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 2.25v1.5m0 16.5v1.5m-9.75-9.75h1.5m16.5 0h1.5"
                          />
                        </svg>
                      </button>
                    )}
                    {/* Minimize Button */}
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => setIsCapPanelMinimized(true)}
                      className="w-5 h-5 rounded-md hover:bg-gray-100 flex items-center justify-center border-none text-gray-500 hover:text-gray-800 cursor-pointer"
                      title="Minimize"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18 12H6"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Container with exact 3-row visible height */}
              <div className="overflow-y-auto pr-1 flex flex-col gap-2 max-h-[300px]">
                <div className="grid grid-cols-2 gap-2">
                  {/* Default Slot */}
                  <button
                    onClick={() => onSelectCap && onSelectCap("none")}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer outline-none ${selectedCapUrl === "none"
                      ? "border-[#c05520] bg-orange-50/50 text-[#c05520] ring-1 ring-[#c05520]"
                      : "border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100/80 hover:border-gray-200"
                      }`}
                  >
                    {/* Visual Image Placeholder for Default Cap */}
                    <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200/50 flex items-center justify-center mb-1.5 relative overflow-hidden">
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold">Default</span>
                  </button>

                  {/* Cap 1-8 Slots */}
                  {CAPS.map((cap, i) => (
                    <button
                      key={cap.id}
                      onClick={() => onSelectCap && onSelectCap(cap.url)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer outline-none ${selectedCapUrl === cap.url
                        ? "border-[#c05520] bg-orange-50/50 text-[#c05520] ring-1 ring-[#c05520]"
                        : "border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100/80 hover:border-gray-200"
                        }`}
                    >
                      {/* Visual Image/Render for Cap */}
                      <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-[#fdfbf7] to-[#f5f0e6] border border-orange-100 flex items-center justify-center mb-1.5 relative overflow-hidden">
                        {cap.imageUrl ? (
                          <img
                            src={cap.imageUrl}
                            alt={cap.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            {/* Visual cap illustration fallback */}
                            <div className="w-10 h-5 bg-[#c05520] rounded-t-md opacity-85 shadow-sm flex flex-col justify-between p-0.5">
                              <div className="w-full h-0.5 bg-white/20 rounded" />
                              <div className="w-full h-0.5 bg-white/20 rounded" />
                            </div>
                          </>
                        )}
                        <span className="absolute bottom-1 right-1 text-[8px] bg-[#c05520]/10 text-[#c05520] px-1 rounded font-black">
                          #{i + 1}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold">Cap {i + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Help / Legend Panel */}
      {showLegend && (
        <>
          {/* Invisible overlay for click-outside to close */}
          <div
            className="fixed inset-0 z-[999]"
            onClick={() => setShowLegend(false)}
          />
          <div className="absolute bottom-6 right-24 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] text-xs text-gray-600 border border-white/60 flex flex-col gap-3 z-[1000]">
            <div className="font-bold text-gray-800 text-[14px]">
              Editor Controls
            </div>
            <div className="flex gap-6 pointer-events-none">
              <div className="flex items-start gap-2">
                <img
                  src={cursorIcon}
                  className="w-4 h-4 opacity-70 mt-0.5"
                  alt=""
                />
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">Select Tool</span>
                  <span className="text-gray-500">Rotate & explore</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <img
                  src={handIcon}
                  className="w-4 h-4 opacity-70 mt-0.5"
                  alt=""
                />
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">Hand Tool</span>
                  <span className="text-gray-500">Pan & move</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[16px] leading-none mt-0.5">âš™ï¸</span>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">Mouse Wheel</span>
                  <span className="text-gray-500">Zoom in / out</span>
                </div>
              </div>
            </div>
            <div className="flex gap-6 pt-3 border-t border-gray-200/60 mt-1">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 opacity-70 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 2.25v1.5m0 16.5v1.5m-9.75-9.75h1.5m16.5 0h1.5"
                  />
                </svg>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">
                    Reset Position
                  </span>
                  <span className="text-gray-500">Center view</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 opacity-70 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-700">Reset Edits</span>
                  <span className="text-gray-500">Clear all designs</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Export Options Popup */}
      {showExportModal && (
        <>
          {/* Invisible overlay for click-outside to close */}
          <div
            className="fixed inset-0 z-[999]"
            onClick={() => setShowExportModal(false)}
          />
          <div className="absolute right-[100px] top-6 z-[1000] pointer-events-auto">
            <div className="bg-white rounded-[15px] p-6 w-[340px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col gap-5 relative border border-gray-100">
              <button
                onClick={() => setShowExportModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center border-none text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
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
                    className="w-[1.1vw] h-[1.1vw] accent-[#c05520] cursor-pointer rounded"
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
                    className="w-[1.1vw] h-[1.1vw] accent-[#c05520] cursor-pointer rounded"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      Export as PNG
                    </span>
                    <span className="text-[11px] text-gray-500">
                      High-res image with transparent background
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={exportJpgChecked}
                    onChange={(e) => setExportJpgChecked(e.target.checked)}
                    className="w-[1.1vw] h-[1.1vw] accent-[#c05520] cursor-pointer rounded"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      Export as JPG
                    </span>
                    <span className="text-[11px] text-gray-500">
                      High-res screenshot with background
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100/70 transition-colors cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={exportPdfChecked}
                    onChange={(e) => setExportPdfChecked(e.target.checked)}
                    className="w-[1.1vw] h-[1.1vw] accent-[#c05520] cursor-pointer rounded"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      Export as PDF
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Document containing the 3D model view
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

      {/* Bottom Floating Bar removed as requested */}

      {/* Model Switch Confirmation Dialog */}
      {showSwitchDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-[90%] max-w-[360px] flex flex-col gap-5 text-center transform transition-all">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-[#c0623a] mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 m-0">
              Switch Model
            </h3>
            <p className="text-[13px] text-gray-500 m-0 leading-relaxed">
              Do you want to keep your current design on the new model, or start
              fresh?
            </p>

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => {
                  setModelUrl(pendingModelUrl);
                  setShowSwitchDialog(false);
                  setPendingModelUrl(null);
                }}
                className="w-full py-3 bg-[#c0623a] text-white rounded-xl font-bold text-sm border-none cursor-pointer hover:bg-[#a65330] transition-colors"
              >
                Keep Design
              </button>
              <button
                onClick={() => {
                  onResetAll();
                  setModelUrl(pendingModelUrl);
                  setShowSwitchDialog(false);
                  setPendingModelUrl(null);
                }}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm border-none cursor-pointer hover:bg-gray-200 transition-colors"
              >
                Clear Design
              </button>
              <button
                onClick={() => {
                  setShowSwitchDialog(false);
                  setPendingModelUrl(null);
                }}
                className="w-full py-2.5 bg-transparent text-gray-500 rounded-xl font-medium text-sm border-none cursor-pointer hover:text-gray-700 transition-colors mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Overwrite Confirmation Dialog */}
      {showOverwriteConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-[90%] max-w-[360px] flex flex-col gap-5 text-center transform transition-all border border-gray-100">
            <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 m-0">Overwrite Existing?</h3>
            <p className="text-[13px] text-gray-500 m-0 leading-relaxed">
              A scene named <strong>"{saveSceneName}"</strong> already exists in your gallery.
            </p>

            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => handleSaveScene(true)}
                className="w-full py-3 bg-[#c05520] text-white rounded-xl font-bold text-sm border-none cursor-pointer hover:bg-orange-700 transition-colors"
              >
                Overwrite Existing
              </button>
              <button
                onClick={() => {
                  const copyName = `${saveSceneName} (Copy)`;
                  setSaveSceneName(copyName);
                  setShowOverwriteConfirm(false);
                  setTimeout(() => {
                    const stored = localStorage.getItem("fisto_saved_scenes");
                    const parsed = stored ? JSON.parse(stored) : [];
                    if (pendingSceneObject) {
                      pendingSceneObject.name = copyName;
                      parsed.push(pendingSceneObject);
                      localStorage.setItem("fisto_saved_scenes", JSON.stringify(parsed));
                      setSaveSceneName("");
                      setShowSaveModal(false);
                      setPendingSceneObject(null);
                      setDuplicateSceneIndex(-1);
                      setActiveTab("gallery");
                    }
                  }, 50);
                }}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm border-none cursor-pointer hover:bg-gray-200 transition-colors"
              >
                Save as New Copy
              </button>
              <button
                onClick={() => {
                  setShowOverwriteConfirm(false);
                  setPendingSceneObject(null);
                  setDuplicateSceneIndex(-1);
                }}
                className="w-full py-2.5 bg-transparent text-gray-500 rounded-xl font-medium text-sm border-none cursor-pointer hover:text-gray-700 transition-colors mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Scene Dialog */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-[90%] max-w-[360px] flex flex-col gap-5 text-center transform transition-all border border-gray-100">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-[#c05520] mb-2 animate-pulse">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 m-0">Save Scene</h3>
            <p className="text-[13px] text-gray-500 m-0 leading-relaxed">
              Enter a name for your customized scene to save it in your local
              gallery.
            </p>

            <input
              type="text"
              value={saveSceneName}
              onChange={(e) => setSaveSceneName(e.target.value)}
              placeholder="e.g. My Custom Cup"
              className="w-full py-3 px-4 border border-gray-200 rounded-xl outline-none text-center font-semibold text-sm text-gray-800 focus:border-[#c05520] transition-all bg-gray-50/50"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveScene();
                }
              }}
            />

            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveSceneName("");
                }}
                className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-bold text-sm border border-gray-200/60 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveScene}
                className="flex-1 py-3 bg-[#c05520] hover:bg-[#a65330] text-white rounded-xl font-bold text-sm border-none cursor-pointer transition-colors shadow-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation Bar */}
      <BottomBar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === "uv_editor") {
            onProceed(selectedMaterial);
          } else {
            setActiveTab(tab);
          }
        }}
        onResetView={() => {
          if (orbitControlsRef.current) {
            orbitControlsRef.current.reset();
            orbitControlsRef.current.setAzimuthalAngle(0);
            orbitControlsRef.current.setPolarAngle(Math.PI / 2);
            orbitControlsRef.current.target.set(0, getModelCenterY(), 0);
            orbitControlsRef.current.update();
          }
        }}
        onToggleWireframe={() => setWireframe((w) => !w)}
        wireframe={wireframe}
      />
    </div>
  );
}

function ViewBtn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-16 h-16 rounded-xl bg-transparent hover:bg-gray-50 border-none flex flex-col items-center justify-center gap-1 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-[1.1vw] h-[1.1vw]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
        />
      </svg>
      <span className="text-[10px] font-semibold text-gray-500">{label}</span>
    </button>
  );
}

function Tooltip1({ label, children, side = "left" }) {
  const sideClasses = {
    left: "right-[calc(100%+8px)] top-1/2 -translate-y-1/2",
    right: "left-[calc(100%+8px)] top-1/2 -translate-y-1/2",
    top: "bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2",
    bottom: "top-[calc(100%+8px)] left-1/2 -translate-x-1/2",
  };
  const arrowClasses = {
    left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-y-transparent border-r-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-y-transparent border-l-transparent",
    top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-x-transparent border-b-transparent",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-x-transparent border-t-transparent",
  };
  return (
    <div className="relative group flex items-center justify-center">
      {children}
      <div
        className={`absolute ${sideClasses[side]} px-2.5 py-1 bg-gray-900 text-white text-[11px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100] shadow-sm`}
      >
        {label}
        <div
          className={`absolute w-0 h-0 border-solid border-4 ${arrowClasses[side]}`}
        ></div>
      </div>
    </div>
  );
}

const ScreenshotHelper = forwardRef(({ filename, bgColor, bgImage }, ref) => {
  const { gl, scene, camera } = useThree();

  useImperativeHandle(ref, () => ({
    capture: async ({ png, jpg, pdf }) => {
      const currentPixelRatio = gl.getPixelRatio();
      const currentClearColor = gl.getClearColor(new THREE.Color());
      const currentClearAlpha = gl.getClearAlpha();
      const originalBackground = scene.background;

      gl.setPixelRatio(3); // High-res export multiplier

      const doExport = async (format, transparent) => {
        if (transparent || bgColor === "transparent") {
          gl.setClearColor(0x000000, 0); // Transparent background
          scene.background = null;
        } else {
          gl.setClearColor(
            new THREE.Color(bgColor === "transparent" ? "#ffffff" : bgColor),
            1,
          ); // Solid background
          if (!bgImage) {
            scene.background = new THREE.Color(
              bgColor === "transparent" ? "#ffffff" : bgColor,
            );
          } else {
            scene.background = originalBackground;
          }
        }

        gl.render(scene, camera);

        let mimeType = format === "jpg" ? "image/jpeg" : "image/png";
        const url = gl.domElement.toDataURL(mimeType, 1.0);

        if (format === "pdf") {
          const { jsPDF } = await import("jspdf");
          const pdfDoc = new jsPDF("landscape", "px", [
            gl.domElement.width,
            gl.domElement.height,
          ]);
          pdfDoc.addImage(
            url,
            "PNG",
            0,
            0,
            gl.domElement.width,
            gl.domElement.height,
          );
          pdfDoc.save(`${filename || "model"}.pdf`);
        } else {
          const a = document.createElement("a");
          a.href = url;
          a.download = `${filename || "model"}.${format}`;
          a.click();
        }
      };

      if (png) await doExport("png", true);
      if (jpg) await doExport("jpg", false);
      if (pdf) await doExport("pdf", false);

      // Restore original state
      scene.background = originalBackground;
      gl.setPixelRatio(currentPixelRatio);
      gl.setClearColor(currentClearColor, currentClearAlpha);
      gl.render(scene, camera);
    },
  }));

  return null;
});
