## 2026-02-27 - [Input Length Limits & CSP]
**Vulnerability:** Lack of input length validation and missing Content Security Policy (CSP).
**Learning:** In applications using `localStorage` for state persistence, a lack of input length limits can lead to a client-side Denial of Service (DoS) by exhausting the 5MB storage quota or causing memory issues during re-renders of large lists.
**Prevention:** Always implement `maxLength` on user-facing inputs and enforce strict CSPs to mitigate XSS risks and control resource loading.
