import {
  batch,
  createMemo,
  createSignal,
  For,
  getOwner,
  onMount,
  runWithOwner,
  Show,
} from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { MultiSelectField, type Option } from "~/components/styled/MultiSelect";
import { fetchDataFromDB } from "~/cypher/get/fetchDataFromDB";
import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getErrorMessage } from "~/lib/api/general/getErrorMessage";
import { isValidResponse } from "~/lib/api/general/isValidResponse";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { isObject } from "~/lib/data_structure/object/isObject";
import { evalExpression } from "~/lib/expression_eval";
import { selectedValue } from "~/lib/graph/get/sync/edge/selectedValue";
import { onChangeHandler } from "~/lib/graph/mutate/form/onChangeHandler";
import { setValueGlobal } from "~/lib/graph/mutate/form/setValueGlobal";
import { setSelectValueHelper } from "~/lib/graph/mutate/selection/setSelectValueHelper";
import { commitTxn } from "~/lib/graph/transaction/core/commitTxn";
import { generateNewTxnId } from "~/lib/graph/transaction/core/generateNewTxnId";

import { useFormContext } from "../../form/context/FormContext";
import { isStaticOptions } from "./functions/isStaticOptions";
import { IdAttr } from "~/lib/graph/type/idAttr";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";

// displayExpr is required when meta.P.collection is complex
export function SelectField(
  props: Readonly<{
    css?: string;
    data?: Vertex;
    isRealTime?: boolean;
    meta?: Vertex;
    onChange?: (value: string) => void;
    placeholder?: string;
    title: string;
    txnId?: number;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const formId = useFormContext();
  const formVertex = () => graph.vertexes[formId!] as Vertex<FormStoreObject>;
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => props.meta ?? parentRenderContext()?.context.meta!;
  const data = () => props.data ?? parentRenderContext()?.context.data!;
  const [loading, setLoading] = createSignal(false);
  const [options, setOptions] = createSignal([] as any[]);
  const [error, setError] = createSignal("");
  const componentName = () => parentRenderContext()?.context.componentName!;
  const outerOwner = getOwner();

  const getCollection = () =>
    typeof meta().P.collection === "function"
      ? meta().P.collection()
      : meta().P.collection;

  const memoizedOptions = createMemo(() => {
    const options = meta().P.options;
    return typeof options === "function" ? options() : options;
  });

  const getStaticOptions = (
    options: string | { label: string; value: string }[],
  ) => {
    if (typeof options === "string") {
      const lines = options.split("\n");
      return lines.map((item) => {
        const [label, val] = item.split(",");
        if (val === undefined) {
          return meta().P.valueKey
            ? { id: label.trim(), label: label.trim() }
            : label.trim();
        }
        return { id: val.trim(), label: label.trim() };
      });
    }
    if (Array.isArray(options)) {
      return options;
    }
    return options ? [options] : [];
  };

  const getSelectedOptions = () => {
    return selectedValue(meta(), data(), graph).map(
      (vertexId) => graph.vertexes[vertexId],
    );
  };

  const _getDynamicOptions = () => {
    return (
      evalExpression(getCollection(), {
        graph,
        setGraph,
        vertexes: [data()],
      }) || []
    );
  };

  const loadOptions = async () => {
    let parsedOptions: any[] = [];
    const collection = runWithOwner(outerOwner, () => getCollection());
    runWithOwner(outerOwner, () => {
      setError("");
      if (memoizedOptions()) {
        parsedOptions = getStaticOptions(memoizedOptions());
        setOptions(parsedOptions);
        return parsedOptions;
      }
      if (props.disabled) {
        parsedOptions = getSelectedOptions();
        setOptions(parsedOptions);
        return parsedOptions;
      }
      if (collection && meta().P.useLocalStorage) {
        parsedOptions =
          evalExpression(collection, {
            graph,
            setGraph,
            vertexes: [data()],
          }) || [];
        setOptions(parsedOptions);
        return parsedOptions;
      }
    });
    if (parsedOptions.length) {
      return;
    }

    if (collection) {
      runWithOwner(outerOwner, () => {
        setLoading(true);
      });

      const res = await fetchDataFromDB(
        { expression: collection },
        {
          nodes: {},
          relationships: {},
          vertexes: [data()],
        },
      );
      if (isValidResponse(res)) {
        parsedOptions = res.result || [];
      } else {
        const errorMsg = getErrorMessage(res);
        if (errorMsg) {
          runWithOwner(outerOwner, () => {
            setError(errorMsg);
          });
        }
      }
      runWithOwner(outerOwner, () => {
        setOptions(parsedOptions);
        setLoading(false);
      });
      return;
    }
    runWithOwner(outerOwner, () => setOptions(parsedOptions));
  };

  function getComponent() {
    // TODO: find when the direction is set?
    const direction = meta().P.dir;
    if (!componentName() && direction) {
      return direction === "->" ? "Select" : "MultiSelect";
    }
    return componentName();
  }

  onMount(() => {
    if (isStaticOptions(meta())) {
      loadOptions();
    }
  });

  const onChangeSelect = (value: Option[], isRemove: boolean) => {
    runWithOwner(outerOwner, () => {
      batch(() => {
        if (!value) {
          return;
        }
        let txnId = formVertex().P.txnId ?? 0;
        if (props.isRealTime) {
          txnId = generateNewTxnId(graph, setGraph);
        }
        if (isStaticOptions(meta())) {
          let parsedValue;
          if (isRemove) {
            parsedValue = null;
          } else if (getComponent() === "Select") {
            parsedValue = isObject(value[0])
              ? // @ts-expect-error ignore
                value[0][meta().P.valueKey || "id"]
              : value[0];
          } else {
            parsedValue = value;
          }
          if (props.onChange) {
            props.onChange(parsedValue);
          } else {
            setValueGlobal(
              graph,
              setGraph,
              txnId,
              meta(),
              data(),
              parsedValue,
              false,
            );
          }
        } else {
          setSelectValueHelper(
            txnId,
            meta(),
            data(),
            getComponent(),
            value,
            isRemove,
            graph,
            setGraph,
          );
        }
        onChangeHandler(
          txnId,
          graph.vertexes[formVertex().P.formDataId!],
          data(),
          meta(),
          graph,
          setGraph,
        );
        if (props.isRealTime) {
          commitTxn(txnId, graph);
        }
      });
    });
  };

  return (
    <Show
      fallback={
        <For each={selectedValue(meta(), data(), graph)}>
          {(vertexId) => (
            <>
              {evalExpression(meta().P.displayExpr || `::'P.${IdAttr}'`, {
                graph,
                vertexes: [graph.vertexes[vertexId]],
              })}
            </>
          )}
        </For>
      }
      when={!props.disabled}
    >
      <MultiSelectField
        childrenKey={meta().P.childrenKey}
        css={props.css}
        disable={props.disabled}
        displayValueKey={
          meta().P.labelKey
            ? meta().P.labelKey
            : "::'P.displayName'||::'P.key'||::'P.id'||::'label'"
        }
        error={error()}
        isLoadingOptions={loading()}
        loadOptions={loadOptions}
        onRemove={(e) => onChangeSelect(e, true)}
        onSelect={(e) => onChangeSelect(e, false)}
        options={options()}
        optionValueKey={meta().P.valueKey ? meta().P.valueKey : "id"}
        placeholder={`${props.placeholder || ""}`}
        renderLabel={meta().P.renderLabel}
        selectedValues={() => {
          if (isStaticOptions(meta())) {
            const value = data()?.P[meta().P[IdAttr]];
            if (!value) {
              return [];
            }
            if (!Array.isArray(value) && getComponent() === "Select") {
              const option = options().find(
                (option) =>
                  (value?.[meta().P.valueKey ?? "id"] || value) ===
                  (option?.[meta().P.valueKey ?? "id"] || option),
              );
              return option ? [option] : [{ label: value, value }];
            }
            return ensureArray(value);
          }
          return selectedValue(meta(), data(), graph).map((id) => {
            return graph.vertexes[id];
          });
        }}
        selectionLimit={getComponent() === "Select" ? 1 : undefined}
      />
    </Show>
  );
}
