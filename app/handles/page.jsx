"use client";
import dynamic from "next/dynamic";
import PageShell from "../../components/PageShell";

const HandlesTable = dynamic(() => import("../../components/HandlesTable"), {
  ssr: false,
  loading: () => null
});

export default function HandlesPage() {
  return (
    <PageShell activeTab="handles">
      {({ activePlatform, refreshKey }) => (
        <HandlesTable platform={activePlatform} refreshKey={refreshKey} />
      )}
    </PageShell>
  );
}
