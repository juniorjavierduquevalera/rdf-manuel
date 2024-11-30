import Tema from "../models/temas.model.js";
import Coleccion from "../models/colecciones.model.js";
import Audio from "../models/audios.model.js";
import { uploadToS3, deleteFromS3 } from "../services/s3Service.js";
import { deleteLocalFile } from "../services/fileService.js";

export const createTema = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res
        .status(400)
        .json({ message: "El nombre y la descripción son obligatorios" });
    }

    const imgSmallFile = req.files?.imgSmall?.[0];
    const imgLargeFile = req.files?.imgLarge?.[0];

    if (!imgSmallFile || !imgLargeFile) {
      return res.status(400).json({ message: "Las imágenes son obligatorias" });
    }

    const imgSmallKey = `temas/${Date.now()}-${imgSmallFile.originalname}`;
    const imgLargeKey = `temas/${Date.now()}-${imgLargeFile.originalname}`;
    await uploadToS3(imgSmallFile.path, imgSmallKey, imgSmallFile.mimetype);
    await uploadToS3(imgLargeFile.path, imgLargeKey, imgLargeFile.mimetype);

    deleteLocalFile(imgSmallFile.path);
    deleteLocalFile(imgLargeFile.path);

    const newTema = new Tema({
      name,
      description,
      imgSmall: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${imgSmallKey}`,
      imgLarge: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${imgLargeKey}`,
    });

    await newTema.save();
    res.status(201).json({ message: "Tema creado con éxito", tema: newTema });
  } catch (error) {
    console.error("Error al crear el tema:", error);
    res
      .status(500)
      .json({ message: "Error al crear el tema", error: error.message });
  }
};

export const getTemas = async (req, res) => {
  try {
    const temas = await Tema.find();
    console.log(req.cookies.access_token);
    res.status(200).json(temas);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los temas", error: error.message });
  }
};

export const getTemaById = async (req, res) => {
  try {
    const tema = await Tema.findById(req.params.id);
    if (!tema) return res.status(404).json({ message: "Tema no encontrado" });
    res.status(200).json(tema);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el tema", error: error.message });
  }
};

export const updateTema = async (req, res) => {
  try {
    const { name, description } = req.body;

    const tema = await Tema.findById(req.params.id);
    if (!tema) {
      return res.status(404).json({ message: "Tema no encontrado" });
    }

    if (req.files?.imgSmall?.[0]) {
      const oldImgSmallKey = tema.imgSmall.split(".com/")[1];
      await deleteFromS3([oldImgSmallKey]);

      const imgSmallKey = `temas/${Date.now()}-${
        req.files.imgSmall[0].originalname
      }`;
      await uploadToS3(
        req.files.imgSmall[0].path,
        imgSmallKey,
        req.files.imgSmall[0].mimetype
      );
      deleteLocalFile(req.files.imgSmall[0].path);

      tema.imgSmall = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${imgSmallKey}`;
    }

    if (req.files?.imgLarge?.[0]) {
      const oldImgLargeKey = tema.imgLarge.split(".com/")[1];
      await deleteFromS3([oldImgLargeKey]);

      const imgLargeKey = `temas/${Date.now()}-${
        req.files.imgLarge[0].originalname
      }`;
      await uploadToS3(
        req.files.imgLarge[0].path,
        imgLargeKey,
        req.files.imgLarge[0].mimetype
      );
      deleteLocalFile(req.files.imgLarge[0].path);

      tema.imgLarge = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${imgLargeKey}`;
    }

    tema.name = name || tema.name;
    tema.description = description || tema.description;

    await tema.save();
    res.status(200).json({ message: "Tema actualizado con éxito", tema });
  } catch (error) {
    console.error("Error al actualizar el tema:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar el tema", error: error.message });
  }
};

export const deleteTema = async (req, res) => {
  try {
    const tema = await Tema.findById(req.params.id);
    if (!tema) {
      return res.status(404).json({ message: "Tema no encontrado" });
    }

    const colecciones = await Coleccion.find({ idTema: tema._id });

    for (const coleccion of colecciones) {
      await Audio.deleteMany({ idColeccion: coleccion._id });
    }

    await Coleccion.deleteMany({ idTema: tema._id });

    const keysToDelete = [
      tema.imgSmall.split(".com/")[1],
      tema.imgLarge.split(".com/")[1],
    ];
    await deleteFromS3(keysToDelete);

    await Tema.deleteOne({ _id: tema._id });

    res.status(200).json({
      message: "Tema, colecciones y audios asociados eliminados con éxito",
    });
  } catch (error) {
    console.error("Error al eliminar el tema:", error);
    res
      .status(500)
      .json({ message: "Error al eliminar el tema", error: error.message });
  }
};
