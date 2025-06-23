export class APIError extends Error {
  constructor(
    message: string,
    public status = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return {
      details: error.details,
      error: error.message,
    };
  }

  // Check if it's a Neo4j error
  if (
    error instanceof Error &&
    "code" in error &&
    typeof (error as any).code === "string" &&
    (error as any).code.startsWith("Neo")
  ) {
    const neo4jError = error as any;
    const errorMessage = neo4jError.message || error.message;
    const errorCode = neo4jError.code || "Unknown";

    // Clean up the error message for better readability
    const cleanMessage = errorMessage
      .replace(/^.*?:\s*/, "") // Remove prefix like "Neo4jError: "
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    return new Response(
      JSON.stringify({
        error: `Database Error (${errorCode}): ${cleanMessage}`,
        code: errorCode,
        details: neo4jError.retriable
          ? "This error may be retriable."
          : undefined,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }

  const message =
    error instanceof Error ? error.message : "An unknown error occurred";
  return new Response(JSON.stringify({ error: message }), {
    headers: { "Content-Type": "application/json" },
    status: 500,
  });
}
