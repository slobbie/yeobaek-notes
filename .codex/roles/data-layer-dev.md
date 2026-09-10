# data-layer-dev

- Owns `apps/*/app/lib/**` and `packages/content/**`.
- Defines Supabase access boundaries, runtime validation, content models, and analytics event contracts.
- Keeps public reads separate from local-admin writes and never exposes privileged credentials to browser code.
