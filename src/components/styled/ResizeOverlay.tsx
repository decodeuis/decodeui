import { Portal } from "solid-js/web";

export function ResizeOverlay() {
  return (
    <Portal>
      <div
        style={{
          bottom: "0",
          left: "0",
          position: "fixed",
          right: "0",
          top: "0",
          "z-index": "9999",
        }}
      />
    </Portal>
  );
}
