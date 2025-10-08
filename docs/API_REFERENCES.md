# API References

This document provides detailed information about all available API endpoints in the application.

## Section Links

### Admin Routes
- http://localhost:3001/admin/UserSettings
- http://localhost:3001/admin/GlobalSettings
- http://localhost:3001/admin/
- http://localhost:3001/admin/Page

### Authentication
- http://localhost:3001/auth/signin

### Email Templates
- http://localhost:3001/internal/page/AccountDeletionRequest
- http://localhost:3001/internal/page/TwoFactorAuth
- http://localhost:3001/internal/page/VerificationCode
- http://localhost:3001/internal/page/TestEmail
- http://localhost:3001/internal/page/PasswordChanged
- http://localhost:3001/internal/page/ProfileUpdated
- http://localhost:3001/internal/page/SignupConfirmation
- http://localhost:3001/internal/page/WelcomeEmail
- http://localhost:3001/internal/page/EmailChanged
- http://localhost:3001/internal/page/EmailChangeSuccessful
- http://localhost:3001/internal/page/EmailConfirmation
- http://localhost:3001/internal/page/InvitationEmail

### Support
- http://localhost:3001/support/contact

### Admin DB Setup
- Admin DB Setup: http://localhost:3001/api/setup/adminUserSetup

## REST API Endpoints

### Authentication APIs

#### Sign In

**Endpoint:** `POST /api/auth/signin`

**Description:** Authenticates a user and creates a session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "user_password"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "roles": ["user"]
  },
  "token": "session-token"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Account locked or requires verification

#### Sign Up

**Endpoint:** `POST /api/auth/signup`

**Description:** Registers a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "secure_password",
  "username": "newuser"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email."
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already in use

#### Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Ends the current user session.

**Response:**
```json
{
  "success": true
}
```

#### Request Password Reset

**Endpoint:** `POST /api/auth/password-reset/request`

**Description:** Sends a password reset email to the user.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account exists with this email, a reset link has been sent."
}
```

#### Verify Email

**Endpoint:** `GET /api/auth/verifyEmail?token={token}`

**Description:** Verifies a user's email address using the token sent to their email.

**Parameters:**
- `token`: Email verification token

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully."
}
```

### User Management APIs

#### Get User Profile

**Endpoint:** `GET /api/auth/getUserRPC`

**Description:** Retrieves the current user's profile information.

**Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "username": "username",
  "roles": ["user"],
  "settings": {
    "theme": "light"
  }
}
```

#### Update Profile

**Endpoint:** `POST /api/auth/updateProfile`

**Description:** Updates the current user's profile information.

**Request Body:**
```json
{
  "username": "new_username",
  "displayName": "Display Name"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "new_username",
    "displayName": "Display Name"
  }
}
```

#### Update Profile Image

**Endpoint:** `POST /api/auth/updateProfileImage`

**Description:** Updates the user's profile image.

**Request:** Multipart form data with image file

**Response:**
```json
{
  "success": true,
  "imageUrl": "/api/file/download/profile_image.jpg"
}
```

#### List Users (Admin)

**Endpoint:** `GET /api/users/list`

**Description:** Admin endpoint to list all users.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)
- `search`: Search term
- `role`: Filter by role

**Response:**
```json
{
  "users": [
    {
      "id": "user-uuid-1",
      "email": "user1@example.com",
      "username": "user1",
      "roles": ["user"]
    },
    {
      "id": "user-uuid-2",
      "email": "user2@example.com",
      "username": "user2",
      "roles": ["admin", "user"]
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "pages": 5
}
```

#### Update User (Admin)

**Endpoint:** `POST /api/users/update`

**Description:** Admin endpoint to update user details.

**Request Body:**
```json
{
  "id": "user-uuid",
  "roles": ["admin", "user"],
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "roles": ["admin", "user"],
    "status": "active"
  }
}
```

#### Delete User (Admin)

**Endpoint:** `POST /api/users/delete`

**Description:** Admin endpoint to delete a user.

**Request Body:**
```json
{
  "id": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully."
}
```

### File Management APIs

#### Upload File

**Endpoint:** `POST /api/file/upload`

**Description:** Uploads a file to the server.

**Request:** Multipart form data with file

**Response:**
```json
{
  "success": true,
  "fileId": "file-uuid",
  "fileName": "uploaded-file.pdf",
  "fileUrl": "/api/file/download/uploaded-file.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf"
}
```

#### Download File

**Endpoint:** `GET /api/file/download/{fileName}`

**Description:** Downloads a file from the server.

**Parameters:**
- `fileName`: Name of the file to download

**Response:** File data with appropriate Content-Type header

#### Delete File

**Endpoint:** `POST /api/file/delete`

**Description:** Deletes a file from the server.

**Request Body:**
```json
{
  "fileId": "file-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully."
}
```

#### Replace File

**Endpoint:** `POST /api/file/replace`

**Description:** Replaces an existing file with a new one.

**Request:** Multipart form data with file and fileId field

**Response:**
```json
{
  "success": true,
  "fileId": "file-uuid",
  "fileName": "replaced-file.pdf",
  "fileUrl": "/api/file/download/replaced-file.pdf"
}
```

### Data Submission API

#### Submit Data

**Endpoint:** `POST /api/submit/submitData`

**Description:** Submits form data to be stored in the Neo4j database.

**Request Body:**
```json
{
  "formId": "form-uuid",
  "data": {
    "field1": "value1",
    "field2": "value2",
    "nestedObject": {
      "subfield": "subvalue"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "recordId": "record-uuid"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `403 Forbidden`: Permission denied
- `500 Server Error`: Database error

### Settings APIs

#### Get Company Settings

**Endpoint:** `GET /api/settings/company/get`

**Description:** Retrieves company-specific settings.

**Response:**
```json
{
  "companyName": "Example Corp",
  "companyEmail": "contact@example.com",
  "companyLogo": "/api/file/download/company_logo.png",
  "companyAddress": "123 Main St, City, Country",
  "supportEmail": "support@example.com"
}
```

#### Update Company Settings

**Endpoint:** `POST /api/settings/company/update`

**Description:** Updates company settings.

**Request Body:**
```json
{
  "companyName": "New Company Name",
  "companyEmail": "new-contact@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "settings": {
    "companyName": "New Company Name",
    "companyEmail": "new-contact@example.com"
  }
}
```

#### Update Company Logo

**Endpoint:** `POST /api/settings/updateCompanyLogo`

**Description:** Updates the company logo.

**Request:** Multipart form data with logo file

**Response:**
```json
{
  "success": true,
  "logoUrl": "/api/file/downloadCompanyRectangularLogo"
}
```

#### Get Email Settings

**Endpoint:** `GET /api/settings/email/get`

**Description:** Retrieves email configuration settings.

**Response:**
```json
{
  "smtpServer": "smtp.example.com",
  "smtpPort": 587,
  "smtpSecure": true,
  "smtpUsername": "mail@example.com",
  "emailFrom": "noreply@example.com",
  "emailTemplates": {
    "welcome": {
      "subject": "Welcome to Example Corp",
      "body": "HTML template content"
    }
  }
}
```

#### Test Email Settings

**Endpoint:** `POST /api/settings/email/test`

**Description:** Tests email configuration by sending a test email.

**Request Body:**
```json
{
  "recipientEmail": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully."
}
```

### Subdomain APIs

#### List Subdomains

**Endpoint:** `GET /api/subdomain/list`

**Description:** Lists all subdomains for the account.

**Response:**
```json
{
  "subdomains": [
    {
      "id": "subdomain-uuid-1",
      "name": "client1",
      "fullDomain": "client1.example.com",
      "createdAt": "2023-01-01T00:00:00Z"
    },
    {
      "id": "subdomain-uuid-2",
      "name": "client2",
      "fullDomain": "client2.example.com",
      "createdAt": "2023-02-01T00:00:00Z"
    }
  ]
}
```

#### Create Subdomain

**Endpoint:** `POST /api/subdomain/create`

**Description:** Creates a new subdomain.

**Request Body:**
```json
{
  "name": "newclient",
  "displayName": "New Client"
}
```

**Response:**
```json
{
  "success": true,
  "subdomain": {
    "id": "subdomain-uuid",
    "name": "newclient",
    "fullDomain": "newclient.example.com",
    "displayName": "New Client",
    "createdAt": "2023-03-01T00:00:00Z"
  }
}
```

#### Update Subdomain

**Endpoint:** `POST /api/subdomain/update`

**Description:** Updates an existing subdomain.

**Request Body:**
```json
{
  "id": "subdomain-uuid",
  "displayName": "Updated Client Name"
}
```

**Response:**
```json
{
  "success": true,
  "subdomain": {
    "id": "subdomain-uuid",
    "name": "newclient",
    "fullDomain": "newclient.example.com",
    "displayName": "Updated Client Name",
    "updatedAt": "2023-03-02T00:00:00Z"
  }
}
```

#### Delete Subdomain

**Endpoint:** `POST /api/subdomain/delete`

**Description:** Deletes a subdomain.

**Request Body:**
```json
{
  "id": "subdomain-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subdomain deleted successfully."
}
```

### Support Ticket APIs

#### Create Support Ticket

**Endpoint:** `POST /api/support/ticket/create`

**Description:** Creates a new support ticket.

**Request Body:**
```json
{
  "subject": "Problem with file upload",
  "description": "I'm unable to upload files larger than 5MB.",
  "priority": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "ticket": {
    "id": "ticket-uuid",
    "subject": "Problem with file upload",
    "description": "I'm unable to upload files larger than 5MB.",
    "status": "open",
    "priority": "medium",
    "createdAt": "2023-03-10T00:00:00Z"
  }
}
```

#### List Support Tickets

**Endpoint:** `GET /api/support/ticket/list`

**Description:** Lists support tickets for the current user or all tickets for admins.

**Query Parameters:**
- `status`: Filter by status (open, closed, all)
- `page`: Page number
- `limit`: Results per page

**Response:**
```json
{
  "tickets": [
    {
      "id": "ticket-uuid-1",
      "subject": "Problem with file upload",
      "status": "open",
      "priority": "medium",
      "createdAt": "2023-03-10T00:00:00Z",
      "lastUpdated": "2023-03-10T00:00:00Z"
    },
    {
      "id": "ticket-uuid-2",
      "subject": "Feature request",
      "status": "closed",
      "priority": "low",
      "createdAt": "2023-03-05T00:00:00Z",
      "lastUpdated": "2023-03-07T00:00:00Z"
    }
  ],
  "total": 27,
  "page": 1,
  "limit": 10,
  "pages": 3
}
```

#### Reply to Support Ticket

**Endpoint:** `POST /api/support/ticket/reply`

**Description:** Adds a reply to an existing support ticket.

**Request Body:**
```json
{
  "ticketId": "ticket-uuid",
  "message": "Here's a solution to your problem...",
  "isInternal": false
}
```

**Response:**
```json
{
  "success": true,
  "reply": {
    "id": "reply-uuid",
    "message": "Here's a solution to your problem...",
    "author": {
      "id": "user-uuid",
      "name": "Support Agent"
    },
    "isInternal": false,
    "createdAt": "2023-03-12T00:00:00Z"
  }
}
```

#### Update Ticket Status

**Endpoint:** `POST /api/support/ticket/status`

**Description:** Updates the status of a support ticket.

**Request Body:**
```json
{
  "ticketId": "ticket-uuid",
  "status": "closed",
  "message": "Issue resolved by updating the configuration."
}
```

**Response:**
```json
{
  "success": true,
  "ticket": {
    "id": "ticket-uuid",
    "status": "closed",
    "lastUpdated": "2023-03-12T00:00:00Z"
  }
}
```

### Error Logging API

#### Log Client Error

**Endpoint:** `POST /api/error/logError`

**Description:** Logs client-side errors for debugging and monitoring.

**Request Body:**
```json
{
  "message": "Uncaught TypeError: Cannot read property 'id' of undefined",
  "stack": "TypeError: Cannot read property 'id' of undefined\n    at Function.getById (app.js:123:45)\n    at render (app.js:234:56)",
  "url": "/admin/User/edit/123",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "appVersion": "1.2.3"
}
```

**Response:**
```json
{
  "success": true,
  "errorId": "error-uuid"
}
```