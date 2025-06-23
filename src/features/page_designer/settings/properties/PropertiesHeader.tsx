import type { FormStoreObject } from "~/components/form/context/FormContext";

import { useDesignerFormIdContext } from "../../context/LayoutContext";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

// depricated:
export function PropertiesHeader() {
  const [graph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const _formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  return (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  align-items: center;
  cursor: pointer;
  justify-content: space-between;
}\`;`}
    >
      <As
        as="div"
        css={`return \`._id {
  font-size: 16px;
  display: flex;
  font-weight: bold;
  margin-bottom: 2px;
  margin-left: 5px;
  padding: 3px 0px;
  text-align: left;
}\`;`}
      >
        Properties
        {/* <OpenComponentSettings id={formStoreVertex()?.P.selectedComponent as string} />
        <OpenComponentURL
          meta={graph.vertexes[formStoreVertex()?.P.selectedComponent]}
        /> */}
      </As>
    </As>
  );
}
