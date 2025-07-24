"use client";

import { type User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DeleteAdDialog from './delete-ad-dialog';
import { getSupabaseBrowserClient } from '@/lib/utils/supabase/client';

type Job = {
  id: string;
  title: string;
  location: string;
  created_at: string;
};

type MyAdsListProps = {
  jobs: Job[];
  user: User | null;
};

export default function MyAdsList({ jobs: initialJobs, user }: MyAdsListProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (selectedJob) {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', selectedJob.id);

      if (error) {
        setError(error.message);
      } else {
        setJobs(jobs.filter((job) => job.id !== selectedJob.id));
        setIsDeleteDialogOpen(false);
        setSelectedJob(null);
      }
    }
  };

  if (error) {
    return <p>Chyba: {error}</p>;
  }

  return (
    <div>
      {jobs.length === 0 ? (
        <p>Zatiaľ ste nepridali žiadne inzeráty.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 border rounded-lg">
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-gray-600">{job.location}</p>
              <p className="text-sm text-gray-500">
                Vytvorené: {new Date(job.created_at).toLocaleDateString()}
              </p>
              <div className="mt-4 flex space-x-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  onClick={() => router.push(`/ucet/inzerat/${job.id}/upravit`)}
                >
                  Upraviť
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                  onClick={() => {
                    setSelectedJob(job);
                    setIsDeleteDialogOpen(true);
                  }}
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
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          userEmail={user?.email || ''}
        />
      )}
    </div>
  );
}
