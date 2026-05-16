import { useEffect } from "react";

export default function Modal({ title, onClose, children, size = "md" }) {
  const widths = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-3xl" };
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className={`bg-white w-full ${widths[size]} rounded-lg shadow-2xl max-h-[90vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between bg-[#5c60c0] text-white px-5 py-3.5 rounded-t-lg">
          <span className="font-semibold text-base">{title}</span>
          <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded flex items-center justify-center">x</button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}