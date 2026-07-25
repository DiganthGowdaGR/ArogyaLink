# ArogyaLink

ArogyaLink is an inclusive continuity-of-care healthcare platform focused on making follow-up care accessible to smartphone users, rural patients, elderly users, caregivers, and doctors.

## Vision

Healthcare should not stop after a consultation.

## Hackathon Objective

Build a closed-loop care prototype connecting doctor-created care plans with patient follow-up.

## Planned Core Capabilities

- Patient experience
- Doctor experience
- CareLoop
- AI-assisted workflows
- Offline-first smartphone support
- Future voice access

These capabilities are planned progressively and are not all implemented in the current phase.

## Technology Stack

- React Native
- Expo
- Expo Router
- TypeScript
- Web support through Expo

## Running Locally

On Windows PowerShell, use the `.cmd` shims:

```powershell
npm.cmd install
npm.cmd run start
npm.cmd run web
```

Useful checks:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run format:check
```

## Project Structure

- `app/` - Expo Router routes and screens
- `src/components/` - reusable UI components
- `src/features/` - feature modules added by later phases
- `src/hooks/` - reusable React hooks
- `src/lib/` - small shared library helpers
- `src/services/` - external service integrations added by later phases
- `src/store/` - client-side state management added by later phases
- `src/theme/` - foundation design tokens
- `src/types/` - shared TypeScript types
- `src/utils/` - general utilities
- `assets/` - images and icons
- `docs/` - architecture notes and decisions

## Development Workflow

Long-lived branches:

- `main`
- `develop`

Phase branches:

- `phase/*`

Each phase should implement, test, fix, verify, commit, push, and then stop before the next phase begins.

## Current Phase

Phase 0 - Foundation
