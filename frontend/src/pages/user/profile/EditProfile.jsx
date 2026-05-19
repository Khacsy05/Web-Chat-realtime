import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  fullname: yup.string().required("Vui lòng nhập họ tên"),

  address: yup.string().required("Vui lòng nhập địa chỉ"),

  dateOfBirth: yup
    .date()
    .typeError("Vui lòng chọn ngày sinh")
    .required("Vui lòng chọn ngày sinh"),

  gender: yup
    .string()
    .oneOf(["Nam", "Nữ", "Khác"], "Chọn giới tính hợp lệ")
    .required("Vui lòng chọn giới tính"),
});

const EditProfile = ({ onBack, onSave, profile }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullname: profile?.fullname || "",
      address: profile?.address || "",
      dateOfBirth: profile?.dateOfBirth?.slice(0, 10) || "",
      gender: profile?.gender || "other",
    },
  });

  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-blue-500"
        >
          ← Quay lại
        </button>
        <span className="font-semibold">Cập nhật thông tin</span>
      </div>

      {/* Họ tên */}
      <div>
        <input
          {...register("fullname")}
          className="w-full border rounded p-2"
          placeholder="Họ tên"
        />
        <p className="text-red-500 text-xs">{errors.fullname?.message}</p>
      </div>

      {/* Địa chỉ */}
      <div>
        <input
          {...register("address")}
          className="w-full border rounded p-2"
          placeholder="Địa chỉ"
        />
        <p className="text-red-500 text-xs">{errors.address?.message}</p>
      </div>

      {/* Ngày sinh */}
      <div>
        <input
          type="date"
          {...register("dateOfBirth")}
          className="w-full border rounded p-2"
        />
        <p className="text-red-500 text-xs">
          {errors.dateOfBirth?.message}
        </p>
      </div>

      {/* Giới tính */}
      <div className="flex gap-4">
        <label className="flex items-center gap-1">
          <input type="radio" value="Nam" {...register("gender")} />
          Nam
        </label>

        <label className="flex items-center gap-1">
          <input type="radio" value="Nữ" {...register("gender")} />
          Nữ
        </label>

        <label className="flex items-center gap-1">
          <input type="radio" value="Khác" {...register("gender")} />
          Khác
        </label>
      </div>

      <p className="text-red-500 text-xs">{errors.gender?.message}</p>

      {/* Button */}
      <Button type="submit" className="bg-white text-black w-full hover:bg-[#f8f9fa]" onSave >
        💾 Lưu thay đổi
      </Button>
    </form>
  );
};

export default EditProfile;