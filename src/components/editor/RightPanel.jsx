import {
  Suspense,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Canvas as R3FCanvas, useThree, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  useProgress,
  Html,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";
import SafeEnvironment from "./SafeEnvironment";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { isMeasurementMesh } from "./EditorScreen1";
import { CAPS } from "../../pages/EditorPage";
import { BOTTLE_CAP_CONFIGS } from "../../utils/capConfigs";
import { MODELS } from "./ModelsPopup";
import { gsap } from "gsap";

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

const packageColors = [
  { id: "white", color: "#ffffff" },
  { id: "black", color: "#000000" },
  { id: "transparent", color: "transparent" },
];

function LoaderOverlay() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <Html fullscreen style={{ pointerEvents: "none" }} zIndexRange={[100, 0]}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)",
          pointerEvents: "none",
        }}
      >
        {/* Spinner ring */}
        <div
          style={{
            position: "relative",
            width: 44,
            height: 44,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.2)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "4px solid transparent",
              borderTopColor: "#ffffff",
              animation: "spin 0.75s linear infinite",
            }}
          />
        </div>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 12, margin: 0 }}>
          Loading Model...
        </p>
        <p
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 10,
            margin: "4px 0 0",
          }}
        >
          {Math.round(progress)}%
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Html>
  );
}

export default function RightPanel({
  canvasRef,
  textureCanvasRef,
  textureVersion,
  modelUrl,
  appliedMaterials,
  appliedColors,
  appliedLastApplied,
  wireframe,
  setWireframe,
  showUv,
  setShowUv,
  fullUv,
  setFullUv,
  bgColor,
  setBgColor,
  sceneBgColor = "#e5e5e5",
  sceneBgImage = null,
  hideExport,
  onSave,
  onExportClick,
  customSize,
  isActive,
  selectedColor,
  setSelectedColor,
  onOpenTapeLayout,
  showPreview,
  setShowPreview,
  selectedCapUrl,
  onSelectCap,
  selectedMaterial,
}) {
  const isBottleModel =
    modelUrl &&
    (modelUrl.toLowerCase().includes("plastic") ||
      modelUrl.toLowerCase().includes("glass") ||
      modelUrl.toLowerCase().includes("soft"));

  const activeCapOffsets = useMemo(() => {
    if (!modelUrl || !selectedCapUrl || selectedCapUrl === "none") return null;
    const model = MODELS.find((m) => m.modelUrl === modelUrl);
    let modelKey = model ? model.id : "default";

    if (modelKey === "default") {
      const cleanUrl = modelUrl.split("?")[0].split("#")[0];
      const filename = cleanUrl.split("/").pop().replace(/\.[^/.]+$/, "");
      if (filename) modelKey = filename;
    }

    const modelConfig = BOTTLE_CAP_CONFIGS[modelKey] || {};
    const capFile = selectedCapUrl.split("/").pop();
    return modelConfig[capFile] || modelConfig["default"] || null;
  }, [modelUrl, selectedCapUrl]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [panelWidth, setPanelWidth] = useState(() =>
    Math.max(220, window.innerWidth * 0.18),
  );

  const customColorInputRef = useRef(null);
  const lastColorUpdate = useRef(0);
  const colorTimeoutRef = useRef(null);
  const captureRef = useRef(null);
  const orbitControlsRef = useRef(null);

  const handleExportCanvasPNG = () => {
    if (!canvasRef?.current) return;
    const url = canvasRef.current.exportAsPNG();
    const a = document.createElement("a");
    a.href = url;
    a.download = "texture-canvas.png";
    a.click();
    setShowExportMenu(false);
  };

  const handleExportModelPNG = () => {
    if (!captureRef.current) return;
    captureRef.current.capture();
    setShowExportMenu(false);
  };

  const handleExportSVG = () => {
    if (!canvasRef?.current) return;
    const svgContent = canvasRef.current.exportAsSVG();
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "texture-layered.svg";
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportPDF = async () => {
    if (!canvasRef?.current) return;
    setExporting(true);
    try {
      const url = await canvasRef.current.exportAsPDF();
      const a = document.createElement("a");
      a.href = url;
      a.download = "texture-layered.pdf";
      a.click();
    } catch (err) {
      console.error("PDF Export Error:", err);
    } finally {
      setExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleExportGLB = () => {
    if (!modelUrl || !textureCanvasRef?.current) return;
    setExporting(true);
    setShowExportMenu(false);
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = true;
        // No uv layout offset/scale applying, exactly 1:1 raw mapping
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
            setExporting(false);
          },
          (err) => {
            console.error("GLTFExporter error:", err);
            setExporting(false);
          },
          { binary: true },
        );
      },
      undefined,
      () => setExporting(false),
    );
  };

  const handleCustomColorChange = (e) => {
    const newColor = e.target.value;
    setSelectedColor("custom");

    const now = Date.now();
    if (now - lastColorUpdate.current >= 50) {
      setBgColor(newColor);
      lastColorUpdate.current = now;
    } else {
      clearTimeout(colorTimeoutRef.current);
      colorTimeoutRef.current = setTimeout(() => {
        setBgColor(newColor);
        lastColorUpdate.current = Date.now();
      }, 50);
    }
  };

  const resetPreviewCamera = () => {
    orbitControlsRef.current?.reset();
  };

  const containerWidth = panelWidth - 24;
  const gizmoScale = Math.max(0.45, Math.min(0.7, containerWidth / 480));
  const gizmoMarginVal = Math.max(30, Math.min(42, containerWidth * 0.11));

  return (
    <aside
      style={{
        width: showPreview ? panelWidth : 200,
        minWidth: showPreview ? "160px" : "unset",
      }}
      className="bg-white border-l border-gray-100 flex flex-col shrink-0 h-fit overflow-y-auto relative z-10 max-[1024px]:!w-[230px] max-[640px]:!w-[270px] animate-slide-in"
    >
      <style>{`
        @keyframes slide-in-panel {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in-panel 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0; /* Start hidden for animation */
        }
      `}</style>
      <div className="flex gap-2 px-3 pb-2 pt-1"></div>

      <div className="px-3 pb-2" style={{ display: "none" }}>
        <div className="flex items-center justify-center gap-3 bg-white border border-gray-100 px-3 py-2 rounded-xl text-[11px] shadow-sm flex-wrap">
          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={fullUv}
              onChange={(e) => setFullUv(e.target.checked)}
              className="cursor-pointer"
            />
            Full UV
          </label>
          <div className="w-px h-4 bg-gray-200" />
          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={wireframe}
              onChange={(e) => setWireframe(e.target.checked)}
              className="cursor-pointer"
            />
            Wireframe
          </label>
        </div>
      </div>

      {/* 3D Preview Toggle Options */}
      {!showPreview && (
        <div className="px-3 pb-2 pt-2">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="w-full py-3 rounded-xl border-2 border-[#c0623a] bg-white hover:bg-orange-50/50 font-bold text-[13px] text-[#c0623a] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shadow-[0_2px_8px_rgba(192,98,58,0.08)] active:scale-[0.98]"
          >
            <style>{`
              @keyframes slow-spin-y {
                0% { transform: rotateY(0deg) translateY(0px); }
                50% { transform: rotateY(180deg) translateY(-2px); }
                100% { transform: rotateY(360deg) translateY(0px); }
              }
              .animate-3d-box {
                animation: slow-spin-y 4s linear infinite;
                transform-style: preserve-3d;
              }
            `}</style>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-[#c0623a] animate-3d-box"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
            Show 3D Preview
          </button>
        </div>
      )}

      {/* 3D Preview */}
      {showPreview && (
        <div className="px-3 pb-2 relative select-none">
          <div
            className="relative rounded-xl overflow-hidden aspect-square"
            style={{ background: sceneBgColor }}
          >
            <R3FCanvas
              className="w-full h-full"
              camera={{ position: [0, 0.2, 3.2], fov: 40 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
              onCreated={({ gl }) => {
                gl.outputColorSpace = THREE.SRGBColorSpace;
                gl.toneMapping = THREE.NeutralToneMapping;
                gl.toneMappingExposure = 1;
                if (!sceneBgImage)
                  gl.setClearColor(new THREE.Color(sceneBgColor), 1);
              }}
            >
              {!sceneBgImage && (
                <color attach="background" args={[sceneBgColor]} />
              )}
              {sceneBgImage && (
                <Suspense fallback={null}>
                  <BackgroundImage url={sceneBgImage} />
                </Suspense>
              )}
              <ambientLight intensity={0.7} />
              <SafeEnvironment preset="city" />
              <directionalLight position={[4, 5, 4]} intensity={0.8} />
              <directionalLight position={[-4, 3, -4]} intensity={0.3} />
              <Suspense fallback={null}>
                {modelUrl && (
                  <AutoSizedModel
                    key={modelUrl}
                    modelUrl={modelUrl}
                    canvasRef={canvasRef}
                    textureCanvasRef={textureCanvasRef}
                    textureVersion={textureVersion}
                    wireframe={wireframe}
                    appliedMaterials={appliedMaterials}
                    appliedColors={appliedColors}
                    appliedLastApplied={appliedLastApplied}
                    bgColor={bgColor}
                    selectedColor={selectedColor}
                    selectedMaterial={selectedMaterial}
                    isActive={isActive}
                    selectedCapUrl={selectedCapUrl}
                  />
                )}
              </Suspense>
              {/* Loader overlay — must live inside R3FCanvas to access useProgress context */}
              <LoaderOverlay />
              <ScreenshotHelper ref={captureRef} />
              <OrbitControls
                ref={orbitControlsRef}
                enablePan={false}
                enableZoom={true}
                minDistance={1.5}
                maxDistance={10}
                minPolarAngle={0}
                maxPolarAngle={Math.PI}
              />
              <GizmoHelper
                alignment="top-left"
                margin={[gizmoMarginVal, gizmoMarginVal]}
              >
                <GizmoViewport
                  axisColors={["#ef4444", "#22c55e", "#3b82f6"]}
                  labelColor="white"
                  scale={40 * gizmoScale}
                />
              </GizmoHelper>
            </R3FCanvas>

            {/* Collapse button */}
            <button
              type="button"
              title="Collapse 3D preview"
              onClick={() => setShowPreview(false)}
              className="absolute top-2 right-10 w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm border-none cursor-pointer flex items-center justify-center text-gray-800 hover:bg-white transition-colors z-10"
              style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12h-15"
                />
              </svg>
            </button>

            {/* Refresh button */}
            <button
              type="button"
              title="Reset model view"
              onClick={resetPreviewCamera}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm border-none cursor-pointer flex items-center justify-center text-gray-800 hover:bg-white transition-colors z-10"
              style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </button>

            {/* Resize Handle */}
            <div
              className="absolute bottom-0 left-0 w-8 h-8 cursor-sw-resize flex items-end justify-start z-20"
              onPointerDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
                const startX = e.clientX;
                const startWidth = panelWidth;
                const maxAllowedWidth = window.innerWidth * 0.27;
                const minAllowedWidth = window.innerWidth * 0.2;

                const onMove = (moveEvent) => {
                  const dx = moveEvent.clientX - startX;
                  // Subtract dx because dragging left (negative dx) increases width
                  setPanelWidth(
                    Math.max(
                      minAllowedWidth,
                      Math.min(maxAllowedWidth, startWidth - dx),
                    ),
                  );
                };

                const onUp = () => {
                  setIsResizing(false);
                  document.removeEventListener("pointermove", onMove);
                  document.removeEventListener("pointerup", onUp);
                };

                document.addEventListener("pointermove", onMove);
                document.addEventListener("pointerup", onUp);
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 0 L32 32 L0 32 Z" fill="#cbd5e1" />
                <line
                  x1="6"
                  y1="22"
                  x2="22"
                  y2="6"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <line
                  x1="12"
                  y1="26"
                  x2="26"
                  y2="12"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="px-3 pb-2">
        <button
          onClick={onSave}
          className="w-full py-[11px] rounded-[10px] text-white font-bold text-[15px] border-none cursor-pointer transition-all duration-200 hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
          style={{ background: "#eab308" }}
        >
          Save
        </button>
      </div>

      {/* Export Button (Below Save) */}
      {!hideExport && (
        <div className="px-3 pb-2 relative">
          <button
            onClick={() => {
              if (onExportClick) {
                onExportClick();
              } else {
                setShowExportMenu(!showExportMenu);
              }
            }}
            className="w-full py-[11px] rounded-[10px] text-white font-bold text-[15px] border-none cursor-pointer transition-all duration-200 hover:shadow-lg hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-1.5"
            style={{ background: "#c0623a" }}
          >
            {exporting ? (
              <span className="flex items-center gap-1.5 text-white">
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                Exporting...
              </span>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                Export
              </>
            )}
          </button>

          {/* Export dropdown */}
          {showExportMenu && !onExportClick && (
            <div className="absolute right-full bottom-0 mr-3 w-64 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.14)] border border-gray-100 overflow-hidden z-50">
              {/* GLB */}
              <button
                onClick={handleExportGLB}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-800 font-semibold hover:bg-orange-50 transition-colors border-none cursor-pointer bg-transparent text-left"
              >
                <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#c0623a"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
                    />
                  </svg>
                </span>
                <div className="flex flex-col">
                  <span className="text-gray-900 leading-tight mb-0.5">
                    Export 3D Model
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    .glb format
                  </span>
                </div>
              </button>

              <div className="h-px bg-gray-100 mx-4" />

              {/* Model PNG */}
              <button
                onClick={handleExportModelPNG}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-800 font-semibold hover:bg-purple-50 transition-colors border-none cursor-pointer bg-transparent text-left"
              >
                <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#7c3aed"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
                    />
                  </svg>
                </span>
                <div className="flex flex-col">
                  <span className="text-gray-900 leading-tight mb-0.5">
                    Model as .PNG
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    3D render screenshot with texture
                  </span>
                </div>
              </button>

              <div className="h-px bg-gray-100 mx-4" />

              {/* Canvas PNG */}
              <button
                onClick={handleExportCanvasPNG}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-800 font-semibold hover:bg-orange-50 transition-colors border-none cursor-pointer bg-transparent text-left"
              >
                <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#c05520"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                </span>
                <div className="flex flex-col">
                  <span className="text-gray-900 leading-tight mb-0.5">
                    Canvas as .PNG
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    2D texture file
                  </span>
                </div>
              </button>

              <div className="h-px bg-gray-100 mx-4" />

              {/* Canvas SVG */}
              <button
                onClick={handleExportSVG}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-800 font-semibold hover:bg-orange-50 transition-colors border-none cursor-pointer bg-transparent text-left"
              >
                <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="#c05520"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                    />
                  </svg>
                </span>
                <div className="flex flex-col">
                  <span className="text-gray-900 leading-tight mb-0.5">
                    Canvas as .SVG
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Vector layers (for Illustrator)
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

function MaterialItem({ icon, title, subtitle, hasArrow }) {
  const iconBg = { shadow: "#fef3c7", camera: "#fce7f3", size: "#e0e7ff" };
  const iconColor = { shadow: "#d97706", camera: "#db2777", size: "#6366f1" };
  const icons = {
    shadow: (
      <path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM6.75 9.25a.75.75 0 0 0 0 1.5h4.59l-2.1 1.95a.75.75 0 0 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 1 0-1.02 1.1l2.1 1.95H6.75Z" />
    ),
    camera: (
      <path d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    ),
    size: (
      <path
        fillRule="evenodd"
        d="M1 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V6Zm4 1.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm2 3a4 4 0 0 0-3.665 2.395.75.75 0 0 0 .416 1A8.98 8.98 0 0 0 7 14.5a8.98 8.98 0 0 0 3.249-.605.75.75 0 0 0 .416-1A4 4 0 0 0 7 10.5Z"
        clipRule="evenodd"
      />
    ),
  };

  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: iconBg[icon] }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={iconColor[icon]}
          className="w-[16px] h-[16px]"
        >
          {icons[icon]}
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-800 m-0 leading-tight">
          {title}
        </p>
        <p className="text-[10px] text-gray-400 m-0 leading-tight mt-[2px]">
          {subtitle}
        </p>
      </div>
      {hasArrow && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );
}

function CapInstance({
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

    const offsets = currentCapOffsets || {
      posX: 0,
      posY: 0,
      posZ: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
    };

    const scaleMult = transform.isLayout ? (transform.scale.y || 1) : 1;
    inner.position.set(
      (offsets.posX || 0) * scaleMult,
      (offsets.posY || 0) * scaleMult,
      (offsets.posZ || 0) * scaleMult,
    );
    inner.scale.set(
      offsets.scaleX || 1,
      offsets.scaleY || 1,
      offsets.scaleZ || 1,
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

function AutoSizedModel({
  modelUrl,
  canvasRef,
  textureCanvasRef,
  textureVersion,
  wireframe,
  customSize,
  appliedMaterials,
  appliedColors,
  bgColor,
  selectedColor,
  selectedMaterial,
  isActive,
  appliedLastApplied,
  selectedCapUrl,
}) {
  const { scene } = useGLTF(modelUrl);
  const { gl, invalidate } = useThree();

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

    let meshCount = 0;
    scene.traverse((o) => {
      if (o.isMesh) meshCount++;
    });

    const clone = cloneSkeleton(scene);
    clone.updateMatrixWorld(true);

    // Compute overall bounds to find topThresholdY for splitting
    let containerMinY = Infinity;
    let containerMaxY = -Infinity;

    clone.traverse((obj) => {
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

    const meshesToProcess = [];
    clone.traverse((obj) => {
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

      if (isLabel && !isLid) {
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

        if (spansHeight && hasTopPart && hasBottomPart) {
          const split = splitGeometry(
            obj.geometry,
            topThresholdY,
            obj.matrixWorld,
          );
          if (split.top && split.bottom) {
            obj.userData.originalGeometry = obj.geometry;
            obj.geometry = split.bottom;

            const lidLabel = new THREE.Mesh(
              split.top,
              Array.isArray(obj.material)
                ? obj.material.map((m) => m.clone())
                : obj.material.clone(),
            );
            lidLabel.name = obj.name + "_lidPart";
            lidLabel.userData.isSplitLidLabel = true;

            obj.parent.add(lidLabel);
            lidLabel.position.copy(obj.position);
            lidLabel.rotation.copy(obj.rotation);
            lidLabel.scale.copy(obj.scale);
            lidLabel.matrix.copy(obj.matrix);
            lidLabel.matrixWorld.copy(obj.matrixWorld);
          }
        }
      }
    });

    // First pass: identify label vs structural meshes and sort by height.
    const labelMeshes = [];
    const structuralMeshes = [];
    clone.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      if (isMeasurementMesh(obj, meshCount)) return;

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

    // Sort by height (highest first) — same ordering as EditorScreen1
    labelMeshes.sort((a, b) => b.y - a.y);
    structuralMeshes.sort((a, b) => b.y - a.y);

    // Second pass: clone materials, save originals, and rename to Editor1 convention
    clone.traverse((obj) => {
      // Hide measurement meshes entirely in Editor 2
      if (isMeasurementMesh(obj, meshCount)) {
        obj.visible = false;
      }

      if (!obj.isMesh || !obj.material) return;

      const processMat = (mat) => {
        if (!mat) return mat;
        const m = mat.clone();
        m.userData.originalMap = m.map;
        m.userData.originalColorHex = m.color.getHex();
        m.userData.originalRoughness = m.roughness;
        m.userData.originalMetalness = m.metalness;
        m.userData.originalTransparent = m.transparent;
        m.userData.originalOpacity = m.opacity;
        m.userData.originalSide = m.side;
        m.userData.originalTransmission =
          m.transmission !== undefined ? m.transmission : 0;
        // Remove the default map so "Upload your design" is hidden immediately
        m.map = null;
        return m;
      };

      obj.material = Array.isArray(obj.material)
        ? obj.material.map(processMat)
        : processMat(obj.material);

      // Rename materials to match Editor 1 naming convention
      const labelIndex = labelMeshes.findIndex((x) => x.obj === obj);
      if (labelIndex !== -1) {
        const mArray = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];
        mArray.forEach((m) => {
          if (labelMeshes.length === 1) m.name = "Label";
          else if (labelMeshes.length === 2)
            m.name = labelIndex === 0 ? "Lid Label" : "Body Label";
          else
            m.name =
              labelIndex === 0 ? "Lid Label" : `Body Label ${labelIndex}`;
        });
      } else {
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
              if (structIndex === 0) m.name = "Lid";
              else if (structIndex === structuralMeshes.length - 1)
                m.name = "Body";
              else {
                const originalClean = (m.name || "Part").replace(/\.\d+$/, "");
                m.name = `${originalClean} ${structIndex}`;
              }
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

  const [capTransform, setCapTransform] = useState(null);

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

          setCapTransform({
            position: pos,
            rotation: rotationEuler,
            scale: scl,
            isLayout: false,
          });
        } else {
          // Layout model: Use the anchor mesh position and orientation
          const anchor = capMeshes[0];
          anchor.updateMatrixWorld(true);
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

          let rotationEuler = new THREE.Euler().setFromQuaternion(quart);
          const isSteelBottle = modelUrl && (modelUrl.includes("Steel") || modelUrl.includes("steel"));
          if (isSteelBottle) {
            if (!anchor.geometry.boundingBox) anchor.geometry.computeBoundingBox();
            const meshBox = anchor.geometry.boundingBox.clone();
            const topLocal = new THREE.Vector3(
              (meshBox.min.x + meshBox.max.x) / 2,
              meshBox.max.y,
              (meshBox.min.z + meshBox.max.z) / 2
            );
            topLocal.applyMatrix4(localMatrix);
            pos.copy(topLocal);

            const steelQuat = quart.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI));
            rotationEuler.setFromQuaternion(steelQuat);
          }

          setCapTransform({
            position: pos,
            rotation: rotationEuler,
            scale: scl,
            isLayout: true,
          });
        }
      } else {
        capMeshes.forEach((mesh) => {
          mesh.visible = true;
        });
        setCapTransform(null);
      }
    }
  }, [clonedScene, selectedCapUrl, modelUrl]);

  const currentCapOffsets = useMemo(() => {
    if (!modelUrl || !selectedCapUrl || selectedCapUrl === "none") return null;
    const model = MODELS.find((m) => m.modelUrl === modelUrl);
    let modelKey = model ? model.id : "default";

    if (modelKey === "default") {
      const cleanUrl = modelUrl.split("?")[0].split("#")[0];
      const filename = cleanUrl.split("/").pop().replace(/\.[^/.]+$/, "");
      if (filename) modelKey = filename;
    }

    const modelConfig = BOTTLE_CAP_CONFIGS[modelKey] || {};
    const capFile = selectedCapUrl.split("/").pop();
    return modelConfig[capFile] || modelConfig["default"] || null;
  }, [modelUrl, selectedCapUrl]);
  // No uvLayout memoization needed
  const canvasTextureRef = useRef(null);
  const appliedTextureVersionRef = useRef(null);
  const appliedWireframeRef = useRef(null);
  const appliedMaterialsRef = useRef(null);
  const appliedColorsRef = useRef(null);
  const appliedBgColorRef = useRef(null);
  const appliedSelectedColorRef = useRef(null);
  const appliedActiveRef = useRef(false);

  const { autoTransform, baseDims } = useMemo(() => {
    if (!clonedScene)
      return { autoTransform: { scale: 1, offset: [0, 0, 0] }, baseDims: null };
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
    const scale = 1.7 / maxDim;
    return {
      autoTransform: {
        scale,
        offset: [-center.x * scale, -center.y * scale, -center.z * scale],
      },
      baseDims: {
        length: Math.round(size.x * 1000),
        height: Math.round(size.y * 1000),
        width: Math.round(size.z * 1000),
      },
    };
  }, [clonedScene]);

  const customScale = useMemo(() => {
    if (!baseDims || !customSize) return [1, 1, 1];
    return [
      customSize.length ? customSize.length / baseDims.length : 1,
      customSize.height ? customSize.height / baseDims.height : 1,
      customSize.width ? customSize.width / baseDims.width : 1,
    ];
  }, [baseDims, customSize]);

  // Apply texture + wireframe + materials
  useEffect(() => {
    if (
      wireframe === appliedWireframeRef.current &&
      appliedMaterials === appliedMaterialsRef.current &&
      appliedColors === appliedColorsRef.current &&
      bgColor === appliedBgColorRef.current &&
      selectedColor === appliedSelectedColorRef.current &&
      appliedActiveRef.current === isActive &&
      canvasTextureRef.current
    ) {
      return;
    }
    if (!clonedScene || !textureCanvasRef?.current) return;

    const textureCanvas = textureCanvasRef.current;
    // Create the canvas texture once
    if (!canvasTextureRef.current) {
      const tex = new THREE.CanvasTexture(textureCanvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      canvasTextureRef.current = tex;
    }

    // Always re-apply flipY so it's correct even after hot-reload or model switches.
    const tex = canvasTextureRef.current;
    tex.flipY = true;
    tex.center.set(0, 0);
    tex.rotation = 0;
    tex.needsUpdate = true;
    let meshCount = 0;
    clonedScene.traverse((o) => {
      if (o.isMesh && !o.userData.isDecal) meshCount++;
    });

    clonedScene.traverse((obj) => {
      if (!obj.isMesh || obj.userData.isDecal) return;

      if (isMeasurementMesh(obj, meshCount)) return;

      // Relink or clear stale serialized decalMesh reference (can happen when importing a previously exported scene)
      if (obj.userData.decalMesh && !(obj.userData.decalMesh instanceof THREE.Mesh)) {
        obj.userData.decalMesh = null;
      }
      if (!obj.userData.decalMesh) {
        const existingDecal = obj.children.find((c) => c.isMesh && c.userData.isDecal);
        if (existingDecal) {
          obj.userData.decalMesh = existingDecal;
        }
      }

      const shouldApply = (() => {
        let hasLabelMesh = false;
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
              hasLabelMesh = true;
            }
          }
        });

        if (hasLabelMesh) {
          const n = (obj.name || "").toLowerCase();
          const mats = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];
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
          return (
            n.includes("label") ||
            n.includes("wrapper") ||
            n.includes("design") ||
            n.includes("artwork") ||
            hasLabelMat
          );
        }
        return true;
      })();

      if (!shouldApply) {
        if (obj.userData.decalMesh) {
          obj.userData.decalMesh.visible = false;
        }
      } else {
        if (obj.userData.decalMesh) {
          obj.userData.decalMesh.visible = true;
        }
      }

      const materials = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];
      for (const mat of materials) {
        if (!mat) continue;

        if (shouldApply) {
          // --- OVERLAY CANVAS TEXTURE VIA DECAL MESH ---
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
          decalMat.map = canvasTextureRef.current;
          decalMat.color.set(0xffffff);
          decalMat.needsUpdate = true;
        }

        const hasArtwork = canvasRef?.current?.hasArtwork?.();
        // Only apply the live selectedColor/bgColor to the currently-selected material.
        // This prevents the Editor 2 color picker from repainting all parts at once.
        const isTargetMaterial =
          !selectedMaterial ||
          selectedMaterial === "all" ||
          selectedMaterial === "none" ||
          mat.name === selectedMaterial;

        // When a live face color is active for this material, hide the decal so the
        // base mesh color shows through (mirrors the EditorScreen1 textureUrl suppression).
        if (shouldApply && obj.userData.decalMesh) {
          obj.userData.decalMesh.visible = true;
        }

        // --- CALCULATE PRIORITY OF ACTIONS ---
        const lookup = (stateObj) => {
          if (!stateObj) return null;
          if (stateObj[mat.name] !== undefined) return stateObj[mat.name];
          return stateObj["all"] !== undefined ? stateObj["all"] : null;
        };

        const last =
          selectedColor && selectedColor !== "none" && isTargetMaterial
            ? "color"
            : lookup(appliedLastApplied);

        let colorHex =
          last === "material"
            ? null
            : selectedColor && selectedColor !== "none" && isTargetMaterial
              ? bgColor
              : lookup(appliedColors);

        let materialType = last === "color" ? null : lookup(appliedMaterials);

        // If it's a label mesh but has no explicit color/material, inherit from the lid/body
        // so its background doesn't remain white when the rest of the model is colored.
        if (
          shouldApply &&
          !colorHex &&
          !materialType &&
          (appliedColors || appliedMaterials)
        ) {
          const tryInherit = (appliedObj) => {
            if (!appliedObj) return null;
            const keys = Object.keys(appliedObj).filter((k) => k !== "all");
            if (keys.length === 0) return null;

            const labelName = (obj.name + "_" + mat.name).toLowerCase();
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

            if (isLidLabel && !isBodyLabel && lidKey) {
              const val = appliedObj[lidKey];
              return val === "transparent" ? null : val;
            }
            if (isBodyLabel && !isLidLabel && bodyKey) {
              const val = appliedObj[bodyKey];
              return val === "transparent" ? null : val;
            }

            // Fallback position check
            if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
            const center = new THREE.Vector3();
            obj.geometry.boundingBox.getCenter(center);

            if (center.y > 0.04) {
              const val = lidKey ? appliedObj[lidKey] : null;
              return val === "transparent" ? null : val;
            } else {
              const val = bodyKey ? appliedObj[bodyKey] : null;
              return val === "transparent" ? null : val;
            }
          };
          if (!colorHex && last !== "material")
            colorHex = tryInherit(appliedColors);
          if (!materialType && last !== "color")
            materialType = tryInherit(appliedMaterials);
        }

        // --- APPLY PBR MATERIALS TO BASE MESH ---
        if (typeof materialType === "object" && materialType !== null) {
          // PBR Material
          if (mat.userData.currentPbrId !== materialType.id) {
            mat.userData.currentPbrId = materialType.id;
            mat.color.setHex(0xffffff);
            mat.map = null;
            mat.normalMap = null;
            mat.roughnessMap = null;
            mat.metalnessMap = null;
            mat.aoMap = null;
            mat.bumpMap = null;

            const loadMap = (url, mapType, isColorSpace) => {
              if (!url) return;
              new THREE.TextureLoader().load(url, (texture) => {
                texture.wrapS = THREE.MirroredRepeatWrapping;
                texture.wrapT = THREE.MirroredRepeatWrapping;
                texture.flipY = false;
                const imageAspect =
                  texture.image?.width && texture.image?.height
                    ? texture.image.width / texture.image.height
                    : 1;
                const repeatBase = 3;
                texture.repeat.set(repeatBase, repeatBase * imageAspect);
                if (isColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
                mat[mapType] = texture;
                mat.needsUpdate = true;
                invalidate();
              });
            };

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
              mat.bumpScale = 0.03;
            }

            mat.roughness = materialType.maps.roughness ? 1.0 : 0.65;
            mat.metalness = materialType.maps.metallic ? 1.0 : 0.0;
            mat.needsUpdate = true;
          }
        } else {
          // No PBR Material
          if (mat.userData.currentPbrId !== null) {
            mat.userData.currentPbrId = null;
            mat.normalMap = null;
            mat.roughnessMap = null;
            mat.metalnessMap = null;
            mat.aoMap = null;
            mat.roughness = Math.max(0.72, mat.roughness);
            mat.metalness = 0;
            mat.needsUpdate = true;
          }
        }

        // --- APPLY COLORS ---
        let finalColorHex = null;
        let isTransparent = false;

        if (colorHex === "transparent") {
          isTransparent = true;
        } else if (colorHex) {
          finalColorHex = colorHex;
        } else if (modelUrl && modelUrl.toLowerCase().includes("tape")) {
          finalColorHex = "#ffffff";
        }

        if (isTransparent) {
          mat.userData.currentPbrId = null;
          if (mat.normalMap) mat.normalMap.dispose();
          if (mat.roughnessMap) mat.roughnessMap.dispose();
          if (mat.metalnessMap) mat.metalnessMap.dispose();
          if (mat.aoMap) mat.aoMap.dispose();
          mat.normalMap = null;
          mat.roughnessMap = null;
          mat.metalnessMap = null;
          mat.aoMap = null;

          mat.transparent = true;
          mat.opacity = 0.35;
          mat.roughness = 0.1;
          mat.metalness = 0.1;
          if ("transmission" in mat) mat.transmission = 0.9;
          mat.color.setHex(0xffffff);
          if (mat.map) mat.map.dispose();
          mat.map = null;
          mat.needsUpdate = true;
        } else if (finalColorHex) {
          mat.userData.currentPbrId = null;
          if (mat.normalMap) mat.normalMap.dispose();
          if (mat.roughnessMap) mat.roughnessMap.dispose();
          if (mat.metalnessMap) mat.metalnessMap.dispose();
          if (mat.aoMap) mat.aoMap.dispose();
          mat.normalMap = null;
          mat.roughnessMap = null;
          mat.metalnessMap = null;
          mat.aoMap = null;

          // A custom color is applied, override properties to look opaque
          const wasOriginallyTransparent =
            mat.userData.originalTransparent ||
            (mat.userData.originalTransmission &&
              mat.userData.originalTransmission > 0);
          if (wasOriginallyTransparent) {
            mat.transparent = true;
            mat.opacity =
              mat.userData.originalOpacity !== undefined
                ? mat.userData.originalOpacity
                : 0.35;
            mat.roughness =
              mat.userData.originalRoughness !== undefined
                ? mat.userData.originalRoughness
                : 0.1;
            mat.metalness =
              mat.userData.originalMetalness !== undefined
                ? mat.userData.originalMetalness
                : 0.1;
            if ("transmission" in mat) {
              mat.transmission =
                mat.userData.originalTransmission !== undefined
                  ? mat.userData.originalTransmission
                  : 0.9;
            }
          } else {
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.roughness = 0.72;
            mat.metalness = 0.0;
            if ("transmission" in mat) mat.transmission = 0;
          }
          mat.color.set(finalColorHex);
          if (mat.map) mat.map.dispose();
          mat.map = null;
          mat.needsUpdate = true;
        } else {
          // Restore original model properties!
          mat.transparent =
            mat.userData.originalTransparent !== undefined
              ? mat.userData.originalTransparent
              : false;
          mat.opacity =
            mat.userData.originalOpacity !== undefined
              ? mat.userData.originalOpacity
              : 1.0;
          mat.roughness =
            mat.userData.originalRoughness !== undefined
              ? mat.userData.originalRoughness
              : 0.5;
          mat.metalness =
            mat.userData.originalMetalness !== undefined
              ? mat.userData.originalMetalness
              : 0.1;
          if (
            mat.userData.originalTransmission !== undefined &&
            "transmission" in mat
          ) {
            mat.transmission = mat.userData.originalTransmission;
          }

          if (!materialType) {
            // Restore Original color only, keep map null to hide "upload your design"
            if (mat.userData.originalColorHex !== undefined) {
              mat.color.setHex(mat.userData.originalColorHex);
            }
            if (mat.map !== null && !mat.userData.currentPbrId) {
              mat.map = null;
            }
            mat.needsUpdate = true;
          } else if (materialType) {
            // For PBR materials with no custom color, default to white
            mat.color.setHex(0xffffff);
            if (mat.map !== null && !mat.userData.currentPbrId) {
              mat.map = null;
            }
            mat.needsUpdate = true;
          }
        }

        if ("envMapIntensity" in mat) mat.envMapIntensity = 0.08;
        if (mat.userData.originalSide !== undefined) {
          mat.side = mat.userData.originalSide;
        } else if (mat.side !== undefined) {
          mat.side = THREE.DoubleSide;
        }
        if ("toneMapped" in mat) mat.toneMapped = true;
        mat.needsUpdate = true;
      }

      // Wireframe overlay
      let wireframeLines = obj.children.find(
        (c) => c.isLineSegments && c.name === "wireframeHelper",
      );
      if (wireframe && !wireframeLines) {
        const geo = new THREE.WireframeGeometry(obj.geometry);
        const mat = new THREE.LineBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.15,
        });
        const line = new THREE.LineSegments(geo, mat);
        line.name = "wireframeHelper";
        obj.add(line);
      } else if (!wireframe && wireframeLines) {
        obj.remove(wireframeLines);
        wireframeLines.geometry.dispose();
        wireframeLines.material.dispose();
      }
    });

    appliedWireframeRef.current = wireframe;
    appliedMaterialsRef.current = appliedMaterials;
    appliedColorsRef.current = appliedColors;
    appliedBgColorRef.current = bgColor;
    appliedSelectedColorRef.current = selectedColor;
    appliedActiveRef.current = true;
    invalidate();
  }, [
    clonedScene,
    gl,
    textureCanvasRef,
    wireframe,
    appliedMaterials,
    appliedColors,
    bgColor,
    selectedColor,
    isActive,
    invalidate,
  ]);

  // Fast-path for just updating the texture without re-traversing the scene
  useEffect(() => {
    if (textureVersion === appliedTextureVersionRef.current) return;

    if (canvasTextureRef.current && textureCanvasRef?.current) {
      // Just mark needsUpdate. Three.js will upload the new canvas pixels to GPU.
      canvasTextureRef.current.needsUpdate = true;
      invalidate();
    }
    appliedTextureVersionRef.current = textureVersion;
  }, [textureVersion, textureCanvasRef, invalidate]);

  if (!clonedScene) return null;

  return (
    <group
      position={autoTransform.offset}
      scale={autoTransform.scale}
      rotation={[0, Math.PI / 6, 0]}
    >
      <group scale={customScale}>
        <primitive object={clonedScene} dispose={null} />
        {selectedCapUrl && selectedCapUrl !== "none" && capTransform && (
          <CustomCap
            url={selectedCapUrl}
            transform={capTransform}
            appliedColors={appliedColors}
            currentCapOffsets={currentCapOffsets}
          />
        )}
      </group>
    </group>
  );
}

// Lives inside R3FCanvas — uses useThree to access the live renderer, scene, camera
const ScreenshotHelper = forwardRef((_, ref) => {
  const { gl, scene, camera } = useThree();

  useImperativeHandle(ref, () => ({
    capture: () => {
      // Save current pixel ratio
      const currentPixelRatio = gl.getPixelRatio();

      // Temporarily set a high pixel ratio for a high-quality render
      gl.setPixelRatio(4);

      // Force a fresh render with the high-res state
      gl.render(scene, camera);

      // Read the framebuffer
      const url = gl.domElement.toDataURL("image/png", 1.0);

      // Restore original state to prevent the UI from staying high-res/slow
      gl.setPixelRatio(currentPixelRatio);
      gl.render(scene, camera);

      const a = document.createElement("a");
      a.href = url;
      a.download = "model-render-high-res.png";
      a.click();
    },
  }));

  return null;
});
