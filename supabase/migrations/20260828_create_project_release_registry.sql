-- Stores deployment metadata for source versions that have been synchronized to the connected Supabase workspace.
CREATE TABLE IF NOT EXISTS public.project_release_registry (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  release_label text NOT NULL,
  git_commit text NOT NULL,
  github_repository text NOT NULL,
  summary text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.project_release_registry ENABLE ROW LEVEL SECURITY;
