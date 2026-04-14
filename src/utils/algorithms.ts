import { Node, Edge } from "../types.ts";

/**
 * Đếm số thành phần liên thông trong đồ thị vô hướng.
 *
 * @param nodes - Danh sách các đỉnh (mỗi đỉnh có `id` và `label`).
 * @param edges - Danh sách các cạnh (mỗi cạnh có `id`, `from`, `to`).
 * @returns Số lượng thành phần liên thông.
 */
export function countConnectedComponents(nodes: Node[], edges: Edge[]): number {
  // Nếu đồ thị không có đỉnh nào -> 0 thành phần
  if (nodes.length === 0) return 0;

  // 1. Xây dựng danh sách kề: id đỉnh -> mảng các id đỉnh kề
  const adjacents = new Map<string, string[]>();
  // Khởi tạo mảng rỗng cho mỗi đỉnh
  nodes.forEach((n) => adjacents.set(n.id, []));
  // Thêm kết nối hai chiều cho mỗi cạnh (vì đồ thị vô hướng)
  edges.forEach((e) => {
    adjacents.get(e.from)?.push(e.to);
    adjacents.get(e.to)?.push(e.from);
  });

  // Tập hợp các đỉnh đã được thăm
  const visited = new Set<string>();
  let count = 0; // Biến đếm số thành phần liên thông

  // 2. Duyệt từng đỉnh để đếm thành phần liên thông
  for (const n of nodes) {
    // Nếu đỉnh đã được thăm thì bỏ qua
    if (visited.has(n.id)) continue;

    // Bắt đầu một thành phần liên thông mới
    count++;

    // Khởi tạo ngăn xếp cho DFS
    const stack = [n.id];
    visited.add(n.id); // Đánh dấu đỉnh bắt đầu

    // Thực hiện DFS bằng ngăn xếp
    while (stack.length) {
      const current = stack.pop()!; // Lấy đỉnh hiện tại từ đỉnh ngăn xếp

      // Duyệt tất cả đỉnh kề của đỉnh hiện tại
      for (const neighbor of adjacents.get(current) || []) {
        // Nếu đỉnh kề chưa được thăm
        if (!visited.has(neighbor)) {
          visited.add(neighbor); // Đánh dấu đã thăm
          stack.push(neighbor); // Đẩy vào ngăn xếp để duyệt tiếp
        }
      }
    }
  }

  return count; // Trả về tổng số thành phần liên thông
}

/**
 * Tìm chu trình Euler trong đồ thị vô hướng (nếu có).
 * Trả về mảng nhãn (label) của các đỉnh theo thứ tự trên chu trình.
 * Nếu không tồn tại chu trình Euler, trả về null.
 *
 * @param nodes - Danh sách các đỉnh.
 * @param edges - Danh sách các cạnh.
 * @returns Mảng nhãn đỉnh hoặc null.
 */
export function findEulerCircuit(nodes: Node[], edges: Edge[]): string[] | null {
  // Không có đỉnh hoặc không có cạnh thì không thể có chu trình Euler
  if (nodes.length === 0 || edges.length === 0) return null;

  // 1. Xây dựng danh sách kề có lưu id cạnh để hỗ trợ đa đồ thị
  const adjacents = new Map<string, { id: string; to: string }[]>();
  nodes.forEach((n) => adjacents.set(n.id, [])); // Mỗi đỉnh có một mảng rỗng

  // Với mỗi cạnh, thêm vào danh sách kề cho cả hai đầu mút
  edges.forEach((e) => {
    adjacents.get(e.from)!.push({ id: e.id, to: e.to });
    adjacents.get(e.to)!.push({ id: e.id, to: e.from });
  });

  // 2. Lọc ra các đỉnh có bậc > 0 (các đỉnh thực sự tham gia vào đồ thị)
  const active = nodes.filter((n) => adjacents.get(n.id)!.length > 0);
  // Nếu không có cạnh nào nối các đỉnh thì không có chu trình
  if (active.length === 0) return null;

  // 3. Kiểm tra điều kiện bậc chẵn cho mọi đỉnh
  for (const n of nodes) {
    // Bậc của đỉnh = số phần tử trong danh sách kề
    if ((adjacents.get(n.id)?.length || 0) % 2 !== 0) {
      return null; // Tồn tại đỉnh bậc lẻ → không có chu trình Euler
    }
  }

  // 4. Kiểm tra tính liên thông của đồ thị con chỉ gồm các đỉnh hoạt động
  //    (các đỉnh có bậc > 0 phải nằm trong cùng một thành phần liên thông)
  if (countConnectedComponents(active, edges) > 1) {
    return null; // Đồ thị không liên thông → không có chu trình Euler
  }

  // 5. Áp dụng thuật toán Hierholzer để tìm chu trình Euler

  const used = new Set<string>(); // Tập chứa id các cạnh đã dùng
  const path: string[] = []; // Mảng lưu id các đỉnh theo thứ tự chu trình (sẽ đảo sau)
  const stack: string[] = [active[0].id]; // Ngăn xếp duy trì đường đi hiện tại, bắt đầu từ đỉnh đầu tiên

  // Tiếp tục cho đến khi ngăn xếp rỗng
  while (stack.length) {
    const current = stack[stack.length - 1]; // Xem đỉnh ở đỉnh ngăn xếp (chưa lấy ra)

    // Tìm một cạnh chưa được dùng nối từ đỉnh current
    const edge = adjacents.get(current)?.find((e) => !used.has(e.id));

    if (edge) {
      // Nếu tìm thấy cạnh: đánh dấu đã dùng và đẩy đỉnh kề vào ngăn xếp
      used.add(edge.id);
      stack.push(edge.to);
    } else {
      // Nếu không còn cạnh nào: đỉnh current đã hết lối đi,
      // lấy nó ra khỏi ngăn xếp và thêm vào mảng path (đây sẽ là một phần của chu trình)
      path.push(current);
      stack.pop();
    }
  }

  // Sau khi kết thúc, path chứa thứ tự các đỉnh theo chiều ngược lại (từ đỉnh cuối về đỉnh đầu)
  // Cần đảo ngược để có thứ tự xuôi
  path.reverse();

  // 6. Chuyển đổi id đỉnh sang nhãn (label) để trả về kết quả
  const label = new Map(nodes.map((n) => [n.id, n.label]));
  return path.map((id) => label.get(id)!);
}
