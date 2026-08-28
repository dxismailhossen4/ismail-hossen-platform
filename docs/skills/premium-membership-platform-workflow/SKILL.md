---
name: premium-membership-platform-workflow
description: Build and evolve premium dark-themed membership platforms with Supabase Auth/RLS, manual payment verification, private proof uploads, multi-role dashboards, responsive public pages, social/contact surfaces, testing, GitHub/Supabase synchronization, and checkpoint delivery. Use for new builds, major feature additions, branding changes, or release validation of similar web platforms.
---

# Premium Membership Platform Workflow

Use this skill to execute a secure, auditable build loop for an authenticated membership platform. Keep the workflow reusable: separate brand-specific values, payment recipients, social URLs, and copy from the implementation patterns.

## 1. Establish scope and project vocabulary

Confirm the brand name, visual direction, public routes, member routes, administrator routes, payment channels, membership rules, social/contact destinations, and responsible-use wording. Record every requested feature or bug in the project `todo.md` before implementation. Treat exact user-supplied URLs, phone numbers, account names, and copy as source data; never invent payment details, testimonials, ratings, reviews, winning records, or performance claims.

Define the core entities early: `profile` with a user identity and role, `membership` with access status and dates, `payment` with channel/reference/proof/status/review note, and any prediction/result records with explicit publication context. Keep user-owned data linked to the authenticated user ID.

## 2. Build the public experience

Use a custom public layout for marketing pages and a reusable dashboard layout for member and administrator areas. Establish a dark navy/black surface system with one high-contrast accent, readable body text, visible focus states, reduced-motion-safe transitions, and mobile-first breakpoints. Preserve escape routes from every subpage.

Keep public navigation and footer links in typed shared configuration. Store social and contact destinations in a dedicated module and render them through a reusable component. External links should use `target="_blank"` with `rel="noreferrer"`, clear accessible labels, and exact URLs. Phone contacts should use the provider’s official deep-link format only when supplied or verified, such as `https://wa.me/<international-number>`.

Make responsible-use context visible near membership, payment, prediction, performance, and contact surfaces. State that content is informational, outcomes are not guaranteed, past results do not predict future outcomes, and users should follow applicable laws, age requirements, and personal limits.

## 3. Implement authentication and access control

Use the project’s configured Supabase client and environment-managed public connection values. Provide email sign-in, sign-up, loading, confirmation, and error states. Protect account, checkout, paid-content, and administrator routes with an auth guard; do not weaken privacy controls to make visual verification easier.

Enforce role checks server-side for administrator operations. Apply RLS policies using `auth.uid() = user_id` for user-owned rows and explicit administrator checks for review or management actions. Keep private payment proofs in S3-backed storage and store only safe metadata and private keys in the database. Generate signed URLs only after authorization checks.

Never ask users to send passwords, OTPs, private keys, or service-role credentials in chat. If a live authenticated check is blocked, document the limitation and request that the user sign in through the opened browser page, or validate every non-authenticated surface without creating a fake session.

## 4. Implement manual payment verification

Model payment channels as typed configuration. Keep recipient details inside the authenticated checkout flow. For each channel, show the recipient, channel-specific instructions, required transaction reference format, acknowledgement, and responsible-use notice. Do not store banking credentials.

Validate payment proof files by MIME type, size, and required presence before upload. Show a local thumbnail preview, remove/replace controls, upload progress, duplicate-submit protection, success confirmation, and a clear pending state. On the server, upload bytes to S3 storage, save the private storage key against the payment record, and expose proof previews only to the submitter or an administrator.

Allow administrators to approve, reject, or request more information. Activate time-limited membership access only after the secure approval action succeeds. Reflect payment status, administrator notes, proof presence, and membership dates in the user dashboard.

## 5. Validate in layers

Create focused Vitest tests for shared configuration, navigation helpers, payment validation, proof-selection state, status labels, membership access, and any new brand or contact configuration. Run the full test suite and TypeScript check after implementation.

Capture public desktop and mobile previews. Check that headings, cards, buttons, contact links, disclaimers, and navigation remain readable and reachable at narrow widths. For user-supplied external URLs, passively open each destination with an informational browser visit and do not post, message, pay, or modify external accounts. Record verification outcomes in `verification-notes.md`.

For authenticated flows, verify with a real user session only. A protected entry-state screenshot is valid evidence for route privacy, but it is not evidence that member-only controls rendered. Keep any rate-limit or missing-session limitation explicit in the notes and task list.

## 6. Synchronize release state

After tests and previews pass, review `todo.md` and mark only genuinely completed items as `[x]`; retain blocked items as history. Commit the project changes and push the private GitHub repository using the project’s configured remote. Record the product release in the connected Supabase `project_release_registry` with the release label, Git commit, repository URL, and concise summary, using a limited verification query afterward.

Save a WebDev checkpoint after the code, documentation, and synchronization are stable. Auto-publish settings may make checkpoint creation immediately live, so describe that state accurately. Offer the resulting `manus-webdev://<version_id>` attachment to the user. Deliver this skill by attaching its `SKILL.md` path so Manus can package the skill directory.

## 7. Brand changes

Treat a requested rename as a cross-surface change. Search the project for the old brand string, update page titles, visible logos, navigation labels, footer marks, accessible labels, metadata, and any release documentation that should reflect the new name. Preserve payment recipient identities and legal or responsible-use wording unless the user explicitly changes them. Run tests and responsive previews again, then synchronize the rename like any other release.

For this project, use **SINGAPORE POOLS 4D6D** as the single public, owner-facing, administrator-facing, accessibility, and metadata brand name. Preserve a different legal beneficiary name only when it is explicitly supplied as required payment data.

## Release checklist

- [ ] Requirements, exact external URLs, payment data, and responsible-use constraints recorded in `todo.md`.
- [ ] Public, member, and administrator route boundaries preserved.
- [ ] Supabase Auth and user-specific RLS verified.
- [ ] Payment proof remains private and uses S3-backed storage.
- [ ] No fabricated reviews, ratings, testimonials, results, or financial claims added.
- [ ] Focused tests, full tests, and TypeScript checks pass.
- [ ] Desktop/mobile previews and supplied external destinations verified.
- [ ] GitHub push and Supabase release metadata verified.
- [ ] Checkpoint saved and skill package validated before delivery.
