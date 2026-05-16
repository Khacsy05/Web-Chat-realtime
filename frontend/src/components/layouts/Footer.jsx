import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-white px-8 py-5 mt-auto">
      <div className="max-w-7xl mx-auto space-y-2 text-sm">
        {/* Tiêu đề Khoa */}
        <h3 className="font-bold text-base uppercase tracking-wide mb-3">
          TRƯỜNG ĐẠI HỌC THỦY LỢI - KHOA CÔNG NGHỆ THÔNG TIN
        </h3>

        {/* Thông tin địa chỉ */}
        <div className="flex items-start gap-2 opacity-90">
          <MapPin className="size-4 mt-0.5 shrink-0 text-white/70" />
          <span>
            <strong className="font-semibold">Địa chỉ:</strong> Nhà C1, số 175 Tây Sơn, Đống Đa, Hà Nội.
          </span>
        </div>

        {/* Thông tin liên hệ */}
        <div className="flex items-center gap-2 opacity-90">
          <Phone className="size-4 shrink-0 text-white/70" />
          <span>
            <strong className="font-semibold">Liên hệ:</strong> (+84)-024 3 5632211.
          </span>
        </div>

        {/* Thông tin Email */}
        <div className="flex items-center gap-2 opacity-90">
          <Mail className="size-4 shrink-0 text-white/70" />
          <span>
            <strong className="font-semibold">Email:</strong>{" "}
            <a 
              href="mailto:vpkcntt@tlu.edu.vn" 
              className="hover:text-blue-200 underline transition-colors"
            >
              vpkcntt@tlu.edu.vn
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

