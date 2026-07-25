# 0001 - Use Expo Universal App

## Status

Accepted

## Decision

ArogyaLink will use React Native, Expo, Expo Router, and TypeScript for the application foundation.

## Rationale

- One codebase can support Android and Web during the hackathon.
- The architecture remains compatible with future iOS support.
- Expo keeps setup and iteration fast for a 24-hour build.
- Shared TypeScript modules can hold domain and business logic across platforms.
- Expo Router gives scalable file-based routing without custom navigation setup.
