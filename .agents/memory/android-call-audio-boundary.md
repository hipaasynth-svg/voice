---
name: Android call audio boundary
description: The product decision and platform constraint behind VoiceShift's call-routing approach.
---

VoiceShift should present VoIP/SIP calling as the practical non-rooted Android route for real-time voice transformation. It must not imply that a standard third-party Android app can intercept and rewrite the microphone stream of ordinary cellular calls; Accessibility Services do not change that audio boundary.

**Why:** Android's regular cellular call audio path is restricted to privileged/system-level functionality, so promising a normal-dialer voice changer would be misleading.

**How to apply:** Keep the UI and future native audio work centered on VoIP/softphone routing, while explaining cellular-call limitations plainly and reserving root/system-level approaches for explicitly documented future research.