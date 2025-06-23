import { createMemo, createSignal } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";
import { v7 as uuidv7 } from "uuid";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { FileManagerObject } from "~/features/file_manager/FileManagerContext";
import type { FieldAttribute } from "~/lib/meta/FormMetadataType";

type SaveState = {
  isLoading: boolean;
};

// Define a type for function arguments with saveState in contextData
interface SaveStateFunctionArgumentType extends FunctionArgumentType {
  contextData: {
    saveState: [SaveState, SetStoreFunction<SaveState>];
    [key: string]: unknown;
  };
}

import { useToast } from "~/components/styled/modal/Toast";
import { FilePickerModal } from "~/components/file_picker/FilePickerModal";
import { getDownloadLink } from "~/features/file_manager/sidebar/getDownloadLink";
import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { evalExpression } from "~/lib/expression_eval";
import {
  getMemberVertex,
  getProfileImageVertex,
} from "~/lib/graph/get/sync/store/getMemberVertex";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { profileImage, SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { SchemaRenderer } from "../../SchemaRenderer";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function ProfileImageSettings() {
  const [openDialog, setOpenDialog] = createSignal(false);
  const [graph, setGraph] = useGraph();
  const { showErrorToast, showSuccessToast } = useToast();
  let fileManagerStore: FileManagerObject;

  const formDataId = uuidv7();
  addNewVertex(
    0,
    {
      id: formDataId,
      IN: {},
      L: ["User"],
      OUT: {},
      P: {},
    },
    graph,
    setGraph,
  );
  const profileImageVertexCopy = getProfileImageVertex(graph);
  if (profileImageVertexCopy?.id) {
    setSelectionValue(
      0,
      graph.vertexes[formDataId],
      graph,
      setGraph,
      { id: "", IN: {}, L: [], OUT: {}, P: { type: "UserProfileImage" } },
      profileImageVertexCopy.id,
    );
  }

  const onFileSelected = () => {
    const selectedFile = fileManagerStore.gridStore?.[0].selectedRows[0];
    if (!selectedFile) {
      showErrorToast("Please select a file");
      return;
    }

    const selectedFileMetaVertex = {
      id: "",
      IN: {},
      L: [],
      OUT: {},
      P: {
        type: "UserProfileImage",
      },
    };

    setSelectionValue(
      0,
      graph.vertexes[formDataId],
      graph,
      setGraph,
      selectedFileMetaVertex,
      selectedFile.id,
    );

    setOpenDialog(false);
  };

  const setFileManagerStore = (fileManagerStore_: FileManagerObject) => {
    fileManagerStore = fileManagerStore_;
  };

  const form = {
    as: "div",
    attributes: [
      {
        as: "div",
        attributes: [
          {
            as: "span",
            css: SETTINGS_CONSTANTS.LABEL_CSS,
            componentName: "Html",
            text: "Profile Image",
          },
          {
            as: "img",
            css: `return \`._id {
  cursor: pointer;
  height: 60px;
}\`;`,
            componentName: "Html",
            key: "profileImage",
            props: () => {
              const selectedFile = profileImageVertex()[0];
              return {
                onClick: () => setOpenDialog(true),
                src: getDownloadLink(selectedFile) || profileImage,
              };
            },
          },
          {
            as: "div",
            componentName: "Html",
          },
          {
            as: "button",
            css: [
              SETTINGS_CONSTANTS.SECONDARY_BUTTON_CSS,
              `return \`._id {margin-right:auto;}\`;`,
            ],
            componentName: "Html",
            props: () => ({
              onClick: () => setOpenDialog(true),
            }),
            text: "Change Profile Image",
          },
          {
            attributes: [
              {
                as: "button",
                css: SETTINGS_CONSTANTS.SAVE_BUTTON_CSS,
                componentName: "Html",
                props: (options: SaveStateFunctionArgumentType) => ({
                  disabled: options.contextData.saveState[0]?.isLoading,
                  onClick: async () => {
                    const selectedFile = profileImageVertex()[0];
                    if (!selectedFile) {
                      showErrorToast("Please select a profile image first");
                      return;
                    }

                    try {
                      options.contextData.saveState[1]("isLoading", true);
                      const memberVertex = getMemberVertex(graph);
                      const response = await postAPI(
                        API.auth.updateProfileImageUrl,
                        {
                          profileImage: selectedFile.id,
                          uuid: memberVertex.P.uuid,
                        },
                      );

                      if (response.error) {
                        showErrorToast(response.error as string);
                      } else {
                        showSuccessToast("Profile image updated successfully");
                      }
                    } catch (error) {
                      showErrorToast((error as Error).message);
                    } finally {
                      options.contextData.saveState[1]("isLoading", false);
                    }
                  },
                  text: options.contextData.saveState[0]?.isLoading
                    ? "Saving..."
                    : "Save Changes",
                }),
              },
            ],
            componentName: "Data",
            name: "saveState",

            props: () => ({
              data: createStore<SaveState>({
                isLoading: false,
              }),
            }),
          },
        ],
        css: SETTINGS_CONSTANTS.GRID_ITEM_NARROW_CSS,
        componentName: "Html",
        props: (options: SaveStateFunctionArgumentType) => ({
          onUnmount: () => {
            options.revertTransactionUpToIndex(options.txnId, -1);
          },
        }),
      },
    ],
    css: SETTINGS_CONSTANTS.FORM_CSS,
    componentName: "Html",
  } as FieldAttribute;

  const profileImageVertex = createMemo(() => {
    return (
      evalExpression("->$0ProfileImage", {
        graph,
        setGraph,
        vertexes: [graph.vertexes[formDataId]],
      }) || []
    );
  });

  return (
    <div>
      <SchemaRenderer
        form={{ attributes: [form], key: "ProfileImage" }}
        formDataId={formDataId}
      />
      <FilePickerModal
        onFileSelected={onFileSelected}
        open={openDialog}
        selectedFileVertex={profileImageVertex()}
        setFileManagerStore={setFileManagerStore}
        setOpen={setOpenDialog}
      />
    </div>
  );
}
