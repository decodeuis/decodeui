import { ADMIN_DB_NAME } from "~/cypher/core/boltConstant";

export const adminUserData = {
  email: `admin@${process.env.DOMAIN || "decodeui.io"}`,
  password: process.env.ADMIN_USER_PASSWORD || "",
  subDomain: ADMIN_DB_NAME,
  username: "admin",
};
