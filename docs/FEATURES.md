# Multi-Profile Budget App Features

## Overview

The Budget App supports both **Standalone** and **Online** deployment modes. This document outlines the feature matrix and capabilities of each mode.

## Deployment Modes

### Standalone Mode (Current)

The standalone version runs entirely locally in your browser:
- **No account required** - Start using immediately
- **100% local storage** - Data never leaves your device
- **Offline capable** - Works without internet connection
- **Privacy-first** - No data collection or tracking

### Online Mode (Coming Soon)

The online version adds cloud-powered features:
- **Cloud sync** - Access data from any device
- **Family sharing** - Invite family members via email
- **Automatic backups** - Daily encrypted backups
- **Real-time collaboration** - See changes instantly

---

## Feature Comparison Matrix

| Feature | Standalone | Online |
|---------|:----------:|:------:|
| **Core Budgeting** | | |
| Transaction tracking | ✅ | ✅ |
| Budget categories | ✅ | ✅ |
| Spending reports | ✅ | ✅ |
| Goal tracking | ✅ | ✅ |
| Loan management | ✅ | ✅ |
| Subscription tracking | ✅ | ✅ |
| **Multi-Profile** | | |
| Multiple profiles | ✅ | ✅ |
| PIN protection | ✅ | ✅ |
| Private budgets | ✅ | ✅ |
| Shared budgets | ✅ | ✅ |
| Activity logging | ✅ | ✅ |
| Auto-lock timeout | ✅ | ✅ |
| **Data Storage** | | |
| Local storage | ✅ | ✅ |
| Cloud storage | ❌ | ✅ |
| Automatic sync | ❌ | ✅ |
| **Backup & Export** | | |
| Manual export (.budget) | ✅ | ✅ |
| Manual import | ✅ | ✅ |
| Automatic backups | ❌ | ✅ |
| Point-in-time restore | ❌ | ✅ |
| **Collaboration** | | |
| Same-device sharing | ✅ | ✅ |
| Multi-device access | ❌ | ✅ |
| Family invites | ❌ | ✅ |
| Real-time updates | ❌ | ✅ |
| **Security** | | |
| PIN authentication | ✅ | ✅ |
| Encrypted exports | ✅ | ✅ |
| Bank-level encryption | N/A | ✅ |
| Two-factor auth | N/A | ✅ |

---

## Multi-Profile Features (Standalone)

### Profile Management

- **Create profiles** for each family member
- **Avatar customization** with colors and images
- **Default profile** auto-selected on app start
- **Profile switching** via header dropdown

### PIN Protection

- **4-6 digit PIN** for each profile
- **Brute force protection**: 3 attempts, then 30-second lockout
- **Auto-lock timeout**: 15 minutes of inactivity
- **Secure hashing**: PBKDF2 with 100,000 iterations

### Budget Visibility

- **Shared budgets**: Visible to all profiles
- **Private budgets**: Only visible to the owner
- **Flexible control**: Convert between shared/private anytime

### Activity Logging

- **Audit trail** for all actions
- **Profile attribution** - who did what
- **Filter by profile**, action type, or entity
- **Search** activity entries
- **Auto-pruning**: Max 500 entries maintained

---

## Feature Flags

The app uses a feature flag system to control functionality:

```typescript
// src/config/features.ts
export const FEATURES = {
  // Standalone features (always enabled)
  multiProfiles: true,
  pinAuthentication: true,
  privatePublicBudgets: true,
  activityLogging: true,
  localExport: true,

  // Online features (enabled when APP_MODE === 'online')
  cloudSync: false,
  familyInvites: false,
  cloudBackup: false,
  realTimeCollab: false,
};
```

### Checking Feature Availability

```typescript
import { isFeatureEnabled, isOnlineMode } from '@/config/features';

// Check specific feature
if (isFeatureEnabled('multiProfiles')) {
  // Show profile selector
}

// Check deployment mode
if (isOnlineMode()) {
  // Show cloud features
}
```

---

## Settings Panels

### Profile Settings

Location: Settings > Profile Settings

- View all profiles
- Create/edit/delete profiles
- Set/change/remove PINs
- Set default profile

### Activity Log

Location: Settings > Activity Log

- View recent activity
- Filter by profile, action, entity type
- Search activity entries
- Real-time refresh

### Online Features (Preview)

Location: Settings > Online Features

- Preview upcoming cloud features
- Comparison of standalone vs online
- Join waitlist (coming soon)

---

## Export/Import Support

### Exported Data Includes

- All profiles (without PIN data)
- Activity log entries
- Budget visibility settings (ownerId, visibility)
- All other budget data

### Import Handling

- Profile ID mapping for renamed profiles
- Security: PIN data is never exported
- Conflict resolution options: skip, overwrite, rename

---

## Technical Implementation

### Database Schema (v16)

```typescript
// New tables added in version 16
profiles: 'id, name, isDefault, createdAt'
activityLog: 'id, profileId, action, entityType, timestamp, [profileId+timestamp]'

// Budget table extensions
budgets: {
  ownerId?: string | null;     // Profile ID (null = shared)
  visibility?: 'shared' | 'private';
}
```

### Context Providers

```typescript
// ProfileContext provides:
- profiles: Profile[]
- currentProfile: Profile | null
- isLocked: boolean
- createProfile(name, pin?)
- switchProfile(profileId)
- unlockProfile(pin)
- lockProfile()
- setPIN(profileId, pin)
- removePIN(profileId)
```

---

## Coming Soon (Online Mode)

### Cloud Sync
- Automatic synchronization across devices
- Conflict resolution with last-write-wins
- Offline support with sync when online

### Family Invites
- Invite family members via email
- Permission levels: view, edit, admin
- Accept/decline invitations

### Cloud Backup
- Daily automatic backups
- 30-day backup retention
- One-click restore to any point

### Real-time Collaboration
- See family members' changes instantly
- Live activity feed
- Collaborative budget planning
