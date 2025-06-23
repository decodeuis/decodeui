import type { Store } from "solid-js/store";

import { klona } from "klona";

import type { MutationArgs } from "~/cypher/types/MutationArgs";

import { removeUndefinedProperties } from "~/lib/data_structure/removeUndefinedProperties";

import type { InsertFnKey, TransactionValue } from "../types/TransactionType";
import type { TransactionDetail } from "../types/TransactionDetail";
import {
  hasChangesToCommit,
  hasRevertedCommittedChanges,
} from "../types/TransactionDetail";

import {
  getEdgeOldIdToNewIdMap,
  getVertexOldIdToNewIdMap,
} from "../../get/sync/store/getGlobalStore";
import { getActiveUndoIndex } from "../steps/getActiveUndoIndex";
import { updateVertexIdsToNew } from "~/lib/graph/mutate/core/vertex/updateVertexIdsToNew";
import { updateEdgeIdsToNew } from "~/lib/graph/mutate/core/edge/updateEdgeIdsToNew";
import type { Edge } from "~/lib/graph/type/edge";
import type { Vertex } from "~/lib/graph/type/vertex";
import type { GraphInterface } from "~/lib/graph/context/GraphInterface";

type ResultStep = {
  [key in InsertFnKey]?: Edge | Vertex;
};

// Test: Copy Save Undo AddHtmlField Save
export function commitTxn(
  txnId: number,
  graph: Store<GraphInterface>,
): MutationArgs | undefined {
  const validationError = validateTransaction(txnId, graph);
  if (validationError) {
    console.error("Transaction validation failed:", validationError);
    return;
  }

  const txnVertex = graph.vertexes[`txn${txnId}`];
  const txnDetail = txnVertex.P as TransactionDetail;

  // Quick check using our helper
  if (!hasChangesToCommit(txnDetail)) {
    return;
  }

  const submittedIndex = txnDetail.submittedIndex ?? -1;
  const originalSubmittedIndex =
    txnDetail.originalSubmittedIndex ?? submittedIndex;
  const activeUndoIndex = getActiveUndoIndex(txnId, graph);

  try {
    let revertSteps: TransactionValue[] = [];
    let steps: TransactionValue[];

    // Check if we're in a undo-after-save situation
    if (activeUndoIndex < submittedIndex) {
      // We've undone some committed steps, so we need to revert them
      const removedSteps = txnDetail.steps.slice(
        activeUndoIndex + 1,
        submittedIndex + 1,
      );
      // Combine with any existing revert steps
      revertSteps = [...removedSteps, ...txnDetail.revertSteps];
      // No forward steps in this case
      steps = [];
    }
    // Check if we've undone past the original submitted index (special case)
    else if (hasRevertedCommittedChanges(txnDetail)) {
      // If we're undoing past the original submitted index but have
      // revertSteps, make sure they're included
      steps = txnDetail.steps.slice(submittedIndex + 1, activeUndoIndex + 1);
      revertSteps = [...txnDetail.revertSteps];

      // If we don't have any explicit steps but did undo past original submitted,
      // we need to add revert steps for those operations
      if (steps.length === 0 && activeUndoIndex < originalSubmittedIndex) {
        const revertedCommittedSteps = txnDetail.steps.slice(
          activeUndoIndex + 1,
          originalSubmittedIndex + 1,
        );
        revertSteps = [...revertedCommittedSteps, ...revertSteps];
      }
    } else {
      // Normal case: just get new steps since last submitted index
      steps = txnDetail.steps.slice(submittedIndex + 1, activeUndoIndex + 1);
      revertSteps = [...txnDetail.revertSteps];
    }

    // console.log(`Commit check - Steps: ${steps.length}, Revert steps: ${revertSteps.length}`);

    // Sanity check that there are steps to commit
    if (steps.length === 0 && revertSteps.length === 0) {
      return;
    }

    // Get ID maps
    const vertexIdMap = getVertexOldIdToNewIdMap(graph);
    const edgeIdMap = getEdgeOldIdToNewIdMap(graph);

    // Create mutation args with proper typing
    const mutationArgs: MutationArgs = {
      edgeIdMap: Object.entries(edgeIdMap),
      transactions: [],
      txnId,
      vertexIdMap: Object.entries(vertexIdMap),
    };

    // Process revert steps
    const reverseStepsToCommit = [...revertSteps].reverse().map((txnDetail) => {
      return removeUndefinedProperties({
        deleteEdge: txnDetail.insertEdge
          ? updateEdgeIdsToNew(klona(txnDetail.originalData as Edge), graph)
          : undefined,
        deleteVertex: txnDetail.insert
          ? updateVertexIdsToNew(
              klona(txnDetail.originalData as Vertex),
              graph,
              true,
            )
          : undefined,
        insertEdge: txnDetail.deleteEdge
          ? updateEdgeIdsToNew(klona(txnDetail.originalData as Edge), graph)
          : undefined,
        insert: txnDetail.deleteVertex
          ? updateVertexIdsToNew(
              klona(txnDetail.originalData as Vertex),
              graph,
              true,
            )
          : undefined,
        merge: txnDetail.merge
          ? updateVertexIdsToNew(
              klona(txnDetail.originalData as Vertex),
              graph,
              true,
            )
          : undefined,
        replace: txnDetail.replace
          ? updateVertexIdsToNew(
              klona(txnDetail.originalData as Vertex),
              graph,
              true,
            )
          : undefined,
        replaceEdge: txnDetail.replaceEdge
          ? updateEdgeIdsToNew(klona(txnDetail.originalData as Edge), graph)
          : undefined,
      } as TransactionValue);
    });

    // Process forward steps
    const stepsToCommit = steps.map((txnDetail) => {
      return removeUndefinedProperties({
        deleteEdge: txnDetail.deleteEdge
          ? updateEdgeIdsToNew(klona(txnDetail.data as Edge), graph)
          : undefined,
        deleteVertex: txnDetail.deleteVertex
          ? updateVertexIdsToNew(klona(txnDetail.data as Vertex), graph, true)
          : undefined,
        insert: txnDetail.insert
          ? updateVertexIdsToNew(klona(txnDetail.data as Vertex), graph, true)
          : undefined,
        insertEdge: txnDetail.insertEdge
          ? updateEdgeIdsToNew(klona(txnDetail.data as Edge), graph)
          : undefined,
        merge: txnDetail.merge
          ? updateVertexIdsToNew(klona(txnDetail.data as Vertex), graph, true)
          : undefined,
        replace: txnDetail.replace
          ? updateVertexIdsToNew(klona(txnDetail.data as Vertex), graph, true)
          : undefined,
        replaceEdge: txnDetail.replaceEdge
          ? updateEdgeIdsToNew(klona(txnDetail.data as Edge), graph)
          : undefined,
      });
    });

    if (stepsToCommit.length || reverseStepsToCommit.length) {
      // Merge steps operating on the same entity before returning
      const allSteps = [...reverseStepsToCommit, ...stepsToCommit];
      mutationArgs.transactions = mergeStepsForSameEntities(allSteps);

      // When committing successfully, the updateSubmittedIndex function will be
      // called separately after server response in submitDataCall
      return mutationArgs;
    }
    return;
  } catch (error) {
    console.error("Error during transaction commit:", error);
    // Update transaction status to error
    return;
  }
}

// Helper function to merge steps that operate on the same entity
function mergeStepsForSameEntities(steps: ResultStep[]): ResultStep[] {
  const seenEntityIds = new Set<string>();
  const seenEdgeIds = new Set<string>();
  const edgesToDelete = new Set<string>();
  const result: ResultStep[] = [];

  // First pass: process all steps
  for (const step of steps) {
    // Handle merge operations
    if (step.merge) {
      const entityId = step.merge.id;

      // Check if we've seen this entity before
      const existingIndex = result.findIndex(
        (s) =>
          (s.merge && s.merge.id === entityId) ||
          (s.insert && s.insert.id === entityId),
      );

      if (existingIndex === -1) {
        // First occurrence - add to result
        result.push(step);
        seenEntityIds.add(entityId);
      } else {
        // Merge with existing step
        const existingStep = result[existingIndex];
        if (existingStep.insert) {
          // If the existing step is an insert, merge its properties with the merge step
          result[existingIndex] = {
            ...existingStep,
            insert: {
              ...(existingStep.insert as Vertex),
              P: {
                ...(existingStep.insert!.P || {}),
                ...(step.merge!.P || {}),
              },
            },
          };
        } else {
          // Otherwise merge with existing merge step
          result[existingIndex] = {
            ...existingStep,
            merge: {
              ...(existingStep.merge as Vertex),
              P: {
                ...(existingStep.merge!.P || {}),
                ...(step.merge!.P || {}),
              },
            },
          };
        }
      }
    }
    // Handle replace operations
    else if (step.replace) {
      const entityId = step.replace.id;

      // Check if we've seen this entity before
      const existingIndex = result.findIndex(
        (s) =>
          (s.replace && s.replace.id === entityId) ||
          (s.insert && s.insert.id === entityId),
      );

      if (existingIndex === -1) {
        // First occurrence - add to result
        result.push(step);
        seenEntityIds.add(entityId);
      } else {
        // Replace with existing step
        const existingStep = result[existingIndex];
        if (existingStep.insert) {
          // If the existing step is an insert, replace its properties
          result[existingIndex] = {
            ...existingStep,
            insert: {
              ...(existingStep.insert as Vertex),
              P: {
                ...(step.replace!.P || {}),
              },
            },
          };
        } else {
          // Otherwise add the replace step
          result[existingIndex] = step;
        }
      }
    }
    // Handle insertEdge operations
    else if (step.insertEdge) {
      const edgeId = step.insertEdge.id;
      result.push(step);
      seenEdgeIds.add(edgeId);
    }
    // Handle deleteEdge operations
    else if (step.deleteEdge) {
      const edgeId = step.deleteEdge.id;
      edgesToDelete.add(edgeId);

      // Remove any previous operations for this edge ID
      const filteredResult = result.filter(
        (s) =>
          !(
            (s.insertEdge && s.insertEdge.id === edgeId) ||
            (s.replaceEdge && s.replaceEdge.id === edgeId)
          ),
      );

      result.length = 0;
      result.push(...filteredResult);

      // Only add the delete operation if the edge wasn't just inserted in this transaction
      const wasInserted = seenEdgeIds.has(edgeId);
      if (!wasInserted) {
        result.push(step);
      }
      // Otherwise, if the edge was just inserted in this transaction,
      // we can omit both the insert and delete operations
    }
    // Handle edge modifications (replaceEdge)
    else if (step.replaceEdge) {
      const operation = step.replaceEdge;
      const edgeId = operation.id;

      // this will not happen, but lets keep it here for now.
      if (edgesToDelete.has(edgeId)) {
        // This edge is going to be deleted, so ignore modifications
        continue;
      }

      // Check if we've seen this edge before
      const existingIndex = result.findIndex(
        (s) =>
          (s.insertEdge && s.insertEdge.id === edgeId) ||
          (s.replaceEdge && s.replaceEdge.id === edgeId),
      );

      if (existingIndex === -1) {
        // First occurrence - add to result
        result.push(step);
      } else {
        // Update based on which operation this is
        if (step.replaceEdge) {
          if (result[existingIndex].insertEdge) {
            result[existingIndex].insertEdge.P = step.replaceEdge.P;
          } else if (result[existingIndex].replaceEdge) {
            result[existingIndex].replaceEdge.P = step.replaceEdge.P;
          }
        }
      }
    }
    // All other operations (not merge or edge related)
    else {
      // Non-merge, non-edge step - add as is
      result.push(step);
    }
  }

  return result;
}

function validateTransaction(
  txnId: number,
  graph: Store<GraphInterface>,
): string {
  if (!txnId) {
    return "Transaction ID is required";
  }

  const txnVertex = graph.vertexes[`txn${txnId}`];
  if (!txnVertex) {
    return `Transaction ${txnId} not found`;
  }

  return "";
}
