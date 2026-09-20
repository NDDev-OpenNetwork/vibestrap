import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Pin, PinOff, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  backendClient,
  createNoteMutation,
  deleteNoteMutation,
  invalidateResource,
  listNotesOptions,
  updateNoteMutation,
} from "#/shared/api";
import { m } from "#/shared/lib/i18n/messages";
import { useLocale } from "#/shared/lib/locales";
import { Badge } from "#/shared/ui/shadcn/badge";
import { Button } from "#/shared/ui/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "#/shared/ui/shadcn/card";
import { Empty, EmptyDescription } from "#/shared/ui/shadcn/empty";
import { Field, FieldError, FieldLabel } from "#/shared/ui/shadcn/field";
import { Input } from "#/shared/ui/shadcn/input";
import { Textarea } from "#/shared/ui/shadcn/textarea";
import { toast } from "#/shared/ui/shadcn/toast";

const noteSchema = z.object({
  title: z.string().trim().min(1, "notes_title_required").max(200),
  body: z.string().trim().max(10_000),
});
type NoteValues = z.infer<typeof noteSchema>;

/** Query options for one filter; the route loader prefetches the default view. */
export const notesQuery = (pinned: boolean | null) =>
  listNotesOptions({
    client: backendClient,
    query: pinned === null ? {} : { pinned },
  });

export const NotesPage = () => {
  const locale = useLocale();
  const [pinned, setPinned] = useState<boolean | null>(null);
  // `useSuspenseQuery` suspends when the key changes; a transition keeps the current
  // list on screen instead of dropping the whole route into its pending state.
  const [isSwitching, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const notes = useSuspenseQuery(notesQuery(pinned));

  const showFilter = (value: boolean | null) => {
    startTransition(() => {
      setPinned(value);
    });
  };

  const refresh = () => invalidateResource(queryClient, "notes");

  const form = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: "", body: "" },
  });

  const create = useMutation({
    ...createNoteMutation({ client: backendClient }),
    onSuccess: async () => {
      form.reset();
      toast.add({ type: "success", title: m.notes_created({}, { locale }) });
      await refresh();
    },
  });
  const update = useMutation({
    ...updateNoteMutation({ client: backendClient }),
    onSuccess: refresh,
  });
  const remove = useMutation({
    ...deleteNoteMutation({ client: backendClient }),
    onSuccess: async () => {
      toast.add({ type: "success", title: m.notes_deleted({}, { locale }) });
      await refresh();
    },
  });

  const submit = form.handleSubmit(async (values) => {
    await create.mutateAsync({
      body: { title: values.title, body: values.body || null },
    });
  });

  return (
    <div className="mx-auto grid w-full max-w-2xl min-w-0 grid-cols-1 gap-6">
      <h1 className="text-xl font-semibold tracking-tight">
        {m.notes_page({}, { locale })}
      </h1>

      <Card>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              void submit(event);
            }}
          >
            <Field data-invalid={Boolean(form.formState.errors.title)}>
              <FieldLabel htmlFor="note-title">
                {m.notes_title_label({}, { locale })}
              </FieldLabel>
              <Input
                id="note-title"
                maxLength={200}
                aria-describedby={
                  form.formState.errors.title ? "note-title-error" : undefined
                }
                aria-invalid={Boolean(form.formState.errors.title)}
                {...form.register("title")}
              />
              <FieldError
                id="note-title-error"
                errors={[
                  form.formState.errors.title && {
                    message:
                      form.formState.errors.title.message ===
                      "notes_title_required"
                        ? m.notes_title_required({}, { locale })
                        : form.formState.errors.title.message,
                  },
                ]}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="note-body">
                {m.notes_body_label({}, { locale })}
              </FieldLabel>
              <Textarea
                id="note-body"
                rows={3}
                maxLength={10_000}
                {...form.register("body")}
              />
            </Field>
            <Button
              className="justify-self-start"
              type="submit"
              disabled={create.isPending}
            >
              {m.notes_create({}, { locale })}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div aria-busy={isSwitching} className="flex flex-wrap gap-1">
        <Button
          size="sm"
          variant={pinned === null ? "secondary" : "ghost"}
          onClick={() => {
            showFilter(null);
          }}
        >
          {m.notes_all({}, { locale })}
        </Button>
        <Button
          size="sm"
          variant={pinned === true ? "secondary" : "ghost"}
          onClick={() => {
            showFilter(true);
          }}
        >
          {m.notes_only_pinned({}, { locale })}
        </Button>
      </div>

      {notes.data.items.length === 0 ? (
        <Empty>
          <EmptyDescription>{m.notes_empty({}, { locale })}</EmptyDescription>
        </Empty>
      ) : (
        <ul
          className="grid gap-3 data-[busy=true]:opacity-60"
          data-busy={isSwitching}
        >
          {notes.data.items.map((note) => (
            <li key={note.id}>
              <Card>
                <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                  <CardTitle className="min-w-0 break-words">
                    {note.title}
                  </CardTitle>
                  <div className="flex max-w-full flex-wrap items-center gap-1">
                    {note.pinned && (
                      <Badge
                        variant="secondary"
                        className="h-auto whitespace-normal"
                      >
                        {m.notes_only_pinned({}, { locale })}
                      </Badge>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={
                        note.pinned
                          ? m.notes_unpin({}, { locale })
                          : m.notes_pin({}, { locale })
                      }
                      disabled={update.isPending}
                      onClick={() => {
                        update.mutate({
                          path: { note_id: note.id },
                          body: { pinned: !note.pinned },
                        });
                      }}
                    >
                      {note.pinned ? (
                        <PinOff aria-hidden="true" />
                      ) : (
                        <Pin aria-hidden="true" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={m.notes_delete({}, { locale })}
                      disabled={remove.isPending}
                      onClick={() => {
                        remove.mutate({ path: { note_id: note.id } });
                      }}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </CardHeader>
                {note.body && (
                  <CardContent className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {note.body}
                  </CardContent>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
