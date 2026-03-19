import React from "react";
import Toolbar from "./components/Toolbar";
import Canvas from "./components/Canvas";

const App: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50">
      <Canvas />
      <Toolbar />
    </div>
  );
};

export default App;
