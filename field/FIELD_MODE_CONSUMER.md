# FIELD MODE Consumer v0.1

Status: Next-Lab integration slice

## Purpose

This browser-side consumer reads the read-only Campsite AI Headquarters FIELD MODE contract (`contract_version = 0.1.0`) without turning navigation, map rendering, candidate selection, or transport into Core AI execution.

## Input channels

The consumer accepts one payload from the first available source:

1. `window.__CAMPSITE_FIELD_MODE_PAYLOAD__`
2. `#fieldTransfer=<packet>` from the explicit Headquarters handoff
3. `?fieldPayloadUrl=<json>` fetched with `credentials: omit` for integration/QA
4. session storage key `campsite.field_mode_payload.v0.1`

A payload is rejected unless it preserves all contract safety gates:

- `source = CAMPSITE_AI_HEADQUARTERS`
- `mode = FIELD_MODE`
- `read_only = true`
- `automatic_execution = false`
- `automatic_category_fanout = false`
- decision owner is human
- FIELD MODE may not execute categories
- FIELD MODE may not expand targets

## Headquarters fragment transport

The production-facing v0.1 handoff uses a browser URL fragment, not an HTTP query parameter:

```text
#fieldTransfer=<base64url UTF-8 envelope>
```

The envelope must declare:

- `transport = CAMPSITE_FIELD_HANDOFF`
- `transport_version = 0.1.0`
- `binding.state = UNBOUND`
- `binding.decision_owner = human`

After the envelope and inner FIELD MODE payload both validate, the browser stores the payload in session storage and removes `fieldTransfer` from the address bar.

No R2 request is made by this transport.

## Site binding

Receiving a Headquarters payload does **not** mean that payload belongs to one of the three park candidates shown by the Phase 1 prototype.

Therefore the consumer has two states:

- `unbound`: payload is detected and summarized, but Core facts and GIS are not applied to candidate A/B/C.
- `bound`: the operator explicitly confirms the currently viewed candidate with `この候補をHQ案件として接続`.

That button sets the existing `fieldBind=1` browser seam only after the human confirmation. The Headquarters fragment itself never contains automatic binding.

## Bound rendering

When explicitly bound, the consumer may render only existing Headquarters output:

- site counts and minimum spacing
- Activity Area geometry
- Site Focal point
- Review Target points
- FACILITY / ROAD / CROWD state
- executed category facts, observed time, confidence, and field-check state

A category with `data_state != EXECUTED` is rendered as `NOT RUN`. The consumer never turns routing readiness into observed facts.

## Map layers

Bound payloads add independent overlay layers:

- `field-ai-activity-area-*`
- `field-ai-review-targets-*`
- `field-ai-site-focal-*`

The existing Phase 1 demo park boundary and demo POIs are left untouched and remain visibly identified as DEMO data.

## Phase 1 compatibility

`field/index.html` still loads `prototype.html`. The loader only exposes the MapLibre instance as `window.__FIELD_MAP__`, injects the consumer module, and routes park exploration through `explore-shell.html` so the same consumer can be installed on `explore.html` without rewriting the Phase 1 prototype.

When bound, the loader suppresses the Phase 1 delayed DEMO briefing reveal so it cannot overwrite Headquarters Core cards. `field-mode:briefing-open` asks the consumer to redraw the read-only Headquarters view instead.

## QA fixture

For contract/UI integration checks only:

`field/fixtures/field-mode-sample-v0.1.json`

Example query:

`field/?fieldPayloadUrl=./fixtures/field-mode-sample-v0.1.json&fieldBind=1`

This fixture is not production Campsite data.

## Safety invariants

- fragment handoff arrives `UNBOUND`;
- binding is a separate human action;
- binding does not execute Data AI;
- unexecuted Core categories remain `NOT RUN`;
- R2 is not used by v0.1 transport;
- payload transport never expands one site/target/category into multiple requests.
