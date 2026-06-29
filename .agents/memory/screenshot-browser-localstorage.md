---
name: Screenshot browser persists localStorage
description: The app_preview screenshot browser keeps localStorage across calls — breaks "flip a default to test" verification
---

The `app_preview` screenshot tool's browser keeps `localStorage` across separate screenshot calls within a session (not a fresh context each time).

**Why it bit us:** verifying a localStorage-backed feature (accessibility mode) by temporarily flipping its in-code DEFAULT to "on" failed silently — a prior screenshot had already written the persisted value `{enabled:false}`, which overrode the new default on the next load. The feature looked broken when it wasn't.

**How to apply:** to visually verify a localStorage-driven feature, don't rely on changing the in-code default. Instead bump the STORAGE_KEY to a fresh string for the test (so no stored value exists), confirm, then revert. Remember the client effect runs after hydration, so a setting applied only in `useEffect` won't show in a screenshot taken pre-hydration — apply critical attributes via a pre-hydration inline script in the layout `<head>` if first-paint correctness matters.
