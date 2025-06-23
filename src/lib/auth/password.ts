import { fromBase64, generateSalt, hash, toBase64, verify } from "@razr/crypto";

export async function hashPassword(password: string) {
  const salt = generateSalt(); // Generates a secure random salt as Uint8Array
  const hashedPassword = await hash(password, salt);

  const hashedPasswordBase64 = toBase64(hashedPassword);
  const saltBase64 = toBase64(salt);

  return {
    hashedPassword: hashedPasswordBase64,
    salt: saltBase64,
  };
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSaltBase64: string,
) {
  //convert storedHash to Uint8Array
  const hash = fromBase64(storedHash);
  // Convert stored base64 salt back to Uint8Array
  const salt = fromBase64(storedSaltBase64);

  return await verify(password, hash, salt);
}
