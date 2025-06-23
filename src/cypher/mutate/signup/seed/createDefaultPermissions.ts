// TODO: this is access levels, not permissions
import type { Session, Transaction } from "neo4j-driver";

export async function createDefaultPermissions(_tx: Session | Transaction) {
  return;
  // const query = `
  //   MERGE (insert:Perm {key: 'insert'})
  //   MERGE (edit:Perm {key: 'edit'})
  //   MERGE (view:Perm {key: 'view'})
  //   MERGE (delete:Perm {key: 'delete'})
  // `;
  //
  // try {
  //   await tx.run(query);
  // } catch (error) {
  //   console.error("Error creating default permissions:", error);
  //   throw error;
  // }
}

/*
// Create permissions
UNWIND [
  {key: 'create:user', name: 'Create User', description: 'Can create new users'},
  {key: 'delete:user', name: 'Delete User', description: 'Can delete users'},
  {key: 'edit:user', name: 'Edit User', description: 'Can edit user details'},
  {key: 'view:user', name: 'View User', description: 'Can view user details'},
  {key: 'manage:roles', name: 'Manage Roles', description: 'Can manage roles'},
  {key: 'manage:system', name: 'Manage System', description: 'Can manage system settings'},
  {key: 'upload:files', name: 'Upload Files', description: 'Can upload files'},
  {key: 'delete:files', name: 'Delete Files', description: 'Can delete files'},
  {key: 'view:files', name: 'View Files', description: 'Can view files'}
] AS perm
MERGE (p:Permission {key: perm.key})
SET p += perm;
*/
