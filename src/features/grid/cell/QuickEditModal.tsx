import type { Setter } from "solid-js";

import { PageViewWrapper } from "~/pages/PageViewWrapper";

import { CustomModal } from "../../../components/styled/modal/CustomModal";

// Deprecated
export const QuickEditModal = (p: {
  disabled?: boolean;
  info: any;
  onClose: Setter<boolean>;
  tableId: string;
}) => {
  const closePopUp = () => {
    p.onClose(false);
  };

  return (
    <CustomModal
      dialogCss={`return \`._id {min-width: 30%; padding: 6px;}\`;`}
      open={() => !!p.tableId}
      setOpen={() => p.onClose(false)}
      title="Quick Edit"
    >
      <PageViewWrapper
        closePopUp={closePopUp}
        dataId={p.info.row.original.id}
        pageVertexName={p.tableId}
      />
    </CustomModal>
  );
};
