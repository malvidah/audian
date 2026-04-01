"use client";
import dynamic from "next/dynamic";
import PageShell from "../../components/PageShell";

const InteractionsTable = dynamic(() => import("../../components/InteractionsTable"), {
  ssr: false,
  loading: () => <div style={{padding:"2rem",textAlign:"center",color:"#6B6560"}}>Loading comments...</div>
});

export default function CommentsPage() {
  return (
    <PageShell activeTab="comments">
      {({ activePlatform, weekFilter, refreshKey }) => (
        <InteractionsTable
          platform={activePlatform}
          weekFilter={weekFilter}
          refreshKey={refreshKey}
          commentsOnly
        />
      )}
    </PageShell>
  );
}
