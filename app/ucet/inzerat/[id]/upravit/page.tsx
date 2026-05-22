import EditAd from "@/components/dashboard/edit-ad";

export default async function UpravitInzeratPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditAd jobId={id} />;
}
