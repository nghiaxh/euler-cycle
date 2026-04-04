import { useEffect, useRef } from "react";
import { SquareMousePointer, CircleCheckBig, Search, ChartNetwork, Download, Upload, Trash } from "lucide-react";

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const Modal = ({ isVisible, onClose }: ModalProps) => {
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isVisible, onClose]);

  if (!isVisible) return null;
  return (
    <div
      ref={overlay}
      onMouseDown={(event) => {
        if (event.target === overlay.current) onClose();
      }}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/25 select-none">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Hướng dẫn</h2>
        </div>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 pb-3 border-b border-gray-100">
            <span className="text-gray-500 shrink-0">
              <SquareMousePointer size={16} />
            </span>
            <div className="flex flex-col space-y-2">
              <p className="text-sm">
                Nhấn <kbd className="font-mono text-xs px-1.5 py-0.5 border border-gray-200 rounded bg-gray-50 text-gray-600">Chuột trái</kbd> để thêm đỉnh vào đồ thị
              </p>
              <p className="text-sm">
                Nhấn <kbd className="font-mono text-xs px-1.5 py-0.5 border border-gray-200 rounded bg-gray-50 text-gray-600">Chuột phải</kbd> để xóa đỉnh hoặc cạnh
              </p>
              <p className="text-sm">
                Nhấn giữ <kbd className="font-mono text-xs px-1.5 py-0.5 border border-gray-200 rounded bg-gray-50 text-gray-600">Chuột trái</kbd> để di chuyển đỉnh
              </p>
              <p className="text-sm">
                Nhấn giữ phím <kbd className="font-mono text-xs px-1.5 py-0.5 border border-gray-200 rounded bg-gray-50 text-gray-600">Shift</kbd> và kéo từ đỉnh này sang đỉnh khác để thêm cạnh
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-gray-500 shrink-0">
              <CircleCheckBig size={16} />
            </span>
            <div>
              <p className="text-sm font-medium">Kiểm tra liên thông</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-gray-500 shrink-0">
              <Search size={16} />
            </span>
            <div>
              <p className="text-sm font-medium">Tìm chu trình Euler</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-gray-500 shrink-0">
              <ChartNetwork size={16} />
            </span>
            <div>
              <p className="text-sm font-medium">Tải đồ thị mẫu</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-gray-500 shrink-0">
              <Download size={16} />
            </span>
            <div>
              <p className="text-sm font-medium">Xuất đồ thị</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-gray-500 shrink-0">
              <Upload size={16} />
            </span>
            <div>
              <p className="text-sm font-medium">Nhập đồ thị</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-gray-500 shrink-0">
              <Trash size={16} />
            </span>
            <div>
              <p className="text-sm font-medium">Xóa đồ thị</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Modal;
