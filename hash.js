
import bcrypt from "bcrypt";

const generar = async () => {
  const hash = await bcrypt.hash("123", 10);
  console.log(hash);
};

generar();