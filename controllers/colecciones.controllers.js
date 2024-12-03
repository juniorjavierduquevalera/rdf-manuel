import Coleccion from "../models/colecciones.model.js";
import Audio from "../models/audios.model.js";
import Tema from "../models/temas.model.js";
import { uploadToS3, deleteFromS3 } from "../services/s3Service.js";
import { deleteLocalFile } from "../services/fileService.js";

export const createColeccion = async (req, res) => {
  try {
    const { idTema, name, description } = req.body;

    const tema = await Tema.findById(idTema);
    if (!tema) {
      return res.status(404).json({ message: "Tema no encontrado" });
    }

    const imgSmallFile = req.files?.imgSmall?.[0];
    const imgLargeFile = req.files?.imgLarge?.[0];

    if (!imgSmallFile || !imgLargeFile) {
      return res.status(400).json({ message: "Las imágenes son obligatorias" });
    }

    const imgSmallKey = `colecciones/${Date.now()}-${
      imgSmallFile.originalname
    }`;
    const imgLargeKey = `colecciones/${Date.now()}-${
      imgLargeFile.originalname
    }`;
    await uploadToS3(imgSmallFile.path, imgSmallKey, imgSmallFile.mimetype);
    await uploadToS3(imgLargeFile.path, imgLargeKey, imgLargeFile.mimetype);

    deleteLocalFile(imgSmallFile.path);
    deleteLocalFile(imgLargeFile.path);

    const newColeccion = new Coleccion({
      idTema,
      name,
      description,
      imgSmall: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${imgSmallKey}`,
      imgLarge: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${imgLargeKey}`,
    });

    await newColeccion.save();
    res.status(201).json({
      message: "Colección creada con éxito",
      coleccion: newColeccion,
    });
  } catch (error) {
    console.error("Error al crear la colección:", error);
    res
      .status(500)
      .json({ message: "Error al crear la colección", error: error.message });
  }
};

export const getAllColecciones = async (req, res) => {
  try {
    const { name } = req.query;
    const query = name ? { name: new RegExp(name, "i") } : {};
    const colecciones = await Coleccion.find(query).populate(
      "idTema",
      "name description"
    );

    res.status(200).json(colecciones);
  } catch (error) {
    console.error("Error al obtener todas las colecciones:", error);
    res.status(500).json({
      message: "Error al obtener todas las colecciones",
      error: error.message,
    });
  }
};

export const getColeccionesByTema = async (req, res) => {
  try {
    const { idTema } = req.params;

    const colecciones = await Coleccion.find({ idTema });
    res.status(200).json(colecciones);
  } catch (error) {
    console.error("Error al obtener las colecciones:", error);
    res.status(500).json({
      message: "Error al obtener las colecciones",
      error: error.message,
    });
  }
};

export const getColeccionById = async (req, res) => {
  try {
    const { id } = req.params;

    const coleccion = await Coleccion.findById(id);
    if (!coleccion) {
      return res.status(404).json({ message: "Colección no encontrada" });
    }

    res.status(200).json(coleccion);
  } catch (error) {
    console.error("Error al obtener la colección:", error);
    res.status(500).json({
      message: "Error al obtener la colección",
      error: error.message,
    });
  }
};

export const updateColeccion = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const coleccion = await Coleccion.findById(id);
    if (!coleccion) {
      return res.status(404).json({ message: "Colección no encontrada" });
    }

    if (req.files?.imgSmall?.[0]) {
      const oldImgSmallKey = coleccion.imgSmall.split(".com/")[1];
      await deleteFromS3([oldImgSmallKey]);

      const imgSmallKey = `colecciones/${Date.now()}-${
        req.files.imgSmall[0].originalname
      }`;
      await uploadToS3(
        req.files.imgSmall[0].path,
        imgSmallKey,
        req.files.imgSmall[0].mimetype
      );
      deleteLocalFile(req.files.imgSmall[0].path);

      coleccion.imgSmall = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${imgSmallKey}`;
    }

    if (req.files?.imgLarge?.[0]) {
      const oldImgLargeKey = coleccion.imgLarge.split(".com/")[1];
      await deleteFromS3([oldImgLargeKey]);

      const imgLargeKey = `colecciones/${Date.now()}-${
        req.files.imgLarge[0].originalname
      }`;
      await uploadToS3(
        req.files.imgLarge[0].path,
        imgLargeKey,
        req.files.imgLarge[0].mimetype
      );
      deleteLocalFile(req.files.imgLarge[0].path);

      coleccion.imgLarge = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${imgLargeKey}`;
    }

    coleccion.name = name || coleccion.name;
    coleccion.description = description || coleccion.description;

    await coleccion.save();
    res.status(200).json({
      message: "Colección actualizada con éxito",
      coleccion,
    });
  } catch (error) {
    console.error("Error al actualizar la colección:", error);
    res.status(500).json({
      message: "Error al actualizar la colección",
      error: error.message,
    });
  }
};

export const deleteColeccion = async (req, res) => {
  try {
    const { id } = req.params;

    const coleccion = await Coleccion.findById(id);
    if (!coleccion) {
      return res.status(404).json({ message: "Colección no encontrada" });
    }

    await Audio.deleteMany({ idColeccion: coleccion._id });

    const keysToDelete = [
      coleccion.imgSmall.split(".com/")[1],
      coleccion.imgLarge.split(".com/")[1],
    ];
    await deleteFromS3(keysToDelete);

    await Coleccion.deleteOne({ _id: coleccion._id });

    res.status(200).json({
      message: "Colección y audios asociados eliminados con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar la colección:", error);
    res.status(500).json({
      message: "Error al eliminar la colección",
      error: error.message,
    });
  }
};
