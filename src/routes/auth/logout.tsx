import { useNavigate } from "@solidjs/router";
import { onMount } from "solid-js";

import { API } from "~/lib/api/endpoints";
import { postAPI } from "~/lib/api/general/postApi";
import { As } from "~/components/As";
import { Loader } from "~/components/Loader";
import { deleteVertex } from "~/lib/graph/mutate/core/vertex/deleteVertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export default function Logout() {
  const navigate = useNavigate();
  const [graph, setGraph] = useGraph();

  onMount(async () => {
    try {
      // Create a minimum 2-second delay
      const minimumDelay = new Promise((resolve) => setTimeout(resolve, 2000));

      // Execute API call and minimum delay in parallel
      await Promise.all([postAPI(API.auth.logOutUrl, {}), minimumDelay]);

      // Delete member vertex from the graph
      deleteVertex(0, "member", graph, setGraph);

      // Navigate to signIn page with replaced history
      navigate(API.urls.admin.signIn, { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if there's an error, navigate to signIn
      navigate(API.urls.admin.signIn, { replace: true });
    }
  });

  // Return a nicer looking loading component
  return (
    <As
      as="div"
      css={`return \`._id {
        min-height: 100vh;
        background-color: \${args.theme.var.color.background};
        padding: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }\`;`}
    >
      <As
        as="div"
        css={`return \`._id {
          background-color: \${args.theme.var.color.background_light_100};
          padding: 32px;
          border-radius: 8px;
          box-shadow: 1px 2px 3px \${args.theme.var.color.primary};
          text-align: center;
        }\`;`}
      >
        <As
          as="h2"
          css={`return \`._id {
            margin-bottom: 16px;
            color: \${args.theme.var.color.text};
          }\`;`}
        >
          Logging out...
        </As>
        <Loader message="" size="medium" />
      </As>
    </As>
  );
}
/*
    props.onClose();

    await showLoadingToast({
      loadMessage: "Logging Out...",
      onSuccess: (value) => {
        if (value?.message != null) {
          navigate(API.urls.admin.signIn);
        }
      },
      promise: postAPI(API.auth.logOutUrl, {}),
      successMessage: "Log Out Successfully",
    });

    deleteVertex(0, "member", graph, setGraph);
*/
