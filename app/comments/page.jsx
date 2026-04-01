"use client";
import dynamic from "next/dynamic";
import PageShell from "../../components/PageShell";

const CommentsTable = dynamic(() => import("../../components/CommentsTable"), {
  ssr: false,
  loading: () => <div style={{padding:"2rem",textAlign:"center",color:"#6B6560"}}>Loading comments...</div>
});

export default function CommentsPage() {
  return (
    <PageShell activeTab="comments">
      {({ activePlatform, weekFilter }) => (
        <CommentsTable platform={activePlatform} weekFilter={weekFilter} />
      )}
    </PageShell>
  );
}
