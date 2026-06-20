import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Schema validation with realistic birthday constraints
const schema = yup.object().shape({
  fullname: yup
    .string()
    .required("Vui lòng nhập họ tên")
    .max(50, "Họ tên không được vượt quá 50 ký tự"),

  address: yup
    .string()
    .required("Vui lòng nhập địa chỉ")
    .max(100, "Địa chỉ không được vượt quá 100 ký tự"),

  dateOfBirth: yup
    .date()
    .typeError("Vui lòng chọn ngày sinh")
    .required("Vui lòng chọn ngày sinh")
    .max(new Date(), "Ngày sinh không được ở tương lai")
    .test("realistic-age", "Ngày sinh không hợp lệ (Quá 120 tuổi)", (val) => {
      if (!val) return false;
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 120);
      return val > minDate;
    }),

  gender: yup
    .string()
    .oneOf(["Nam", "Nữ", "Khác"], "Chọn giới tính hợp lệ")
    .required("Vui lòng chọn giới tính"),
});

const EditProfile = ({ onBack, onSave, profile }) => {
  // Safe date parsing to "YYYY-MM-DD"
  const formattedDob = (() => {
    if (!profile?.dateOfBirth) return "";
    const dateObj = new Date(profile.dateOfBirth);
    if (isNaN(dateObj.getTime())) return "";
    return dateObj.toISOString().slice(0, 10);
  })();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullname: profile?.fullname || "",
      address: profile?.address || "",
      dateOfBirth: formattedDob,
      gender: profile?.gender || "Nam",
    },
  });

  const onSubmit = (data) => {
    // Format the date properly before saving
    const formattedData = {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth).toISOString(),
    };
    onSave(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-1 py-2 text-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <span className="font-bold text-lg text-slate-800">Cập nhật thông tin</span>
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 transition"
        >
          ← Quay lại
        </button>
      </div>

      {/* Họ tên */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Họ và tên</label>
        <input
          {...register("fullname")}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          placeholder="Ví dụ: Nguyễn Văn A"
        />
        {errors.fullname && (
          <p className="text-red-500 text-xs font-medium mt-0.5">{errors.fullname.message}</p>
        )}
      </div>

      {/* Địa chỉ */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Địa chỉ</label>
        <input
          {...register("address")}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          placeholder="Ví dụ: Hà Nội, Việt Nam"
        />
        {errors.address && (
          <p className="text-red-500 text-xs font-medium mt-0.5">{errors.address.message}</p>
        )}
      </div>

      {/* Ngày sinh */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày sinh</label>
        <input
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          {...register("dateOfBirth")}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
        />
        {errors.dateOfBirth && (
          <p className="text-red-500 text-xs font-medium mt-0.5">{errors.dateOfBirth.message}</p>
        )}
      </div>

      {/* Giới tính */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Giới tính</label>
        <div className="flex gap-6 py-1">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer select-none">
            <input 
              type="radio" 
              value="Nam" 
              {...register("gender")} 
              className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            Nam
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer select-none">
            <input 
              type="radio" 
              value="Nữ" 
              {...register("gender")} 
              className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            Nữ
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer select-none">
            <input 
              type="radio" 
              value="Khác" 
              {...register("gender")} 
              className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
            />
            Khác
          </label>
        </div>
        {errors.gender && (
          <p className="text-red-500 text-xs font-medium mt-0.5">{errors.gender.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="pt-2 flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
        >
          Hủy bỏ
        </button>
        <button 
          type="submit" 
          className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow transition"
        >
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
};

export default EditProfile;