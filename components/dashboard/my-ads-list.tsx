"use client";

import { useRouter } from 'next/navigation';
import { useState, useCallback, memo } from 'react';
import DeleteAdDialog from './delete-ad-dialog';
import { getSupabaseBrowserClient } from '@/lib/utils/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useJobs } from '@/hooks/use-jobs';

type Job = {
  id: string;
  title: string;
  location: string;
  created_at: string;
};

type MyAdsListProps = {
  jobs: Job[];
};

function MyAdsList({ jobs }: MyAdsListProps) {
  const { user } = useAuth();
  const { invalidateCache } = useJobs();
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleEditClick = useCallback((jobId: string) => {
    router.push(`/ucet/inzerat/${jobId}/upravit`);
  }, [router]);

  const handleDeleteClick = useCallback((job: Job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
    setError(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!selectedJob || isDeleting) return;

    setIsDeleting(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', selectedJob.id);

      if (error) {
        setError(error.message);
      } else {
        // Invalidate cache to refresh the list
        invalidateCache();
        setIsDeleteDialogOpen(false);
        setSelectedJob(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Nepodarilo sa zmazať inzerát');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedJob, isDeleting, invalidateCache]);

  const handleCloseDialog = useCallback(() => {
    if (!isDeleting) {
      setIsDeleteDialogOpen(false);
      setSelectedJob(null);
      setError(null);
    }
  }, [isDeleting]);

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded-lg">
        Chyba: {error}
      </div>
    );
  }

  return (
    <div>
      {jobs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Zatiaľ ste nepridali žiadne inzeráty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-gray-600">{job.location}</p>
              <p className="text-sm text-gray-500">
                Vytvorené: {new Date(job.created_at).toLocaleDateString('sk-SK')}
              </p>
              <div className="mt-4 flex space-x-2">
                <button
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  onClick={() => handleEditClick(job.id)}
                >
                  Upraviť
                </button>
                <button
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  onClick={() => handleDeleteClick(job)}
                >
                  Zmazať
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedJob && (
        <DeleteAdDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleCloseDialog}
          onConfirm={handleDelete}
          userEmail={user?.email || ''}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

export default memo(MyAdsList);
