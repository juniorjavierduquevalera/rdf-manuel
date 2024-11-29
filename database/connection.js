import mongoose from 'mongoose';

const connection = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/junior");
        console.log("Conexión exitosa a la base de datos");
    } catch (error) {
        console.error("Error de conexión a la base de datos:", error);
    }
};

export default connection;
