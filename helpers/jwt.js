import jwt from "jwt-simple";
import moment from "moment";
import dotenv from "dotenv";

dotenv.config();
const secret = process.env.SECRET_KEY;

const createToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    iat: moment().unix(),
    exp: moment().add(14, "days").unix(),
  };

  // Devolver jwt token codificado
  return jwt.encode(payload, secret);
};

export { secret, createToken };
