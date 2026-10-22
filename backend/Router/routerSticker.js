import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getStickerStore,
  getMyStickers,
  installStickerPack,
  uninstallStickerPack,
} from "../controller/StickerController.js";

const routerSticker = express.Router();

routerSticker.use(authMiddleware);

routerSticker.get("/store", getStickerStore);
routerSticker.get("/my-stickers", getMyStickers);
routerSticker.post("/install/:packId", installStickerPack);
routerSticker.delete("/uninstall/:packId", uninstallStickerPack);

export default routerSticker;
