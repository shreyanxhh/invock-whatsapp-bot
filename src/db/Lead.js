import mongoose from "mongoose";
const leadSchema = new mongoose.Schema(
    {
        waPhone: { type: String, index: true },
        fullName: String,
        email: String,
        business: String,
        intent: { type: String, default: "lead" },
        createdBy: { type: String, default: "whatsapp" },
        meta: Object
    },
    { timestamps: true }
);
const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
