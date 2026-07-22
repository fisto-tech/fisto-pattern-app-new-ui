import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const tools = [
  {
    id: "models",
    label: "MODELS",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-[2.2vw] h-[2.2vh]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
        />
      </svg>
    ),
  },
  {
    id: "edit",
    label: "Edit",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-[2.2vw] h-[2.2vh]"
      >
        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
      </svg>
    ),
  },
  {
    id: "layout",
    label: "LAYOUT",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-[2.2vw] h-[2.2vh]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
        />
      </svg>
    ),
  },
  {
    id: "scene",
    label: "SCENE",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-[2.2vw] h-[2.2vh]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
        />
      </svg>
    ),
  },
  {
    id: "gallery",
    label: "GALLERY",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-[2.2vw] h-[2.2vh]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    ),
  },
];

export default function LeftSidebar({ active, setActive, items }) {
  const navigate = useNavigate();
  const displayTools = items
    ? tools.filter((t) => items.includes(t.id))
    : tools;
  const [lastActive, setLastActive] = useState("models");

  useEffect(() => {
    if (active) {
      setLastActive(active);
    }
  }, [active]);

  return (
    <aside
      className="
      left-sidebar-container
      flex flex-col items-center py-5 gap-2.5
      bg-white/95 backdrop-blur-md rounded-2xl
      border border-gray-100/80
      shadow-[0_12px_40px_rgba(0,0,0,0.06)]
      w-[52px] sm:w-[60px] h-fit shrink-0
      overflow-y-auto overflow-x-hidden scrollbar-hide
      z-30 transition-all duration-300
    "
    >
      <style>{`
        @media (max-height: 800px) {
          .left-sidebar-container {
            padding-top: 10px !important;
            padding-bottom: 10px !important;
            gap: 6px !important;
          }
          .left-sidebar-button {
            padding-top: 6px !important;
            padding-bottom: 6px !important;
          }
        }
      `}</style>

      {/* Back button to mockup page */}
      <button
        onClick={() => navigate("/modelsMockup")}
        className="
          flex flex-col items-center justify-center gap-1 border-none cursor-pointer bg-transparent
          text-gray-400 hover:text-[#C15F27] transition-all duration-200 w-full py-1.5 group shrink-0
        "
        title="Back to Mockups"
      >
        <div className="w-8 h-8 rounded-xl bg-gray-50 group-hover:bg-orange-50 flex items-center justify-center transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </div>
        <span className="text-[9px] font-bold tracking-wider">BACK</span>
      </button>

      <div className="w-7 h-[1px] bg-gray-100 my-0.5 shrink-0" />

      {displayTools.map((tool) => {
        const isActive = active === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => setActive(isActive ? null : tool.id)}
            className={`
              left-sidebar-button
              relative flex flex-col items-center justify-center gap-1 border-none cursor-pointer bg-transparent
              transition-all duration-200 w-full py-2 group
            `}
          >
            <div
              className={`
                w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                ${
                  isActive
                    ? "bg-[#C15F27] text-white shadow-md shadow-orange-500/20 scale-105"
                    : "text-gray-400 group-hover:text-gray-700 group-hover:bg-gray-50"
                }
              `}
            >
              {tool.icon}
            </div>
            <span
              className={`text-[9px] font-bold tracking-wider transition-colors ${
                isActive ? "text-[#C15F27]" : "text-gray-400 group-hover:text-gray-600"
              }`}
            >
              {tool.label}
            </span>
          </button>
        );
      })}

      <div className="w-7 h-[1px] bg-gray-100 my-0.5 shrink-0" />

      <button
        onClick={() => setActive(active ? null : lastActive)}
        className="flex items-center justify-center border-none cursor-pointer bg-transparent text-gray-400 hover:text-[#C15F27] transition-all duration-200 py-1.5 w-full shrink-0"
        title={active ? "Close Panel" : "Open Panel"}
      >
        <div className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-orange-50 flex items-center justify-center transition-colors">
          {active ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-3.5 h-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-3.5 h-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          )}
        </div>
      </button>
    </aside>
  );
}
