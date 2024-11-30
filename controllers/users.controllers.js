import User from "../models/users.model.js";
import bcrypt from "bcrypt";
import { validate } from "../helpers/validate.js";
import { createToken } from "../helpers/jwt.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).send({
        status: "error",
        message: "Usuario no encontrado.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({
        status: "error",
        message: "Contraseña incorrecta.",
      });
    }

    const token = createToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return res.status(200).send({
      status: "success",
      message: "Inicio de sesión exitoso.",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).send({
      status: "error",
      message: error.message || "Error desconocido.",
    });
  }
};

export const register = async (req, res) => {
  try {
    const params = req.body;

    validate(params);

    const existingUser = await User.findOne({ email: params.email });
    if (existingUser) {
      return res.status(400).send({
        status: "error",
        message: "El usuario ya está registrado con este correo electrónico.",
      });
    }

    const hashedPassword = await bcrypt.hash(params.password, 10);

    const newUser = new User({
      name: params.name,
      email: params.email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = createToken({
      id: newUser._id,
      email: newUser.email,
      role: newUser.role || "user",
    });

    return res.status(200).send({
      status: "success",
      message: "Usuario registrado correctamente",
      user: {
        name: newUser.name,
        email: newUser.email,
      },
      token,
    });
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: error.message || "Error desconocido",
    });
  }
};

export const profile = async (req, res) => {
  try {
    const userIdFromParams = req.params.id;
    const user = await User.findById(userIdFromParams).select("-password -__v");
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado.",
      });
    }
    res.status(200).json({
      status: "success",
      profile: user,
    });
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    res.status(500).json({
      status: "error",
      message: "Error en el servidor.",
      error: error.message,
    });
  }
};

export const update = async (req, res) => {
  try {
    const userIdToUpdate = req.params.id;

    const { password, email, name, ...otherFields } = req.body;

    if (Object.keys(otherFields).length > 0) {
      return res.status(400).json({
        status: "error",
        message:
          "Sólo se permiten los campos 'email', 'name' y 'password' para actualizar.",
      });
    }

    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userIdToUpdate },
      });
      if (existingUser) {
        return res.status(400).json({
          status: "error",
          message: "El correo electrónico ya está en uso por otro usuario.",
        });
      }
    }

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const userUpdated = await User.findByIdAndUpdate(
      userIdToUpdate,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(hashedPassword && { password: hashedPassword }),
      },
      { new: true }
    ).select("-password -__v");

    if (!userUpdated) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Usuario actualizado correctamente.",
      user: userUpdated,
    });
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    res.status(500).json({
      status: "error",
      message: "Error en el servidor.",
      error: error.message,
    });
  }
};


export const remove = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    const userDeleted = await User.findByIdAndDelete(userIdToDelete);

    if (!userDeleted) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Usuario eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

