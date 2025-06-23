import type { APIEvent } from "@solidjs/start/server";
import { join } from "path";
import type { Session } from "neo4j-driver";
import { getDBSessionForSubdomain } from "~/cypher/session/getSessionForSubdomain";
import { handleAPIError } from "~/lib/api/server/apiErrorHandler";
import { createActivityLog } from "~/cypher/mutate/activity/createActivityLog";
import { ensureDirectoryExists } from "~/lib/files/ensureDirectoryExists";
import { fetchFormMetaData } from "~/pages/functions/fetchFormMetaData";
import type { ExportedSchema } from "./ExportedSchema";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { Edge } from "~/lib/graph/type/edge";

import { validateUserAndPermissions } from "~/routes/api/schema/export/validation/validateUserAndPermissions";
import { writeSchemaToFile } from "./export/utils/writeSchemaToFile";

export interface ExportStats {
  exportedComponents: string[];
  exportedPages: string[];
  totalVertices: number;
  totalEdges: number;
}

async function fetchEntities(
  dbSession: Session,
  entityType: "Component" | "Page",
): Promise<Record<string, ExportedSchema>> {
  const result = await dbSession.run(`
    MATCH (entity:${entityType})
    RETURN elementId(entity) as id, entity.key as key
    ORDER BY entity.key
  `);

  const entities: Record<string, ExportedSchema> = {};

  for (const record of result.records) {
    const entityId = record.get("id");
    const entityKey = record.get("key");
    if (!entityKey || !entityId) continue;

    // Fetch entity data using fetchFormMetaData
    const fetchResult = await fetchFormMetaData(
      entityType, // pageVertexName
      entityId, // formId
      undefined, // expression
      false, // isDesignMode
      undefined, // pageKeyName
      undefined, // url
      true, // skipComponentData
    );

    if (fetchResult.error || !fetchResult.data) {
      continue;
    }

    let vertexes: Vertex[] = [];
    let edges: Edge[] = [];

    // Extract vertices and edges directly from the result
    if (fetchResult.data.graph) {
      if (fetchResult.data.graph.vertexes) {
        vertexes = Object.values(fetchResult.data.graph.vertexes);
      }
      if (fetchResult.data.graph.edges) {
        edges = Object.values(fetchResult.data.graph.edges);
      }
    }

    entities[entityKey] = {
      vertexes: vertexes.map((v) => ({
        ...v,
        L: Array.isArray(v.L) ? v.L[0] : v.L,
      })),
      edges,
    };
  }

  return entities;
}

export async function GET({ request }: APIEvent) {
  const { dbSession, subDomain } = await getDBSessionForSubdomain(request);

  try {
    // Validate user and permissions
    const user = await validateUserAndPermissions(request, dbSession);

    // Create export directory path
    const exportBasePath = join(process.cwd(), "src", "page_schema");

    // Ensure base export directory exists
    await ensureDirectoryExists(exportBasePath);

    const stats: ExportStats = {
      exportedComponents: [],
      exportedPages: [],
      totalVertices: 0,
      totalEdges: 0,
    };

    // Fetch and export components
    const components = await fetchEntities(dbSession, "Component");
    for (const [key, schema] of Object.entries(components)) {
      await writeSchemaToFile(
        exportBasePath,
        subDomain,
        "components",
        key,
        schema,
      );
      stats.exportedComponents.push(key);
      stats.totalVertices += schema.vertexes.length;
      stats.totalEdges += schema.edges.length;
    }

    // Fetch and export pages
    const pages = await fetchEntities(dbSession, "Page");
    for (const [key, schema] of Object.entries(pages)) {
      await writeSchemaToFile(exportBasePath, subDomain, "pages", key, schema);
      stats.exportedPages.push(key);
      stats.totalVertices += schema.vertexes.length;
      stats.totalEdges += schema.edges.length;
    }

    // Log the export activity
    const tx = dbSession.beginTransaction();
    try {
      await createActivityLog(
        tx,
        "schema_export",
        "Schema",
        subDomain,
        user.P.email,
        `Exported ${stats.exportedComponents.length} components and ${stats.exportedPages.length} pages for subdomain: ${subDomain}. Total vertices: ${stats.totalVertices}, Total edges: ${stats.totalEdges}`,
      );
      await tx.commit();
    } catch (error) {
      await tx.rollback();
      throw error;
    }

    return {
      success: true,
      message: `Successfully exported ${stats.exportedComponents.length} components and ${stats.exportedPages.length} pages`,
      exportPath: join(exportBasePath, subDomain),
      details: {
        subdomain: subDomain,
        exportedComponents: stats.exportedComponents,
        exportedPages: stats.exportedPages,
        totalVertices: stats.totalVertices,
        totalEdges: stats.totalEdges,
      },
    };
  } catch (error) {
    return handleAPIError(error);
  } finally {
    await dbSession.close();
  }
}
