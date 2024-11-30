import Audio from "../models/audios.model.js";
import Coleccion from "../models/colecciones.model.js";
import { uploadToS3, deleteFromS3 } from "../services/s3Service.js";
import { deleteLocalFile } from "../services/fileService.js";

export const createAudio = async (req, res) => {
  try {
    const { idColeccion, track, name, description, duration } = req.body;

    const coleccion = await Coleccion.findById(idColeccion);
    if (!coleccion) {
      return res.status(404).json({ message: "Colección no encontrada" });
    }

    const audioFile = req.files?.file?.[0];
    const imageSmallFile = req.files?.imageSmall?.[0];
    const imageLargeFile = req.files?.imageLarge?.[0];

    if (!audioFile) {
      return res
        .status(400)
        .json({ message: "El archivo de audio es obligatorio" });
    }

    const audioKey = `audios/${Date.now()}-${audioFile.originalname}`;
    await uploadToS3(audioFile.path, audioKey, audioFile.mimetype);
    deleteLocalFile(audioFile.path);

    let imageSmallKey, imageLargeKey;

    if (imageSmallFile) {
      imageSmallKey = `audios/images/${Date.now()}-${
        imageSmallFile.originalname
      }`;
      await uploadToS3(
        imageSmallFile.path,
        imageSmallKey,
        imageSmallFile.mimetype
      );
      deleteLocalFile(imageSmallFile.path);
    }

    if (imageLargeFile) {
      imageLargeKey = `audios/images/${Date.now()}-${
        imageLargeFile.originalname
      }`;
      await uploadToS3(
        imageLargeFile.path,
        imageLargeKey,
        imageLargeFile.mimetype
      );
      deleteLocalFile(imageLargeFile.path);
    }

    const newAudio = new Audio({
      idColeccion,
      track,
      name,
      description,
      duration,
      file: `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${audioKey}`,
      imageSmall: imageSmallKey
        ? `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${imageSmallKey}`
        : undefined,
      imageLarge: imageLargeKey
        ? `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${imageLargeKey}`
        : undefined,
    });

    await newAudio.save();
    res
      .status(201)
      .json({ message: "Audio creado con éxito", audio: newAudio });
  } catch (error) {
    console.error("Error al crear el audio:", error);
    res
      .status(500)
      .json({ message: "Error al crear el audio", error: error.message });
  }
};

export const getAllAudios = async (req, res) => {
  try {
    const audios = await Audio.find(); // Recupera todos los audios
    res.status(200).json(audios);
  } catch (error) {
    console.error("Error al obtener todos los audios:", error);
    res
      .status(500)
      .json({
        message: "Error al obtener todos los audios",
        error: error.message,
      });
  }
};

export const getAudiosByColeccion = async (req, res) => {
    try {
      const { idColeccion } = req.params;
  
      // Validar que el ID de colección sea válido
      if (!mongoose.Types.ObjectId.isValid(idColeccion)) {
        return res.status(400).json({ message: "ID de colección inválido" });
      }
  
      // Consultar directamente en el modelo Audio
      const audios = await Audio.find({ idColeccion });
  
      // Verificar si no hay audios relacionados
      if (audios.length === 0) {
        return res
          .status(404)
          .json({ message: "No se encontraron audios para esta colección" });
      }
  
      // Responder con los audios encontrados
      res.status(200).json(audios);
    } catch (error) {
      console.error("Error al obtener los audios:", error);
      res.status(500).json({
        message: "Error al obtener los audios",
        error: error.message,
      });
    }
  };

export const getAudioById = async (req, res) => {
  try {
    const { id } = req.params;

    const audio = await Audio.findById(id);
    if (!audio) {
      return res.status(404).json({ message: "Audio no encontrado" });
    }

    res.status(200).json(audio);
  } catch (error) {
    console.error("Error al obtener el audio:", error);
    res
      .status(500)
      .json({ message: "Error al obtener el audio", error: error.message });
  }
};

export const updateAudio = async (req, res) => {
  try {
    const { id } = req.params;
    const { track, name, description, duration } = req.body;

    const audio = await Audio.findById(id);
    if (!audio) {
      return res.status(404).json({ message: "Audio no encontrado" });
    }

    if (req.files?.file?.[0]) {
      const oldAudioKey = audio.file.split(".com/")[1];
      await deleteFromS3([oldAudioKey]);

      const audioKey = `audios/${Date.now()}-${req.files.file[0].originalname}`;
      await uploadToS3(
        req.files.file[0].path,
        audioKey,
        req.files.file[0].mimetype
      );
      deleteLocalFile(req.files.file[0].path);

      audio.file = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${audioKey}`;
    }

    if (req.files?.imageSmall?.[0]) {
      const oldImageSmallKey = audio.imageSmall?.split(".com/")[1];
      if (oldImageSmallKey) {
        await deleteFromS3([oldImageSmallKey]);
      }

      const imageSmallKey = `audios/images/${Date.now()}-${
        req.files.imageSmall[0].originalname
      }`;
      await uploadToS3(
        req.files.imageSmall[0].path,
        imageSmallKey,
        req.files.imageSmall[0].mimetype
      );
      deleteLocalFile(req.files.imageSmall[0].path);

      audio.imageSmall = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${imageSmallKey}`;
    }

    if (req.files?.imageLarge?.[0]) {
      const oldImageLargeKey = audio.imageLarge?.split(".com/")[1];
      if (oldImageLargeKey) {
        await deleteFromS3([oldImageLargeKey]);
      }

      const imageLargeKey = `audios/images/${Date.now()}-${
        req.files.imageLarge[0].originalname
      }`;
      await uploadToS3(
        req.files.imageLarge[0].path,
        imageLargeKey,
        req.files.imageLarge[0].mimetype
      );
      deleteLocalFile(req.files.imageLarge[0].path);

      audio.imageLarge = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${imageLargeKey}`;
    }

    audio.track = track || audio.track;
    audio.name = name || audio.name;
    audio.description = description || audio.description;
    audio.duration = duration || audio.duration;

    await audio.save();
    res.status(200).json({ message: "Audio actualizado con éxito", audio });
  } catch (error) {
    console.error("Error al actualizar el audio:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar el audio", error: error.message });
  }
};

export const deleteAudio = async (req, res) => {
  try {
    const { id } = req.params;

    const audio = await Audio.findById(id);
    if (!audio) {
      return res.status(404).json({ message: "Audio no encontrado" });
    }

    const keysToDelete = [
      audio.file.split(".com/")[1],
      audio.imageSmall?.split(".com/")[1],
      audio.imageLarge?.split(".com/")[1],
    ].filter(Boolean);

    await deleteFromS3(keysToDelete);

    await Audio.deleteOne({ _id: id });
    res.status(200).json({ message: "Audio eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el audio:", error);
    res
      .status(500)
      .json({ message: "Error al eliminar el audio", error: error.message });
  }
};
