"use client";
import dynamic from "next/dynamic";
import PageShell from "../../components/PageShell";

const InteractionsTable = dynamic(() => import("../../components/InteractionsTable"), {
  ssr: false,
  loading: () => <div style={{padding:"2rem",textAlign:"center",color:"#6B6560"}}>Loading interactions...</div>
});

export default function InteractionsPage() {
  return (
    <PageShell activeTab="interactions">
      {({ activePlatform, weekFilter }) => (
        <InteractionsTable platform={activePlatform} weekFilter={weekFilter} />
      )}
    </PageShell>
  );
}
