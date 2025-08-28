import mongoose from "mongoose";
const sessionSchema = new mongoose.Schema(
    {
        waPhone: { type: String, unique: true },
        state: { type: String, default: "IDLE" },
        context: { type: Object, default: {} }
    },
    { timestamps: true }
);
const Session = mongoose.model("Session", sessionSchema);
export default Session;
