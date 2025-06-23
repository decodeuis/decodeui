import { As } from "~/components/As";
import { SimpleCard } from "./SimpleCard";

export function CardGrids() {
  return (
    <As
      as="div"
      css={`return \`._id {
  max-width: 80rem;
  margin-left: auto; margin-right: auto;
  padding-left: 1rem; padding-right: 1rem;
  padding-left: 1.5rem@sm; padding-right: 1.5rem@sm;
  padding-left: 2rem@lg; padding-right: 2rem@lg;
}\`;`}
    >
      <As
        as="div"
        css={`return \`._id {
  // max-width: 42rem;
  /* max-width: none@lg; */
  margin-left: auto; margin-right: auto;
  margin-left: 0@lg; margin-right: 0@lg;
}\`;`}
      >
        <As
          as="div"
          css={`return \`._id {
  display: flex;
  align-items: center;
  justify-content: space-between;
}\`;`}
        >
          <As
            as="h2"
            css={`return \`._id {
  color: \${args.theme.var.color.primary};
  font-size: 1rem;
  font-weight: 600;
}\`;`}
          >
            Recent Users
          </As>
          <As
            as="a"
            css={`return \`._id {
  color: \${args.theme.var.color.primary_light_300};
  font-size: 0.875rem;
  font-weight: 600;
  &:hover {
    color: \${args.theme.var.color.primary};
  }
}\`;`}
            href="#"
          >
            View all<span class="sr-only">, clients</span>
          </As>
        </As>
        <As
          as="ul"
          css={`return \`._id {
  display: grid;
  column-gap: 1.5rem;
  row-gap: 2rem;
  grid-template-columns: repeat(1, 1fr);
  margin-top: 1.5rem;
}\`;`}
        >
          <SimpleCard
            amount="$2,000.00"
            imgSrc="https://tailwindui.com/img/logos/48x48/tuple.svg"
            lastInvoiceDate="December 13, 2022"
            status="Overdue"
            title="Tuple"
          />
          <SimpleCard
            amount="$14,000.00"
            imgSrc="https://tailwindui.com/img/logos/48x48/savvycal.svg"
            lastInvoiceDate="January 22, 2023"
            status="Paid"
            title="SavvyCal"
          />
          <SimpleCard
            amount="$7,600.00"
            imgSrc="https://tailwindui.com/img/logos/48x48/reform.svg"
            lastInvoiceDate="January 23, 2023"
            status="Paid"
            title="Reform"
          />
        </As>
      </As>
    </As>
  );
}
