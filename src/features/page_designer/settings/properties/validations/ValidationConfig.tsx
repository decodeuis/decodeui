import { createSignal, For, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";

import { validateInput } from "./validateInput";
import { As } from "~/components/As";
import type { Vertex } from "~/lib/graph/type/vertex";

interface ValidationProps {
  componentName: string;
  data: Vertex;
  meta: Vertex;

  onChange(meta: Vertex, data: any): void;
}

export const validations = {
  SystemTextInput: "required|email|minLength|maxLength|regex",
};

export type ValidateFunction = (value: string) => string | undefined;

export interface ValidationConfigType {
  email: boolean;
  maxLength: number;
  minLength: number;
  regex: {
    enabled: boolean;
    message: string;
    value: string;
  }[];
  required: boolean;
  validate?: ValidateFunction | ValidateFunction[];
}

export function ValidationConfig(props: Readonly<ValidationProps>) {
  const rules =
    validations[props.componentName as keyof typeof validations]?.split("|") ||
    [];
  const [values, setValues] = createStore<ValidationConfigType>(
    props.data.P.validation || {},
  );

  const addRegex = () => {
    setValues("regex", [
      ...(values.regex || []),
      { enabled: true, message: "", value: "" },
    ]);
  };

  const deleteRegex = (index: number) => {
    setValues(
      "regex",
      values.regex.filter((_, i) => i !== index),
    );
    props.onChange(props.meta, values);
  };

  const RuleInput = (
    inputProps: Readonly<{
      label: string;
      onChange: (e: any) => void;
      rule: string;
      type: string;
      value: any;
    }>,
  ) => (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: space-between;
  margin-top: 6px;
}\`;`}
    >
      <As
        as="label"
        css={`return \`._id {
  font-size: 15px;
  display: flex;
}\`;`}
      >
        {inputProps.label}
      </As>
      <As
        as="input"
        checked={inputProps.type === "checkbox" ? inputProps.value : undefined}
        css={`return \`._id {
  border: 1px solid #3b82f6;
  font-size: 15px;
  display: flex;
  padding: 2px;
}\`;`}
        onChange={(e) => {
          inputProps.onChange(e);
          props.onChange(props.meta, values);
        }}
        type={inputProps.type}
        value={inputProps.value}
      />
    </As>
  );

  const RegexInput = (regexprops: Readonly<{ index: number }>) => (
    <div class="">
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: space-between;
  margin-top: 6px;
}\`;`}
      >
        <As
          as="label"
          css={`return \`._id {
  font-size: 15px;
  display: flex;
}\`;`}
        >
          Regex
        </As>
        <As
          as="input"
          css={`return \`._id {
  border: 1px solid #3b82f6;
  font-size: 15px;
  display: flex;
  padding: 2px;
}\`;`}
          onChange={(e) =>
            setValues("regex", regexprops.index, "value", e.target.value)
          }
          type="text"
          value={values.regex[regexprops.index].value}
        />
      </As>
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: space-between;
  margin-top: 6px;
}\`;`}
      >
        <As
          as="label"
          css={`return \`._id {
  font-size: 15px;
  display: flex;
}\`;`}
        >
          Enabled
        </As>
        <As
          as="input"
          checked={values.regex[regexprops.index].enabled}
          css={`return \`._id {
  border: 1px solid #3b82f6;
  font-size: 15px;
  display: flex;
  padding: 2px;
}\`;`}
          onChange={(e) =>
            setValues("regex", regexprops.index, "enabled", e.target.checked)
          }
          type="checkbox"
        />
      </As>
      <As
        as="div"
        css={`return \`._id {
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: space-between;
  margin-top: 6px;
}\`;`}
      >
        <As
          as="label"
          css={`return \`._id {
  font-size: 15px;
  display: flex;
}\`;`}
        >
          Message
        </As>
        <As
          as="input"
          css={`return \`._id {
  border: 1px solid #3b82f6;
  font-size: 15px;
  display: flex;
  padding: 2px;
}\`;`}
          onChange={(e) =>
            setValues("regex", regexprops.index, "message", e.target.value)
          }
          type="text"
          value={values.regex[regexprops.index].message}
        />
      </As>
      <div>
        <As
          as="button"
          css={`return \`._id {
  border: 1px solid #3b82f6;
  padding: 2px;
}\`;`}
          onClick={() => deleteRegex(regexprops.index)}
          type="button"
        >
          Delete Regex
        </As>
      </div>
    </div>
  );

  return (
    <div>
      <Show when={rules.length > 0}>
        <As
          as="h3"
          css={`return \`._id {
  font-weight: bold;
}\`;`}
        >
          Validations:
        </As>
      </Show>
      <For each={rules}>
        {(rule) => (
          <div>
            <Switch>
              <Match when={rule === "required"}>
                <RuleInput
                  label="Required"
                  onChange={(e) => setValues("required", e.target.checked)}
                  rule={rule}
                  type="checkbox"
                  value={values.required}
                />
              </Match>
              <Match when={rule === "email"}>
                <RuleInput
                  label="Email"
                  onChange={(e) => setValues("email", e.target.checked)}
                  rule={rule}
                  type="checkbox"
                  value={values.email}
                />
              </Match>
              <Match when={rule === "minLength"}>
                <RuleInput
                  label="Min Length"
                  onChange={(e) =>
                    setValues("minLength", Number.parseInt(e.target.value))
                  }
                  rule={rule}
                  type="number"
                  value={values.minLength}
                />
              </Match>
              <Match when={rule === "maxLength"}>
                <RuleInput
                  label="Max Length"
                  onChange={(e) =>
                    setValues("maxLength", Number.parseInt(e.target.value))
                  }
                  rule={rule}
                  type="number"
                  value={values.maxLength}
                />
              </Match>
              <Match when={rule === "regex"}>
                <button onClick={addRegex} type="button">
                  Add Regex
                </button>
                <For each={values.regex}>
                  {(_regex, index) => <RegexInput index={index()} />}
                </For>
              </Match>
            </Switch>
          </div>
        )}
      </For>
    </div>
  );
}

export const ValidationConfigTest = (validations: ValidationConfigType) => {
  const [values, setValues] = createSignal("");
  const [error, setError] = createSignal("");

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    setValues(value);
    setError("");
    const error = validateInput(validations, value, "test");
    if (error) {
      setError(error);
    }
  };

  return (
    <div>
      <input onChange={handleChange} type="text" value={values()} />
      {error() && <div class="error">{error()}</div>}
    </div>
  );
};
