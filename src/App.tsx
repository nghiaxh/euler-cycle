// App.tsx
import React from "react";
import TitleBar from "./components/TitleBar";
import Toolbar from "./components/Toolbar";
import Canvas from "./components/Canvas";

const App: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 flex flex-col">
      <TitleBar />
      <div className="flex-1 relative overflow-hidden">
        <Canvas />
        <Toolbar />
      </div>
    </div>
  );
};

export default App;
