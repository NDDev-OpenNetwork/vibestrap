import { createFileRoute } from "@tanstack/react-router";

import { NotesPage, notesQuery } from "#/pages/notes";

export const Route = createFileRoute("/_app/notes")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(notesQuery(null)),
  component: NotesPage,
});
