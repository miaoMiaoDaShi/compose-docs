# Reading Navigation Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve long-form reading navigation by making section jumps, hash deep-linking, current-section highlighting, reading progress, and return-to-top interactions feel deliberate and reliable.

**Architecture:** Keep heading id generation in the Markdown layer, but extract scroll state, active heading detection, hash synchronization, and progress calculation into a dedicated reading-navigation composable. The document view will consume that composable and render a stronger TOC, progress bar, heading link controls, and a floating return-to-top action without changing the docs content model.

**Tech Stack:** Vue 3, Vue Router 4, Marked, browser IntersectionObserver, History API, Vite 5

---

### Task 1: Extend the Markdown layer to support stable heading anchors and heading link UI

**Files:**
- Modify: `src/lib/markdown.js`
- Test via: `npm run build`

- [ ] **Step 1: Verify the current build is green before changes**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 2: Update the Markdown renderer so headings include anchor affordances**

Implement heading rendering so each `h2`/`h3` keeps its stable `id` and includes a visible anchor target wrapper, for example:

```js
renderer.heading = (text, level, raw) => {
  const id = slug(raw)
  const safeText = raw

  if (level === 2 || level === 3) {
    headings.push({ id, text: safeText, level })
  }

  return `
    <h${level} id="${id}" class="doc-heading">
      <a class="doc-heading-anchor" href="#${id}" aria-label="复制并跳转到 ${safeText}">#</a>
      <span>${text}</span>
    </h${level}>
  `
}
```

- [ ] **Step 3: Keep the extracted TOC data aligned with the rendered ids**

Make sure the same slugger instance shape is used for both rendered HTML and returned `headings`, so a TOC item and its heading anchor cannot diverge.

- [ ] **Step 4: Run build to verify Markdown rendering still compiles**

Run: `npm run build`
Expected: PASS.

### Task 2: Extract reading navigation state into a composable

**Files:**
- Create: `src/composables/useReadingNavigation.js`
- Modify: `src/views/DocView.vue`
- Test via: `npm run build`

- [ ] **Step 1: Create a composable for article scroll state**

Create a composable that accepts refs for the article element, heading list, and route slug, then exposes:

```js
{
  activeHeadingId,
  readingProgress,
  showBackToTop,
  jumpToHeading,
  scrollToTop,
  syncFromHash,
}
```

- [ ] **Step 2: Move heading observation out of `DocView.vue`**

Port the current `IntersectionObserver` logic from `DocView.vue` into the composable, and extend it to compute:
- active heading id
- reading progress percent based on article scroll depth
- whether the back-to-top button should be visible

- [ ] **Step 3: Add hash-aware deep-link syncing**

In the composable, support two flows:
- on first ready render, if `window.location.hash` exists, scroll to that heading with the correct offset
- when a TOC item is clicked, update the URL hash via `history.replaceState` or router-compatible hash update without causing a full route navigation

- [ ] **Step 4: Run build to verify the composable integration compiles**

Run: `npm run build`
Expected: PASS.

### Task 3: Upgrade the document view interactions

**Files:**
- Modify: `src/views/DocView.vue`
- Modify: `src/assets/main.css`
- Test via: `npm run build`

- [ ] **Step 1: Add a reading progress bar near the top of the document view**

Render a thin progress indicator tied to the composable’s `readingProgress`, for example directly under the sticky top bar or reader header.

- [ ] **Step 2: Make TOC clicks use controlled scrolling instead of raw anchor jumps**

Replace the plain `href="#id"` TOC click behavior with a handler that:
- prevents the raw jump
- scrolls smoothly to the target heading
- applies a sticky-header offset
- updates the URL hash

- [ ] **Step 3: Add a floating back-to-top button**

Render a compact floating action button when the reader is meaningfully below the article start. Clicking it should smoothly scroll back to the top of the article.

- [ ] **Step 4: Add heading-link affordance styling**

Style the heading anchor so it appears on hover/focus for desktop, remains usable on touch, and does not dominate the text.

- [ ] **Step 5: Run build to verify the upgraded reader UI compiles**

Run: `npm run build`
Expected: PASS.

### Task 4: Stabilize deep-linking behavior and polish edge cases

**Files:**
- Modify: `src/views/DocView.vue`
- Modify: `src/composables/useReadingNavigation.js`
- Modify: `src/assets/main.css`
- Test via: `npm run build`

- [ ] **Step 1: Handle repeated heading clicks and missing hashes safely**

Ensure clicking the currently active TOC entry still aligns the section cleanly, and that invalid hashes fail silently without breaking the page.

- [ ] **Step 2: Keep active heading state stable during rapid scroll**

Tune the observer thresholds/root margins so active-section highlighting does not flicker when headings are close together.

- [ ] **Step 3: Keep the back-to-top control unobtrusive on mobile**

Use responsive positioning and size rules so the floating control does not cover pagination buttons or document text on smaller screens.

- [ ] **Step 4: Run build for final feature verification**

Run: `npm run build`
Expected: PASS.

### Task 5: Final review and cleanup

**Files:**
- Review: `src/views/DocView.vue`
- Review: `src/lib/markdown.js`
- Review: `src/composables/useReadingNavigation.js`
- Review: `src/assets/main.css`

- [ ] **Step 1: Verify the reading-navigation logic now lives outside the view**

Run: `rg -n "IntersectionObserver|scrollTo\(|replaceState|location.hash" src/views/DocView.vue src/composables/useReadingNavigation.js`
Expected: most scroll/observer logic lives in the composable, not inline in the view.

- [ ] **Step 2: Verify the feature set is present**

Run: `rg -n "doc-heading-anchor|back-to-top|readingProgress|jumpToHeading" src`
Expected: hits across the Markdown utility, composable, view, and styles.

- [ ] **Step 3: Run final build verification**

Run: `npm run build`
Expected: PASS.
