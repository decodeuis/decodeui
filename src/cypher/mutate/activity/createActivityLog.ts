import type { Session, Transaction } from "neo4j-driver";

export async function createActivityLog(
  dbSession: Session | Transaction,
  action: string,
  entityType: string,
  entityId: string,
  updatedByEmail: string,
  details?: string,
) {
  await dbSession.run(
    `CREATE (a:ActivityLog {
      action: $action,
      entityType: $entityType,
      entityId: $entityId,
      updatedBy: $updatedByEmail,
      createdAt: datetime(),
      details: $details
    })`,
    {
      action,
      details: details ?? null,
      entityId,
      entityType,
      updatedByEmail,
    },
  );
}
