import { Icon } from "@iconify-icon/solid";
import { createSignal } from "solid-js";

import { TableInputField } from "~/components/fields/table_field/TableInputField";
import { PlusIconButton } from "~/components/styled/buttons/PlusIconButton";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";

interface TablePanelProps {
  title?: string;
  icon?: string;
  data?: Vertex;
  meta: Vertex;
  addButtonAriaLabel?: string;
  isNoPermissionCheck?: boolean;
  isRealTime?: boolean;
}

export function TablePanel(props: TablePanelProps) {
  const [addRowFn, setAddRowFn] = createSignal<(() => void) | undefined>();

  const handleAddNewRow = () => {
    const fn = addRowFn();
    if (fn) {
      fn();
    }
  };

  return (
    <As
      as="div"
      css={`return \`._id {
        margin-top: 6px;
      }\`;`}
    >
      <As
        as="div"
        css={`return \`._id {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }\`;`}
      >
        <As
          as="h3"
          css={`return \`._id {
            color: \${args.theme.var.color.text};
            font-size: 1rem;
            font-weight: 600;
            line-height: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }\`;`}
        >
          {props.icon && <Icon icon={props.icon} />}
          {props.title}
        </As>
        <PlusIconButton
          onClick={handleAddNewRow}
          ariaLabel={props.addButtonAriaLabel || "Add new row"}
        />
      </As>

      <As
        as="div"
        css={`return \`._id {
          margin-top: 0.5rem;
        }\`;`}
      >
        <TableInputField
          data={props.data}
          hideAddButton={true}
          isNoPermissionCheck={props.isNoPermissionCheck ?? true}
          isRealTime={props.isRealTime ?? false}
          meta={props.meta}
          onAddRef={setAddRowFn}
        />
      </As>
    </As>
  );
}
