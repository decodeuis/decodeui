import { fetchComponentDataPure } from "~/cypher/get/fetchComponentData";
import type { ServerResult } from "~/cypher/types/ServerResult";

/**
 * Fetches component data for all components referenced in the provided graph data
 * Recursively fetches nested components until all dependencies are resolved
 * @param graphData The graph data containing vertices to scan for component references
 * @returns Array of component data results, empty array if no components found
 */
export async function fetchComponentDataFromGraph(graphData?: {
  graph?: { vertexes: Record<string, any> };
}): Promise<ServerResult[]> {
  if (!graphData?.graph?.vertexes) {
    return [];
  }

  const allFetchedComponents = new Set<string>();
  const componentDataResults: ServerResult[] = [];

  // Helper function to extract component names from vertices
  const extractComponentNames = (
    vertices: Record<string, any>,
  ): Set<string> => {
    const componentNames = new Set<string>();

    for (const vertex of Object.values(vertices)) {
      if (vertex.L.includes("Attr") && vertex.P.componentName) {
        // Skip "Html", "Data" and "Slot" components
        if (!["Html", "Data", "Slot"].includes(vertex.P.componentName)) {
          componentNames.add(vertex.P.componentName);
        }
      }
    }

    return componentNames;
  };

  // Start with component names from the initial graph data
  let currentVertices = graphData.graph.vertexes;

  while (true) {
    // Extract component names from current vertices
    const componentNames = extractComponentNames(currentVertices);

    // Filter out already fetched components
    const newComponentNames = Array.from(componentNames).filter(
      (name) => !allFetchedComponents.has(name),
    );

    // If no new components to fetch, we're done
    if (newComponentNames.length === 0) {
      break;
    }

    // Fetch the new components
    const componentData = await fetchComponentDataPure(newComponentNames);

    if (componentData?.graph?.vertexes) {
      // Mark these components as fetched
      for (const name of newComponentNames) {
        allFetchedComponents.add(name);
      }

      // Add the component data to results array
      componentDataResults.push(componentData);

      // Set current vertices to the newly fetched ones for next iteration
      currentVertices = componentData.graph.vertexes;
    } else {
      // If fetch failed or returned no data, break to avoid infinite loop
      break;
    }
  }

  return componentDataResults;
}
