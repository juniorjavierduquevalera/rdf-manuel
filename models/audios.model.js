import { Schema, model } from "mongoose";

const audioSchema = new Schema(
  {
    idColeccion: {
      type: Schema.Types.ObjectId,
      ref: "Coleccion",
      required: true,
    },
    track: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    file: {
      type: String,
      default: "default.mp3",
      required: true,
    },
    imageSmall: {
      type: String,
    },
    imageLarge: {
      type: String,
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

const Audio = model("Audio", audioSchema, "audios");

export default Audio;
