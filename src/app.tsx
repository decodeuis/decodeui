import { MetaProvider } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { clientOnly } from "@solidjs/start";
import { FileRoutes } from "@solidjs/start/router";
import { ToastProvider } from "solid-hot-toast";

// import "~/base.css";
import { ErrorBoundary, onMount, Suspense, createSignal, Show } from "solid-js";
import { isServer } from "solid-js/web";

import { createAppState } from "~/createAppState";
import { ThemeProvider } from "./lib/theme/ThemeProvider";
import { logError } from "./lib/error/errorLogger";
import { setupGlobalErrorHandlers } from "./lib/error/globalErrorHandler";
import { toastValue } from "./toastValue";
import { GraphContext } from "~/lib/graph/context/GraphContext";
import { GetInitialData } from "./GetInitialData";

// Create a generic error fallback component
const ErrorFallback = (props: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  console.error(props.error);
  return (
    <div class="error-boundary-fallback">
      <h2>Something went wrong</h2>
      <p>{props.error.message}</p>
      <button onClick={props.resetErrorBoundary}>Try again</button>
    </div>
  );
};

// Note: When we use createResource, it will temporary display Suspense fallback
export default function App() {
  const graph = createAppState();
  const [isHydrated, setIsHydrated] = createSignal(false);
  const Toaster = clientOnly(() => import("./Toaster"));

  // Set up global error handlers on client-side only
  onMount(() => {
    if (!isServer) {
      setupGlobalErrorHandlers();
      // Set isHydrated to true after a short delay to ensure components are ready
      setTimeout(() => {
        setIsHydrated(true);
      }, 3000);
    }
  });

  return (
    <ToastProvider {...toastValue}>
      <GraphContext.Provider value={graph}>
        <Router
          root={(props) => {
            // <A> and 'use' router primitives can be only used inside a Route.
            // const location = useLocation();
            return (
              <MetaProvider>
                <ErrorBoundary
                  fallback={(error, reset) => {
                    // Log the UI error
                    if (!isServer) {
                      logError(error, { location: location.pathname });
                    }
                    return (
                      <ErrorFallback error={error} resetErrorBoundary={reset} />
                    );
                  }}
                >
                  <Suspense>
                    <GetInitialData dontRedirectToLogin={true}>
                      <ThemeProvider>
                        <Suspense>{props.children}</Suspense>
                      </ThemeProvider>
                    </GetInitialData>
                  </Suspense>
                  <Show when={isHydrated()}>
                    {/* <Show when={!location.pathname.startsWith("/email-templates")}> */}
                    <Toaster />
                    {/* </Show> */}
                  </Show>
                </ErrorBoundary>
              </MetaProvider>
            );
          }}
        >
          <FileRoutes />
        </Router>
      </GraphContext.Provider>
    </ToastProvider>
  );
}
