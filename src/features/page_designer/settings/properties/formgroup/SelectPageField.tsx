import type { FormStoreObject } from "~/components/form/context/FormContext";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { IconButton } from "~/components/styled/IconButton";
import { useDesignerFormIdContext } from "~/features/page_designer/context/LayoutContext";
import { headerIconButtonCss } from "~/pages/settings/constants";

import { Label } from "./Label";
import { As } from "~/components/As";
import { IdAttr } from "~/lib/graph/type/idAttr";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function SelectPageField(
  props: Readonly<{
    meta: Vertex;
    onChange: (meta: Vertex, data: any) => void;
    selectedLayout: Vertex;
    txnId: number;
  }>,
) {
  const [graph] = useGraph();
  let buttonRef: HTMLInputElement;

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  const RenderLabel = (option: Vertex, _isSelected: boolean) => {
    return (
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 4px;
}\`;`}
      >
        <span>{option.P.key}</span>
        <IconButton
          icon={"ph:gear"}
          iconCss={headerIconButtonCss}
          onClick={(e) => {
            e.stopPropagation();
            window.open(`/admin/Page/${option.id}`, "_blank");
          }}
          size={22}
        />
      </As>
    );
  };

  const meta = {
    P: {
      css: `return \`._id {
  display: flex;
}\`;`,
      collection: `g:'Page'`,
      componentName: "Select",
      displayName: props.meta.P.displayName,
      key: props.meta.P.key,
      renderLabel: RenderLabel,
    },
  } as unknown as Vertex;

  const SelectThankYouPage = () => {
    return (
      <DynamicComponent
        componentName={"Select"}
        data={props.selectedLayout}
        isNoPermissionCheck={true}
        isRealTime={false}
        meta={meta}
        noLabel
        txnId={formStoreVertex()?.P.txnId}
      />
    );
  };

  const AddNewPageButton = () => {
    const handleAddNewClick = () => {
      window.open("/admin/Page/new", "_blank");
    };
    return (
      <IconButton
        icon="ic:round-add"
        onClick={handleAddNewClick}
        size={21}
        title="Add New Rule"
      />
    );
  };

  return (
    <As
      as="div"
      css={`${
        props.selectedLayout?.P[props.meta.P[IdAttr]] !== undefined &&
        props.selectedLayout?.P[props.meta.P[IdAttr]] !== null
          ? `return \`._id {
  border: 2px solid #008000;
  border-bottom: none;
  border-top: none;
  padding: 2px 3px;
  border-radius: 5px;
}\`;`
          : ""
      } ._id {
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: space-between;
  margin-top: 6px;
}`}
    >
      <As
        as="span"
        css={`return \`._id {
  font-size: 15px;
  flex: 0.5;
}\`;`}
      >
        {/* Show Page After Submission */}
        <Label meta={props.meta} />
      </As>
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  font-size: 15px;
  flex: 1;
}\`;`}
        ref={buttonRef!}
      >
        <SelectThankYouPage />
        <AddNewPageButton />
      </As>
    </As>
  );
}
