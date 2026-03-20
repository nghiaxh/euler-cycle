// Toolbar.tsx
import React, { useRef } from "react";
import { useStore } from "../store";
import { countConnectedComponents, findEulerCircuit } from "../utils/algorithms";
import toast, { Toaster } from "react-hot-toast";
import { CircleCheckBig, Search, ChartNetwork, Upload, Download, Trash, HelpCircleIcon } from "lucide-react";

const Toolbar: React.FC = () => {
  const { nodes, edges, clearGraph, setGraph } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCountConnectivity = () => {
    const components = countConnectedComponents(nodes, edges);
    if (components === 0) {
      toast.error("Đồ thị rỗng");
    } else if (components === 1) {
      toast.success("Đồ thị liên thông");
    } else {
      toast.error(`Đồ thị không liên thông (${components} thành phần)`);
    }
  };

  const handleFindEuler = () => {
    const circuit = findEulerCircuit(nodes, edges);
    if (circuit) {
      toast.success(`Chu trình Euler\n${circuit.join(" ➔ ")}`, { duration: 4000 });
    } else {
      toast.error("Không có chu trình Euler");
    }
  };

  const loadMockup = () => {
    setGraph({
      nodes: [
        { id: "n1", x: 150, y: 150, label: "1" },
        { id: "n2", x: 150, y: 350, label: "2" },
        { id: "n3", x: 325, y: 250, label: "3" },
        { id: "n4", x: 500, y: 150, label: "4" },
        { id: "n5", x: 500, y: 350, label: "5" },
      ],
      edges: [
        { id: "e1", from: "n1", to: "n2" },
        { id: "e2", from: "n2", to: "n3" },
        { id: "e3", from: "n3", to: "n1" },
        { id: "e4", from: "n3", to: "n4" },
        { id: "e5", from: "n4", to: "n5" },
        { id: "e6", from: "n5", to: "n3" },
      ],
    });
    toast.success("Đã tải đồ thị mẫu");
  };

  const exportJSON = () => {
    if (nodes.length === 0) {
      toast.error("Không có dữ liệu");
      return;
    }
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "graph.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất JSON");
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.nodes && json.edges) {
          setGraph(json);
          toast.success(`Đã nhập ${json.nodes.length} đỉnh`);
        } else {
          toast.error("File không hợp lệ");
        }
      } catch {
        toast.error("Lỗi đọc file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClearGraph = () => {
    clearGraph();
    toast.success("Xóa đồ thị thành công");
  };

  return (
    <>
      {/* Toaster đặt ở top-center */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Toolbar cố định dưới cùng */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg px-4 py-2 flex items-center gap-2 z-50">
        <button onClick={handleCountConnectivity} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" title="Kiểm tra liên thông">
          <CircleCheckBig />
        </button>
        <button onClick={handleFindEuler} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" title="Tìm chu trình Euler">
          <Search />
        </button>
        <button onClick={loadMockup} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" title="Tải đồ thị mẫu">
          <ChartNetwork />
        </button>
        <button onClick={exportJSON} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" title="Xuất JSON">
          <Download />
        </button>
        <label className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" title="Nhập JSON">
          <Upload />
          <input type="file" className="hidden" accept=".json" onChange={importJSON} ref={fileInputRef} />
        </label>
        <button onClick={handleClearGraph} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" title="Xóa đồ thị">
          <Trash />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" title="Trợ giúp">
          <HelpCircleIcon />
        </button>
      </div>
    </>
  );
};

export default Toolbar;
