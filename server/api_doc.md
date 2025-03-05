## API SPECS

## Authentication

- **Bearer Token** must be included in the `Authorization` header for all protected endpoints:
  - `Authorization: Bearer <ACCESS_TOKEN>`

---

# 1. User Endpoints

## POST /users/register

**Description**  
Register a new user.

**Request Body**

```
{
  "name": "string",    // required
  "email": "string",   // required
  "password": "string" // required
}
```

**Response (201 Created)**

```
{
  "id": number,
  "name": "string",
  "email": "string"
}
```

---

## POST /users/login

**Description**  
Login an existing user.

**Request Body**

```
{
  "email": "string",    // required
  "password": "string"  // required
}
```

**Response (200 OK)**

```
{
  "id": number,
  "access_token": "string",
  "email": "string",
  "name": "string"
}
```

Use `access_token` in the `Authorization` header for protected routes.

---

## GET /users

**Description**  
Retrieve a list of all users.  
**Protected** – Requires valid `access_token`.

**Response (200 OK)**

```
[
  {
    "id": number,
    "name": "string",
    "email": "string"
  },
  ...
]
```

---

## GET /users/find/:userId

**Description**  
Retrieve a single user by their ID.  
**Protected** – Requires valid `access_token`.

**URL Parameters**

- `userId` (number) – ID of the user to retrieve

**Response (200 OK)**

```
{
  "id": number,
  "name": "string",
  "email": "string"
}
```

---

# 2. Chat Endpoints

## POST /chats

**Description**  
Create (or retrieve if already existing) a chat between two users.  
**Protected** – Requires valid `access_token`.

**Request Body**

```
{
  "senderId": number,   // required, ID of the user initiating the chat
  "receiverId": number  // required, ID of the other user
}
```

**Response (200 OK)**

```
{
  "id": number,
  "members": [number, number], // [senderId, receiverId]
  "membersDetails": [
    {
      "id": number,
      "name": "string",
      "email": "string"
    },
    ...
  ]
}
```

If a chat already exists for these two members, it simply returns the existing chat.

---

## GET /chats/:userId

**Description**  
Retrieve all chats for a specific user.  
**Protected** – Requires valid `access_token`.

**URL Parameters**

- `userId` (number) – ID of the user whose chats to retrieve

**Response (200 OK)**

```
[
  {
    "id": number,
    "members": [number, ...],
    "membersDetails": [
      {
        "id": number,
        "name": "string",
        "email": "string"
      },
      ...
    ]
  },
  ...
]
```

---

## GET /chats/find/:firstId/:secondId

**Description**  
Find a specific chat between two user IDs.  
**Protected** – Requires valid `access_token`.

**URL Parameters**

- `firstId` (number) – User ID #1
- `secondId` (number) – User ID #2

**Response (200 OK)**

```
{
  "id": number,
  "members": [firstId, secondId],
  "membersDetails": [
    {
      "id": number,
      "name": "string",
      "email": "string"
    },
    ...
  ]
}
```

---

# 3. Message Endpoints

## POST /messages

**Description**  
Create a new message in a specific chat.  
**Protected** – Requires valid `access_token`.

**Request Body**

```
{
  "chatId": number,   // required
  "senderId": number, // required, must be a member of the chat
  "text": "string"    // required
}
```

**Response (201 Created)**

```
{
  "id": number,
  "chatId": number,
  "senderId": number,
  "text": "string",
  "updatedAt": "ISODateString",
  "createdAt": "ISODateString"
}
```

---

## GET /messages/:chatId

**Description**  
Retrieve all messages from a specific chat.  
**Protected** – Requires valid `access_token`.

**URL Parameters**

- `chatId` (number) – ID of the chat

**Response (200 OK)**

```
[
  {
    "id": number,
    "chatId": number,
    "senderId": number,
    "text": "string",
    "updatedAt": "ISODateString",
    "createdAt": "ISODateString"
  },
  ...
]
```

Messages are sorted in ascending order by creation time.

---

## POST /messages/ai-suggestions

**Description**  
Get AI-generated response suggestions based on conversation history.  
**Protected** – Requires valid `access_token`.

**Request Body**

```
{
  "messages": [
    {
      "role": "string",    // "user" or "assistant"
      "content": "string"  // message content
    },
    ...
  ]
}
```

**Response (200 OK)**

```
{
  "suggestion": "string"  // AI-generated suggestion for next message
}
```

---

## Error Response Example

```
{
  "name": "BadRequest",
  "message": "Name, email, and password are required"
}
```

(The `name` and `message` will vary based on the specific error.)

---

**Base URL**  
All endpoints above are typically prefixed by your server's base URL (for example, `https://your-domain.com` or `http://localhost:3000`).

Use these routes to handle user registration, login, chat creation and retrieval, message creation and retrieval, and AI message suggestions. Make sure to include your `Authorization: Bearer <ACCESS_TOKEN>` header (where applicable) after logging in to access protected endpoints.

**Error Types**

The API may return the following error types:

- `BadRequest` - When required fields are missing or invalid
- `Unauthorized` - When authentication fails
- `NotFound` - When requested resources don't exist
- `Forbidden` - When a user tries to access resources they don't have permission for

**Authentication Flow**

1. Register a new user using `/users/register`
2. Login using `/users/login` to get your `access_token`
3. Include this token in the `Authorization` header for all subsequent protected API calls
