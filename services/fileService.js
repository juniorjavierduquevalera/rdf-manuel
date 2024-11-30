import fs from "fs";

export const deleteLocalFile = (filePath) => {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error(`Error al eliminar el archivo: ${filePath}`, error);
  }
};
