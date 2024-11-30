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

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
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

    return res.status(200).send({
      status: "success",
      message: "Usuario registrado correctamente",
    });
  } catch (error) {
    return res.status(400).send({
      status: "error",
      message: error.message || "Error desconocido",
    });
  }
};

export const profile = (req, res) => {
  const { id, name, email, role } = req.user;
  const userIdentity = req.params.id;

  if (userIdentity !== id) {
    return res.status(403).json({
      status: "error",
      message: "No tienes permiso para ver este perfil",
    });
  }

  res.status(200).json({
    status: "success",
    profile: {
      id,
      name,
      email,
      role,
    },
  });
};

export const update = async (req, res) => {
  try {
    const userIdFromToken = req.user.id;
    const userIdToUpdate = req.params.id;

    if (userIdFromToken !== userIdToUpdate) {
      return res.status(403).json({
        status: "error",
        message: "No tienes permiso para actualizar este usuario.",
      });
    }

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
        _id: { $ne: userIdFromToken },
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
      userIdFromToken,
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
    res.status(500).json({
      status: "error",
      message: "Error en el servidor.",
      error: error.message,
    });
  }
};

export const remove = async (req, res) => {
  try {
    const userIdFromToken = req.user.id;

    const userIdToDelete = req.params.id || req.body.id;

    if (userIdFromToken !== userIdToDelete) {
      return res.status(403).json({
        status: "error",
        message: "No tienes permiso para eliminar este usuario",
      });
    }

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

export const renovarToken = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Usuario no autenticado",
      });
    }

    const token = createToken(user);

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Token renovado con éxito",
      user,
    });
  } catch (error) {
    console.error("Error al renovar el token:", error);
    res.status(500).json({
      message: "Error al renovar el token",
    });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({
      status: "success",
      message: "Sesión cerrada correctamente.",
    });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).json({
      status: "error",
      message: "Error al cerrar sesión.",
    });
  }
};
