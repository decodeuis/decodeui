# Development Guide


## Building

Solid apps are built with _presets_, which optimize your project for deployment to different environments.

By default, `npm run build` will generate a Node app that you can run with `npm start`. To use a different preset, add it to the `devDependencies` in `package.json` and specify in your `app.config.js`.

## Environment Variables

Load env variables on production:
https://dear-caravan-605.notion.site/Solid-FAQ-b5ae5a47f2ec47c8a78bc5671180845d#1a328989d46a8033a63cd6e94cdaea31

1. npm install -g dotenv-cli
2. npm run start

## Code Quality

### Circular Dependencies
Check for circular dependencies:
```
npx madge --circular --extensions ts,tsx src
npx depcruise src --validate
```

### Find Large Files
To find all files in your codebase whose line count is greater than 400:
```
find . -type f -exec sh -c 'wc -l "$0" | awk "{if (\$1 > 400) print \$0}"' {} \;
```

### Fix ESLint Errors
```
npx eslint --fix src
```

## Web Server
To start the Web Server, open Mac terminal and run:
```
sudo apachectl start
```

## Admin User Setup
When resetting a new admin user:
1. Create a admin user
2. Sync components
3. Add component properties manually
4. Add essential pages

## Permission Management
```javascript
// Check for specific permissions
const canCreateUser = await isPermission(request, PERMISSIONS.CREATE_USER, dbSession);

// Check for multiple permissions (any of them)
const canManageUsers = await isPermission(
  request, 
  [PERMISSIONS.CREATE_USER, PERMISSIONS.DELETE_USER], 
  dbSession
);

// Check for roles
const isAdmin = await checkRole(request, SYSTEM_ROLES.ADMIN, dbSession);
``` 