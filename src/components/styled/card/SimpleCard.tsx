import type { JSX } from "solid-js";

import { CardDetails } from "./CardDetails";
import { CardHeader } from "./CardHeader";
import { CardOptions } from "./CardOptions";
import { As } from "~/components/As";

type SimpleCardProps = {
  amount: string;
  imgSrc: string;
  lastInvoiceDate: string;
  status: string;
  title: string;
};

export function CardContainer(props: { children: JSX.Element }) {
  return (
    <As
      as="div"
      css={`return \`._id {
  border-color: \${args.theme.var.color.primary_light_750};
  border-radius: 0.75rem;
  border-width: 1px;
  border-style: solid;
  overflow: hidden;
  background-color: \${args.theme.var.color.background_light_100};
  color: \${args.theme.var.color.background_light_100_text};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
    border-color: \${args.theme.var.color.primary_light_650};
  }
}\`;`}
    >
      {props.children}
    </As>
  );
}

export function CardHeaderContainer(props: { children: JSX.Element }) {
  return (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  align-items: center;
  background-color: \${args.theme.var.color.primary_light_900};
  color: \${args.theme.var.color.primary_light_900_text};
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-color: \${args.theme.var.color.primary_light_800};
  column-gap: 1rem;
  padding: 1.5rem;
}\`;`}
    >
      {props.children}
    </As>
  );
}

export function SimpleCard(props: SimpleCardProps) {
  return (
    <CardContainer>
      <CardHeaderContainer>
        <CardHeader imgSrc={props.imgSrc} title={props.title} />
        <CardOptions
          options={[
            {
              action: () => {},
              label: "View",
            },
            {
              action: () => {},
              label: "Edit",
            },
          ]}
          title={props.title}
        />
      </CardHeaderContainer>
      <CardDetails
        amount={props.amount}
        lastInvoiceDate={props.lastInvoiceDate}
        status={props.status}
      />
    </CardContainer>
  );
}
