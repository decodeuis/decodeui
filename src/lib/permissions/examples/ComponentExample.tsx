import { PermissionGuard } from "~/lib/permissions/examples/PermissionGuard";

/**
 * Example usage of the PermissionGuard component
 */
export function AdminDashboard() {
  return (
    <PermissionGuard path="/admin/dashboard">
      <div class="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <p>This content is only visible to users with admin privileges</p>
        {/* Admin dashboard content */}
      </div>
    </PermissionGuard>
  );
}
