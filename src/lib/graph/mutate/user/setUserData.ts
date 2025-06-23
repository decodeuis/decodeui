import type { SetStoreFunction } from "solid-js/store";

import { updateVertex } from "../core/setGraphData";
import { setSelectionValue } from "../selection/setSelectionValue";
import { addNewVertex } from "~/lib/graph/mutate/core/vertex/addNewVertex";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import { replaceVertexProperties } from "~/lib/graph/mutate/core/vertex/replaceVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

interface UserData {
  profileImage?: Vertex;
  roles?: Vertex[];
  user?: Vertex;
  userSetting?: Vertex;
}

export function setUserData(
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
  data: UserData,
) {
  if (data.user) {
    saveUser(data.user, graph, setGraph);
  }

  if (data.userSetting) {
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      userSettingId: data.userSetting.id,
    });
    updateVertex(data.userSetting.id, data.userSetting, graph, setGraph);
  } else {
    // Create a new userSetting vertex if not provided
    const newUserSettingId = `userSetting_${Date.now()}`;
    const newUserSetting: Vertex = {
      id: newUserSettingId,
      IN: {},
      L: [],
      OUT: {},
      P: {
        type: "UserSetting",
      },
    };

    addNewVertex(0, newUserSetting, graph, setGraph);
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      userSettingId: newUserSettingId,
    });
  }

  if (data.roles) {
    mergeVertexProperties(0, "globalStoreId", graph, setGraph, {
      userRoles: data.roles.map((role) => role.id),
    });
    for (const role of data.roles) {
      updateVertex(role.id, role, graph, setGraph);
    }
  }

  if (data.user && data.profileImage) {
    if (data.profileImage.id && !graph.vertexes[data.profileImage.id]) {
      addNewVertex(0, data.profileImage, graph, setGraph);
    }
    setSelectionValue(
      0,
      graph.vertexes.member,
      graph,
      setGraph,
      {
        id: "",
        L: [],
        P: {
          type: "UserProfileImage",
        },
      } as unknown as Vertex,
      data.profileImage.id,
    );
  }
}

function saveUser(
  user: Vertex,
  graph: GraphInterface,
  setGraph: SetStoreFunction<GraphInterface>,
) {
  if (graph.vertexes.member) {
    replaceVertexProperties(0, "member", graph, setGraph, user.P, {
      cloneProperties: false,
    });
  } else {
    addNewVertex(
      0,
      {
        ...user,
        id: "member",
        L: ["member"],
      },
      graph,
      setGraph,
    );
  }
}
