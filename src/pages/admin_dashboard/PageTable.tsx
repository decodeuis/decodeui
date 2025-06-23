import { For } from "solid-js";
import {
  Table,
  TableBodyCell,
  TableHeadCell,
} from "~/components/styled/SimpleTable";
import { As } from "~/components/As";
import { findVertexIdsByLabel } from "~/lib/graph/get/sync/entity/findVertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

export function PageTable() {
  const [graph] = useGraph();

  const getPageData = () => {
    const pageIds = findVertexIdsByLabel(graph, "Page");
    return pageIds.map((id) => ({
      id,
      name: graph.vertexes[id]?.P?.name || "Untitled",
      path: graph.vertexes[id]?.P?.path || "",
      description: graph.vertexes[id]?.P?.description || "",
    }));
  };

  return (
    <As
      as="div"
      css={`return \`._id {
        margin-top: 40px;
      }\`;`}
    >
      <As
        as="h2"
        css={`return \`._id {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 20px;
          color: \${args.theme.var.color.text};
        }\`;`}
      >
        All Pages
      </As>
      <Table headers={4}>
        <>
          <TableHeadCell>ID</TableHeadCell>
          <TableHeadCell>Name</TableHeadCell>
          <TableHeadCell>Path</TableHeadCell>
          <TableHeadCell>Actions</TableHeadCell>
          <For each={getPageData()}>
            {(page, index) => (
              <>
                <TableBodyCell index={index()}>
                  <As
                    as="span"
                    css={`return \`._id {
                      font-family: \${args.theme.var.fontFamily.mono};
                      font-size: 0.9em;
                    }\`;`}
                  >
                    {page.id}
                  </As>
                </TableBodyCell>
                <TableBodyCell index={index()}>{page.name}</TableBodyCell>
                <TableBodyCell index={index()}>{page.path}</TableBodyCell>
                <TableBodyCell index={index()}>
                  <As
                    as="a"
                    href={`/admin/Page/${page.id}`}
                    css={`return \`._id {
                      color: \${args.theme.var.color.primary};
                      text-decoration: none;
                      padding: 4px 8px;
                      border-radius: 4px;
                      transition: all 0.2s ease;
                      
                      &:hover {
                        background-color: \${args.theme.var.color.primary_light_100};
                        color: \${args.theme.var.color.primary_dark_200};
                      }
                    }\`;`}
                  >
                    Open
                  </As>
                </TableBodyCell>
              </>
            )}
          </For>
        </>
      </Table>
    </As>
  );
}
