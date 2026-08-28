# ArogyaLink

ArogyaLink is a cross-platform healthcare follow-up prototype for patients and doctors. It connects doctor-created care plans with patient task tracking, appointment/token workflows, offline support, and text-based AI assistance.

> **Current status:** Phase 7 is implemented on `phase/07-ai`. This repository is a hackathon prototype: its domain data and authentication are local/mock implementations, not a production healthcare backend.

## What It Does

### Patient experience

- Register or log in locally as a patient.
- View a patient home dashboard, care tasks, medications, appointments, and health history.
- Find doctors by name, speciality, clinic, or city.
- Request an appointment from a doctor's available demo slots.
- See requested, confirmed, declined, and completed appointment states, including tokens where available.
- Mark care tasks as taken or as couldn't take, with a missed reason.
- Continue viewing cached Home, Medications, and Appointments data while offline.
- Queue offline care-task actions and synchronize them when connectivity returns.
- Use Arogya AI for text-based concern summaries, controlled speciality suggestions, prescription explanations, and record explanations.

### Doctor experience

- Register or log in locally as a doctor.
- View the doctor dashboard, appointment requests, queue, patients, and profile.
- Accept or decline appointment requests.
- Assign tokens during confirmation and work through the current/waiting queue.
- Open a patient's snapshot, history, or care plan.
- Create care plans and care-plan items that generate patient care tasks.
- Review adherence counts, missed reasons, rule-based care alerts, and unresolved attention items.
- Generate a text-based AI summary from recorded patient, care-plan, adherence, and alert data.
- Mark attention items resolved and complete appointments.

## Important Scope Notes

- **Voice automation is not currently implemented.** The repository contains no voice, speech recognition, microphone, audio, or recording feature. Voice access remains a future improvement.
- AI currently uses a deterministic local mock provider. No real AI API is called from the client.
- Authentication is local mock authentication. It persists only the mock session with AsyncStorage and does not validate credentials against a server.
- Healthcare domain repositories are in-memory and seeded from `src/data/mockSeed.ts`.
- This prototype does not provide medical diagnosis, medication changes, prescriptions, emergency services, or clinical decision-making.

## Technology Stack

| Area                | Technology                                                                            |
| ------------------- | ------------------------------------------------------------------------------------- |
| Application         | React Native 0.86 with Expo SDK 57                                                    |
| Routing             | Expo Router with file-based routes                                                    |
| Language            | TypeScript                                                                            |
| Web                 | React Native Web and Expo static web export                                           |
| Local session/cache | `@react-native-async-storage/async-storage`                                           |
| Connectivity        | `@react-native-community/netinfo`                                                     |
| Data layer          | In-memory repositories with centralized mock seed data                                |
| AI layer            | Typed provider abstraction, deterministic mock provider, prompt and output guardrails |
| Quality tools       | ESLint, TypeScript, Prettier                                                          |

## Getting Started

### Requirements

- Node.js and npm installed locally.
- Information required: the repository does not currently specify a minimum Node.js version.

### Install dependencies

From the repository root:

```powershell
npm.cmd install
```

### Start the development app

Start Expo and choose a target from the Expo developer interface:

```powershell
npm.cmd run start
```

Run directly for web:

```powershell
npm.cmd run web
```

Run the Android target when an Android development environment is available:

```powershell
npm.cmd run android
```

The project also defines an iOS script:

```powershell
npm.cmd run ios
```

Native device/emulator prerequisites are environment-specific and are not defined by this repository.

## Verification Commands

```powershell
npm.cmd run lint
npm.cmd run typecheck
npx.cmd expo export --platform web
```

The web export writes generated output to `dist/`, which is ignored by Git.

Formatting checks are also available:

```powershell
npm.cmd run format:check
npm.cmd run format
```

There is currently no `test` script or configured automated test runner in `package.json`. `src/services/ai/verification.ts` contains small AI service verification helpers, but it is not a test command.

## How the Prototype Works

```text
Local patient/doctor auth
          |
          v
Role-protected Expo Router shell
       /       \\
 Patient       Doctor
    |             |
 Care tasks   Care plans and queue
 Appointments  Patient snapshots
 Offline cache Adherence and alerts
    |             |
    +------ local repositories ------+
                   |
                   v
             Mock AI services
```

### Authentication and role protection

The app starts at the local auth entry screen. A user selects Patient or Doctor and can register or log in with required fields and a six-character minimum password. The active mock session is stored in AsyncStorage without storing the password. Patient and doctor route groups redirect unauthenticated users to login and prevent an active session from entering the other role's shell.

### CareLoop workflow

1. A doctor creates a care plan for a patient.
2. Care-plan items such as medication or follow-up items are added.
3. Care tasks are generated and appear in the patient's care views.
4. The patient records taken or couldn't-take outcomes, including a reason for a missed task.
5. Adherence history and rule-based attention items are available to the doctor.
6. The doctor can review the patient snapshot and resolve attention items.

### Appointment and token workflow

1. A patient selects a doctor, date, time, and visit reason.
2. The appointment is stored as a request in the local repository.
3. The doctor accepts or declines the request.
4. Accepted appointments receive a stable token such as `A-01`.
5. The doctor's queue derives the current patient from the first confirmed, non-completed appointment in token order.
6. Completing the current appointment makes the next confirmed appointment current without renumbering tokens.

### Offline workflow

Connectivity is monitored with NetInfo. When offline, the patient sees an offline state and can use cached patient data for Home, Medications, and Appointments. Care-task actions are applied optimistically to the local cache and placed in a persistent AsyncStorage sync queue. When connectivity returns, queued actions are processed with duplicate checks, the patient cache is refreshed, and attention evaluation runs for synchronized missed medication events.

### AI workflow

The AI service accepts typed use cases through `src/services/ai/types.ts` and sends them through a provider abstraction. The current `MockAIProvider` returns deterministic responses for:

- Patient concern summaries.
- Controlled speciality suggestions.
- Repository-backed doctor matching after a speciality suggestion.
- Explanations of existing prescription instructions.
- Explanations of saved patient records.
- Doctor-facing summaries built from recorded patient context.

Output guardrails replace responses that contain selected unsafe patterns, and emergency phrases in patient concerns show an urgent-care message instead of a normal suggestion flow. The doctor summary is manual, uses recorded repository data, and is labeled for clinical verification.

## Routes and Screens

Expo Router routes are organized into authentication, patient, and doctor route groups.

| Area                      | Screens                                                       |
| ------------------------- | ------------------------------------------------------------- |
| Auth                      | Entry, Login, Register                                        |
| Patient tabs              | Home, Appointments, Arogya AI, Medications, Profile           |
| Patient secondary screens | Find Doctor, Doctor Profile, Book Appointment, Health History |
| Doctor tabs               | Home, Patients, Queue, Profile                                |
| Doctor secondary screens  | Patient Snapshot, Patient History, Care Plan                  |

The route groups are implemented under `app/(auth)`, `app/(patient)`, and `app/(doctor)`.

## Repository and Data Model

The temporary data layer is centralized and repository-backed:

- `Patient`
- `Doctor`
- `Appointment`
- `Consultation`
- `CarePlan`
- `CarePlanItem`
- `CareTask`
- `AdherenceEvent`
- `AttentionItem`

The repository contracts live in `src/repositories/contracts.ts`. The current implementations are in `src/repositories/memory/MemoryRepositories.ts`, and their shared seed data is in `src/data/mockSeed.ts`.

Changes to in-memory domain data are reset when the JavaScript runtime is restarted. AsyncStorage is used separately for the mock auth session, offline patient cache, and pending sync queue.

## Project Structure

```text
app/                  Expo Router route files and screens
assets/               App icons, splash assets, and favicon
docs/                 Architecture notes and accepted decisions
src/components/       Shared UI, patient, doctor, and navigation components
src/config/           Demo identities and navigation route definitions
src/data/              Centralized mock seed data
src/domain/            Healthcare domain types
src/features/auth/     Local mock authentication context and validation
src/hooks/             Shared React hooks
src/lib/               Small shared helpers, including public environment access
src/repositories/      Repository contracts and in-memory implementations
src/services/ai/       Typed AI service, mock provider, prompts, and guardrails
src/services/connectivity/  Network state context
src/services/offline/  Patient cache and offline patient data context
src/services/offlineSync/  Persistent pending-action queue and synchronization
src/theme/             Colors, spacing, typography, radius, and accessibility tokens
```

## Configuration

`.env.example` documents the currently reserved public environment names:

```text
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

The app reads these names through `src/lib/env.ts`, but the current repository does not configure a live API or Supabase integration. Do not put private API keys in client-side `EXPO_PUBLIC_*` variables. Local `.env` files are ignored by Git.

## Limitations and Future Improvements

The following are outside the current implementation:

- Production authentication, server-side profiles, and secure token management.
- Supabase or another backend database/API.
- Real AI model calls through a secure server boundary.
- Voice automation, speech recognition, microphone input, audio calls, and voice responses.
- OCR, image analysis, prescription image capture, and document upload.
- OTP, password reset, email verification, social login, biometrics, and doctor verification.
- Push notifications, real-time synchronization, and production-grade offline conflict resolution.
- Real appointment availability, queue operations, consultation creation, and prescription creation.
- Automated unit, integration, and end-to-end test suites.

## Development Workflow

The repository uses long-lived `main` and `develop` branches plus phase branches named `phase/*`. The completed work is currently on `phase/07-ai`.

Before submitting changes, run lint, type checking, and the finite Expo web export. Keep generated output, local environment files, dependencies, and secrets out of commits.

## License

This project includes the MIT License. See [LICENSE](LICENSE).

## Repository

GitHub: [DiganthGowdaGR/ArogyaLink](https://github.com/DiganthGowdaGR/ArogyaLink)
