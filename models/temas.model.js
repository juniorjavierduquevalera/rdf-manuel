import { Schema, model } from "mongoose";

const temaSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imgSmall: {
      type: String,
      required: true,
    },
    imgLarge: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Tema = model("Tema", temaSchema, "temas");

export default Tema;
