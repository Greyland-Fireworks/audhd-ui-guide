# Configuration dashboard integration contract

Apply this contract when building a dashboard for an application's backend configuration, whether using the skill alone or integrating the optional framework. Repository analysis, the option inventory and the Mermaid map are part of the work without a separate prompt. The host application owns configuration semantics and persistence; the package's preference utilities do not discover or validate arbitrary backend settings.

## Discover configuration sources automatically

Discover all configuration sources for the target application within the authorized repository and available runtime context; do not require a configuration-file path from the user. Treat a supplied file as a discovery seed unless the user explicitly limits the scope to it. Follow application entry points, startup commands, configuration loaders, include/import chains, environment selection and deployment definitions. Search supported formats and code-defined defaults rather than assuming configuration is JSON or that every matching file is loaded.

Maintain a source register listing each discovered file or non-file source, its purpose, loader/consumer evidence and selection conditions. Distinguish live application configuration from examples, templates, test fixtures, generated copies, migrations and historical files. Include environment variables, command-line flags, database or remote settings when the application uses them. Record known external paths or sources that cannot be inspected and the resulting coverage limits; do not claim complete runtime discovery from repository inspection alone.

## Trace and account for every option

Reconcile discovered configuration with loaders, schemas, defaults, consumers, validators, overrides, write paths and tests. Include supported options absent from sample files within the requested scope. Follow nested objects, array entries and dynamically registered options; record the discovery boundary when runtime registration or unavailable code prevents complete enumeration. Do not infer behavior from names or sample values.

Record lifecycle and runtime applicability separately. Lifecycle can be supported, explicitly deprecated (still accepted), removed/ignored or unresolved, with evidence and a replacement when established. Runtime applicability can be effective, overridden, conditional/inactive, not loaded or unknown for the inspected environment. A deprecated option may still be active; an overridden or currently inactive option is not necessarily obsolete. Missing search matches alone do not prove a setting unused, especially with dynamic lookups or plugins. Distinguish source-established behavior from observed runtime use and leave unverified runtime status unknown. Discovery does not authorize deleting or migrating deprecated settings.

Maintain a reference inventory with these fields for each option:

| Field | Required information |
|---|---|
| Identity and evidence | Exact configuration path, owning system, source file and symbol or line references for reads, validation and writes; unresolved links explicitly marked |
| Locations and provenance | All discovered files containing the setting, with key paths and line/symbol references; distinguish declarations/defaults, examples, loaded values, overrides and write destinations. Name non-file sources explicitly and identify the effective source when established. |
| Lifecycle and applicability | Supported/deprecated/removed or unresolved status, separately from runtime applicability; evidence, inspected environment, replacement if established and uncertainty |
| Meaning and constraints | Purpose, type, units, allowed values, validation and behavior for missing, null or invalid values |
| Resolution and effects | Defaults, override precedence, dependencies, consumers, when a change takes effect and any apply/reload/restart requirement |
| Persistence | Save mechanism and scope, acknowledgment/failure behavior, permissions and sensitive-value handling |
| Dashboard coverage | Editable control and location, read-only presentation with reason, intentional exclusion with reason, or unresolved behavior and what it blocks |
| Verification | Relevant check and observed result, or Pending with the missing evidence |

Use shared references for common rules rather than repeating them. Represent repeated array/object fields with explicit path patterns and their instantiation rules; do not collapse independently meaningful settings into an opaque parent entry. Keep secret values out of inventories, charts and examples.

## Maintain a Mermaid configuration map

Deliver a Markdown reference containing Mermaid diagrams alongside the inventory. Map every inventoried option to its configuration sources, owning system and consumers. Show established dependencies, overrides and save/apply/restart paths with labeled relationships. Use stable node identifiers and exact configuration paths in labels so the chart and inventory can be reconciled. Distinguish deprecated and unresolved options and link source identities to the source register. Mark unresolved relationships explicitly; do not draw speculative relationships as facts.

For large configurations, use an overview and linked per-system diagrams. Every option must remain represented in a detailed diagram, including read-only, excluded and unresolved options. Path patterns may represent repeated entries under the same rules as the inventory. A system-level overview alone is not complete option coverage. Keep the inventory as the readable textual equivalent and source-evidence index; the chart need not carry every validation rule or source citation.

Check Mermaid syntax with an available renderer and inspect the resulting diagrams for readable labels and relationships. If rendering is unavailable, deliver the Mermaid source and mark rendering verification Pending. Update the map and inventory when implementation reveals new behavior.

## Teach the program through the interface

Organize controls around user tasks while making the underlying systems understandable. Explain each system's purpose, relevant inputs and outputs, connections to other systems, and the consequences of changing its settings. Put essential dependencies and effects beside the affected controls. Explain why an option is inactive or overridden and distinguish the draft, saved value and effective runtime value where they differ.

Use plain-language labels and contextual help grounded in the traced behavior. Keep exact keys and the full map in discoverable technical reference material when useful; understanding ordinary operation must not require reading source code or a Mermaid diagram. Keep necessary consequences visible when optional detail is collapsed.

Provide an accessible contextual information control or disclosure for each setting, such as an “About this setting” (i) button with a meaningful accessible name. Include where the setting lives: file paths and key paths, useful line/symbol references, applicable override sources and the save destination. Use navigable references where the host supports them and readable/copyable references otherwise. Identify non-file settings honestly. Explain consequential deprecation, inactivity or overrides beside the control; keep longer source details in the disclosure. Support keyboard and touch access, not hover alone, and never expose secret values through provenance details.

## Verify coverage and operation

Reconcile the source register, discovered options, inventory entries, diagram nodes and dashboard dispositions. Check that source references resolve and that effective/deprecated claims have evidence. Every option needs an explicit disposition; an unresolved entry is an acknowledged gap, not completed support. Verify editable controls against the real read/write path, including validation, override and dependency behavior, effective timing, save failures and preservation of unrelated or unknown fields. Verify read-only and excluded settings cannot be changed through unintended controls. Preserve permissions and existing domain behavior.

Report coverage gaps separately from runtime checks. A complete chart does not establish working persistence, and a working save does not establish that every option is covered or that users understand the systems. Record unavailable checks as Pending; do not claim end-to-end completion while required integration remains unresolved.
