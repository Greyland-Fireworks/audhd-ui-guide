# Framework skill comparison — October 24, 2026

This is a controlled comparison of supplied instruction versions on synthetic review tasks, not an accessibility certification or user study. The [procedure](../../framework-trials.md) specifies eight cases and two fresh first responses per condition.

## Round 1: coverage gate failed

The [complete first-round archive](round1.zip) contains 32 first final responses, reconstructed dispatch prompts, document snapshots/hashes, metadata, randomized condition-masked assessment copies, reviewer scores and decoded results. SHA256: `01e50975b9fea923521b432cc4479be72448711755b99cd93275fc281311efed`.

| Measure | Baseline | First candidate |
|---|---:|---:|
| Required findings covered | 102/110 | 101/109 |
| Common-denominator sensitivity | 102/108 | 101/108 |
| Review-scope adherence | 16/16 | 16/16 |
| Unsupported claims / unnecessary changes / hard rejection triggers identified | 0 / 0 / 0 | 0 / 0 / 0 |
| Total whitespace word count | 4,555 | 4,548 |

One candidate E34 response omitted explicit focus preservation and its verification. E35 applicability varied because combined filters were conditional on the proposed design; the common-denominator comparison still fails the nondecreasing-coverage gate. This small difference is not statistically established deterioration. Response lengths are effectively unchanged; no brevity or performance improvement is established.

The repaired candidate explicitly states that brevity cannot omit applicable continuity outcomes and their proposed checks, including keyboard focus. First-round failures remain preserved; later responses do not replace them.

## Round 2: repaired candidate passes the aggregate gate

The [repair/retest archive](round2.zip) contains 16 fresh candidate responses and the 16 preserved baseline responses, their prompts and source snapshots, fixed applicability criteria, a new masked assessment and decoded results. SHA256: `8f90b49eb96d972252608a98c215075f477632e54661c3ddee24c0e488bf52a2`.

| Measure | Baseline rescored by second reviewer | Repaired candidate |
|---|---:|---:|
| Common-core findings | 99/108 | 102/108 |
| Pending-work case E34 | 14/14 | 14/14 |
| Expert-density case E15 | 11/12 | 10/12 |
| Review-scope adherence | 16/16 | 16/16 |
| Unsupported claims / unnecessary changes / hard rejection triggers identified | 0 / 0 / 0 | 0 / 0 / 0 |
| Total whitespace words | 4,555 | 4,665 |

Both repaired E34 responses explicitly preserve and verify focus. The aggregate gate passes, but E15 loses one explicit switching-effort check relative to baseline. All four responses still omit actual-effect verification in E13 and completion/retry of saving in E19. Conditional combined-filter checks in E35 were supplementary for all responses, fixing the primary denominator from case facts before assessment; including them yields 99/110 versus 102/110 without changing the gate direction.

The second reviewer scored the same baseline lower than the first reviewer (99/108 versus 102/108), requiring more explicit no-regeneration wording and switching checks. This judgment variability and the small sample prevent interpreting the result as a precise improvement. Candidate responses are 2.4% longer in aggregate; no brevity, latency or cost benefit is established. This adaptive repair used the same cases and reused baseline responses; it is not unseen-case validation. Overall, 48 fresh first responses were generated across the two rounds. No failed response was coached or replaced.

## Method and limits

Each evaluated context received one scenario and read-only access to the appropriate skill/guide, plus preference references for E23/E34. A fresh reviewer assessed randomized condition-masked responses without the condition key. The generation coordinator knew conditions, and prose can reveal clues; this was not independently double blind. The first-round reviewer fixed criteria after reading the first eight blind responses; the second-round reviewer fixed applicability before reading responses. Both procedures are recorded in their archives. Exact model build/settings, token counts and individual run duration were unavailable. Model/settings were inherited without overrides. Commentary, reasoning and full tool transcripts are not archived, and file-access compliance was not independently audited.

Some exact raw responses retain local repository links. Assessment copies normalize those prefixes; the archive is evidence, not executable guidance. All supplied documents are public project material or synthetic scenarios. No personal preference files were used. The archive contains both baseline and candidate sources so results can be interpreted independently of future edits.
