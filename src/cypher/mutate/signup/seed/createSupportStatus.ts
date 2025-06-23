import type { Session, Transaction } from "neo4j-driver";

export const createSupportStatus = async (tx: Session | Transaction) => {
  const query = `
    MERGE (openStatus:SupportStatus {key: 'Open'})
    SET openStatus.name = 'Open'
    SET openStatus.description = 'The ticket is open and awaiting response.'
    
    MERGE (inProgressStatus:SupportStatus {key: 'In Progress'})
    SET inProgressStatus.name = 'In Progress'
    SET inProgressStatus.description = 'The ticket is currently being worked on.'
    
    MERGE (resolvedStatus:SupportStatus {key: 'Resolved'})
    SET resolvedStatus.name = 'Resolved'
    SET resolvedStatus.description = 'The ticket has been resolved.'
    
    MERGE (closedStatus:SupportStatus {key: 'Closed'})
    SET closedStatus.name = 'Closed'
    SET closedStatus.description = 'The ticket has been closed.'
  `;

  try {
    await tx.run(query);
  } catch (error) {
    console.error("Error creating SupportStatus vertices:", error);
    throw error;
  }
};
