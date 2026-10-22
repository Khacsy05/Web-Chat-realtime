import StickerPack from "../models/StickerPack.js";
import User from "../models/User.js";

// Bộ dữ liệu khởi tạo mẫu
const DEFAULT_PACKS_SEED = [
  {
    packId: "cuppy",
    name: "Cuppy Vui Nhộn",
    description: "Bộ nhãn dán biểu cảm chiếc cốc Cuppy siêu nhí nhảnh và vui tươi.",
    icon: "/stickers/cuppy/smile.webp",
    isDefault: true,
    stickers: [
      { id: "c1", name: "Smile", url: "/stickers/cuppy/smile.webp" },
      { id: "c2", name: "LOL", url: "/stickers/cuppy/lol.webp" },
      { id: "c3", name: "ROFL", url: "/stickers/cuppy/rofl.webp" },
      { id: "c4", name: "Love", url: "/stickers/cuppy/love.webp" },
      { id: "c5", name: "Cookie", url: "/stickers/cuppy/cookie.webp" },
      { id: "c6", name: "Sad", url: "/stickers/cuppy/sad.webp" },
      { id: "c7", name: "Cry", url: "/stickers/cuppy/cry.webp" },
      { id: "c8", name: "HMM", url: "/stickers/cuppy/hmm.webp" },
      { id: "c9", name: "Angry", url: "/stickers/cuppy/angry.webp" },
      { id: "c10", name: "Tired", url: "/stickers/cuppy/tired.webp" },
      { id: "c11", name: "Work Hard", url: "/stickers/cuppy/workhard.webp" },
      { id: "c12", name: "Shine", url: "/stickers/cuppy/shine.webp" },
      { id: "c13", name: "Hi", url: "/stickers/cuppy/hi.webp" },
      { id: "c14", name: "Bye", url: "/stickers/cuppy/bye.webp" },
    ],
  },
  {
    packId: "cat",
    name: "Mèo Cute Động",
    description: "Những chú mèo hoạt hình chuyển động hài hước và dễ thương.",
    icon: "/stickers/cat/cat_cute.gif",
    isDefault: true,
    stickers: [
      { id: "cat1", name: "Cat Wave", url: "/stickers/cat/cat_wave.gif" },
      { id: "cat2", name: "Cat Dance", url: "/stickers/cat/cat_dance.gif" },
      { id: "cat3", name: "Cat Love", url: "/stickers/cat/cat_love.gif" },
      { id: "cat4", name: "Cat Heart", url: "/stickers/cat/cat_heart.gif" },
      { id: "cat5", name: "Cat Typing", url: "/stickers/cat/cat_typing.gif" },
      { id: "cat6", name: "Cat Cute", url: "/stickers/cat/cat_cute.gif" },
      { id: "cat7", name: "Cat OK", url: "/stickers/cat/cat_ok.gif" },
    ],
  },
  {
    packId: "pepe",
    name: "Pepe & Memes",
    description: "Bộ sticker Ếch Pepe và những gương mặt meme huyền thoại.",
    icon: "/stickers/pepe/peepo_love.webp",
    isDefault: false,
    stickers: [
      { id: "p1", name: "Peepo Love", url: "/stickers/pepe/peepo_love.webp" },
      { id: "p2", name: "Peepo Happy", url: "/stickers/pepe/peepo_happy.webp" },
      { id: "p3", name: "Peepo Sad", url: "/stickers/pepe/peepo_sad.webp" },
      { id: "p4", name: "Feels Good", url: "/stickers/pepe/feels_good.webp" },
      { id: "p5", name: "Feels Bad", url: "/stickers/pepe/feels_bad.webp" },
      { id: "p6", name: "MonkaS", url: "/stickers/pepe/monka_s.webp" },
      { id: "p7", name: "MonkaW", url: "/stickers/pepe/monka_w.webp" },
      { id: "p8", name: "PogChamp", url: "/stickers/pepe/pogchamp.webp" },
      { id: "p9", name: "Kappa", url: "/stickers/pepe/kappa.webp" },
      { id: "p10", name: "Hey Guys", url: "/stickers/pepe/heyguys.webp" },
      { id: "p11", name: "Fail Fish", url: "/stickers/pepe/failfish.webp" },
    ],
  },
  {
    packId: "together",
    name: "Bạn Bè & Đời Sống",
    description: "Bộ nhãn dán ấm áp về tình bạn, gia đình và sự kết nối thường nhật.",
    icon: "/stickers/together/sending_love.webp",
    isDefault: false,
    stickers: [
      { id: "t1", name: "Sending Love", url: "/stickers/together/sending_love.webp" },
      { id: "t2", name: "Heart", url: "/stickers/together/heart.webp" },
      { id: "t3", name: "High Five", url: "/stickers/together/high_five.webp" },
      { id: "t4", name: "Stay Connected", url: "/stickers/together/connected.webp" },
      { id: "t5", name: "OK", url: "/stickers/together/ok.webp" },
      { id: "t6", name: "Stay Calm", url: "/stickers/together/stay_calm.webp" },
      { id: "t7", name: "Cat On Laptop", url: "/stickers/together/cat_laptop.webp" },
    ],
  },
];

// Hàm tự động khởi tạo dữ liệu mẫu nếu DB chưa có
const ensureSeedPacks = async () => {
  const count = await StickerPack.countDocuments();
  if (count === 0) {
    await StickerPack.insertMany(DEFAULT_PACKS_SEED);
  }
};

/**
 * GET /api/stickers/store
 * Lấy danh sách tất cả các bộ sticker trong Cửa hàng
 */
export const getStickerStore = async (req, res) => {
  try {
    await ensureSeedPacks();

    const user = await User.findOne({ userId: req.user._id });
    const installedIds = new Set(
      (user?.installedStickers || []).map((id) => id.toString())
    );

    const packs = await StickerPack.find().sort({ isDefault: -1, createdAt: -1 });

    const result = packs.map((p) => ({
      _id: p._id,
      packId: p.packId,
      name: p.name,
      description: p.description,
      icon: p.icon,
      isDefault: p.isDefault,
      totalStickers: p.stickers?.length || 0,
      previewStickers: p.stickers.slice(0, 4), // 4 con đầu tiên để hiển thị thumbnail xem trước
      stickers: p.stickers,
      isInstalled: installedIds.has(p._id.toString()),
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/stickers/my-stickers
 * Lấy danh sách các bộ sticker mà tài khoản đang sở hữu (hiển thị ở thanh chat)
 */
export const getMyStickers = async (req, res) => {
  try {
    await ensureSeedPacks();

    let user = await User.findOne({ userId: req.user._id }).populate("installedStickers");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Nếu người dùng mới chưa có bộ sticker nào, tự động cài đặt các bộ mặc định
    if (!user.installedStickers || user.installedStickers.length === 0) {
      const defaultPacks = await StickerPack.find({ isDefault: true });
      user.installedStickers = defaultPacks.map((p) => p._id);
      await user.save();
      user = await User.findById(user._id).populate("installedStickers");
    }

    return res.status(200).json(user.installedStickers || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/stickers/install/:packId
 * Cài đặt (Thêm) bộ sticker vào bộ sưu tập của người dùng
 */
export const installStickerPack = async (req, res) => {
  try {
    const { packId } = req.params;

    // Tìm pack theo _id hoặc packId
    let pack = null;
    if (packId.match(/^[0-9a-fA-F]{24}$/)) {
      pack = await StickerPack.findById(packId);
    }
    if (!pack) {
      pack = await StickerPack.findOne({ packId });
    }

    if (!pack) {
      return res.status(404).json({ message: "Không tìm thấy bộ sticker" });
    }

    const user = await User.findOne({ userId: req.user._id });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    await User.updateOne(
      { _id: user._id },
      { $addToSet: { installedStickers: pack._id } }
    );

    return res.status(200).json({
      success: true,
      message: `Đã thêm bộ "${pack.name}" vào bộ sưu tập`,
      pack,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /api/stickers/uninstall/:packId
 * Gỡ bỏ bộ sticker khỏi bộ sưu tập của người dùng
 */
export const uninstallStickerPack = async (req, res) => {
  try {
    const { packId } = req.params;

    let pack = null;
    if (packId.match(/^[0-9a-fA-F]{24}$/)) {
      pack = await StickerPack.findById(packId);
    }
    if (!pack) {
      pack = await StickerPack.findOne({ packId });
    }

    if (!pack) {
      return res.status(404).json({ message: "Không tìm thấy bộ sticker" });
    }

    const user = await User.findOne({ userId: req.user._id });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    await User.updateOne(
      { _id: user._id },
      { $pull: { installedStickers: pack._id } }
    );

    return res.status(200).json({
      success: true,
      message: `Đã gỡ bộ "${pack.name}" khỏi bộ sưu tập`,
      packId: pack._id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
