import appBcrypt from "bcrypt";
const saltRounds = 10;

export const encryptPassword = async (password) => {
  try {
    const hashedPassword = await appBcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error("Error encrypting password:", error);
    throw new Error("Password encryption failed");
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    const match = await appBcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    console.error("Error comparing password:", error);
    throw new Error("Password comparison failed");
  }
};
