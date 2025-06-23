declare module "acorn-jsx" {
  export interface BaseExpression {
    start: number;
  }

  export interface JSXAttribute extends BaseExpression {
    elements?: Expression[];
    expression?: Expression | null;
    name: { name: string };
    type: "JSXAttribute";
    value: Expression;
  }

  export interface JSXAttributeExpression extends BaseExpression {
    argument?: Expression;
    type: "JSXAttributeExpression";
  }

  export interface ArrowFunctionExpression extends BaseExpression {
    argument?: Expression;
    async: boolean;
    body: Expression;
    expression: true;
    generator: boolean;
    params: Identifier[];
    type: "ArrowFunctionExpression";
  }

  export interface JSXFragment {
    children: JSXElement[];
    end: number;
    openingFragment: OpeningElement;
    start: number;
    type: "JSXFragment";
  }

  export interface OpeningElement extends JSXElement {
    attributes: JSXAttribute[];
  }

  export interface JSXElement extends BaseExpression {
    children: JSXElement[];
    name: JSXIdentifier | JSXMemberExpression;
    openingElement: OpeningElement;
    type: "JSXElement";
  }

  export interface JSXExpressionContainer extends BaseExpression {
    expression: Expression;
    type: "JSXExpressionContainer";
  }

  export interface JSXIdentifier extends BaseExpression {
    name: string;
    type: "JSXIdentifier";
  }

  export interface JSXMemberExpression extends BaseExpression {
    object: JSXIdentifier | JSXMemberExpression;
    property: JSXIdentifier | JSXMemberExpression;
    type: "JSXMemberExpression";
  }

  export interface JSXSpreadAttribute extends BaseExpression {
    argument: Identifier;
    type: "JSXSpreadAttribute";
  }

  export interface JSXText extends BaseExpression {
    type: "JSXText";
    value: string;
  }

  export interface ArrayExpression extends BaseExpression {
    elements: Expression[];
    type: "ArrayExpression";
  }

  export interface BinaryExpression extends BaseExpression {
    left: Expression;
    operator: string;
    right: Expression;
    type: "BinaryExpression";
  }

  export interface CallExpression extends BaseExpression {
    arguments: Expression[];
    callee: Expression;
    type: "CallExpression";
  }

  export interface ConditionalExpression extends BaseExpression {
    alternate: Expression;
    consequent: Expression;
    test: Expression;
    type: "ConditionalExpression";
  }

  export interface ExpressionStatement extends BaseExpression {
    expression: Expression;
    type: "ExpressionStatement";
  }

  export interface Identifier extends BaseExpression {
    name: string;
    type: "Identifier";
  }

  export interface Literal extends BaseExpression {
    type: "Literal";
    value: string;
  }

  export interface LogicalExpression extends BaseExpression {
    left: Expression;
    operator: string;
    right: Expression;
    type: "LogicalExpression";
  }

  export interface MemberExpression extends BaseExpression {
    computed: boolean;
    name?: string;
    object: Literal | MemberExpression;
    property?: MemberExpression;
    raw?: string;
    type: "MemberExpression";
  }

  export interface ObjectExpression extends BaseExpression {
    properties: [
      {
        key: { name?: string; value?: string };
        value: Expression;
      },
    ];
    type: "ObjectExpression";
  }

  export interface TemplateElement extends BaseExpression {
    type: "TemplateElement";
    value: { cooked: string };
  }

  export interface TemplateLiteral extends BaseExpression {
    expressions: Expression[];
    quasis: Expression[];
    type: "TemplateLiteral";
  }

  export interface UnaryExpression extends BaseExpression {
    argument: { value: any };
    operator: string;
    type: "UnaryExpression";
  }

  export type Expression =
    | ArrayExpression
    | ArrowFunctionExpression
    | BinaryExpression
    | CallExpression
    | ConditionalExpression
    | ExpressionStatement
    | Identifier
    | JSXAttribute
    | JSXAttributeExpression
    | JSXElement
    | JSXExpressionContainer
    | JSXFragment
    | JSXSpreadAttribute
    | JSXText
    | Literal
    | LogicalExpression
    | MemberExpression
    | ObjectExpression
    | TemplateElement
    | TemplateLiteral
    | UnaryExpression;

  interface PluginOptions {
    allowNamespacedObjects?: boolean;
    allowNamespaces?: boolean;
    autoCloseVoidElements?: boolean;
  }

  export default function (options?: PluginOptions): any;
}
