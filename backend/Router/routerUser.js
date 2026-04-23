import express from "express"
import { friendRequest } from "../controller/UserController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const routerUser = express.Router();

routerUser.use(authMiddleware)

routerUser.post("/friendRequest",friendRequest)

export default routerUser