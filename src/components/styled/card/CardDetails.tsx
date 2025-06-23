import type { JSX } from "solid-js";
import { As } from "~/components/As";

export function CardDetailRow(props: { children: JSX.Element; label: string }) {
  return (
    <As
      as="div"
      css={`return \`._id {
  display: flex;
  column-gap: 1rem;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid \${args.theme.var.color.primary_light_850};
  
  &:last-child {
    border-bottom: none;
  }
}\`;`}
    >
      <As
        as="dt"
        css={`return \`._id {
  color: \${args.theme.var.color.text_light_450};
  font-weight: 500;
}\`;`}
      >
        {props.label}
      </As>
      <As
        as="dd"
        css={`return \`._id {
  color: \${args.theme.var.color.text_light_150};
  font-weight: 600;
}\`;`}
      >
        {props.children}
      </As>
    </As>
  );
}

export function CardDetails(props: {
  amount: string;
  lastInvoiceDate: string;
  status: string;
}) {
  return (
    <CardDetailsContainer>
      <CardDetailRow label="Amount">
        <span>{props.amount}</span>
      </CardDetailRow>
      <CardDetailRow label="Status">
        <Status status={props.status} />
      </CardDetailRow>
      <CardDetailRow label="Last invoice">
        <time datetime={props.lastInvoiceDate}>{props.lastInvoiceDate}</time>
      </CardDetailRow>
    </CardDetailsContainer>
  );
}

export function CardDetailsContainer(props: { children: JSX.Element }) {
  return (
    <As
      as="dl"
      css={`return \`._id {
  font-size: 0.875rem;
  padding: 1.25rem 1.5rem;
  background-color: \${args.theme.var.color.background_light_100};
  color: \${args.theme.var.color.background_light_100_text};
  border-top: 1px solid \${args.theme.var.color.primary_light_800};
}\`;`}
    >
      {props.children}
    </As>
  );
}

export function Status(props: { status: string }) {
  return (
    <As
      as="span"
      css={[
        `return \`._id {
          border-radius: 0.375rem;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          line-height: 1rem;
          font-weight: 500;
          display: inline-block;
        }\`;`,
        props.status === "Overdue"
          ? `return \`._id {
              color: \${args.theme.var.color.error_light_850_text};
              background-color: \${args.theme.var.color.error_light_850};
            }\`;`
          : props.status === "Paid"
            ? `return \`._id {
                color: \${args.theme.var.color.success_light_850_text};
                background-color: \${args.theme.var.color.success_light_850};
              }\`;`
            : `return \`._id {
                color: \${args.theme.var.color.warning_light_850_text};
                background-color: \${args.theme.var.color.warning_light_850};
              }\`;`,
      ]}
    >
      {props.status}
    </As>
  );
}
