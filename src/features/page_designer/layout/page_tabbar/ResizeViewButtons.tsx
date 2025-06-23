import { toTitle } from "case-switcher-js";
import { createEffect, createSignal } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { IconButton } from "~/components/styled/IconButton";
import { DIMENSIONS } from "~/components/styled/ResizableDivView";
import { As } from "~/components/As";
import { headerIconButtonCss } from "~/pages/settings/constants";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

type DimensionType = {
  height: string;
  view: string;
  width: string;
};

export const ResizeViewButtons = (props: {
  formStoreId: string;
  openIndex: number;
}) => {
  const [graph, setGraph] = useGraph();
  const [isLandscape, setIsLandscape] = createSignal(true);

  const formStoreVertex = () =>
    graph.vertexes[props.formStoreId!] as Vertex<FormStoreObject>;
  const openedView = () => formStoreVertex()?.P.openedViews[props.openIndex];
  const viewVertex = () =>
    graph.vertexes[openedView()] as Vertex<{
      height: string;
      view: string;
      width: string;
    }>;

  // Extract number from dimension string like "100px"
  const extractNumber = (value: string): number =>
    Number.parseInt(value.match(/(\d+)/)?.[0] || "0", 10);

  // Determine if dimensions represent landscape orientation
  const isDimensionsLandscape = (width: string, height: string): boolean =>
    extractNumber(width) >= extractNumber(height);

  // Update dimensions and set orientation
  const updateDimensions = (dimensions: Partial<DimensionType>) => {
    mergeVertexProperties(0, openedView(), graph, setGraph, dimensions);

    // Update orientation if both width and height are provided
    if (dimensions.width && dimensions.height) {
      setIsLandscape(
        isDimensionsLandscape(dimensions.width, dimensions.height),
      );
    }
  };

  // Initialize dimensions if not set
  createEffect(() => {
    const view = viewVertex();
    if (view?.P.width && view?.P.height) {
      // Determine initial orientation
      setIsLandscape(isDimensionsLandscape(view.P.width, view.P.height));
    } else {
      const defaultDimension = DIMENSIONS.desktop;
      updateDimensions({
        height: defaultDimension.height,
        view: defaultDimension.id,
        width: defaultDimension.width,
      });
    }
  });

  const handleDimensionSelect = (selected: string) => {
    if (selected === "custom") {
      return;
    }
    const dimension = DIMENSIONS[selected as keyof typeof DIMENSIONS];
    updateDimensions({
      height: dimension.height,
      view: dimension.id,
      width: dimension.width,
    });
  };

  const handleDimensionChange = (
    dimension: "height" | "width",
    value: string,
  ) => {
    updateDimensions({
      [dimension]: value,
      view: "custom",
    });
  };

  const handleKeyDown = (
    e: KeyboardEvent,
    dimension: "height" | "width",
    currentValue: string,
  ) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();

      const numericMatch = currentValue.match(/(\d+)/);
      if (numericMatch) {
        const numericPart = Number.parseInt(numericMatch[0], 10);
        const prefix = currentValue.substring(0, numericMatch.index);
        const suffix = currentValue.substring(
          numericMatch.index! + numericMatch[0].length,
        );

        const newNumericValue =
          e.key === "ArrowUp" ? numericPart + 1 : numericPart - 1;
        const newValue = `${prefix}${newNumericValue}${suffix}`;

        handleDimensionChange(dimension, newValue);
      }
    }
  };

  const toggleOrientation = () => {
    const view = viewVertex();
    if (view?.P.width && view?.P.height) {
      // Swap width and height
      updateDimensions({
        height: view.P.width,
        view: "custom",
        width: view.P.height,
      });

      setIsLandscape(!isLandscape());
    }
  };

  const commonInputCss = `return \`._id {
    border: 1px solid \${args.theme.var.color.border};
    border-radius: 5px;
    padding: 0.15rem;
    width: 4.5rem;
    height: 28px;
    background-color: \${args.theme.var.color.background_light_100};
    color: \${args.theme.var.color.text};
  }\`;`;

  return (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  gap: 2px;
  align-items: center;
  font-size: 0.8rem;
}\`;`}
    >
      <As
        as="select"
        css={`return \`._id {
  border: 1px solid \${args.theme.var.color.border};
  border-radius: 5px;
  padding: 0.15rem;
  height: 28px;
  background-color: \${args.theme.var.color.background_light_100};
  color: \${args.theme.var.color.text};
}\`;`}
        onChange={(e) => handleDimensionSelect(e.target.value)}
        title="Select size"
        value={viewVertex()?.P.view?.toLowerCase()}
      >
        {Object.entries(DIMENSIONS).map(([key, value]) => (
          <option value={key}>{toTitle(value.id)}</option>
        ))}
        <option value="custom">Custom</option>
      </As>

      <As
        as="div"
        css={`return \`._id {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}\`;`}
      >
        <As
          as="input"
          css={commonInputCss}
          onChange={(e) => handleDimensionChange("width", e.target.value)}
          onKeyDown={(e) =>
            handleKeyDown(e, "width", viewVertex()?.P.width || "")
          }
          title="Width"
          type="text"
          value={viewVertex()?.P.width || ""}
        />
        <As
          as="span"
          css={`return \`._id {
  display: flex;
  align-items: center;
}\`;`}
        >
          ×
        </As>
        <As
          as="input"
          css={commonInputCss}
          onChange={(e) => handleDimensionChange("height", e.target.value)}
          onKeyDown={(e) =>
            handleKeyDown(e, "height", viewVertex()?.P.height || "")
          }
          title="Height"
          type="text"
          value={viewVertex()?.P.height || ""}
        />
      </As>

      <IconButton
        css={headerIconButtonCss}
        icon="ph:device-mobile-speaker"
        iconCss={`return \`._id {transition:transform 0.2s; ${isLandscape() ? "transform: rotate(90deg);" : ""}}\`;`}
        onClick={toggleOrientation}
        size={18}
        title={isLandscape() ? "Switch to Portrait" : "Switch to Landscape"}
      />
    </As>
  );
};
