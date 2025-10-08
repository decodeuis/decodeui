import type { ExportedSchema } from "~/routes/api/schema/ExportedSchema";
import { parseHjsonPreservingMultiline } from "~/lib/hjson/parseHjsonPreservingMultiline";

export interface WebsiteSchemas {
  components?: Record<string, ExportedSchema>;
  pages?: Record<string, ExportedSchema>;
  themes?: Record<string, ExportedSchema>;
  functions?: Record<string, ExportedSchema>;
}

type AllWebsiteSchemas = Record<string, WebsiteSchemas>;
type SchemaType = "components" | "pages" | "themes" | "functions";

interface ParsedPath {
  websiteName: string;
  schemaType: SchemaType;
  fileName: string;
}

// Helper function to parse module paths
function parseModulePath(path: string): ParsedPath | null {
  const parts = path.split("/");
  if (parts.length < 4) return null;

  const schemaType = parts[2];
  if (
    schemaType !== "components" &&
    schemaType !== "pages" &&
    schemaType !== "themes" &&
    schemaType !== "functions"
  )
    return null;

  return {
    websiteName: parts[1],
    schemaType: schemaType as SchemaType,
    fileName: parts[3].replace(".hjson", ""),
  };
}

// Helper to process a single schema file
function processSchemaFile(
  schemas: AllWebsiteSchemas | WebsiteSchemas,
  parsedPath: ParsedPath,
  content: string,
): void {
  try {
    const schema = parseHjsonPreservingMultiline(content);

    // Handle both AllWebsiteSchemas and WebsiteSchemas types
    if ("components" in schemas || "pages" in schemas || "themes" in schemas || "functions" in schemas) {
      // WebsiteSchemas
      const websiteSchemas = schemas as WebsiteSchemas;
      if (!websiteSchemas[parsedPath.schemaType]) {
        websiteSchemas[parsedPath.schemaType] = {};
      }
      websiteSchemas[parsedPath.schemaType]![parsedPath.fileName] = schema;
    } else {
      // AllWebsiteSchemas
      const allSchemas = schemas as AllWebsiteSchemas;
      if (!allSchemas[parsedPath.websiteName]) {
        allSchemas[parsedPath.websiteName] = {};
      }
      if (!allSchemas[parsedPath.websiteName][parsedPath.schemaType]) {
        allSchemas[parsedPath.websiteName][parsedPath.schemaType] = {};
      }
      allSchemas[parsedPath.websiteName][parsedPath.schemaType]![
        parsedPath.fileName
      ] = schema;
    }
  } catch (error) {
    console.error(
      `Failed to parse schema at ${parsedPath.websiteName}/${parsedPath.schemaType}/${parsedPath.fileName}:`,
      error,
    );
  }
}

// Function to determine which website schemas to load
export function getWebsiteNameForSubdomain(
  subdomain: string,
  domain?: string,
): string | null {
  // For localhost in dev, load all websites
  if (subdomain === "admin") {
    return null; // Load all
  }

  // Otherwise use subdomain as website name
  return subdomain;
}

// Cache for website schemas to avoid reloading
const websiteSchemaCache = new Map<string, WebsiteSchemas>();

// Get specific website schemas synchronously with caching
export function getWebsiteSchemasSync(websiteName: string): WebsiteSchemas {
  // Check cache first
  if (websiteSchemaCache.has(websiteName)) {
    return websiteSchemaCache.get(websiteName)!;
  }

  const schemas: WebsiteSchemas = { components: {}, pages: {}, themes: {}, functions: {} };

  // We have to use the general pattern, but we'll filter efficiently
  // Use explicit default import for better compatibility
  const allModules = import.meta.glob("./*/*/**.hjson", {
    eager: true,
    query: "?raw",
    import: "default",
  }) as Record<string, string>;

  // Process only modules for this specific website
  for (const [path, content] of Object.entries(allModules)) {
    const parsedPath = parseModulePath(path);
    if (!parsedPath || parsedPath.websiteName !== websiteName) continue;

    processSchemaFile(schemas, parsedPath, content);
  }

  // Cache the result for future use
  // websiteSchemaCache.set(websiteName, schemas);

  return schemas;
}

// function to get schemas based on subdomain
export function getSchemasForSubdomain(
  subdomain: string,
  domain?: string,
): AllWebsiteSchemas | WebsiteSchemas {
  const websiteName = getWebsiteNameForSubdomain(subdomain, domain);

  if (websiteName === null) {
    // Return all schemas - need to load them all
    return loadAllWebsiteSchemasSync();
  } else {
    // Return only specific website schemas
    return getWebsiteSchemasSync(websiteName);
  }
}

// Load all website schemas synchronously (used when we need all schemas)
function loadAllWebsiteSchemasSync(): AllWebsiteSchemas {
  const schemas: AllWebsiteSchemas = {};

  // Import all hjson files synchronously
  // Use explicit default import for better compatibility
  const eagerModules = import.meta.glob("./*/*/**.hjson", {
    eager: true,
    query: "?raw",
    import: "default",
  }) as Record<string, string>;

  for (const [path, content] of Object.entries(eagerModules)) {
    const parsedPath = parseModulePath(path);
    if (!parsedPath) continue;

    processSchemaFile(schemas, parsedPath, content);
  }

  return schemas;
}
