import { NavLink } from "react-router-dom";
import useAuthStore from "@/stores/useAuthStore";
import { MASTER_MENU } from "@/config/menu.config"; // Import config mới

export function Sidebar({ onNavigate }) {
  // Sử dụng selector để lấy role, tránh re-render thừa và lỗi IDE
  const role = useAuthStore((state) => state.role);

  // Lọc các mục menu mà role hiện tại có quyền truy cập
  const filteredMenu = MASTER_MENU.filter((item) => 
    item.roles.includes(role)
  );

  return (
    <nav className="flex flex-col h-full bg-white py-4 overflow-y-auto custom-scrollbar border-r border-slate-200">
      <div className="px-4 space-y-1">
        {filteredMenu.map((item, index) => {
          // Render nhãn tiêu đề (Label)
          if (item.label) {
            return (
              <p 
                key={`label-${index}`} 
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-2 px-2"
              >
                {item.label}
              </p>
            );
          }

          // Render các mục chuyển trang (Link)
      
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onNavigate?.()}
              className={({ isActive }) =>
                `flex items-center justify-center p-3 rounded-xl transition ${
                  isActive
                    ? "bg-slate-300 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100"
                }`
              }
            >
              <span>{item.icon && <item.icon size={20} />}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
