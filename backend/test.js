import mongoose from "mongoose"
import dotenv from "dotenv"
import Auth from "./models/Auth.js"


dotenv.config()

await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING)

await Auth.create({
  username: "testuser",
  email: "test@gmail.com",
  password: "123456",
  role: "user",
  profileId: new mongoose.Types.ObjectId(),
})

console.log("Insert success 🚀")
process.exit()