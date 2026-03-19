import { create } from "zustand";
import { Node, Edge } from "./types";

interface State {
  nodes: Node[];
  edges: Edge[];
  dragStartNodeId: string | null;
  addNode: (x: number, y: number) => void;
  addEdge: (from: string, to: string) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  moveNode: (id: string, x: number, y: number) => void;
  setDragStartNode: (id: string | null) => void;
  clearGraph: () => void;
  setGraph: (data: { nodes: Node[]; edges: Edge[] }) => void;
}

export const useStore = create<State>((set) => ({
  nodes: [],
  edges: [],
  dragStartNodeId: null,

  addNode: (x, y) =>
    set((state) => {
      const newId = `n${Date.now()}`;
      const newLabel = (state.nodes.length + 1).toString();
      return { nodes: [...state.nodes, { id: newId, x, y, label: newLabel }] };
    }),

  addEdge: (from, to) =>
    set((state) => {
      const newId = `e${Date.now()}`;
      return { edges: [...state.edges, { id: newId, from, to }] };
    }),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.from !== id && e.to !== id),
    })),

  removeEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
    })),

  moveNode: (id, x, y) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    })),

  setDragStartNode: (id) => set({ dragStartNodeId: id }),

  clearGraph: () => set({ nodes: [], edges: [], dragStartNodeId: null }),

  setGraph: (data) => set({ nodes: data.nodes, edges: data.edges, dragStartNodeId: null }),
}));
