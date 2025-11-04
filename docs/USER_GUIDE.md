# MONAD User Guide

**Version:** 3.7.0  
**Date:** 2025-01-27  
**Status:** Production Ready ✅

---

## Welcome to MONAD

MONAD is your secure, offline AI assistant. Everything runs locally on your device—no cloud, no subscriptions, no surveillance.

---

## Getting Started

### First Run

1. **Boot Screen** - MONAD initializes its neural core (3-5 seconds)
2. **Setup Wizard** - Complete the 11-step onboarding:
   - Enter your name
   - Set a password (if desired)
   - Choose your use type (Personal, Professional, or Both)
   - Select sector, sub-sectors, and roles (if professional)
   - Configure preferences (tone, length, language)
   - Review and confirm
3. **Dashboard** - Access your starter chats

### Starter Chats

After setup, you'll have four starter chats:

1. **Everyday** - General conversations and everyday tasks
2. **Journal** - Personal journaling with encryption (requires separate passcode)
3. **Pro Studio A** - Professional assistance configured from your wizard selections
4. **Pro Studio B** - Second professional chat (for different contexts)
5. **Dispatch** - Current affairs and news digest (interests required)

---

## Using Chats

### Opening a Chat

- Click a chat tile in the dashboard grid
- The chat opens with its interface
- Start typing to begin a conversation

### Saving Conversations

**Quick Save (Cmd/Ctrl+S):**
1. Click Save button or press `Cmd/Ctrl+S`
2. Enter a title and optional tags
3. Choose to save current message or full conversation
4. Click Save

**Auto-Save:**
- Enable auto-save in Settings → Profile
- Conversations save automatically on exit (if enabled)

### Exporting Conversations

**Export (Cmd/Ctrl+E):**
1. Click Export button or press `Cmd/Ctrl+E`
2. Choose format: PDF or RTF
3. File saves to chat folder

**Note:** Exported files are **unencrypted**. Store them securely.

### Adding Tags

1. Click the tag icon in the chat header
2. Type a tag and press Enter
3. Tags help with search and organization

### Opening Chat Folder

- Click folder icon in chat header
- Opens the chat's storage folder in your file manager
- All saved conversations are stored here

---

## Journal Chat

### Setting Up Journal

1. First time opening Journal requires a passcode
2. Enter a passcode (different from app password)
3. Confirm passcode
4. Journal is now unlocked for this session

### Journal Features

- **Auto-Save:** All entries auto-saved with encryption
- **7-Day View:** Browse last 7 days of entries
- **Mood Slider:** Track your mood for each entry
- **Daily Prompt:** Reflection prompts (if enabled)
- **Memory Glimpses:** Random memories from past entries (3/day default)

### Exporting Journal

- Requires re-entering journal passcode
- Shows privacy warning before export
- Exported files are unencrypted

---

## Pro Studio Chat

### Guided Composer

On first open, Pro Studio shows the Guided Composer:

1. **Select Sector** - Choose your industry
2. **Select Sub-sectors** - Multi-select relevant areas
3. **Select Roles** - Choose your role(s)
4. **Configure Identity** - Describe your role (optional)
5. **Set Scope** - Define task boundaries (optional)
6. **Choose Voice** - Professional, Friendly, Technical, or Creative
7. **Set Audience** - Novice, Practitioner, Expert, or Auditorium
8. **Response Style** - Structured, Narrative, Technical, or Conversational

**Complete Setup** to save your persona configuration.

### Using Pro Studio

- Chat uses your configured persona
- Responses tailored to your sector/role
- Professional-grade assistance

---

## Dispatch Chat

### Interest Onboarding

First time opening Dispatch:

1. Select **at least 10 interests** from the list
2. Click Continue
3. Dispatch is now personalized

### Dispatch Tabs

- **Daily** - Daily news digest
- **Deep Dives** - In-depth analysis
- **Good News** - Positive stories (always includes 3+ items)
- **My Brief** - Personalized weekly summary

### Source Bias Slider

- **Mainstream** ← → **Independent**
- Adjust to prefer mainstream or independent sources
- Balanced default

---

## Dashboard

### Navigation

- **Chat Grid** - View all your chats
- **Header Bar** - Status indicators and actions
- **Search** - Search across all chats (F2)
- **Settings** - Configure MONAD (gear icon)
- **Lock** - Lock app immediately (F3)

### Keyboard Shortcuts

**Global:**
- `F1` - Help / Documentation
- `F2` - Search library
- `F3` - Lock app now
- `Cmd/Ctrl+F` - Search
- `Cmd/Ctrl+M` - Mute/unmute sounds
- `Cmd/Ctrl+Shift+L` - Lock all

**In Chat:**
- `Cmd/Ctrl+S` - Save conversation
- `Cmd/Ctrl+E` - Export conversation
- `Cmd/Ctrl+K` - Add tags
- `Enter` - Send message
- `Shift+Enter` - New line

---

## Settings

### Profile Tab

- **Name** - Your display name
- **Role** - Your role (Professional, Personal, etc.)
- **Tone** - Preferred communication style
- **Language** - Language preference

### Security Tab

- **Idle Timeout** - Auto-lock after inactivity (seconds)
- **Lock Now** - Immediately lock the app
- **Clipboard Policy** - Auto-scrub clipboard (enabled by default)

### Theme Tab

- **Dark** - Classic dark theme
- **Light** - Light theme
- **Midnight** - Deep dark theme (default)
- **Dim** - Reduced brightness

### About Tab

- **Version** - MONAD version number
- **License** - MIT License
- **Data Storage** - Location of your data

---

## Security & Privacy

### Encryption

- **At Rest:** All data encrypted using AES-GCM
- **Journal:** Separate encryption with journal passcode
- **Keys:** Derived using Argon2id (password) and HKDF (journal)

### Data Storage

- **Location:** AppData directory (user-scoped)
- **Format:** Encrypted JSON files
- **Backup:** Export unencrypted backups via Export feature

### Offline Operation

- **No Internet Required:** All processing local
- **No Telemetry:** No data sent externally
- **No Accounts:** No sign-in or registration

---

## Troubleshooting

### Backend Not Connected

**Symptoms:** Red indicator in header, "Backend disconnected" message

**Solutions:**
1. Restart MONAD
2. Check backend is running (Tauri launches automatically)
3. Verify port 8000 is available

### Chat Not Saving

**Symptoms:** Save button doesn't work, no confirmation

**Solutions:**
1. Check app is unlocked (password entered)
2. Verify storage location is accessible
3. Check save preference in Settings

### Journal Won't Unlock

**Symptoms:** Journal lock screen persists after passcode

**Solutions:**
1. Verify journal passcode is set
2. Check passcode is correct (case-sensitive)
3. Try closing and reopening Journal chat

### Search Not Finding Chats

**Symptoms:** Search returns no results

**Solutions:**
1. Verify chats have tags (tags are searchable)
2. Check registry exists (complete setup wizard if needed)
3. Try searching by chat name instead of tags

---

## Best Practices

### Security

- Use strong passwords (12+ chars, mixed case, numbers, symbols)
- Set different passcode for Journal
- Enable auto-lock for unattended sessions
- Store exported files securely (they're unencrypted)

### Organization

- Use tags consistently across chats
- Name saved conversations descriptively
- Export important conversations regularly
- Keep chat folders organized

### Performance

- Keep conversations under 100 messages for best performance
- Export and clear old conversations periodically
- Monitor storage usage in Settings → About

---

## Support

For issues, questions, or feedback:
- Check this guide first
- Review troubleshooting section
- Check Settings → About for version info

---

**MONAD v3.7.0** - Your offline AI companion

---

**MONAD Offline AI v1.0.0 — "Untethered Intelligence"
