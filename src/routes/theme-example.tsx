import { ThemeExample } from "~/components/styled/ThemeExample";

export default function ThemeExamplePage() {
  return (
    <div
      style={{
        padding: "2rem",
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        "min-height": "100vh",
      }}
    >
      <h1 style={{ "margin-bottom": "2rem", "text-align": "center" }}>
        Theme Example
      </h1>
      <ThemeExample />
    </div>
  );
}
