# 21st.dev source record for the email updates forms

Recorded 2026-10-11. The session used the 21st MCP connection that was already installed. No sign-in, purchase, OAuth grant or subscription change was made, and no installer was run.

## What was searched

`mcp__21st__search` with the query "newsletter email signup form", type `component`, limit 12. It returned 12 results. The candidates that fit an editorial site were:

| id | Name | Author | Why it was or was not used |
| --- | --- | --- | --- |
| 35256 | Newsletter | kevingirelli | Selected. An inline band with the title on one side and the form on the other, and pending, success and error states announced through status regions. |
| 21496 | Newsletter Signup | olewandowski1 | Not retrieved. Centered section with a marketing-consent checkbox; the consent idea is common practice and was written from scratch here. |
| 33900 | Newsletter Signup Card | balick | Not retrieved. A card that swaps to a confirmation message. |
| 26897 | Email Signup Form | ln-dev7 | Not retrieved. A pill-shaped single field, which does not match the site's squared controls. |

## What was retrieved

One component, through `mcp__21st__get_component` with id 35256. The call succeeded and returned source code; the response's quota block read `tier: "paid"` with no remaining-count limit. It was not locked, paywalled or missing.

- Name: Newsletter (demo "Default")
- Author: kevingirelli
- Page: https://21st.dev/@kevingirelli/components/newsletter
- Demo id: 35256. Component id: 19742.
- Install command: `npx shadcn@latest add "https://21st.dev/r/kevingirelli/newsletter?api_key=[REDACTED]"`. The registry URL carries an API key parameter, so it is redacted here. The command was not run.
- Dependencies it declares: React, `@radix-ui/react-slot`, `class-variance-authority`, and the shadcn `button` and `input` registry files. None was added to this repository.

## License

The `get_component` response has no license field, and the search metadata has none either. [NEED: the license of kevingirelli/newsletter, from its 21st.dev page or the author's registry.] Until that is known the license is treated as unclear, so no code was copied. The component served as a structural reference and the implementation in this repository is original vanilla HTML, CSS and JavaScript.

## What was taken as structure, and what was not

Taken as ideas, rewritten from scratch:

- The two-part band: heading and description on one side, the form on the other, stacked on narrow screens (`updatesFooter` and `.upd-foot`).
- A native `type="email"` field with `autocomplete="email"`, so the browser can help before any script runs.
- A status region that stays mounted and empty until there is something to announce.
- A `data-status`-style state attribute on the form (`data-upd-state` here), and a button that is disabled while the request runs.
- Small print under the form (here, the consent label).

Deliberately different from the retrieved component:

- Its success text is "You're subscribed. Check your inbox to confirm." This site never says "subscribed" before the confirmation click. The pending text is "Check your inbox to confirm."
- Its email label is visually hidden. Here the label "Email" is visible.
- Its default copy promises "once a month" and "tips and release notes". No cadence or benefit is stated here.
- It has no consent checkbox, honeypot, request id, field-level errors or double opt-in. All of those are original to this implementation.
- No Tailwind classes, React hooks, `cn` helper or shadcn tokens were carried over. Colors, type and spacing come from the site's own tokens.

No line of the retrieved source appears in `lib/updates.mjs`, `assets/css/updates.css` or `assets/js/updates.js`.
