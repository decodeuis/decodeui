import type { NestedExpression } from "~/cypher/types/NestedExpression";

import type { FieldAttribute } from "../../../../meta/FormMetadataType";

import { getInEdge } from "./getInEdge";
import { getToEdge } from "./getToEdge";
import type { Vertex } from "~/lib/graph/type/vertex";

export function getEdgesFromRowsAttr(
  metaAttrs: FieldAttribute[],
  ignoreTables = false,
): {
  incoming: NestedExpression[];
  outgoing: NestedExpression[];
} {
  const outgoing = [] as NestedExpression[];
  const incoming = [] as NestedExpression[];

  function processAttributes(attributes: FieldAttribute[]) {
    for (const attribute of attributes) {
      if (ignoreTables && attribute.hideInGrid) {
        continue;
      }
      if (attribute.ignoreFetch) {
        continue;
      }
      if (
        attribute.componentName === "Select" ||
        attribute.componentName === "MultiSelect"
      ) {
        if (attribute.inward) {
          incoming.push({
            expression: `<-${getInEdge(
              { P: attribute } as unknown as Vertex,
              { L: ["$0"] } as unknown as Vertex,
            )}`,
          }); // `<-${capitalizedName}$0`
        } else {
          outgoing.push({
            expression: `->${getToEdge(
              { P: attribute } as unknown as Vertex,
              { L: ["$0"] } as unknown as Vertex,
            )}`,
          }); // `->$0${capitalizedName}`
        }
      } else if (
        attribute.componentName === "Table" ||
        attribute.componentName === "DynamicTable"
      ) {
        if (ignoreTables) {
          continue;
        }

        const expression: NestedExpression = attribute.inward
          ? {
              expression: `<-${getInEdge(
                { P: attribute } as unknown as Vertex,
                { L: ["$0"] } as unknown as Vertex,
              )}`,
            }
          : {
              expression: `->${getToEdge(
                { P: attribute } as unknown as Vertex,
                { L: ["$0"] } as unknown as Vertex,
              )}`,
            };

        if (attribute.attributes) {
          const nested = getEdgesFromRowsAttr(attribute.attributes);
          expression.incoming = nested.incoming;
          expression.outgoing = nested.outgoing;
        }

        if (attribute.inward) {
          incoming.push(expression);
        } else {
          outgoing.push(expression);
        }
      } else if (attribute.attributes) {
        processAttributes(attribute.attributes);
      }
    }
  }

  processAttributes(metaAttrs);

  return { incoming, outgoing };
}
