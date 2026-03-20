import React, { useState, useRef } from "react";
import { useStore } from "../store";

const Canvas: React.FC = () => {
  const { nodes, edges, addNode, addEdge, removeNode, removeEdge, moveNode, dragStartNodeId, setDragStartNode } = useStore();

  const [movingNodeId, setMovingNodeId] = useState<string | null>(null);
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Refs cho thao tác kéo
  const isDraggingRef = useRef(false);
  const dragNodeIdRef = useRef<string | null>(null);
  const nodeRefs = useRef<Map<string, SVGGElement>>(new Map());
  const edgeLineRefs = useRef<Map<string, { thick: SVGLineElement | null; thin: SVGLineElement | null }>>(new Map());
  const tempLineRef = useRef<SVGLineElement | null>(null);
  const dragRectRef = useRef<SVGRectElement | null>(null);

  // Lấy tọa độ tương đối trong SVG
  const getLocalCoords = (e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Cập nhật vị trí node trực tiếp trên DOM
  const updateNodePosition = (nodeId: string, x: number, y: number) => {
    const g = nodeRefs.current.get(nodeId);
    if (g) {
      g.setAttribute("transform", `translate(${x}, ${y})`);
    }
  };

  // Lấy tọa độ hiện tại của node từ DOM
  const getNodePosition = (nodeId: string): { x: number; y: number } | null => {
    const g = nodeRefs.current.get(nodeId);
    if (!g) return null;
    const transform = g.getAttribute("transform");
    if (!transform) return null;
    const match = transform.match(/translate\(([^,]+), ([^)]+)\)/);
    if (match) {
      return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
    }
    return null;
  };

  // Cập nhật cạnh liên quan đến node đang kéo
  const updateEdgesForDraggedNode = (draggedId: string, newX: number, newY: number) => {
    edges.forEach((edge) => {
      if (edge.from === draggedId || edge.to === draggedId) {
        const lineRefs = edgeLineRefs.current.get(edge.id);
        if (!lineRefs) return;

        // Xác định tọa độ của đầu kia
        const otherId = edge.from === draggedId ? edge.to : edge.from;
        const otherPos = getNodePosition(otherId);
        if (!otherPos) return;

        // Cập nhật cả hai đường (thick và thin)
        if (lineRefs.thick) {
          lineRefs.thick.setAttribute("x1", String(edge.from === draggedId ? newX : otherPos.x));
          lineRefs.thick.setAttribute("y1", String(edge.from === draggedId ? newY : otherPos.y));
          lineRefs.thick.setAttribute("x2", String(edge.to === draggedId ? newX : otherPos.x));
          lineRefs.thick.setAttribute("y2", String(edge.to === draggedId ? newY : otherPos.y));
        }
        if (lineRefs.thin) {
          lineRefs.thin.setAttribute("x1", String(edge.from === draggedId ? newX : otherPos.x));
          lineRefs.thin.setAttribute("y1", String(edge.from === draggedId ? newY : otherPos.y));
          lineRefs.thin.setAttribute("x2", String(edge.to === draggedId ? newX : otherPos.x));
          lineRefs.thin.setAttribute("y2", String(edge.to === draggedId ? newY : otherPos.y));
        }
      }
    });
  };

  // Cập nhật đường kéo tạm
  const updateTempLine = (x1: number, y1: number, x2: number, y2: number) => {
    if (tempLineRef.current) {
      tempLineRef.current.setAttribute("x1", String(x1));
      tempLineRef.current.setAttribute("y1", String(y1));
      tempLineRef.current.setAttribute("x2", String(x2));
      tempLineRef.current.setAttribute("y2", String(y2));
    }
  };

  // Cập nhật hình chữ nhật chọn vùng
  const updateDragRect = (x: number, y: number, width: number, height: number) => {
    if (dragRectRef.current) {
      dragRectRef.current.setAttribute("x", String(x));
      dragRectRef.current.setAttribute("y", String(y));
      dragRectRef.current.setAttribute("width", String(width));
      dragRectRef.current.setAttribute("height", String(height));
    }
  };

  // Ẩn đường tạm
  const hideTempLine = () => {
    if (tempLineRef.current) {
      tempLineRef.current.setAttribute("x1", "0");
      tempLineRef.current.setAttribute("y1", "0");
      tempLineRef.current.setAttribute("x2", "0");
      tempLineRef.current.setAttribute("y2", "0");
    }
  };

  // Ẩn hình chữ nhật
  const hideDragRect = () => {
    if (dragRectRef.current) {
      dragRectRef.current.setAttribute("width", "0");
      dragRectRef.current.setAttribute("height", "0");
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) return;
    const coords = getLocalCoords(e);
    const target = e.target as Element;
    const nodeEl = target.closest("[data-node-id]");
    const nodeId = nodeEl?.getAttribute("data-node-id");

    if (nodeId) {
      if (e.shiftKey) {
        setDragStartNode(nodeId);
        isDraggingRef.current = true;
      } else {
        setMovingNodeId(nodeId);
        dragNodeIdRef.current = nodeId;
        isDraggingRef.current = true;
      }
    } else {
      setDragOrigin(coords);
      isDraggingRef.current = true;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const coords = getLocalCoords(e);

    if (dragNodeIdRef.current) {
      // Kéo node: cập nhật node và các cạnh liên quan
      updateNodePosition(dragNodeIdRef.current, coords.x, coords.y);
      updateEdgesForDraggedNode(dragNodeIdRef.current, coords.x, coords.y);
    } else if (dragStartNodeId) {
      // Kéo tạo cạnh: cập nhật đường nối tạm
      const fromNode = nodes.find((n) => n.id === dragStartNodeId);
      if (fromNode) {
        updateTempLine(fromNode.x, fromNode.y, coords.x, coords.y);
      }
    } else if (dragOrigin) {
      // Kéo vùng chọn: cập nhật hình chữ nhật
      const x = Math.min(dragOrigin.x, coords.x);
      const y = Math.min(dragOrigin.y, coords.y);
      const width = Math.abs(dragOrigin.x - coords.x);
      const height = Math.abs(dragOrigin.y - coords.y);
      updateDragRect(x, y, width, height);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const coords = getLocalCoords(e);
    const target = e.target as Element;
    const nodeEl = target.closest("[data-node-id]");
    const endNodeId = nodeEl?.getAttribute("data-node-id");

    // Kết thúc kéo node: cập nhật store
    if (dragNodeIdRef.current) {
      moveNode(dragNodeIdRef.current, coords.x, coords.y);
      dragNodeIdRef.current = null;
    }

    // Kết thúc kéo tạo cạnh
    if (dragStartNodeId && endNodeId && dragStartNodeId !== endNodeId) {
      const exists = edges.some((edge) => (edge.from === dragStartNodeId && edge.to === endNodeId) || (edge.from === endNodeId && edge.to === dragStartNodeId));
      if (!exists) {
        addEdge(dragStartNodeId, endNodeId);
      }
    }

    // Kết thúc kéo vùng chọn (tạo node mới nếu click)
    if (dragOrigin && !dragNodeIdRef.current && !dragStartNodeId) {
      const dist = Math.hypot(coords.x - dragOrigin.x, coords.y - dragOrigin.y);
      if (dist < 5) {
        addNode(coords.x, coords.y);
      }
    }

    // Reset trạng thái
    setDragStartNode(null);
    setMovingNodeId(null);
    setDragOrigin(null);
    isDraggingRef.current = false;
    hideTempLine();
    hideDragRect();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = e.target as Element;
    const nodeEl = target.closest("[data-node-id]");
    const edgeEl = target.closest("[data-edge-id]");
    if (nodeEl) {
      const nodeId = nodeEl.getAttribute("data-node-id")!;
      removeNode(nodeId);
    } else if (edgeEl) {
      const edgeId = edgeEl.getAttribute("data-edge-id")!;
      removeEdge(edgeId);
    }
  };

  // Callback ref cho node
  const setNodeRef = (id: string) => (el: SVGGElement | null) => {
    if (el) {
      nodeRefs.current.set(id, el);
    } else {
      nodeRefs.current.delete(id);
    }
  };

  // Callback ref cho các đường của cạnh
  const setEdgeThickRef = (id: string) => (el: SVGLineElement | null) => {
    const entry = edgeLineRefs.current.get(id) || { thick: null, thin: null };
    entry.thick = el;
    edgeLineRefs.current.set(id, entry);
  };

  const setEdgeThinRef = (id: string) => (el: SVGLineElement | null) => {
    const entry = edgeLineRefs.current.get(id) || { thick: null, thin: null };
    entry.thin = el;
    edgeLineRefs.current.set(id, entry);
  };

  return (
    <div className="relative w-full h-full bg-white border border-gray-200 shadow-inner overflow-hidden">
      <svg ref={svgRef} className="w-full h-full cursor-crosshair" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onContextMenu={handleContextMenu}>
        {/* Các cạnh */}
        {edges.map((edge) => {
          const from = nodes.find((n) => n.id === edge.from);
          const to = nodes.find((n) => n.id === edge.to);
          if (!from || !to) return null;
          return (
            <g key={edge.id}>
              {/* Đường dày trong suốt để bắt sự kiện */}
              <line ref={setEdgeThickRef(edge.id)} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="transparent" strokeWidth="20" data-edge-id={edge.id} className="cursor-pointer" />
              {/* Đường mỏng nhìn thấy */}
              <line ref={setEdgeThinRef(edge.id)} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#555" strokeWidth="2" pointerEvents="none" />
            </g>
          );
        })}

        {/* Đường nối tạm (dùng ref) */}
        <line ref={tempLineRef} x1="0" y1="0" x2="0" y2="0" stroke="black" strokeWidth="1.5" strokeDasharray="4,4" pointerEvents="none" />

        {/* Hình chữ nhật chọn vùng (dùng ref) */}
        <rect ref={dragRectRef} x="0" y="0" width="0" height="0" fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2,2" pointerEvents="none" />

        {/* Các node */}
        {nodes.map((node) => {
          const isActive = dragStartNodeId === node.id || movingNodeId === node.id;
          return (
            <g key={node.id} ref={setNodeRef(node.id)} transform={`translate(${node.x}, ${node.y})`} data-node-id={node.id}>
              <circle r="18" fill={isActive ? "#eff6ff" : "white"} stroke={isActive ? "#3b82f6" : "#334155"} strokeWidth="2" className="cursor-grab active:cursor-grabbing hover:fill-slate-50 transition-colors" />
              <text dy=".33em" textAnchor="middle" className="select-none pointer-events-none font-bold fill-slate-700">
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Canvas;
