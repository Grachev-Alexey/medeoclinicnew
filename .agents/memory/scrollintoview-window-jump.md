---
name: scrollIntoView scrolls the whole window
description: Why centering an active item in a horizontal carousel must use container scrollLeft, not Element.scrollIntoView.
---

`Element.scrollIntoView()` scrolls **every** scrollable ancestor, including the
window — even with `block: "nearest"`. In a horizontal thumbnail/carousel strip
this yanks the whole page vertically to the section (symptom: "navigating to a
page jumps down to the doctors block", "swiping doctors scrolls to the bottom").

**Why:** there is no native option to limit `scrollIntoView` to a single
ancestor. Plus React StrictMode double-invokes effects in dev, so a `didMount`
guard does NOT prevent a mount-time fire — the second invocation runs and scrolls
the window.

**How to apply:** to center an active item inside one horizontal strip, scroll the
strip itself: `strip.scrollTo({ left: thumb.offsetLeft - strip.clientWidth/2 +
thumb.clientWidth/2, behavior: "smooth" })`. Never use `scrollIntoView` for
in-carousel centering.
