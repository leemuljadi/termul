# Termul Mobile

React Native companion prototype for Termul Manager, built with Expo and TypeScript.

This mobile app mirrors the main workspace concepts from the Tauri desktop app:

- project-aware workspace switching
- terminal, editor, and browser surface summaries
- command queue composer
- activity feed and mobile settings

The desktop app still owns local PTY process management through Tauri and Rust. Mobile terminal execution will need a remote bridge or hosted agent before commands can run against a real machine.

## Commands

From the repository root:

```bash
bun run mobile:dev
bun run mobile:ios
bun run mobile:android
bun run mobile:typecheck
```

Or from this folder:

```bash
bun run start
bun run typecheck
```
