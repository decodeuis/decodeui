import { getHttpsSession } from "~/server/auth/session/getHttpsSession";
import type { Vertex } from "~/lib/graph/type/vertex";

export async function updateSession(user: Vertex) {
  const http_session = await getHttpsSession();
  await http_session.update((oldData) => ({
    ...oldData,
    user,
  }));
}
