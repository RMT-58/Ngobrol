# Chat API Documentation

This API supports user registration and authentication, chat creation, and messaging between users. It is built with Express and Sequelize. The endpoints are grouped under three main sections: **Users**, **Chats**, and **Messages**. The base URL assumes the server runs on `http://localhost:3000`.

## Base URL

- **Welcome Route:** `GET /`
  - **Response:**
    ```
    Welcome to our chat API...
    ```
  - (See [index.js citeturn0file4])

## Users

All user-related endpoints are prefixed with `/api/users`.

### 1. Register User

- **Endpoint:** `POST /api/users/register`
- **Description:** Creates a new user account.
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "yourpassword"
  }
  ```
- **Success Response:**
  - **Status Code:** 201 Created
  - **Body:**
    ```json
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
    ```
- **Error Response:**
  - **400 Bad Request:** When any of the required fields (`name`, `email`, or `password`) is missing.
- (Based on [UserController.js citeturn0file2] and [userRoute.js citeturn0file6])

### 2. User Login

- **Endpoint:** `POST /api/users/login`
- **Description:** Authenticates a user and returns an access token.
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "yourpassword"
  }
  ```
- **Success Response:**
  - **Status Code:** 200 OK
  - **Body:**
    ```json
    {
      "access_token": "JWT_TOKEN_HERE",
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
    ```
- **Error Responses:**
  - **400 Bad Request:** If `email` or `password` is missing.
  - **401 Unauthorized:** If the email or password is incorrect.
- (Based on [UserController.js citeturn0file2] and [userRoute.js citeturn0file6])

### 3. Find User

- **Endpoint:** `GET /api/users/find/:userId`
- **Description:** Retrieves details for a specific user by their ID.
- **URL Parameter:**
  - `userId` (required)
- **Success Response:**
  - **Status Code:** 200 OK
  - **Body:**
    ```json
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
    ```
- **Error Responses:**
  - **400 Bad Request:** If the `userId` parameter is missing.
  - **404 Not Found:** If no user exists with the provided ID.
- (Based on [UserController.js citeturn0file2] and [userRoute.js citeturn0file6])

### 4. Get All Users

- **Endpoint:** `GET /api/users`
- **Description:** Retrieves a list of all registered users.
- **Success Response:**
  - **Status Code:** 200 OK
  - **Body:**
    ```json
    [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      {
        "id": 2,
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    ]
    ```
- (Based on [UserController.js citeturn0file2] and [userRoute.js citeturn0file6])

## Chats

All chat-related endpoints are prefixed with `/api/chats`.

### 1. Create Chat

- **Endpoint:** `POST /api/chats`
- **Description:** Creates a new chat between two users. If a chat with the same members already exists, it returns the existing chat.
- **Request Body:**
  ```json
  {
    "senderId": "1",
    "receiverId": "2"
  }
  ```
- **Success Response:**
  - **Status Code:** 200 OK
  - **Body:** A chat object similar to:
    ```json
    {
      "id": 1,
      "members": ["1", "2"],
      "createdAt": "2021-01-01T00:00:00.000Z",
      "updatedAt": "2021-01-01T00:00:00.000Z"
    }
    ```
- **Error Response:**
  - **400 Bad Request:** If either `senderId` or `receiverId` is missing.
- (Based on [chatController.js citeturn0file0] and [chatRoute.js citeturn0file3])

### 2. Get User Chats

- **Endpoint:** `GET /api/chats/:userId`
- **Description:** Retrieves all chats that include the specified user.
- **URL Parameter:**
  - `userId` (required)
- **Success Response:**
  - **Status Code:** 200 OK
  - **Body:** An array of chat objects:
    ```json
    [
      {
        "id": 1,
        "members": ["1", "2"],
        "createdAt": "2021-01-01T00:00:00.000Z",
        "updatedAt": "2021-01-01T00:00:00.000Z"
      }
    ]
    ```
- **Error Response:**
  - **400 Bad Request:** If the `userId` parameter is missing.
- (Based on [chatController.js citeturn0file0] and [chatRoute.js citeturn0file3])

### 3. Find Chat Between Two Users

- **Endpoint:** `GET /api/chats/find/:firstId/:secondId`
- **Description:** Finds and retrieves the chat between two specific users.
- **URL Parameters:**
  - `firstId` (required)
  - `secondId` (required)
- **Success Response:**
  - **Status Code:** 200 OK
  - **Body:** A chat object:
    ```json
    {
      "id": 1,
      "members": ["1", "2"],
      "createdAt": "2021-01-01T00:00:00.000Z",
      "updatedAt": "2021-01-01T00:00:00.000Z"
    }
    ```
- **Error Responses:**
  - **400 Bad Request:** If either `firstId` or `secondId` is missing.
  - **404 Not Found:** If no chat exists between the provided user IDs.
- (Based on [chatController.js citeturn0file0] and [chatRoute.js citeturn0file3])

## Messages

All message-related endpoints are prefixed with `/api/messages`.

### 1. Create Message

- **Endpoint:** `POST /api/messages`
- **Description:** Creates a new message in a specific chat.
- **Request Body:**
  ```json
  {
    "chatId": "1",
    "senderId": "1",
    "text": "Hello, how are you?"
  }
  ```
- **Success Response:**
  - **Status Code:** 201 Created
  - **Body:** A message object, for example:
    ```json
    {
      "id": 1,
      "chatId": "1",
      "senderId": "1",
      "text": "Hello, how are you?",
      "createdAt": "2021-01-01T00:00:00.000Z",
      "updatedAt": "2021-01-01T00:00:00.000Z"
    }
    ```
- **Error Responses:**
  - **400 Bad Request:** If any of `chatId`, `senderId`, or `text` is missing.
  - **404 Not Found:** If the chat does not exist.
  - **403 Forbidden:** If the sender is not a member of the specified chat.
- (Based on [messageController.js citeturn0file1] and [messageRoute.js citeturn0file5])

### 2. Get Chat Messages

- **Endpoint:** `GET /api/messages/:chatId`
- **Description:** Retrieves all messages from a specified chat, ordered by creation time (ascending).
- **URL Parameter:**
  - `chatId` (required)
- **Success Response:**
  - **Status Code:** 200 OK
  - **Body:** An array of message objects:
    ```json
    [
      {
        "id": 1,
        "chatId": "1",
        "senderId": "1",
        "text": "Hello, how are you?",
        "createdAt": "2021-01-01T00:00:00.000Z",
        "updatedAt": "2021-01-01T00:00:00.000Z"
      }
    ]
    ```
- **Error Responses:**
  - **400 Bad Request:** If the `chatId` parameter is missing.
  - **404 Not Found:** If the specified chat does not exist.
- (Based on [messageController.js citeturn0file1] and [messageRoute.js citeturn0file5])

## Error Handling

Errors encountered by the controllers are passed to a centralized error handler middleware. Typical error responses include:

- **name:** A string indicating the error type (e.g., "BadRequest", "NotFound", "Unauthorized", or "Forbidden").
- **message:** A descriptive error message.

---
