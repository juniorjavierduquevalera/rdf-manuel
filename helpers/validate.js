import validator from "validator";

export const validate = (params) => {
  const errors = {};

  if (!params.password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (!validator.isLength(params.password, { min: 6 })) {
    errors.password = "La contraseña debe tener al menos 6 caracteres.";
  }

  if (!params.email) {
    errors.email = "El correo electrónico es obligatorio.";
  } else if (!validator.isEmail(params.email)) {
    errors.email = "El correo electrónico no es válido.";
  }

  if (!params.name) {
    errors.name = "El nombre es obligatorio.";
  } else if (params.name.length < 3) {
    errors.name = "El nombre debe tener al menos 3 caracteres.";
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(params.name)) {
    errors.name = "El nombre solo puede contener letras y espacios.";
  }

  const isValid = Object.keys(errors).length === 0;

  if (!isValid) {
    throw new Error("No se ha superado la validación.");
  }

  return { isValid, errors };
};
