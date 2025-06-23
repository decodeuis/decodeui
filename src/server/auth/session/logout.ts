import { getHttpsSession } from "~/server/auth/session/getHttpsSession";

export async function logout() {
  const httpSession = await getHttpsSession();
  await httpSession.clear();
}
