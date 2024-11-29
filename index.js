import connection from "./database/connection.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; 
import usersRoutes from "./routes/users.routes.js";
import temasRoutes from "./routes/temas.routes.js"; 
import dotenv from "dotenv";


dotenv.config();

connection();
const app = express();
const port = process.env.PORT || 3910;

// Middlewares
const corsOptions = {
  origin: "http://127.0.0.1:5500", 
  credentials: true, 
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Configura cookie-parser aquí


// Rutas
app.use("/api/users", usersRoutes);
app.use("/api/temas", temasRoutes); 

app.get("/", (req, res) => {
  res.send("¡Bienvenido a mi servidor!");
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
