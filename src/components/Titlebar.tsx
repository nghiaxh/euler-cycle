import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X, ChartNetwork } from "lucide-react";

const appWindow = getCurrentWindow();

const TitleBar: React.FC = () => {
  const handleMinimize = async () => {
    await appWindow.minimize();
  };

  const handleMaximize = async () => {
    const isMaximized = await appWindow.isMaximized();
    if (isMaximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  };

  const handleClose = async () => {
    await appWindow.close();
  };

  return (
    <div data-tauri-drag-region className="h-8 w-full flex items-center justify-between border-gray-100 select-none shrink-0 shadow-xl">
      {/* Logo + App name */}
      <div data-tauri-drag-region className="flex items-center gap-1.5 mx-2 pointer-events-none">
        <ChartNetwork size={24} className="text-slate-600" />
      </div>

      {/* Window controls */}
      <div className="flex items-center">
        {/* Minimize */}
        <button onClick={handleMinimize} className="w-13 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800 cursor-pointer" title="Thu nhỏ">
          <Minus size={13} />
        </button>

        {/* Maximize / Restore */}
        <button onClick={handleMaximize} className="w-13 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800 cursor-pointer" title="Phóng to">
          <Square size={13} />
        </button>

        {/* Close */}
        <button onClick={handleClose} className="w-13 h-8 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors text-gray-500 cursor-pointer" title="Đóng">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
