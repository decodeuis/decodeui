export interface NestedExpression {
  expression: string;
  incoming?: NestedExpression[];
  outgoing?: NestedExpression[];
}
