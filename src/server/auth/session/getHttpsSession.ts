import { useSession } from "vinxi/http";

// import crypto from "crypto";
// const generateSecurePassword = () => {
//   return crypto.randomBytes(32).toString('hex');
// };

export function getHttpsSession() {
  const config = {
    password:
      "971dc95829c77a687451fce0099ec9867b3c54538e5e7f2bcfbc427c5b4bfe1c",
    // Other configuration options if required
  };
  return useSession(config);
}
