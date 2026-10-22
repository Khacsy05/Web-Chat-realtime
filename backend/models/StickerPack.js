import mongoose from "mongoose";

const stickerPackSchema = new mongoose.Schema(
  {
    packId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      required: true,
    },
    stickers: [
      {
        id: String,
        name: String,
        url: {
          type: String,
          required: true,
        },
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("StickerPack", stickerPackSchema);
