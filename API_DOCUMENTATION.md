# API Documentation

**Base URL:** `https://[your-project-id].supabase.co/functions/v1/make-server-2516be19`

**Authentication:** All endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## 🔐 **Authentication Endpoints**

### `POST /signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "user-id-here"
}
```

### `GET /user-info`
Get current user information.

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "John Doe",
  "school": "University of Illinois"
}
```

---

## 👤 **Profile Endpoints**

### `GET /profile/:userId`
Get a user's profile.

**Response:**
```json
{
  "id": "user-id",
  "name": "John Doe",
  "school": "University of Illinois",
  "major": "Computer Science",
  "year": "Junior",
  "bio": "Bio text here",
  "interests": ["Coding", "Music"],
  "profilePicture": "https://...",
  "photos": ["https://..."],
  "bondPrint": { ... }
}
```

### `POST /profile`
Create or update user profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "school": "University of Illinois",
  "major": "Computer Science",
  "year": "Junior",
  "bio": "Bio text",
  "interests": ["Coding", "Music"],
  "lookingFor": ["Friends", "Study Partners"]
}
```

### `GET /profiles`
Get all profiles with filters and pagination.

**Query Parameters:**
- `school` (required): School name
- `year`: Filter by year
- `major`: Filter by major
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "profiles": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 💬 **Forum Endpoints**

### `GET /forum/posts`
Get all forum posts with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `filter`: Filter type (`trending`, `all`, etc.)

**Response:**
```json
{
  "posts": [
    {
      "id": "post-id",
      "content": "Post content",
      "authorId": "user-id",
      "authorName": "John Doe",
      "authorAvatar": "https://...",
      "isAnonymous": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "likes": 10,
      "dislikes": 2,
      "comments": 5,
      "mediaUrl": "https://...",
      "mediaType": "image",
      "userLiked": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### `POST /forum/posts`
Create a new forum post.

**Request Body:**
```json
{
  "content": "Post content",
  "isAnonymous": false,
  "mediaUrls": ["https://..."],
  "tags": ["tag1", "tag2"]
}
```

### `POST /forum/posts/:postId/like`
Like or unlike a post (toggles).

**Response:**
```json
{
  "success": true
}
```

### `POST /forum/posts/:postId/comments`
Add a comment to a post.

**Request Body:**
```json
{
  "content": "Comment text",
  "isAnonymous": false
}
```

### `GET /forum/posts/:postId/comments`
Get comments for a post.

---

## 💬 **Messaging Endpoints**

### `GET /chats`
Get all conversations with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "chats": [
    {
      "chatId": "chat-id",
      "otherUser": { ... },
      "lastMessage": "Last message text",
      "unreadCount": 2,
      "lastMessageTimestamp": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### `GET /chat/:chatId/messages`
Get messages for a conversation.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response:**
```json
{
  "messages": [
    {
      "id": "message-id",
      "senderId": "user-id",
      "content": "Message text",
      "timestamp": "2024-01-01T00:00:00Z",
      "readBy": ["user-id"],
      "readAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### `POST /chat/:chatId/message`
Send a message.

**Request Body:**
```json
{
  "content": "Message text"
}
```

---

## 🔔 **Notifications Endpoints**

### `GET /notifications`
Get user notifications.

**Query Parameters:**
- `unread`: `true` to get only unread notifications

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif-id",
      "type": "friend_request",
      "title": "New friend request",
      "message": "John Doe wants to connect",
      "read": false,
      "created_at": "2024-01-01T00:00:00Z",
      "data": {
        "userId": "user-id",
        "userName": "John Doe",
        "avatarUrl": "https://...",
        "actionUrl": "/friends"
      }
    }
  ]
}
```

### `POST /notifications/:notificationId/read`
Mark a notification as read.

### `POST /notifications/read-all`
Mark all notifications as read.

---

## 🔍 **Search Endpoints**

### `GET /search`
Global search across users, posts, clubs, and classes.

**Query Parameters:**
- `q` (required): Search query
- `type`: Search type (`all`, `users`, `posts`, `clubs`, `classes`)

**Response:**
```json
{
  "query": "search term",
  "type": "all",
  "results": {
    "users": [...],
    "posts": [...],
    "clubs": [...],
    "classes": [...]
  },
  "totalResults": 50
}
```

---

## 👥 **Friendship Endpoints**

### `GET /friendships`
Get all friendships (connections).

**Response:**
```json
{
  "friendships": [
    {
      "id": "friendship-id",
      "user_id": "user-id",
      "friend_id": "friend-id",
      "status": "accepted",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### `POST /friendships/request`
Send a friend request.

**Request Body:**
```json
{
  "friendId": "friend-user-id"
}
```

### `POST /friendships/:friendshipId/accept`
Accept a friend request.

### `POST /friendships/:friendshipId/decline`
Decline a friend request.

---

## 📤 **Media Upload**

### `POST /forum/upload-media`
Upload media (image or video).

**Request:** `multipart/form-data`
- `file`: The media file
- `type`: `image` or `video`

**Response:**
```json
{
  "url": "https://...",
  "publicUrl": "https://..."
}
```

---

## ⚠️ **Error Responses**

All endpoints may return errors in this format:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## 🔒 **Rate Limiting**

- Most endpoints: 100 requests per minute per user
- Authentication endpoints: 10 requests per minute per IP
- Media upload: 20 requests per minute per user

---

## 📝 **Notes**

- All timestamps are in ISO 8601 format
- Pagination is available on all list endpoints
- All endpoints require authentication except `/signup` and `/health`
- Content moderation is applied to posts, comments, and profiles

