"use client";
import dynamic from "next/dynamic";
import PageShell from "../../components/PageShell";

const HandlesTable = dynamic(() => import("../../components/HandlesTable"), {
  ssr: false,
  loading: () => <div style={{padding:"2rem",textAlign:"center",color:"#6B6560"}}>Loading handles...</div>
});

export default function HandlesPage() {
  return (
    <PageShell activeTab="handles">
      {({ activePlatform }) => (
        <HandlesTable platform={activePlatform} />
      )}
    </PageShell>
  );
}
