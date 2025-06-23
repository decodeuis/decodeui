# CSS-in-JS Styling System

This styling system uses the `<As>` component for HTML elements and
CSS strings for styling.

## Key Components

### 1. The `<As>` Component

The `<As>` component replaces HTML elements and applies CSS styles with a unique ID selector.

```tsx
import { As } from "~/components/As";

<As as="div" css={myCssFunction}>
  Content goes here
</As>
```

### 2. CSS Functions

Define CSS using functions that return CSS strings with the `._id` selector:

```tsx
const buttonCss = () => `
  ._id {
    background-color: \${args.theme.var.color.primary};
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
  }
  
  ._id:hover {
    background-color: var(--primary-dark);
  }
`;
```

### 3. Helper Functions

Use the provided helper functions in `~/lib/styles`:

```tsx
import { css, mergeCss, responsive, withStates } from "~/lib/styles";

// Define CSS using template literals
const myCss = () => css`
  ._id {
    color: \${args.theme.var.color.primary};
  }
`;
```

### Example

```tsx
import { As } from "~/components/As";

const containerCss = () => `
  ._id {
    padding: 10px;
    display: grid;
    gap: 20px;
  }
`;

const labelCss = () => `
  ._id {
    color: \${args.theme.var.color.primary};
    font-weight: 500;
    font-size: 15px;
  }
`;

<As as="div" css={containerCss}>
  <As as="span" css={labelCss}>Label</As>
</As>
```
