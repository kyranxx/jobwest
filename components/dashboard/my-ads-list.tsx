"use client";

import { useRouter } from "next/navigation";
import { memo, useCallback, useReducer } from "react";
import DeleteAdDialog from "./delete-ad-dialog";
import { getSupabaseBrowserClient } from "@/lib/utils/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { HighlightActions } from "@/components/payments/highlight-actions";
import { Pencil, Trash2, Sparkles, Clock } from "lucide-react";
import { siteConfig } from "@/lib/site";
import type { JobSummary } from "@/lib/types";

type MyAdsListProps = {
  jobs: JobSummary[];
  onInvalidateJobs: () => void;
};

const dateFormatter = new Intl.DateTimeFormat("sk-SK");

type MyAdsState = {
  error: string | null;
  isDeleteDialogOpen: boolean;
  selectedJob: JobSummary | null;
  isDeleting: boolean;
};

type MyAdsAction =
  | { type: "clear-error" }
  | { type: "set-error"; error: string }
  | { type: "open-delete-dialog"; job: JobSummary }
  | { type: "close-delete-dialog" }
  | { type: "start-delete" }
  | { type: "finish-delete" };

const initialState: MyAdsState = {
  error: null,
  isDeleteDialogOpen: false,
  selectedJob: null,
  isDeleting: false,
};

function reducer(state: MyAdsState, action: MyAdsAction): MyAdsState {
  switch (action.type) {
    case "clear-error":
      return { ...state, error: null };
    case "set-error":
      return { ...state, error: action.error };
    case "open-delete-dialog":
      return {
        ...state,
        selectedJob: action.job,
        isDeleteDialogOpen: true,
        error: null,
      };
    case "close-delete-dialog":
      return { ...state, selectedJob: null, isDeleteDialogOpen: false, error: null };
    case "start-delete":
      return { ...state, isDeleting: true, error: null };
    case "finish-delete":
      return { ...state, isDeleting: false };
  }
}

function MyAdsList({ jobs, onInvalidateJobs }: MyAdsListProps) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { push } = useRouter();

  const handleEditClick = useCallback((jobId: string) => {
    push(`/ucet/inzerat/${jobId}/upravit`);
  }, [push]);

  const handleDeleteClick = useCallback((job: JobSummary) => {
    dispatch({ type: "open-delete-dialog", job });
  }, []);

  const handleDelete = useCallback(async () => {
    const { selectedJob, isDeleting } = state;
    if (!selectedJob || isDeleting) return;
    if (!user) {
      dispatch({ type: "set-error", error: "Na zmazanie inzerátu sa musíte prihlásiť." });
      return;
    }

    dispatch({ type: "start-delete" });
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: deletedJob, error: deleteError } = await supabase
        .from("jobs")
        .delete()
        .eq("id", Number(selectedJob.id))
        .eq("user_id", user.id)
        .eq("portal_code", siteConfig.portalCode)
        .select("id")
        .maybeSingle();
      if (deleteError || !deletedJob) {
        dispatch({ type: "set-error", error: deleteError?.message ?? "Inzerát sa nenašiel alebo nemáte oprávnenie." });
      } else {
        onInvalidateJobs();
        dispatch({ type: "close-delete-dialog" });
      }
    } catch (err) {
      console.error("Delete failed:", err);
      dispatch({ type: "set-error", error: "Nepodarilo sa zmazať inzerát." });
    } finally {
      dispatch({ type: "finish-delete" });
    }
  }, [state, onInvalidateJobs, user]);

  const handleCloseDialog = useCallback(() => {
    if (!state.isDeleting) {
      dispatch({ type: "close-delete-dialog" });
    }
  }, [state.isDeleting]);

  if (state.error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Chyba: {state.error}</div>;
  }

  return (
    <div>
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
          <div className="size-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm">
            <Sparkles className="size-6 text-slate-300" />
          </div>
          <p className="text-slate-600 text-sm">Zatiaľ ste nepridali žiadne inzeráty.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white p-4 first:rounded-t-lg last:rounded-b-lg">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-slate-950">{job.title}</h2>
                  <p className="text-sm text-slate-500">{job.location}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDate(job.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors" onClick={() => handleEditClick(String(job.id))}>
                    <Pencil className="size-3" /> Upraviť
                  </button>
                  <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 transition-colors" onClick={() => handleDeleteClick(job)}>
                    <Trash2 className="size-3" /> Zmazať
                  </button>
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <p className="mb-2 text-sm font-medium text-slate-700">Zvýraznenie</p>
                <HighlightActions jobId={job.id} compact />
              </div>
            </div>
          ))}
        </div>
      )}
      {state.selectedJob && (
        <DeleteAdDialog
          isOpen={state.isDeleteDialogOpen}
          onClose={handleCloseDialog}
          onConfirm={handleDelete}
          userEmail={user?.email || ""}
          isDeleting={state.isDeleting}
        />
      )}
    </div>
  );
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export default memo(MyAdsList);
