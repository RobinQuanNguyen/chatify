# Backend Route Flow Diagrams

This document visualizes how the backend processes requests across route groups:
- Auth routes: `/api/auth/*`
- Message routes: `/api/message/*`
- Admin routes: `/api/admin/*`

## 1) Global Request Pipeline

```mermaid
flowchart TB
    C[Client] --> S[server.js]
    S --> CORS[CORS + JSON Parser + Cookie Parser]
    CORS --> R{Route Prefix}

    R -->|/api/auth| AR[auth.route.js]
    R -->|/api/message| MR[message.route.js]
    R -->|/api/admin| ADR[admin.route.js]

    AR --> AJ1[arcjetProtection]
    AR --> AP{Protected auth routes?}
    AP -->|Yes| PR0[protectRoute]
    PR0 --> ARH[auth handlers]
    AP -->|No| ARH

    MR --> AJ2[arcjetProtection]
    AJ2 --> PR1[protectRoute]
    PR1 --> MC[message.controller.js]

    ADR --> AJ3[arcjetProtection]
    AJ3 --> PR2[protectRoute]
    PR2 --> RA[requireAdmin]
    RA --> ADC[admin handlers + controllers]

    ARH --> DB[(MongoDB)]
    MC --> DB
    ADC --> DB
    MC --> SO[(Socket.IO)]
```

## 2) Auth Routes

Routes:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `PUT /api/auth/update-profile` (protected)
- `GET /api/auth/check` (protected)
- `GET /api/auth/admin-check` (protected + admin)

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant A as auth.route.js
    participant J as arcjetProtection
    participant P as protectRoute
    participant R as requireAdmin
    participant C as auth.controller.js
    participant H as auth route inline handlers
    participant D as MongoDB
    participant K as Cookie JWT

    U->>A: Request /api/auth/*
    A->>J: Arcjet decision
    alt denied by Arcjet
        J-->>U: 403 or 429 (denied by server)
    else allowed
        alt POST /signup or /login
            A->>C: signup/login
            C->>D: validate + find/create user
            C->>K: set jwt cookie
            C-->>U: 200/201 user payload
        else POST /logout
            A->>C: logout
            C->>K: clear jwt cookie
            C-->>U: 200 success
        else PUT /update-profile or GET /check or GET /admin-check
            A->>P: verify jwt + load req.user
            alt token invalid
                P-->>U: 401 (token invalid)
            else valid user
                alt GET /admin-check
                    A->>R: require admin
                    alt not admin
                        R-->>U: 403
                    else admin
                        A->>H: inline route response
                        H-->>U: 200 admin confirmed
                    end
                else PUT /update-profile
                    A->>C: updateProfile
                    C->>D: update user profilePic
                    C-->>U: 200 updated user
                else GET /check
                    A->>H: inline route response
                    H-->>U: 200 authenticated + user
                end
            end
        end
    end
```

## 3) Message Routes

Routes:
- `GET /api/message/check`
- `GET /api/message/contacts`
- `GET /api/message/chats`
- `GET /api/message/:id`
- `POST /api/message/send/:id`

```mermaid
sequenceDiagram
    autonumber
    participant U as Authenticated User
    participant M as message.route.js
    participant J as arcjetProtection
    participant P as protectRoute
    participant C as message.controller.js
    participant DB as MongoDB
    participant CL as Cloudinary
    participant IO as Socket.IO

    U->>M: Request /api/message/*
    M->>J: Arcjet protection
    M->>P: Verify jwt, attach req.user

    alt auth failed
        P-->>U: 401
    else auth success
        alt GET /check
            M-->>U: 200 authenticated + user
        else GET /contacts or GET /chats or GET /:id
            M->>C: getAllContacts/getChatPartners/getMessagesByUserId
            C->>DB: query User/Message collections
            C-->>U: 200 data
        else POST /send/:id
            M->>C: sendMessage(text, image?)
            C->>DB: verify receiver exists
            alt includes image
                C->>CL: upload image
                CL-->>C: secure_url
            end
            C->>DB: create message document
            C->>IO: emit newMessage to receiver socket if online
            C-->>U: 201 created
        end
    end
```

## 4) Admin Routes

Routes:
- `GET /api/admin/check`
- `DELETE /api/admin/delete-user/:id`
- `DELETE /api/admin/delete-message/:text`

```mermaid
sequenceDiagram
    autonumber
    participant A as Admin Client
    participant R as admin.route.js
    participant J as arcjetProtection
    participant P as protectRoute
    participant RA as requireAdmin
    participant C as admin.controller.js
    participant DB as MongoDB

    A->>R: Request /api/admin/*
    R->>J: Arcjet protection
    alt denied by Arcjet
        J-->>A: 403 or 429
    else allowed
        R->>P: Verify jwt
        alt invalid token
            P-->>A: 401
        else valid token
            R->>RA: Check req.user.isAdmin
            alt not admin
                RA-->>A: 403
            else admin
                alt GET /check
                    R-->>A: 200 admin confirmed
                else DELETE /delete-user/:id
                    R->>C: deleteUserAndData
                    C->>DB: validate user id and target user
                    C->>DB: delete related messages
                    C->>DB: delete user
                    C-->>A: 200 deleted summary
                else DELETE /delete-message/:text
                    R->>C: deleteMessage
                    C->>DB: deleteMany by regex text
                    C-->>A: 200 deletedCount
                end
            end
        end
    end
```

## 5) Real-time Message Delivery via Socket.IO

```mermaid
flowchart TD
    A[Sender calls POST /api/message/send/:id] --> B[sendMessage controller]
    B --> C[Persist message in MongoDB]
    C --> D["Resolve receiver socket id via getReceiverSocketId"]
    D --> E{Receiver online?}
    E -- Yes --> F["Emit newMessage via io.to(socketId)"]
    E -- No --> G[Skip emit]
    F --> H[Receiver client updates chat instantly]
    G --> I[Receiver gets message on next fetch]
```

## Notes

- Arcjet middleware is active on all route groups and bypassed only in test mode.
- Message routes are globally protected by authentication middleware.
- Admin operations require both authentication and admin role checks.
- JWT is stored in cookies and read by `protectRoute`.
- Production mode serves frontend static files from `frontend/dist`.
