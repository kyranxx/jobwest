"use client";

import { useRouter } from 'next/navigation';
import { useState, useCallback, memo, useEffect } from 'react';
import DeleteAdDialog from './delete-ad-dialog';
import { getSupabaseBrowserClient } from '@/lib/utils/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { HighlightActions } from '@/components/payments/highlight-actions';
import { Pencil, Trash2, Sparkles, Clock } from "lucide-react";
import type { JobSummary } from "@/lib/types";

type MyAdsListProps = {
  jobs: JobSummary[];
  onInvalidateJobs: () => void;
};

function MyAdsList({ jobs, onInvalidateJobs }: MyAdsListProps) {
  const { user } = useAuth();
  const [visibleJobs, setVisibleJobs] = useState(jobs);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => { setVisibleJobs(jobs); }, [jobs]);

  const handleEditClick = useCallback((jobId: string) => {
    router.push(`/ucet/inzerat/${jobId}/upravit`);
  }, [router]);

  const handleDeleteClick = useCallback((job: JobSummary) => {
    setSelectedJob(job); setIsDeleteDialogOpen(true); setError(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!selectedJob || isDeleting) return;
    setIsDeleting(true); setError(null);
    try {
      if (String(selectedJob.id).startsWith("demo-")) {
        setVisibleJobs((currentJobs) => currentJobs.filter((job) => job.id !== selectedJob.id));
        setIsDeleteDialogOpen(false); setSelectedJob(null); return;
      }
      const supabase = getSupabaseBrowserClient();
      const { error: deleteError } = await supabase.from('jobs').delete().eq('id', Number(selectedJob.id));
      if (deleteError) { setError(deleteError.message); }
      else { onInvalidateJobs(); setIsDeleteDialogOpen(false); setSelectedJob(null); }
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Nepodarilo sa zmazať inzerát.');
    } finally { setIsDeleting(false); }
  }, [selectedJob, isDeleting, onInvalidateJobs]);

  const handleCloseDialog = useCallback(() => {
    if (!isDeleting) { setIsDeleteDialogOpen(false); setSelectedJob(null); setError(null); }
  }, [isDeleting]);

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Chyba: {error}</div>;
  }

  return (
    <div>
      {visibleJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Sparkles className="h-6 w-6 text-muted-foreground/30" />
          </div>
          <p className="text-muted-foreground text-sm">Zatiaľ ste nepridali žiadne inzeráty.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleJobs.map((job) => (
            <div key={job.id} className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold">{job.title}</h2>
                  <p className="text-sm text-muted-foreground">{job.location}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(job.created_at).toLocaleDateString('sk-SK')}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors" onClick={() => handleEditClick(String(job.id))}>
                    <Pencil className="h-3 w-3" /> Upraviť
                  </button>
                  <button className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 transition-colors" onClick={() => handleDeleteClick(job)}>
                    <Trash2 className="h-3 w-3" /> Zmazať
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="mb-2 text-sm font-medium">Zvýrazniť inzerát</p>
                <HighlightActions jobId={job.id} compact />
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedJob && (
        <DeleteAdDialog isOpen={isDeleteDialogOpen} onClose={handleCloseDialog} onConfirm={handleDelete} userEmail={user?.email || ''} isDeleting={isDeleting} />
      )}
    </div>
  );
}

export default memo(MyAdsList);
