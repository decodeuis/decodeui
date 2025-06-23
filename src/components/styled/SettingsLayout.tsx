import { useSearchParams } from "@solidjs/router";
import { type Component, createEffect, createSignal, Suspense } from "solid-js";

import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import type { IFormMetaData } from "~/lib/meta/FormMetadataType";

import { HeaderWithDescription } from "~/components/styled/HeaderWithDescription";
import { isAdminRole } from "~/lib/graph/get/sync/auth/isAdminRole";
import { SchemaRenderer } from "~/pages/SchemaRenderer";
import { STYLES } from "~/pages/settings/constants";
import { Dynamic } from "solid-js/web";
import { Loader } from "../Loader";
import { useGraph } from "~/lib/graph/context/UseGraph";

export interface MenuItem {
  adminOnly?: boolean;
  component: Component;
  group?: string;
  icon?: string;
  id: string;
  label: string;
}

interface SettingsLayoutProps {
  description: string;
  menuItems: MenuItem[];
  title: string;
}

export function SettingsLayout(props: SettingsLayoutProps) {
  const [graph] = useGraph();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = createSignal(
    (searchParams.tab as string) || props.menuItems[0]?.id || "",
  );

  createEffect(() => {
    const tab = searchParams.tab;
    if (tab !== selectedMenu()) {
      setSelectedMenu(
        typeof tab === "string" ? tab : props.menuItems[0]?.id || "",
      );
    }
  });

  const handleMenuSelect = (id: string) => {
    setSearchParams({ tab: id });
  };

  const groupedMenuItems = () => {
    const groups: Record<string, MenuItem[]> = {};
    props.menuItems.forEach((item) => {
      const group = item.group || "default";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
    });
    return groups;
  };

  type DataType = [string, MenuItem[]];

  // Create a schema for the SettingsLayout
  const settingsLayoutSchema: IFormMetaData = {
    attributes: [
      {
        as: "div",
        attributes: [
          {
            componentName: "Html",
            as: "title",
            props: () => ({
              text: `${props.title} - ${props.menuItems.find((item) => item.id === selectedMenu())?.label}`,
            }),
          },
          {
            css: `return \`._id {
  flex: 1;
}\`;`,
            // @ts-expect-error - HeaderWithDescription is a function component
            componentName: HeaderWithDescription,
            props: () => ({
              description: props.description,
              title: props.title,
            }),
          },
          {
            as: "div",
            attributes: [
              {
                as: "div",
                attributes: [
                  {
                    attributes: [
                      {
                        as: "div",
                        attributes: [
                          {
                            as: "",
                            attributes: [
                              {
                                as: "div",
                                css: `return \`._id {
  font-size: 14px;
  color: \${args.theme.var.color.text_light_300};
  font-weight: 500;
  margin-bottom: 8px;
}\`;`,
                                componentName: "Html",
                                props: (args: FunctionArgumentType) => ({
                                  text: (
                                    args.contextData.menuGroups as DataType
                                  )[0],
                                }),
                              },
                            ],
                            componentName: "Html",
                            props: (args: FunctionArgumentType) => ({
                              hide:
                                (args.contextData.menuGroups as DataType)[0] ===
                                "default",
                            }),
                          },
                          {
                            attributes: [
                              {
                                as: "div",
                                componentName: "Html",
                                css: (args) => [
                                  `return \`._id {
                                    padding: 12px;
                                    cursor: pointer;
                                    border-radius: 4px;
                                    margin-bottom: 8px;
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                  }\`;`,
                                  selectedMenu() ===
                                  (args.contextData.menuItems as MenuItem).id
                                    ? `return \`._id {
                                        background-color: \${args.theme.var.color.primary};
                                        color: \${args.theme.var.color.primary_text};
                                      }\`;`
                                    : `return \`._id {
                                        color: \${args.theme.var.color.text_dark_700};
                                        &:hover {
                                          background-color: \${args.theme.var.color.primary_light_800};
                                        }
                                      }\`;`,
                                ],
                                props: (args: FunctionArgumentType) => ({
                                  hide:
                                    (args.contextData.menuItems as MenuItem)
                                      .adminOnly && !isAdminRole(graph),
                                  onClick: () =>
                                    handleMenuSelect(
                                      (args.contextData.menuItems as MenuItem)
                                        .id,
                                    ),
                                }),
                                attributes: [
                                  {
                                    componentName: "Html",
                                    as: "icon",
                                    props: (args: FunctionArgumentType) => ({
                                      icon: (
                                        args.contextData.menuItems as MenuItem
                                      ).icon,
                                      hide: !(
                                        args.contextData.menuItems as MenuItem
                                      ).icon,
                                    }),
                                  },
                                  {
                                    componentName: "Html",
                                    props: (args: FunctionArgumentType) => ({
                                      text: (
                                        args.contextData.menuItems as MenuItem
                                      ).label,
                                    }),
                                  },
                                ],
                              },
                            ],
                            componentName: "Data",
                            loop: true,
                            name: "menuItems",
                            props: (args: FunctionArgumentType) => ({
                              data: (
                                args.contextData.menuGroups as DataType
                              )[1],
                            }),
                          },
                        ],
                        css: `return \`._id {
  margin-bottom: 16px;
}\`;`,
                        componentName: "Html",
                        props: (args: FunctionArgumentType) => ({
                          show: (
                            args.contextData.menuGroups as DataType
                          )[1].some(
                            (item: MenuItem) =>
                              !item.adminOnly || isAdminRole(graph),
                          ),
                        }),
                      },
                    ],
                    componentName: "Data",
                    name: "menuGroups",
                    props: () => ({
                      data: Object.entries(groupedMenuItems()),
                      loop: true,
                    }),
                  },
                ],
                css: [
                  STYLES.overflowCss,
                  `return \`._id {
  height:calc(100vh - 140px);
  border-right:1px solid \${args.theme.var.color.border};
}\`;`,
                ],
                componentName: "Html",
              },
              {
                as: "div",
                attributes: [
                  {
                    componentName: "Html",
                    props: () => ({
                      componentName: () => (
                        <Suspense
                          fallback={<Loader message="Loading" size="medium" />}
                        >
                          <Dynamic
                            component={
                              props.menuItems.find(
                                (item) => item.id === selectedMenu(),
                              )?.component
                            }
                          />
                        </Suspense>
                      ),
                    }),
                  },
                ],
                css: `return \`._id {
  flex: 1;
  padding: 6px;
}\`;`,
                componentName: "Html",
              },
            ],
            css: `return \`._id {
  display: grid;
  grid-template-columns: 250px 1fr;
  padding: 6px;
}\`;`,
            componentName: "Html",
          },
        ],
        componentName: "Html",
      },
    ],
    key: "settingsLayout",
  };

  return <SchemaRenderer form={settingsLayoutSchema} />;
}
