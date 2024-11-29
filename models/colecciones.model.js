import { Schema, model } from "mongoose";

const coleccionSchema = new Schema(
  {
    idTema: {
      type: Schema.Types.ObjectId,
      ref: "Tema",
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

const Coleccion = model("Coleccion", coleccionSchema, "colecciones");

export default Coleccion;
