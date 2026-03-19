// algorithms.ts
import { Node, Edge } from "./types";

// Đếm số thành phần liên thông
export function countConnectedComponents(nodes: Node[], edges: Edge[]): number {
  if (nodes.length === 0) return 0;
  const adjacents = new Map<string, string[]>();
  nodes.forEach((n) => adjacents.set(n.id, []));
  edges.forEach((e) => {
    adjacents.get(e.from)?.push(e.to);
    adjacents.get(e.to)?.push(e.from);
  });
  const visited = new Set<string>();
  let count = 0;
  for (const n of nodes) {
    if (visited.has(n.id)) continue;
    count++;
    const stack = [n.id];
    visited.add(n.id);
    while (stack.length) {
      const current = stack.pop()!;
      for (const neighbor of adjacents.get(current) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      }
    }
  }
  return count;
}

// Tìm chu trình Euler (đồ thị vô hướng)
export function findEulerCircuit(nodes: Node[], edges: Edge[]): string[] | null {
  if (nodes.length === 0 || edges.length === 0) return null;

  // Danh sách kề kèm id cạnh (hỗ trợ đa cạnh)
  const adjacents = new Map<string, { id: string; to: string }[]>();
  nodes.forEach((n) => adjacents.set(n.id, []));
  edges.forEach((e) => {
    adjacents.get(e.from)!.push({ id: e.id, to: e.to });
    adjacents.get(e.to)!.push({ id: e.id, to: e.from });
  });

  // Các đỉnh có bậc > 0
  const active = nodes.filter((n) => adjacents.get(n.id)!.length > 0);
  if (active.length === 0) return null;

  // Kiểm tra bậc chẵn
  for (const n of nodes) {
    if ((adjacents.get(n.id)?.length || 0) % 2 !== 0) return null;
  }

  // Kiểm tra liên thông trên tập đỉnh có cạnh
  if (countConnectedComponents(active, edges) > 1) return null;

  // Thuật toán Hierholzer
  const used = new Set<string>(); // cạnh đã dùng
  const path: string[] = []; // chu trình (id đỉnh)
  const stack: string[] = [active[0].id]; // stack

  while (stack.length) {
    const current = stack[stack.length - 1];
    const edge = adjacents.get(current)?.find((e) => !used.has(e.id));
    if (edge) {
      used.add(edge.id);
      stack.push(edge.to);
    } else {
      path.push(current);
      stack.pop();
    }
  }

  path.reverse(); // đảo ngược để có thứ tự xuôi
  const label = new Map(nodes.map((n) => [n.id, n.label]));
  return path.map((id) => label.get(id)!);
}
