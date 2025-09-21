# Agent Hub Frontend

Chat application similar to Slack/WhatsApp Web built with Vue 3 + TypeScript + Vuetify. Multi-channel messaging interface with responsive design, WebSocket real-time messaging, and audio notifications.

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
│   │   ├── ChatDetailsPanel.vue           # Chat details sidebar panel
│   │   ├── list/
│   │   │   ├── ChatSearch.vue             # Search chats functionality
│   │   │   ├── ChatFilters.vue            # Filter chats (all/unread/assigned)
│   │   │   └── EmptyState.vue             # Empty state for no chats
│   │   ├── tabs/
│   │   │   ├── ChatInfoTab.vue            # Chat information tab
│   │   │   └── ChatAgentsTab.vue          # Chat agents management tab
│   │   ├── header/
│   │   │   ├── ChatHeader.vue             # Chat conversation header
│   │   │   └── ChannelHeader.vue          # Channel list header
│   │   ├── conversation/
│   │   │   ├── MessageBubble.vue          # Individual message display
│   │   │   ├── MessageInput.vue           # Message composition input
│   │   │   ├── MessageAttachment.vue      # File/media attachments
│   │   │   ├── MessageStatus.vue          # Message delivery status
│   │   │   ├── DateSeparator.vue          # Date separators in chat
│   │   │   ├── TypingIndicator.vue        # "User is typing..." indicator
│   │   │   └── WelcomeMessage.vue         # Welcome message
│   │   └── details/
│   │       ├── ContactInfo.vue            # Contact information
│   │       ├── SharedMedia.vue            # Shared media gallery
│   │       ├── ChatSettings.vue           # Chat settings
│   │       └── MediaViewer.vue            # Media viewer modal
│   ├── conversation/
│   │   ├── MessageBubble.vue              # Message display (duplicate)
│   │   └── MessageInput.vue               # Message input (duplicate)
│   └── ui/
│       ├── Modal.vue                      # Generic modal component
│       ├── Dropdown.vue                   # Dropdown menus
│       └── Tooltip.vue                    # Tooltip component
├── layouts/
│   └── ChannelLayout.vue                  # Main layout with fixed grid system
├── views/
│   ├── ChannelView.vue                    # Channel main view (chat list)
│   ├── ChatView.vue                       # Individual chat conversation
│   └── onboarding/
│       ├── CreateAgent.vue                # Agent creation form
│       └── CreateChannel.vue              # Channel creation form
├── router/
│   └── index.ts                           # Vue Router config
├── stores/
│   ├── auth.ts                           # Authentication state management
│   ├── channels.ts                        # Channels state management
│   ├── chats.ts                          # Chats state management
│   ├── messages.ts                       # Messages state management
│   ├── websocket.ts                      # WebSocket state and real-time messaging
│   └── ui.ts                             # UI state (sidebar, modals)
├── services/
│   ├── api.ts                            # Base API client (axios)
│   ├── auth/
│   │   └── authService.ts                # Login, users, agents
│   ├── channels/
│   │   ├── channelsService.ts            # CRUD channels
│   │   ├── chatsService.ts               # Chat operations
│   │   ├── messagesService.ts            # Message operations
│   │   └── chatAgentsService.ts          # Chat agents management
│   ├── tasks/
│   │   └── tasksService.ts               # Tasks, notes, documents
│   ├── boards/
│   │   └── boardsService.ts              # Kanban boards
│   ├── websocket/
│   │   └── websocketService.ts           # WebSocket connection management
│   ├── audio/
│   │   └── notificationService.ts        # Audio notification system
│   └── browser/
│       └── visibilityService.ts          # Browser visibility detection
└── types/
    ├── api.ts                            # Base API types, enums
    ├── auth.ts                           # Authentication types
    ├── channels.ts                       # Channels, chats, messages types
    ├── tasks.ts                          # Tasks, notes, documents types
    ├── boards.ts                         # Boards types
    ├── chatAgents.ts                     # Chat agents types
    ├── websocket.ts                      # WebSocket event types
    └── user.ts                           # User interface
```

## Features

- **Real-time messaging** via WebSocket with automatic reconnection
- **Audio notifications** with browser visibility detection
- **Independent scroll areas** with fixed header/input layout
- **Responsive design** with mobile-first approach
- **Defensive error handling** for date formatting and API calls
- **Message ordering** with proper chronological display

## Routing Structure

- `/` → redirects to `/channel/whatsapp`
- `/channel/:channelId` → Channel view (chat list)
- `/channel/:channelId/chat/:chatId` → Chat conversation
- `/onboarding/create-agent` → Agent creation
- `/onboarding/create-channel` → Channel creation

## Run Commands

- `npm run dev` → Development server
- `npm run type-check` → TypeScript type checking
- `npm run build` → Production build
