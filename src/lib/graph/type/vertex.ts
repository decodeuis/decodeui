import type { Id } from "~/lib/graph/type/id";
// implement changes feed like: https://pouchdb.com/guides/changes.html
// '_local/' prefix will not be synced, will not hae revision history, but need to provide the current _rev when you update local docs, just like with regular docs.

// this is the In-Memory Graph Store, entire application will be based on this to work offline.

// Saving a store to local storage serializes it -> accesses every property -> subscribes to the whole store
// https://github.com/solidjs-community/solid-primitives/tree/main/packages/storage
export interface Vertex<P extends object = { [key: string]: any }> {
  id: Id;
  IN: { [key: string]: Id[] };
  L: string[];
  OUT: { [key: string]: Id[] };
  P: P;
}
