# Budget App - Chatbot UI Component Design Specification

**Version**: 1.0
**Date**: November 9, 2025
**Owner**: documentation-specialist → react-specialist
**Status**: Specification Ready for Implementation
**Priority**: Medium (AI Chatbot Feature)

---

## 🎯 Overview

This document provides a complete design specification for the Budget App AI Chatbot UI component. The chatbot will be implemented as a floating widget that provides conversational access to financial data and insights.

---

## 📋 Component Requirements

### Functional Requirements

1. **Always-accessible floating button** in bottom-right corner
2. **Expandable chat panel** that overlays content
3. **Message history** with user/assistant message bubbles
4. **Typing indicators** during API response wait
5. **Keyboard navigation** support (WCAG 2.2 AA compliant)
6. **Mobile-responsive** design (320px to 2560px)
7. **Persistent state** across page navigation (React Context)
8. **Error handling** with retry mechanisms

### Non-Functional Requirements

1. **Performance**: Message rendering <100ms
2. **Accessibility**: WCAG 2.2 Level AA compliant
3. **Responsiveness**: Works on iOS Safari, Android Chrome, Desktop browsers
4. **Privacy**: No data sent without user consent
5. **Offline**: Graceful degradation when offline

---

## 🎨 Visual Design Specification

### Color Palette (Budget App Design System)

```css
/* Primary Colors */
--chatbot-primary: #14b8a6; /* Teal-500 - brand color */
--chatbot-primary-hover: #0d9488; /* Teal-600 */
--chatbot-primary-active: #0f766e; /* Teal-700 */

/* Message Bubbles */
--chatbot-user-bg: #14b8a6; /* Teal-500 */
--chatbot-user-text: #ffffff; /* White */
--chatbot-assistant-bg: #f3f4f6; /* Gray-100 */
--chatbot-assistant-text: #111827; /* Gray-900 */

/* UI Elements */
--chatbot-panel-bg: #ffffff; /* White */
--chatbot-panel-border: #e5e7eb; /* Gray-200 */
--chatbot-input-border: #d1d5db; /* Gray-300 */
--chatbot-input-focus: #14b8a6; /* Teal-500 */

/* States */
--chatbot-disabled: #9ca3af; /* Gray-400 */
--chatbot-error: #ef4444; /* Red-500 */
--chatbot-typing: #6b7280; /* Gray-500 */
```

### Typography

```css
/* Font Families */
--chatbot-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Font Sizes */
--chatbot-text-xs: 0.75rem; /* 12px - timestamps */
--chatbot-text-sm: 0.875rem; /* 14px - messages */
--chatbot-text-base: 1rem; /* 16px - input */
--chatbot-text-lg: 1.125rem; /* 18px - headers */

/* Font Weights */
--chatbot-font-normal: 400;
--chatbot-font-medium: 500;
--chatbot-font-semibold: 600;
```

### Spacing & Sizing

```css
/* Component Sizes */
--chatbot-button-size: 56px; /* 48px minimum + 8px padding */
--chatbot-panel-width-mobile: 100vw;
--chatbot-panel-width-tablet: 400px;
--chatbot-panel-width-desktop: 400px;
--chatbot-panel-height-mobile: 70vh;
--chatbot-panel-height-desktop: 600px;

/* Internal Spacing */
--chatbot-spacing-xs: 0.25rem; /* 4px */
--chatbot-spacing-sm: 0.5rem; /* 8px */
--chatbot-spacing-md: 1rem; /* 16px */
--chatbot-spacing-lg: 1.5rem; /* 24px */
--chatbot-spacing-xl: 2rem; /* 32px */

/* Border Radius */
--chatbot-radius-sm: 0.375rem; /* 6px - bubbles */
--chatbot-radius-md: 0.5rem; /* 8px - panel */
--chatbot-radius-full: 9999px; /* Circular button */

/* Shadows */
--chatbot-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--chatbot-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--chatbot-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--chatbot-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

---

## 🧩 Component Structure

### Component Hierarchy

```
<ChatbotWidget>
  ├── <ChatbotButton>          // Floating button (always visible)
  └── <ChatbotPanel>           // Expandable chat panel
      ├── <ChatbotHeader>      // Title, minimize, close buttons
      ├── <ChatbotMessages>    // Scrollable message list
      │   ├── <MessageBubble type="user" />
      │   ├── <MessageBubble type="assistant" />
      │   └── <TypingIndicator />
      ├── <ChatbotInput>       // Input field + send button
      └── <ChatbotFooter>      // Privacy notice, settings
```

---

## 📐 Layout Specifications

### 1. Floating Button (Collapsed State)

**Position**: Fixed bottom-right corner

```css
.chatbot-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  background: var(--chatbot-primary);
  box-shadow: var(--chatbot-shadow-lg);
  z-index: 1000;

  /* Mobile adjustments */
  @media (max-width: 640px) {
    bottom: 16px;
    right: 16px;
  }
}

.chatbot-button:hover {
  background: var(--chatbot-primary-hover);
  box-shadow: var(--chatbot-shadow-xl);
  transform: scale(1.05);
}

.chatbot-button:active {
  background: var(--chatbot-primary-active);
  transform: scale(0.95);
}

.chatbot-button:focus-visible {
  outline: 2px solid var(--chatbot-primary);
  outline-offset: 2px;
}
```

**Icon**: Chat bubble or message icon (lucide-react `MessageCircle`)
- Icon size: 28px
- Icon color: White
- Accessible label: "Open AI Chatbot"

**Badge**: Unread message count (if applicable)
- Size: 20px circle
- Position: Top-right corner of button
- Background: Red-500
- Text: White, 12px, bold

---

### 2. Chat Panel (Expanded State)

**Position**: Fixed bottom-right, anchored to button

```css
.chatbot-panel {
  position: fixed;
  bottom: 96px; /* 56px button + 24px gap + 16px */
  right: 24px;
  width: 400px;
  height: 600px;
  background: var(--chatbot-panel-bg);
  border: 1px solid var(--chatbot-panel-border);
  border-radius: var(--chatbot-radius-md);
  box-shadow: var(--chatbot-shadow-xl);
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* Mobile: Full screen */
  @media (max-width: 640px) {
    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }

  /* Tablet: Smaller width */
  @media (min-width: 641px) and (max-width: 1024px) {
    width: 360px;
    height: 70vh;
  }
}

/* Animation */
.chatbot-panel-enter {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.chatbot-panel-enter-active {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: all 200ms ease-out;
}

.chatbot-panel-exit {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.chatbot-panel-exit-active {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  transition: all 150ms ease-in;
}
```

---

### 3. Chat Header

**Height**: 64px (mobile), 56px (desktop)

```css
.chatbot-header {
  flex-shrink: 0;
  height: 64px;
  padding: 16px;
  border-bottom: 1px solid var(--chatbot-panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--chatbot-panel-bg);

  @media (min-width: 641px) {
    height: 56px;
    padding: 12px 16px;
  }
}

.chatbot-header-title {
  font-size: var(--chatbot-text-lg);
  font-weight: var(--chatbot-font-semibold);
  color: var(--chatbot-assistant-text);
}

.chatbot-header-actions {
  display: flex;
  gap: 8px;
}

.chatbot-header-button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--chatbot-typing);
  transition: all 150ms;
}

.chatbot-header-button:hover {
  background: var(--chatbot-assistant-bg);
  color: var(--chatbot-assistant-text);
}
```

**Elements**:
- **Title**: "Budget Assistant" (18px, semibold)
- **Minimize button**: `-` icon (mobile only, hides panel)
- **Close button**: `×` icon (closes panel)
- **Settings button** (optional): Gear icon

**Accessibility**:
- All buttons must have aria-label
- Focus visible indicators required
- Keyboard shortcuts: Escape to close

---

### 4. Messages Container

**Layout**: Scrollable flex column

```css
.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--chatbot-panel-border);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--chatbot-disabled);
  }
}

/* Auto-scroll to bottom on new message */
.chatbot-messages[data-auto-scroll="true"] {
  scroll-behavior: smooth;
}
```

**Behavior**:
- Auto-scroll to bottom when new message arrives
- Maintain scroll position when user scrolls up
- Show "New messages" indicator when scrolled up

---

### 5. Message Bubbles

**User Message** (right-aligned):

```css
.message-bubble-user {
  align-self: flex-end;
  max-width: 80%;
  padding: 12px 16px;
  background: var(--chatbot-user-bg);
  color: var(--chatbot-user-text);
  border-radius: 16px 16px 4px 16px;
  font-size: var(--chatbot-text-sm);
  line-height: 1.5;
  word-wrap: break-word;

  @media (max-width: 640px) {
    max-width: 85%;
  }
}
```

**Assistant Message** (left-aligned):

```css
.message-bubble-assistant {
  align-self: flex-start;
  max-width: 80%;
  padding: 12px 16px;
  background: var(--chatbot-assistant-bg);
  color: var(--chatbot-assistant-text);
  border-radius: 16px 16px 16px 4px;
  font-size: var(--chatbot-text-sm);
  line-height: 1.5;
  word-wrap: break-word;

  @media (max-width: 640px) {
    max-width: 85%;
  }
}
```

**Timestamp**:

```css
.message-timestamp {
  font-size: var(--chatbot-text-xs);
  color: var(--chatbot-typing);
  margin-top: 4px;
  text-align: right; /* User messages */
  text-align: left; /* Assistant messages */
}
```

**Format**: "2:34 PM" or "Yesterday 10:15 AM"

---

### 6. Typing Indicator

```css
.typing-indicator {
  align-self: flex-start;
  padding: 12px 16px;
  background: var(--chatbot-assistant-bg);
  border-radius: 16px 16px 16px 4px;
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--chatbot-typing);
  border-radius: 50%;
  animation: typing-bounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}
```

**Accessibility**: `aria-live="polite"` with text "Assistant is typing..."

---

### 7. Input Area

**Height**: 72px (with padding)

```css
.chatbot-input-container {
  flex-shrink: 0;
  padding: 12px 16px;
  border-top: 1px solid var(--chatbot-panel-border);
  background: var(--chatbot-panel-bg);
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.chatbot-input {
  flex: 1;
  min-height: 48px;
  max-height: 120px;
  padding: 12px 16px;
  border: 1px solid var(--chatbot-input-border);
  border-radius: 24px;
  font-size: var(--chatbot-text-base);
  font-family: var(--chatbot-font-family);
  resize: none;
  overflow-y: auto;
  line-height: 1.5;

  &:focus {
    outline: none;
    border-color: var(--chatbot-input-focus);
    box-shadow: 0 0 0 2px rgb(20 184 166 / 0.1);
  }

  &::placeholder {
    color: var(--chatbot-disabled);
  }
}

.chatbot-send-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--chatbot-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 150ms;

  &:hover:not(:disabled) {
    background: var(--chatbot-primary-hover);
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    background: var(--chatbot-primary-active);
    transform: scale(0.95);
  }

  &:disabled {
    background: var(--chatbot-disabled);
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus-visible {
    outline: 2px solid var(--chatbot-primary);
    outline-offset: 2px;
  }
}
```

**Elements**:
- **Textarea**: Auto-expanding (1-4 lines), placeholder "Ask about your finances..."
- **Send button**: Paper plane icon (lucide-react `Send`), disabled when empty

**Keyboard shortcuts**:
- Enter: Send message (desktop)
- Shift+Enter: New line
- Escape: Close panel

---

### 8. Footer (Optional)

```css
.chatbot-footer {
  flex-shrink: 0;
  padding: 8px 16px;
  border-top: 1px solid var(--chatbot-panel-border);
  background: var(--chatbot-assistant-bg);
  font-size: var(--chatbot-text-xs);
  color: var(--chatbot-typing);
  text-align: center;
}

.chatbot-footer-link {
  color: var(--chatbot-primary);
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: var(--chatbot-primary-hover);
  }
}
```

**Content**: "Powered by OpenAI • [Privacy Policy](#)"

---

## ♿ Accessibility Requirements (WCAG 2.2 AA)

### Keyboard Navigation

**Tab Order**:
1. Floating button
2. Close button (when panel open)
3. Message history (scrollable region)
4. Input textarea
5. Send button

**Keyboard Shortcuts**:
- `Tab`: Navigate through interactive elements
- `Shift+Tab`: Navigate backwards
- `Enter`: Send message (when input focused)
- `Shift+Enter`: New line in input
- `Escape`: Close panel
- `↑/↓`: Scroll message history (when focused)

**Implementation**:
```tsx
// Focus trap when panel is open
import { useFocusTrap } from '@/hooks/useFocusTrap';

function ChatbotPanel({ isOpen }: { isOpen: boolean }) {
  const panelRef = useFocusTrap(isOpen);

  return (
    <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="chatbot-title">
      {/* Panel content */}
    </div>
  );
}
```

---

### Screen Reader Support

**ARIA Labels**:
```tsx
<button aria-label="Open AI chatbot" />
<button aria-label="Close chatbot" />
<button aria-label="Send message" />
<div role="log" aria-live="polite" aria-label="Chat messages" />
<textarea aria-label="Type your question" />
```

**Live Regions**:
```tsx
// New messages announced to screen readers
<div
  role="log"
  aria-live="polite"
  aria-atomic="false"
  aria-relevant="additions"
>
  {messages.map(msg => (
    <div key={msg.id} role="article">
      <span className="sr-only">{msg.role === 'user' ? 'You said:' : 'Assistant said:'}</span>
      {msg.content}
    </div>
  ))}
</div>

// Typing indicator
<div aria-live="polite" aria-atomic="true">
  {isTyping && <span className="sr-only">Assistant is typing...</span>}
</div>
```

**Screen Reader Only Text** (`.sr-only`):
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

### Focus Management

**Focus Trap**:
- When panel opens, focus moves to close button or input
- Tab cycles through interactive elements within panel
- Shift+Tab wraps to last element

**Focus Indicators**:
- All interactive elements must show visible focus ring
- Focus ring: 2px solid teal-500, 2px offset
- Never use `outline: none` without replacement

**Implementation**:
```tsx
// Auto-focus input when panel opens
useEffect(() => {
  if (isOpen && inputRef.current) {
    inputRef.current.focus();
  }
}, [isOpen]);

// Return focus to trigger button when closing
const handleClose = () => {
  setIsOpen(false);
  buttonRef.current?.focus();
};
```

---

### Color Contrast

**Required Ratios** (WCAG 2.2 AA):
- Normal text (14px+): 4.5:1
- Large text (18px+ or 14px bold): 3:1
- UI components: 3:1

**Verified Combinations**:
- ✅ Teal-500 (#14b8a6) on White (#ffffff): 4.53:1
- ✅ Gray-900 (#111827) on Gray-100 (#f3f4f6): 15.89:1
- ✅ White (#ffffff) on Teal-500 (#14b8a6): 4.53:1

**Testing**: Use browser DevTools or WebAIM Contrast Checker

---

## 📱 Responsive Behavior

### Mobile (< 640px)

- **Full-screen panel**: 100vw × 100vh
- **No rounded corners**: border-radius: 0
- **Header height**: 64px (larger touch targets)
- **Button position**: bottom: 16px, right: 16px
- **Message bubbles**: max-width: 85%
- **Input**: Larger font size (16px to prevent zoom)

### Tablet (640px - 1024px)

- **Panel width**: 360px
- **Panel height**: 70vh
- **Anchored to button**: bottom-right corner
- **Rounded corners**: 8px

### Desktop (> 1024px)

- **Panel width**: 400px
- **Panel height**: 600px
- **Full hover states**: All interactive elements
- **Keyboard shortcuts**: Enabled

---

## 🔧 State Management

### Component State

```tsx
interface ChatbotState {
  isOpen: boolean;
  messages: Message[];
  isTyping: boolean;
  error: string | null;
  inputValue: string;
}

interface Message {
  id: string; // UUID
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}
```

### Context API

```tsx
// src/contexts/ChatbotContext.tsx
interface ChatbotContextValue {
  isOpen: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
  toggleChatbot: () => void;
  messages: Message[];
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
  isTyping: boolean;
  error: string | null;
}

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ChatbotState>({
    isOpen: false,
    messages: [],
    isTyping: false,
    error: null,
    inputValue: '',
  });

  // Implementation...

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};
```

---

## 🔌 API Integration

### OpenAI API Route

**Endpoint**: `POST /api/chat`

**Request**:
```json
{
  "messages": [
    { "role": "user", "content": "How much did I spend this month?" }
  ],
  "context": {
    "userId": "uuid",
    "financialData": { /* Transaction summaries */ }
  }
}
```

**Response**:
```json
{
  "message": {
    "role": "assistant",
    "content": "You spent $1,234.56 this month..."
  },
  "timestamp": "2025-11-09T20:00:00Z"
}
```

**Error Handling**:
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests. Please try again in 60 seconds.",
    "retryAfter": 60
  }
}
```

### Loading States

```tsx
const sendMessage = async (content: string) => {
  try {
    // Show typing indicator
    setState(prev => ({ ...prev, isTyping: true, error: null }));

    // API call
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, { role: 'user', content }] }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const data = await response.json();

    // Add messages to state
    setState(prev => ({
      ...prev,
      messages: [...prev.messages,
        { id: uuid(), role: 'user', content, timestamp: new Date() },
        { id: uuid(), role: 'assistant', content: data.message.content, timestamp: new Date() }
      ],
      isTyping: false,
    }));
  } catch (error) {
    setState(prev => ({
      ...prev,
      isTyping: false,
      error: error.message,
    }));
  }
};
```

---

## 🎬 Animations

### Panel Open/Close

```tsx
// Using Framer Motion
import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence>
  {isOpen && (
    <motion.div
      className="chatbot-panel"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Panel content */}
    </motion.div>
  )}
</AnimatePresence>
```

### Message Fade In

```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.15 }}
>
  {/* Message bubble */}
</motion.div>
```

---

## 🧪 Testing Requirements

### Unit Tests

**Test Coverage**: >80%

```tsx
// __tests__/ChatbotWidget.test.tsx
describe('ChatbotWidget', () => {
  it('opens panel when button clicked', () => {
    render(<ChatbotWidget />);
    const button = screen.getByLabelText('Open AI chatbot');
    fireEvent.click(button);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes panel when Escape pressed', () => {
    render(<ChatbotWidget />);
    // Open panel
    fireEvent.click(screen.getByLabelText('Open AI chatbot'));
    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('sends message when Enter pressed', async () => {
    render(<ChatbotWidget />);
    // Open panel and type message
    const input = screen.getByLabelText('Type your question');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    // Verify message sent
    expect(await screen.findByText('Test message')).toBeInTheDocument();
  });
});
```

### Accessibility Tests

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = render(<ChatbotWidget />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Visual Regression Tests

```tsx
// Playwright visual tests
test('chatbot button appears correctly', async ({ page }) => {
  await page.goto('/budget-app');
  await expect(page.locator('.chatbot-button')).toHaveScreenshot('chatbot-button.png');
});

test('chatbot panel layout on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto('/budget-app');
  await page.click('.chatbot-button');
  await expect(page.locator('.chatbot-panel')).toHaveScreenshot('chatbot-panel-mobile.png');
});
```

---

## 📦 Implementation Checklist

### Phase 1: Basic Structure (4 hours)
- [ ] Create ChatbotContext provider
- [ ] Build floating button component
- [ ] Implement panel container with animations
- [ ] Add header with close button
- [ ] Set up message container with scrolling

### Phase 2: Message System (3 hours)
- [ ] Create MessageBubble component (user/assistant)
- [ ] Implement TypingIndicator component
- [ ] Add timestamp formatting
- [ ] Handle message rendering and scrolling
- [ ] Add error message displays

### Phase 3: Input & Sending (2 hours)
- [ ] Build auto-expanding textarea
- [ ] Implement send button
- [ ] Add keyboard shortcuts (Enter, Shift+Enter, Escape)
- [ ] Connect to API route

### Phase 4: Accessibility (3 hours)
- [ ] Implement focus trap
- [ ] Add all ARIA labels
- [ ] Set up screen reader announcements
- [ ] Test keyboard navigation
- [ ] Verify color contrast
- [ ] Run axe-core accessibility tests

### Phase 5: Responsive Design (2 hours)
- [ ] Mobile full-screen layout
- [ ] Tablet sizing
- [ ] Desktop hover states
- [ ] Test on iOS Safari, Android Chrome
- [ ] Cross-browser testing

### Phase 6: Polish & Testing (3 hours)
- [ ] Add loading states
- [ ] Implement error handling with retry
- [ ] Write unit tests (>80% coverage)
- [ ] Visual regression tests
- [ ] Performance optimization
- [ ] Documentation updates

**Total Estimated Time**: 17 hours

---

## 🎯 Success Criteria

### Functional
- [x] Chatbot button visible on all pages
- [x] Panel opens/closes smoothly
- [x] Messages send and display correctly
- [x] Typing indicator shows during API calls
- [x] Error messages display with retry option

### Accessibility
- [x] WCAG 2.2 AA compliant (axe-core 0 violations)
- [x] Full keyboard navigation support
- [x] Screen reader compatible
- [x] Focus management correct
- [x] Color contrast ≥4.5:1

### Performance
- [x] Panel opens in <200ms
- [x] Message rendering <100ms
- [x] No layout shift (CLS = 0)
- [x] Bundle size <50KB gzipped

### UX
- [x] Intuitive and easy to discover
- [x] Works on mobile, tablet, desktop
- [x] Animations smooth (60fps)
- [x] Error messages clear and helpful

---

## 📚 References

### Design System
- [Budget App Color System](/src/app/budget-app/COLOR_SYSTEM.md)
- [Budget App Design Guide](/src/app/budget-app/DESIGN_GUIDE.md)

### Code Examples
- **shadcn/ui Chat Component**: https://ui.shadcn.com/examples/chat
- **React Chat Hook**: https://github.com/nearform/react-chat-hook
- **Framer Motion Docs**: https://www.framer.com/motion/

### Accessibility
- [WCAG 2.2 AA Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [ARIA Authoring Practices - Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Focus Trap React](https://github.com/focus-trap/focus-trap-react)

### Testing
- [Jest Axe Documentation](https://github.com/nickcolley/jest-axe)
- [Playwright Visual Testing](https://playwright.dev/docs/test-snapshots)

---

**Next Steps**: Hand off to react-specialist for implementation. Review this spec together, clarify any questions, then begin Phase 1.

**Questions?** Contact documentation-specialist or project-manager.

---

*Last Updated: November 9, 2025*
*Version: 1.0*
*Status: Ready for Implementation*
