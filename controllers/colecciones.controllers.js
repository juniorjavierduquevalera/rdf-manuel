// Acción de prueba
export const prueba = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde: controllers/song.js",
    });
};
