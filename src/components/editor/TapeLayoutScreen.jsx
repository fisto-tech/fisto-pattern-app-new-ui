import React, { useState, useEffect, useRef } from "react";

export default function TapeLayoutScreen({ onSave, onCancel }) {
  const [image, setImage] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState(300);
  const [layoutWidth, setLayoutWidth] = useState(60);
  const [layoutHeight, setLayoutHeight] = useState(48);
  const [repeatGap, setRepeatGap] = useState(30);
  const [copies, setCopies] = useState(5);

  const canvasRef = useRef(null);

  const totalCanvasHeight = layoutHeight + 12; // Calculated as Layout Height + 12mm
  const printSpan = layoutWidth * copies + repeatGap * (copies - 1);
  const effectiveCanvasWidth = Math.max(canvasWidth, printSpan);

  // Canvas pixel resolution
  const PPI = 300;
  const mmToPx = (mm) => (mm * PPI) / 25.4;

  const canvasResWidth = Math.round(mmToPx(effectiveCanvasWidth));
  const canvasResHeight = Math.round(mmToPx(totalCanvasHeight));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setImage(img);
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawCanvas = (withBackground = false) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const widthPx = canvasResWidth;
    const heightPx = canvasResHeight;

    // Clear canvas
    ctx.clearRect(0, 0, widthPx, heightPx);
    if (withBackground) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, widthPx, heightPx);
    }

    if (!image) return;

    // Calculate dimensions in pixels
    const layoutWidthPx = mmToPx(layoutWidth);
    const layoutHeightPx = mmToPx(layoutHeight);
    const repeatGapPx = mmToPx(repeatGap);

    // Draw copies centered vertically and starting from left (or centered horizontally)
    const printSpanPx = mmToPx(printSpan);
    const startX = (widthPx - printSpanPx) / 2;
    const startY = (heightPx - layoutHeightPx) / 2;

    for (let i = 0; i < copies; i++) {
      const x = startX + i * (layoutWidthPx + repeatGapPx);

      // Preserve aspect ratio (object-fit: contain)
      const imgW = image.naturalWidth || image.width;
      const imgH = image.naturalHeight || image.height;
      const imgAspect = imgW && imgH ? imgW / imgH : 1;
      const boxAspect = layoutWidthPx / layoutHeightPx;
      let drawW, drawH, drawX, drawY;

      if (imgAspect > boxAspect) {
        drawW = layoutWidthPx;
        drawH = layoutWidthPx / imgAspect;
      } else {
        drawH = layoutHeightPx;
        drawW = layoutHeightPx * imgAspect;
      }

      drawX = x + (layoutWidthPx - drawW) / 2;
      drawY = startY + (layoutHeightPx - drawH) / 2;

      ctx.drawImage(image, drawX, drawY, drawW, drawH);
    }
  };

  useEffect(() => {
    drawCanvas(false);
  }, [image, canvasWidth, layoutWidth, layoutHeight, repeatGap, copies]);

  const handleSave = () => {
    if (!image) return;
    const tempCanvas = document.createElement("canvas");
    // Swap width and height for 90 degree rotation
    tempCanvas.width = canvasResHeight;
    tempCanvas.height = canvasResWidth;
    const ctx = tempCanvas.getContext("2d");

    // Rotate 90 degrees clockwise
    ctx.translate(canvasResHeight, 0);
    ctx.rotate(Math.PI / 2);

    const layoutWidthPx = mmToPx(layoutWidth);
    const layoutHeightPx = mmToPx(layoutHeight);
    const repeatGapPx = mmToPx(repeatGap);
    const printSpanPx = mmToPx(printSpan);
    const startX = (canvasResWidth - printSpanPx) / 2;
    const startY = (canvasResHeight - layoutHeightPx) / 2;

    for (let i = 0; i < copies; i++) {
      const x = startX + i * (layoutWidthPx + repeatGapPx);
      const imgW = image.naturalWidth || image.width;
      const imgH = image.naturalHeight || image.height;
      const imgAspect = imgW && imgH ? imgW / imgH : 1;
      const boxAspect = layoutWidthPx / layoutHeightPx;
      let drawW, drawH, drawX, drawY;

      if (imgAspect > boxAspect) {
        drawW = layoutWidthPx;
        drawH = layoutWidthPx / imgAspect;
      } else {
        drawH = layoutHeightPx;
        drawW = layoutHeightPx * imgAspect;
      }

      drawX = x + (layoutWidthPx - drawW) / 2;
      drawY = startY + (layoutHeightPx - drawH) / 2;

      ctx.drawImage(image, drawX, drawY, drawW, drawH);
    }

    const dataUrl = tempCanvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  const handleExport = () => {
    if (!image) return;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvasResWidth;
    tempCanvas.height = canvasResHeight;
    const ctx = tempCanvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasResWidth, canvasResHeight);

    const layoutWidthPx = mmToPx(layoutWidth);
    const layoutHeightPx = mmToPx(layoutHeight);
    const repeatGapPx = mmToPx(repeatGap);
    const printSpanPx = mmToPx(printSpan);
    const startX = (canvasResWidth - printSpanPx) / 2;
    const startY = (canvasResHeight - layoutHeightPx) / 2;

    for (let i = 0; i < copies; i++) {
      const x = startX + i * (layoutWidthPx + repeatGapPx);
      const imgW = image.naturalWidth || image.width;
      const imgH = image.naturalHeight || image.height;
      const imgAspect = imgW && imgH ? imgW / imgH : 1;
      const boxAspect = layoutWidthPx / layoutHeightPx;
      let drawW, drawH, drawX, drawY;

      if (imgAspect > boxAspect) {
        drawW = layoutWidthPx;
        drawH = layoutWidthPx / imgAspect;
      } else {
        drawH = layoutHeightPx;
        drawW = layoutHeightPx * imgAspect;
      }

      drawX = x + (layoutWidthPx - drawW) / 2;
      drawY = startY + (layoutHeightPx - drawH) / 2;

      ctx.drawImage(image, drawX, drawY, drawW, drawH);
    }

    const dataUrl = tempCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "tape-layout.png";
    a.click();
  };

  const handleReset = () => {
    setLayoutWidth(60);
    setLayoutHeight(48);
    setRepeatGap(30);
    setCopies(5);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm font-sans">
      <div className="bg-[#f8fafc] w-full max-w-[1200px] h-[85vh] mt-[5vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative border border-white/20">
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden p-6 gap-6 min-h-0">
          {/* Left Sidebar */}
          <div className="w-80 shrink-0 flex flex-col gap-4">
            {/* Image Upload */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-[#c0623a] uppercase tracking-wider mb-3 mt-0">
                1. Image Upload
              </h3>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-[#f8ede8] text-[#c0623a] font-semibold rounded-lg cursor-pointer hover:bg-[#eabfb0] transition-colors text-sm">
                  Choose file
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-slate-500 truncate">
                  {image ? "Image loaded" : "No file chosen"}
                </span>
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
              <h3 className="text-xs font-bold text-[#c0623a] uppercase tracking-wider m-0">
                2. Dimensions (MM)
              </h3>

              {/* Canvas Width */}
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Canvas Width
                </label>
                <input
                  type="number"
                  value={canvasWidth}
                  onChange={(e) => setCanvasWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#c0623a] focus:ring-1 focus:ring-[#c0623a]"
                />
              </div>

              {/* Layout Width & Height */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Layout Width
                  </label>
                  <input
                    type="number"
                    value={layoutWidth}
                    onChange={(e) => setLayoutWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#c0623a] focus:ring-1 focus:ring-[#c0623a]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Layout Height
                  </label>
                  <input
                    type="number"
                    value={layoutHeight}
                    onChange={(e) => setLayoutHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#c0623a] focus:ring-1 focus:ring-[#c0623a]"
                  />
                </div>
              </div>

              {/* Repeat Gap */}
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Repeat Gap
                </label>
                <input
                  type="number"
                  value={repeatGap}
                  onChange={(e) => setRepeatGap(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#c0623a] focus:ring-1 focus:ring-[#c0623a]"
                />
              </div>

              {/* Copies */}
              <div>
                <label className="text-xs font-medium text-slate-500">
                  Copies
                </label>
                <input
                  type="number"
                  value={copies}
                  onChange={(e) => setCopies(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-[#c0623a] focus:ring-1 focus:ring-[#c0623a]"
                />
              </div>

              {/* Total Height Card */}
              <div className="mt-2 bg-[#c0623a] rounded-xl p-4 text-white">
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/80 mb-1">
                  Total Canvas Height
                </div>
                <div className="text-3xl font-black tracking-tight leading-none mb-1">
                  {totalCanvasHeight}mm
                </div>
                <div className="text-[11px] text-white/80">
                  Calculated as Layout Height + 12mm
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="mt-2 w-full py-2.5 rounded-xl font-bold text-sm text-[#c0623a] bg-[#fdfdfd] border border-[#eabfb0] hover:bg-[#f8ede8] transition-colors cursor-pointer shadow-sm"
              >
                Reset Default Values
              </button>
            </div>
          </div>

          {/* Right Preview Area */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <div className="flex-1 bg-[#f1f1f1] rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center p-8 overflow-hidden">
              {/* Visual representation of the layout */}
              <div
                className="relative shadow-md bg-white mx-auto shrink-0"
                style={{
                  width: "100%",
                  maxHeight: "240px",
                  aspectRatio: `${canvasWidth} / ${totalCanvasHeight}`,
                  backgroundImage:
                    "linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
              >
                {/* This is the invisible actual canvas used for generating the output image */}
                <canvas
                  ref={canvasRef}
                  width={canvasResWidth}
                  height={canvasResHeight}
                  style={{ position: "absolute", opacity: 0, pointerEvents: "none", zIndex: -1 }}
                />

                {/* Visual preview elements (red lines, etc.) */}
                {image && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="relative border border-red-400/50 flex"
                      style={{
                        width: `${(printSpan / canvasWidth) * 100}%`,
                        height: `${(layoutHeight / totalCanvasHeight) * 100}%`,
                      }}
                    >
                      {Array.from({ length: copies }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute h-full flex items-center justify-center"
                          style={{
                            width: `${(layoutWidth / printSpan) * 100}%`,
                            left: `${((i * (layoutWidth + repeatGap)) / printSpan) * 100}%`,
                          }}
                        >
                          <img
                            src={image.src}
                            alt=""
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Stats */}
            <div className="flex justify-end ">
              <div className="flex items-center gap-3 bg-white shadow-sm shrink-0 rounded-xl border border-slate-200 p-4 ">
                <button
                  onClick={onCancel}
                  className="px-5 py-2.5 rounded-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  className="px-5 py-2.5 rounded-lg font-bold text-[#c0623a] bg-[#fdfdfd] border border-[#eabfb0] hover:bg-[#f8ede8] transition-colors cursor-pointer"
                >
                  Export PNG
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-lg font-bold text-white bg-[#c0623a] hover:bg-[#a54f2c] transition-colors border-none cursor-pointer shadow-md"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
