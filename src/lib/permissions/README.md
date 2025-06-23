# URL Permission System

This directory contains a permission validation system for controlling access to URLs in the application.

## Overview

The permission system provides a flexible way to define access rules for different routes in the application. It
supports:

- Role-based access control with multiple roles per user
- Custom permission checks
- Path pattern matching with wildcards
- Subdomain-specific permissions

## Files

- `types.ts` - Defines the core types and interfaces for the permission system
- `routePermissions.ts` - Contains the route permission configuration
- `validateUrlAccess.ts` - Implements the URL access validation logic
- `checkRoutePermission.ts` - Provides a common function for checking route permissions

## Permission Levels

The system supports the following permission levels:

- `PUBLIC` - Accessible to anyone
- `AUTHENTICATED` - Requires any authenticated user
- `ADMIN` - Requires admin privileges
- `SYSTEM` - Requires system admin privileges
- `CUSTOM` - Custom permission check

## User Roles

Users can have multiple roles from the following:

- `User` - Regular user
- `Admin` - Administrator
- `SystemAdmin` - System administrator
- `Guest` - Guest user with limited access

### Role Assignment

Roles are assigned to users through database relationships. The system uses the following Cypher pattern to determine a
user's roles:

```cypher
MATCH (u:User {uuid: $uuid})
OPTIONAL MATCH (u)-[:UserRole]->(r:Role)
RETURN u as user, collect(r) as roles
```

The system looks at the `key` property of each Role vertex to determine the user's roles

## Permission Evaluation

When checking if a user has permission to access a URL:

1. The system finds the matching route permission for the requested URL
2. For each of the user's roles, it checks if that role has the required permission level
3. If ANY of the user's roles has the required permission, access is granted
4. Otherwise, access is denied

## How to Use

### Adding a New Route Permission

To add a new route permission, update the `routePermissions` array in `routePermissions.ts`:

```typescript
// Example: Adding a new admin-only route
{ path: '/admin/reports', requiredPermission: PermissionLevel.ADMIN }
```

### Adding a Custom Permission Check

For more complex permission requirements, you can use a custom permission check:

```typescript
{
  path: '/organizations/:orgId/*',
  requiredPermission: PermissionLevel.CUSTOM,
  customPermissionCheck: (user, path) => {
    const orgId = path.split('/')[2];
    return user.permissions?.includes(`org:${orgId}:admin`) || false;
  }
}
```

### Using the Common Permission Check Function

The system provides a common function `checkRoutePermission` that can be used anywhere in the application to check if a
user has permission to access a specific route:

```typescript
import { checkRoutePermission } from "~/lib/permissions/checkRoutePermission";

// In a component or route handler
async function handleAccess(request: Request, path: string) {
  const permissionResult = await checkRoutePermission(request, path);
  
  if (!permissionResult.hasPermission) {
    // Handle unauthorized access
    console.log(permissionResult.message);
    return { redirect: permissionResult.redirectUrl };
  }
  
  // Continue with authorized access
  return { success: true };
}
```

You can also use it without a request object by providing the path and host manually:

```typescript
// Check permission for a specific path and host
const permissionResult = await checkRoutePermission(
  undefined, 
  '/admin/users', 
  'admin.example.com'
);

if (permissionResult.hasPermission) {
  // User has permission
}
```

### Direct URL Access Validation

If you need to directly validate URL access without the full route checking process, you can use the `validateUrlAccess`
function:

```typescript
import { validateUrlAccess } from "~/lib/permissions/isPermission";

// Validate if a user has access to a specific URL path
const result = validateUrlAccess(userWithPermissions, '/admin/dashboard', isAdminSubDomain);

if (result.hasPermission) {
  // User has permission to access the URL
} else {
  // Handle unauthorized access
  console.log(result.message);
}
```

### Integration with Middleware

The permission system is integrated with the application middleware in `middleware.ts`. The middleware:

1. Uses the common `checkRoutePermission` function to check access
2. Redirects to an appropriate page if access is denied

## Default Behavior

- If no specific permission is defined for a route, it defaults to requiring authentication
- Public routes are accessible to everyone
- System routes require both system admin privileges and access from the system subdomain
- Custom permission checks can implement arbitrary logic 