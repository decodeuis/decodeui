# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
```bash
# Install dependencies
npm install --force

# Start development server
npm run dev

# Build application
npm run build

# Start production server
npm run start
# or with environment variables
npm run startDev
```

### Code Quality
```bash
# Run type checking, ESLint, and build to verify everything
npm run check-errors

# Run ESLint with auto-fixing
npx eslint --fix src

# Format code with Prettier
npm run pretty

# Check for circular dependencies
npx madge --circular --extensions ts,tsx src
npx depcruise src --validate
```

### Testing
```bash
# Run Playwright tests (make sure app is running on port 3000 first)
npx playwright test

# Run specific test file
npx playwright test example
npx playwright test tests/auth/adminuser/admin_user_setup.spec.ts --project=chromium

# Run tests with UI mode
npx playwright test --ui

# Run tests for specific browser
npx playwright test --project=chromium

# Debug tests
npx playwright test --debug

# Generate tests
npx playwright codegen

# View test reports
npx playwright show-report
```

### Email Testing
```bash
# Send test email
npm run send-test-email
```

## Architecture Overview

This is a SolidJS-based web application for a page builder/CMS system with the following key components:

1. **Frontend Framework**: SolidJS with Vinxi for SSR/SSG
2. **Database**: Neo4j graph database
3. **Styling**: Custom CSS-in-JS system
4. **Authentication**: Custom auth implementation with role-based permissions
5. **Page Builder**: Visual page design system with components, layouts, and properties
6. **File Management**: System for managing file uploads and organization

### Key Architectural Components

#### Graph Database (Neo4j)
The application uses Neo4j as its primary database. The data model is graph-based with nodes (vertices) and relationships (edges) representing:
- Components and component trees
- Pages and page attributes
- Users, roles, and permissions
- Files and folders
- Forms and form elements

Session management and transaction handling are crucial when working with Neo4j. The app implements proper connection pooling and session management.

#### Vertex Format Best Practices

**IMPORTANT: Always maintain vertex format throughout the application. Never process or transform vertex data unnecessarily.**

When working with Neo4j data in functions and frontend components:

1. **Keep Raw Vertex Format**:
   - Data from Neo4j comes as vertex objects with properties in the `P` field
   - DO NOT transform vertex data into custom objects
   - Pass raw vertex data directly from backend to frontend

2. **Vertex Structure**:
   ```javascript
   // Vertex format from Neo4j
   {
     id: "4:uuid:123",       // Neo4j internal ID
     L: ["Channel"],         // Labels
     P: {                    // Properties
       youtubeId: "UC123",
       title: "Channel Name",
       description: "...",
       // ... all properties
     },
     IN: {},                 // Incoming edges
     OUT: {}                 // Outgoing edges
   }
   ```

3. **Accessing Properties**:
   ```javascript
   // CORRECT - Access via P field
   const title = channel.P.title;
   const id = channel.P.youtubeId;

   // WRONG - Don't transform to flat object
   const channel = {
     title: vertex.P.title,
     id: vertex.P.youtubeId
   };
   ```

4. **In Components**:
   ```javascript
   // Component receives vertex format data
   const channelData = args.contextData.props?.channel;
   const channel = channelData?.channel;        // The vertex
   const settings = channelData?.channelSettings; // Related vertex

   // Access properties via P field
   const title = channel?.P?.title;
   const customName = settings?.P?.customName;
   ```

5. **Benefits**:
   - Reduced code complexity (no transformation layers)
   - Better performance (no data processing overhead)
   - Single source of truth for data structure
   - New vertex properties automatically available
   - Easier debugging with consistent data format

6. **Function Returns**:
   ```javascript
   // Server functions should return vertex data directly
   return {
     success: true,
     data: {
       channels: channelsResult,  // Array of {channel: vertex, channelSettings: vertex}
       playlists: playlistsResult, // Array of {playlist: vertex, playlistSettings: vertex}
       // Don't process or flatten these!
     }
   };
   ```

#### Component System
The application has a component-based architecture where:
- Components can be dragged and dropped in the page designer
- Components have properties, slots, and variants
- Components can be nested to create complex layouts
- The system supports form components with validation

#### Page Schema System
The application uses a page schema system for defining reusable components, pages, and themes organized by website:

**Directory Structure:**
```
/src/page_schema/
  └── [website_name]/
      ├── components/     # Component definitions in hjson format
      ├── pages/         # Page templates in hjson format
      ├── themes/        # Theme definitions in hjson format
      └── functions/      # Server-side functions in hjson format
```

**Example:**
```
/src/page_schema/
  ├── default/
  │   ├── components/
  │   │   ├── SystemButton.hjson
  │   │   ├── SystemCard.hjson
  │   │   └── SystemHeading.hjson
  │   ├── pages/
  │   │   ├── DemoHomePage.hjson
  │   │   └── DemoContactForm.hjson
  │   ├── themes/
  │   │   ├── DefaultTheme.hjson
  │   │   └── DarkTheme.hjson
  │   └── functions/
  │       ├── getUserData.hjson
  │       ├── submitForm.hjson
  │       └── calculatePrice.hjson
  └── mywebsite/
      ├── components/
      │   └── CustomButton.hjson
      ├── pages/
      │   └── LandingPage.hjson
      ├── themes/
      │   ├── BrandTheme.hjson
      │   └── MinimalTheme.hjson
      └── functions/
          ├── fetchProducts.hjson
          └── processPayment.hjson
```

**Schema Format:**
Components and pages are defined using hjson files with the following structure:
```javascript
{
  vertexes: [
    {
      id: string,      // Unique identifier
      L: "Attr",       // Label (always "Attr" for page elements)
      P: {             // Properties object
        displayOrder: number,
        componentName: string,  // "Html", "Slot", or custom component
        props: string,         // Function body returning props object
        css: string,          // Function body returning CSS styles
        fns: string,          // Optional: Function definitions
        slot: string          // Optional: Slot name when used inside a component
      }
    }
  ],
  edges: [
    {
      id: string,      // Unique edge identifier
      T: "Attr",       // Edge type (must be "Attr" for parent-child relationships)
      S: string,       // Start vertex ID (parent)
      E: string        // End vertex ID (child)
    }
  ]
}
```

**Page Layouts:**
Pages can have layout components that wrap the page content. To add layouts to a page:
1. Create a `PageLayout` vertex with properties:
   - `componentName`: The name of the Component to use as layout
   - `displayOrder`: Number to determine the order of multiple layouts
2. Connect it to the Page vertex with edge type `PageLayout`: `Page-[PageLayout]->PageLayout`
3. Multiple layouts can be added and they will wrap the page content in order of `displayOrder`

**Example Page with Layout:**
```hjson
{
  vertexes: [
    {
      id: "page1",
      L: "Page",
      P: {
        key: "HomePage"
      }
    },
    {
      id: "layout1",
      L: "PageLayout",
      P: {
        componentName: "MainLayout",
        displayOrder: 1
      }
    },
    {
      id: "layout2",
      L: "PageLayout",
      P: {
        componentName: "ThemeLayout",
        displayOrder: 2
      }
    },
    // ... page content vertices
  ],
  edges: [
    { id: "e1", T: "PageLayout", S: "page1", E: "layout1" },
    { id: "e2", T: "PageLayout", S: "page1", E: "layout2" },
    // ... other edges
  ]
}
```

In this example, the page content will be wrapped first by `ThemeLayout` (displayOrder: 2), then by `MainLayout` (displayOrder: 1), creating a nested structure:
```
MainLayout
  └── ThemeLayout
      └── Page content
```

**Important Notes:**
- When `componentName` is "Html", the `as` property must be included in the props return statement or in the Properties object
- If `as` is omitted, the component behaves as a fragment and only renders children
- All schemas are automatically loaded during app initialization via `createAppState.ts` using dynamic imports
- Components are registered under the "Component" label without website prefix (e.g., "SystemButton")
- Pages are registered under the "Page" label without website prefix (e.g., "DemoHomePage")
- The loader supports multiple websites, each with their own components and pages

**Loader Functions:**
The `~/page_schema/loader.ts` module provides several utility functions:
- `loadWebsiteSchemas()` - Loads all schemas (components, pages, and themes) from all websites
- `getWebsiteSchemasSync(websiteName)` - Gets schemas for a specific website

**Note:** 
- If multiple websites have components, pages, themes, or functions with the same name, only the last one loaded will be used.
- Components are registered under the "Component" label
- Pages are registered under the "Page" label  
- Themes are registered under the "Theme" label
- Functions are registered under the "Function" label

**Server Functions:**
Server functions allow you to execute server-side code and return results to the client. They are defined in the `functions` directory:

**Function Schema Format (hjson):**
```hjson
{
  vertexes: [
    {
      id: "function_root",
      L: "Function",
      P: {
        key: "getUserData",
        description: "Fetches user data from the database",
        body: '''
// This function runs on the server
// It has access to args object with:
// - args.params: Request parameters
// - args.session: Current session
// - args.graph: Graph interface

const userId = args.params.userId;
if (!userId) {
  throw new Error("User ID is required");
}

// Example: Fetch user from database
const user = await args.graph.getVertex(userId);

// Return data to client
return {
  success: true,
  data: {
    id: user.id,
    name: user.P.name,
    email: user.P.email,
    balance: user.P.raBalance
  }
};
'''
      }
    }
  ],
  edges: []
}
```

**Function Properties:**
- `key`: Unique identifier for the function
- `description`: Brief description of what the function does
- `body`: Function body that will be executed server-side

**Available in Function Body:**
The function body has access to an `args` object containing:
- `args.params`: Request parameters sent from the client
- `args.session`: Current user session
- `args.graph`: Graph interface for database operations
- `args.user`: Current authenticated user (if available)

**Calling Server Functions from Components:**
```javascript
// In component props or fns:
const result = await args.executeServerFunction('getUserData', {
  userId: 'user123'
});

if (result.success) {
  console.log('User data:', result.data);
}
```

**Schema Creation Guidelines:**
When creating component and page schemas, follow the guidelines in `/src/routes/api/chat/SYSTEM_PROMPT.md`. Key points:

1. **Component Properties:**
   - `displayOrder`: Required number for sibling ordering
   - `componentName`: "Html", "Slot", or custom component name
   - `props`: Function body returning dynamic properties
   - `css`: Function body returning CSS with `._id` selector
   - `fns`: Function body for shared functions

2. **CSS Guidelines:**
   - Use kebab-case CSS properties (e.g., `border-radius` not `borderRadius`)
   - Use `._id` selector for component-scoped styles
   - Use theme variables: `${args.theme.var.color.primary}`
   - Use rem units for consistent scaling
   - Include responsive breakpoints

**Example Component Schema:**
```hjson
{
  vertexes: [
    {
      id: "root",
      L: "Attr",
      P: {
        displayOrder: 1,
        componentName: "Html",
        props: '''
return {
  as: "button",  // Required for Html components
  text: props.text || "Click me",
  onClick: props.onClick
};
''',
        css: '''
return `._id {
  padding: 0.5rem 1rem;
  background: ${args.theme.var.color.primary};
  color: ${args.theme.var.color.primary_text};
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${args.theme.var.color.primary_dark_200};
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
}`;
'''
      }
    }
  ],
  edges: []
}
```

#### Page Builder Graph Schema
The Page Builder uses a graph-based structure with vertices and edges to represent UI components:

**Graph Structure:**
```javascript
{
  vertexes: [
    {
      id: string, // Unique identifier for the vertex
      L: string,  // Label associated with the vertex (e.g., 'Attr', 'Component')
      P: object   // Properties associated with the vertex
    }
  ],
  edges: [
    {
      id: string,  // Unique identifier for the edge
      T: string,   // Type/label of the edge (must be 'Attr' for parent-child relationships)
      E: string,   // End vertex ID of the edge (child)
      S: string    // Start vertex ID of the edge (parent)
    }
  ]
}
```

**Important**: Parent-child relationships between Attr vertices MUST use edges with T: "Attr"

**Attr Vertex (Page Builder Items):**
- `displayOrder`: number - Determines item order among siblings
- `componentName`: string - Component type ('Html', 'Slot', or custom component)
- `fns`: Function body string - JavaScript functions for dynamic properties
- `props`: Function body string - Dynamic properties returning key-value pairs
- `css`: Function body string - CSS styling with `._id` selector for current element (returns string or array of strings)

**Component Types:**

1. **Html Component** (default if no componentName):
   - `as`: HTML tag ('div', 'span', 'icon', 'portal') or omit for fragment
   - `text`: Text content to render
   - For icons: requires `icon`, `height`, `width` properties

2. **Slot Component**:
   - `name`: string - Slot name (default: 'children')

**Function Arguments Available:**
The `fns`, `props`, and `css` functions have access to `args` object containing:
- `theme`: ThemeContext for styling
- `data`: Current vertex data
- `contextData`: Context data from parent components
- `graph`: Graph interface for data access
- `navigate`: Navigation utilities
- `onChange`: Value change handler
- `evalExpression`: Expression evaluation
- `showSuccessToast`, `showErrorToast`: Toast notifications
- Many other utilities for form handling, transactions, etc.

**Component Variants:**
Custom components can have variants defined through:
- `Component` vertex with `key` property
- `ComponentVariant` vertices with `key`, `type`, `defValue` properties
- `ComponentVariantOption` vertices for string type options
- Access variant values via `args.contextData.props["variantKey"]`

**Example Component with Variants:**
```hjson
{
  vertexes: [
    {
      id: "1",
      L: "Component",
      P: {
        key: "CustomButton"
      }
    },
    {
      id: "2",
      L: "ComponentVariant",
      P: {
        key: "variant",
        type: "string",
        defValue: "primary"
      }
    },
    {
      id: "3",
      L: "ComponentVariantOption",
      P: {
        key: "primary",
        value: "primary",
        description: "Primary button style"
      }
    },
    {
      id: "4",
      L: "ComponentVariantOption",
      P: {
        key: "secondary",
        value: "secondary",
        description: "Secondary button style"
      }
    },
    {
      id: "5",
      L: "Attr",
      P: {
        displayOrder: 1,
        componentName: "Html",
        props: '''
const variant = args.contextData.props?.variant || "primary";
return {
  as: "button",
  text: args.contextData.props?.text || "Button"
};
''',
        css: '''
const variant = args.contextData.props?.variant || "primary";
return `._id {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${variant === "primary" ? `
    background: ${args.theme.var.color.primary};
    color: ${args.theme.var.color.primary_text};
    border: 1px solid transparent;
    
    &:hover {
      background: ${args.theme.var.color.primary_dark_200};
    }
  ` : `
    background: ${args.theme.var.color.background_light_200};
    color: ${args.theme.var.color.text};
    border: 1px solid ${args.theme.var.color.background_light_400};
    
    &:hover {
      background: ${args.theme.var.color.background_light_300};
    }
  `}
}`;
'''
      }
    }
  ],
  edges: [
    { id: "e1", T: "ComponentVariant", S: "1", E: "2" },
    { id: "e2", T: "ComponentVariantOption", S: "2", E: "3" },
    { id: "e3", T: "ComponentVariantOption", S: "2", E: "4" },
    { id: "e4", T: "Attr", S: "1", E: "5" }
  ]
}
```

#### Styling System
The project uses a custom CSS-in-JS system that:
- Uses `._id` class selector for all component styles
- Returns CSS as strings or arrays of strings (for compatibility with non-nested CSS environments)
- Provides theme awareness and color utilities
- Includes helpers for common patterns (buttons, containers, typography)
- Supports pseudo-classes and pseudo-elements

**CSS Pattern:**
```typescript
// Simple styles - return string with ._id
const complexStyle = () => `._id {
  background: \${args.theme.var.color.background};
  transition: all 0.2s ease;
  
  &:hover {
    background: \${args.theme.var.color.background_light_200};
  }
  
  &::after {
    content: '';
    position: absolute;
  }
}`;

// Keyframes animation - return array
const animatedStyle = () => [
  `@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }`,
  `._id {
    animation: fadeIn 0.3s ease-in;
    padding: 2rem;
  }`
];
```

**Important:** The `css` function from `~/lib/styles` is optional. Styles can be written as plain strings/arrays following the `._id` pattern.

#### Theme System
The application uses a sophisticated theme system built around SolidJS with Neo4j graph database storage:

**Core Features:**
- Dark/light mode support with automatic color resolution and shade swapping
- Customizable color schemes with semantic colors (primary, success, error, etc.)
- Advanced color utilities including light/dark shades, contrast ratios, and accessibility helpers
- Typography, spacing, and animation configuration
- Proxy-based dynamic theme access

**Color System:**
```typescript
// Unified color (same for light/dark)
primary: "oklch(0.57 0.19 250)"

// Mode-specific color
primary: {
  light: "oklch(0.57 0.19 250)",
  dark: "oklch(0.7 0.15 250)"
}

// Dynamic shade access
args.theme.var.color.primary_light_100       // Light shade (close to base)
args.theme.var.color.primary_light_900       // Light shade (close to white)
args.theme.var.color.primary_dark_100       // Dark shade (close to base)
args.theme.var.color.primary_dark_900       // Dark shade (close to black)

// Automatic shade swapping in dark mode
// When dark mode is active, _l shades behave like _d shades and vice versa
args.theme.var.color.primary_light_100       // In light mode: light shade, In dark mode: dark shade

// Text color suffix (_text)
args.theme.var.color.primary_text       // Auto-calculated readable text color for primary background
args.theme.var.color.success_text       // Auto-calculated readable text color for success background
args.theme.var.color.error_text         // Auto-calculated readable text color for error background
args.theme.var.color.primary_light_200_text  // Auto-calculated readable text color for primary_light_200 shade
```

**Text Color Suffix (`_text`):**
- Automatically calculates the most readable text color (white or black) for any background color
- Works with base colors: `primary_text`, `success_text`, `error_text`, etc.
- Works with shades: `primary_light_200_text`, `background_dark_800_text`, etc.
- Uses APCA (Advanced Perceptual Contrast Algorithm) for better readability
- If a predefined `_text` color exists in the theme, it will be used instead of calculating

**Shade System:**
- Light shades: `_light_1` to `_light_1000` (light_1 = closest to base color, light_1000 = white)
- Dark shades: `_dark_1` to `_dark_1000` (dark_1 = closest to base color, dark_1000 = black)
- Common shades: `_light_100`, `_light_200`, `_light_300`, `_light_400`, `_light_500`, `_light_600`, `_light_700`, `_light_800`, `_light_900`
- Shades automatically swap in dark mode for better contrast

**Theme Structure:**
- `var.color`: Core color system (primary, success, error, text, background, etc.)
- For background colors, prefer light shades (e.g., `background_light_100`, `background_light_50`)

**Note:** Currently, the theme system only supports colors and their shades. Use fixed values for other CSS properties like border-radius, transitions, spacing, etc.

**Theme Management:**
Themes can be defined in hjson files within each website's `themes` folder in the page schema directory. Additionally, themes can be managed through the database UI at `/admin/GlobalSettings` > Theme Management.

**Theme Schema Structure:**
Each website can have its own themes folder:
```
/src/page_schema/
  └── [website_name]/
      └── themes/
          ├── DefaultTheme.hjson
          ├── DarkTheme.hjson
          └── CustomTheme.hjson
```

**Theme Schema Format (hjson):**
```hjson
{
  vertexes: [
    {
      id: "theme_root",
      L: "Theme",
      P: {
        key: "CustomTheme",
        name: "Custom Theme",
        description: "A custom theme with modern colors",
        data: '''
return {
  var: {
    color: {
      primary: {
        light: "oklch(0.65 0.25 280)",
        dark: "oklch(0.75 0.20 280)"
      },
      info: {
        light: "oklch(0.70 0.18 230)",
        dark: "oklch(0.80 0.15 230)"
      },
      success: {
        light: "oklch(0.72 0.20 145)",
        dark: "oklch(0.82 0.18 145)"
      },
      warning: {
        light: "oklch(0.85 0.15 85)",
        dark: "oklch(0.90 0.12 85)"
      },
      error: {
        light: "oklch(0.68 0.25 25)",
        dark: "oklch(0.78 0.22 25)"
      },
      text: {
        light: "oklch(0.15 0.01 0)",
        dark: "oklch(0.95 0.01 0)"
      },
      background: {
        light: "oklch(0.98 0.005 0)",
        dark: "oklch(0.12 0.01 0)"
      },
      border: {
        light: "oklch(0.85 0.01 0)",
        dark: "oklch(0.25 0.01 0)"
      },
      muted: {
        light: "oklch(0.60 0.02 0)",
        dark: "oklch(0.45 0.02 0)"
      }
    }
  }
};
'''
      }
    }
  ],
  edges: []
}
```

**Theme Properties:**
- `key`: Unique identifier for the theme
- `name`: Display name for the theme
- `description`: Brief description of the theme
- `data`: Function body returning the theme configuration object

**Custom Theme Variables:**
You can add custom variables to your theme beyond the standard color system. These will be available via `args.theme` in your component schemas:

```hjson
{
  vertexes: [
    {
      id: "theme_root",
      L: "Theme",
      P: {
        key: "CustomTheme",
        name: "Custom Theme",
        data: '''
return {
  var: {
    color: {
      // Standard colors...
    },
    // Custom variables
    spacing: {
      xs: "0.25rem",
      sm: "0.5rem",
      md: "1rem",
      lg: "2rem",
      xl: "4rem"
    },
    borderRadius: {
      sm: "0.25rem",
      md: "0.5rem",
      lg: "1rem",
      full: "9999px"
    },
    animation: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms"
    }
  }
};
'''
      }
    }
  ],
  edges: []
}
```

Then in your components:
```javascript
css: '''
return `._id {
  padding: ${args.theme.var.spacing.md};
  border-radius: ${args.theme.var.borderRadius.md};
  transition: all ${args.theme.var.animation.normal} ease;
}`;
'''
```

**Key Files:**
- `src/lib/theme/ThemeContext.tsx` - Theme context with proxy-based access
- `src/lib/theme/ThemeProvider.tsx` - Global theme state management
- `src/lib/theme/getDefaultTheme.ts` - Default theme generator function
- `src/lib/graph/get/sync/theme/themeConfig.ts` - Database integration
- `src/lib/styles/colorUtils.ts` - Color manipulation utilities (uses colorjs.io library)
- `src/lib/styles/constants.ts` - Theme constants and presets

**Color Library:**
The project uses [colorjs.io](https://colorjs.io/) for color manipulation, providing:
- OKLCH color space support
- APCA contrast algorithm for better text readability
- Advanced color interpolation and manipulation

#### Permission System
The application implements a role-based access control system:
- Users have roles
- Roles have permissions
- Permission checks are performed at the route and component level
- System supports Admin, User, Guest and custom roles

## Directory Structure

- `/src` - Main application code
  - `/components` - Reusable UI components
  - `/page_schema` - Page, component, theme, and function schemas organized by website
    - `/[website_name]/` - Website-specific schemas
      - `/components/` - Component definitions in hjson format
      - `/pages/` - Page templates in hjson format
      - `/themes/` - Theme definitions in hjson format
      - `/functions/` - Server-side function definitions in hjson format
    - `loader.ts` - Dynamic schema loader module
  - `/cypher` - Neo4j database operations
    - `/constants` - Reserved keywords for Cypher queries
    - `/conversion` - Utilities for converting between Neo4j and JSON formats
    - `/core` - Core Neo4j connection handling and driver setup
    - `/get` - Data retrieval functions
    - `/mutate` - Database mutation operations
    - `/permissions` - Permission checking and management
    - `/queries` - Query construction and evaluation
    - `/session` - Session management for subdomains
    - `/types` - Type definitions
  - `/features` - Feature-specific implementations
    - `/file_manager` - File management system
    - `/grid` - Data grid components
    - `/page_attr_render` - Page attribute rendering
    - `/page_designer` - Page design interface
  - `/lib` - Utility functions and core libraries
    - `/api` - API communication
    - `/auth` - Authentication utilities
    - `/context` - Context providers
    - `/data_structure` - Data structure helpers
    - `/graph` - Graph data handling
      - `/context` - Graph context providers
        - `GlobalProperties.ts` - Global property definitions
        - `GraphContext.ts` - Graph context implementation
        - `GraphInterface.ts` - Interface definitions
        - `UseGraph.ts` - Graph hook utilities
      - `/get` - Data retrieval
        - `/sync` - Synchronous data retrieval
          - `/auth` - Authentication-related queries
          - `/company` - Company data queries
          - `/edge` - Edge retrieval functions
          - `/entity` - Entity management functions
          - `/expression` - Expression evaluation
          - `/format` - Formatting utilities
          - `/store` - Global store access
          - `/theme` - Theme-related queries
          - `/user` - User data retrieval
      - `/import` - Data import
        - `importGraphStructure.ts` - Graph data import
      - `/mutate` - Graph mutation operations
        - `/core` - Core mutation functions
          - `/channel` - Broadcast channel handling
          - `/edge` - Edge mutation operations
          - `/vertex` - Vertex mutation operations
        - `/data` - Data mutation handling
        - `/form` - Form-related mutations
        - `/selection` - Selection value mutations
        - `/user` - User data mutations
        - `/vertex` - Vertex-specific operations
      - `/transaction` - Transaction management
        - `/core` - Core transaction functions
        - `/history` - Undo/redo functionality
        - `/revert` - Transaction reverting
        - `/steps` - Transaction step management
        - `/types` - Transaction type definitions
        - `/value` - Transaction value utilities
      - `/type` - Graph type definitions
        - `edge.ts` - Edge type definitions
        - `edgeMap.ts` - Edge mapping types
        - `vertex.ts` - Vertex type definitions
        - `vertexMap.ts` - Vertex mapping types
    - `/meta` - Metadata types and utilities
    - `/permissions` - Permission management
    - `/styles` - Styling system
    - `/validation` - Validation functions
  - `/pages` - Page components
    - `/admin_dashboard` - Admin dashboard components
    - `/auth` - Authentication pages
    - `/global` - Global settings pages
    - `/subdomain` - Subdomain management
    - `/theme_menu` - Theme selection components
    - `/user` - User settings
  - `/routes` - Route definitions (file-based routing)
    - `/admin` - Admin routes
    - `/api` - API endpoints
    - `/auth` - Authentication routes
    - `/internal` - Internal routes
    - `/support` - Support routes
    - `/system` - System routes
    - `/view` - View routes
- `/docs` - Documentation files
- `/scripts` - Utility scripts
- `/public` - Static assets
- `/tests` - Test files

## Important Files

- `app.config.ts` - Application configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `biome.json` - Biome (formatter) configuration

## Development Workflow

1. Start the Neo4j database (required for development)
2. Start the development server with `npm run dev`
3. Make changes to the codebase
4. Run tests with Playwright to verify changes
5. Use `npm run check-errors` to ensure code quality
6. Build the application with `npm run build`

## Implementing Features

When implementing new features:

1. Understand the Neo4j data model for the relevant domain
2. **ALWAYS use vertex format directly - never transform vertex data into custom objects**
3. Follow the existing patterns for components and styling
4. Implement proper permission checks where needed
5. Add appropriate error handling
6. Use the project's CSS-in-JS system for styling
7. Write Playwright tests for new functionality

### Data Handling Guidelines

When working with Neo4j data:
- **Keep vertex format**: Access properties via `vertex.P.propertyName`
- **Don't process data**: Pass raw vertex data from backend to frontend
- **Component props**: Pass entire vertex objects, not extracted properties
- **Avoid transformations**: No `.map()` to flatten or restructure vertex data

## Color Shade System
- Explicit light/dark shades
  - Light shades: `primary_light_100` to `primary_light_900` (light_100 = close to base, light_900 = close to white)
  - Dark shades: `primary_dark_100` to `primary_dark_900` (dark_100 = close to base, dark_900 = close to black)
- **Dark mode behavior**: Shades automatically swap in dark mode (`_light_` becomes `_dark_` and vice versa)

## CSS Styling Pattern Update
- **All styles must use `._id` class selector**
- **Return types**:
  - Simple styles: Return string with `._id { ... }`
  - Complex styles: Return array of strings for media queries
  ```

## Memories

- Run `./beep` after answered or confirmation