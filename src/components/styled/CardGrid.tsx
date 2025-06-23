import type { JSX } from "solid-js";
import { As } from "../As";

export function CardGrid(
  props: Readonly<{ cardSize: number; children: JSX.Element }>,
) {
  return (
    <As
      as="div"
      css={`return \`._id {
  display: grid;
  column-gap: 0.75rem;
  column-gap: 1rem;
  row-gap: 1rem;
  grid-template-columns: repeat(1, 1fr);
  margin-top: 1.5rem;
  @media (min-width: 1280px) {
    grid-template-columns: repeat(${props.cardSize}, 1fr);
  }
}\`;`}
    >
      {props.children}
    </As>
  );
}
