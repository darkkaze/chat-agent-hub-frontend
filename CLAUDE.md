# Agent Hub Frontend

Chat application similar to Slack/WhatsApp Web built with Vue 3 + TypeScript + Vuetify. Multi-channel messaging interface with responsive design (desktop compact/expanded sidebar, mobile drawer).

## Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── SidebarNavigation.vue          # Main navigation sidebar
│   │   ├── Avatar.vue                     # User/contact avatars
│   │   ├── StatusIndicator.vue            # Online/offline status
│   │   └── LoadingSpinner.vue             # Loading states
│   ├── chat/
│   │   ├── ChatListItem.vue               # Individual chat in list
│   │   ├── ChatSearch.vue                 # Search chats functionality
│   │   ├── ChatFilters.vue                # Filter chats (all/unread/assigned)
│   │   └── EmptyState.vue                 # Empty state for no chats
│   ├── conversation/
│   │   ├── MessageBubble.vue              # Individual message display
│   │   ├── MessageInput.vue               # Message composition input
│   │   ├── MessageAttachment.vue          # File/media attachments
│   │   └── TypingIndicator.vue            # "User is typing..." indicator
│   └── ui/
│       ├── Modal.vue                      # Generic modal component
│       ├── Dropdown.vue                   # Dropdown menus
│       └── Toast.vue                      # Toast notifications
├── layouts/
│   └── ChannelLayout.vue                  # Main layout with sidebar + content
├── views/
│   ├── ChannelView.vue                    # Channel main view (chat list)
│   ├── ChatView.vue                       # Individual chat conversation
│   ├── ChatDetailsView.vue                # Chat details panel
│   └── Home.vue                           # Temp home view
├── router/
│   └── index.ts                           # Vue Router config
├── stores/
│   ├── channels.ts                        # Channels state management
│   ├── chats.ts                          # Chats state management
│   ├── messages.ts                       # Messages state management
│   └── ui.ts                             # UI state (sidebar, modals)
├── services/
│   ├── api.ts                            # Base API client (axios)
│   ├── auth/
│   │   └── authService.ts                # Login, users, agents
│   ├── channels/
│   │   ├── channelsService.ts            # CRUD channels
│   │   ├── chatsService.ts               # Chat operations
│   │   └── messagesService.ts            # Message operations
│   ├── tasks/
│   │   └── tasksService.ts               # Tasks, notes, documents
│   └── boards/
│       └── boardsService.ts              # Kanban boards
└── types/
    ├── api.ts                            # Base API types, enums
    ├── auth.ts                           # Authentication types
    ├── channels.ts                       # Channels, chats, messages types
    ├── tasks.ts                          # Tasks, notes, documents types
    ├── boards.ts                         # Boards types
    ├── chat.ts                           # Chat interface (updated)
    ├── message.ts                        # Message interface (updated)
    ├── channel.ts                        # Channel interface
    └── user.ts                           # User interface
```

## Routing Structure

- `/` → redirects to `/channel/whatsapp`
- `/channel/:channelId` → Channel view (chat list)
- `/channel/:channelId/chat/:chatId` → Chat conversation
- `/channel/:channelId/chat/:chatId/details` → Chat with details panel

## IMPORTANT

- services are contracts, You should not modify them unless explicitly asked to do so.
