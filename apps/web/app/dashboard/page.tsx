"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

type Lead = {
  id: string;
  phoneNumber: string;
  projectType: string;
  timeline: string;
  preferredLanguage: string;
  meetingRequested: boolean;
  meetingConfirmed: boolean;
  callOutcome: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  callStatus: string | null;
  callSid: string | null;
  recordingUrl: string | null;
};

type Stats = {
  totalLeads: number;
  qualifiedLeads: number;
  meetingsRequested: number;
  completedCalls: number;
  failedCalls: number;
  activeCalls: number;
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    calling: "Calling",
    ringing: "Ringing",
    in_progress: "In progress",
    qualified: "Qualified",
    completed: "Completed",
    call_failed: "Failed",
    no_answer: "No answer",
  };

  return labels[status] ?? status;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    qualifiedLeads: 0,
    meetingsRequested: 0,
    completedCalls: 0,
    failedCalls: 0,
    activeCalls: 0,
  });
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      const [leadsResponse, statsResponse] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/leads`),
        fetch(`${API_URL}/api/dashboard/stats`),
      ]);

      if (!leadsResponse.ok || !statsResponse.ok) {
        throw new Error("Dashboard request failed");
      }

      const leadsData = await leadsResponse.json();
      const statsData = await statsResponse.json();

      setLeads(leadsData);
      setStats(statsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(loadDashboard, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      <header className="border-b border-black/[0.07] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#171717] text-sm font-semibold text-white">
              S
            </div>

            <div>
              <p className="text-sm font-semibold">Sunrise Interiors</p>
              <p className="text-xs text-[#888]">AI Lead Console</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-[#666]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Live
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999]">
            Voice intelligence
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            Lead pipeline
          </h1>

          <p className="mt-2 text-sm text-[#777]">
            Live qualification data captured from AI conversations.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
  {[
    ["Total leads", stats.totalLeads],
    ["Active calls", stats.activeCalls],
    ["Qualified", stats.qualifiedLeads],
    ["Meetings", stats.meetingsRequested],
    ["Completed", stats.completedCalls],
    ["Needs attention", stats.failedCalls],
  ].map(([label, value]) => (
    <div
      key={label}
      className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm"
    >
      <p className="text-xs text-[#888]">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
        {value}
      </p>
    </div>
  ))}
</div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-black/[0.07] bg-white shadow-sm">
          <div className="border-b border-black/[0.07] px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Recent enquiries</h2>
                <p className="mt-1 text-xs text-[#888]">
                  Automatically refreshed every few seconds.
                </p>
              </div>

              <span className="rounded-full bg-[#f2f2ef] px-3 py-1 text-xs font-medium text-[#666]">
                {leads.length} records
              </span>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-[#888]">
              Loading lead intelligence...
            </div>
          ) : leads.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-[#888]">
              No enquiries yet.
            </div>
          ) : (
            <div className="divide-y divide-black/[0.06]">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="grid gap-5 px-6 py-6 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto]"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1f1ee] text-sm font-semibold">
                        {lead.phoneNumber.slice(-2)}
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          {lead.phoneNumber}
                        </p>
                        <p className="mt-1 font-mono text-[10px] text-[#aaa]">
                          {lead.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-[#999]">
                      {formatDate(lead.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#aaa]">
                      Project
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {lead.projectType === "unknown"
                        ? "Not captured"
                        : lead.projectType}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#aaa]">
                      Timeline
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {lead.timeline === "unknown"
                        ? "Not captured"
                        : lead.timeline}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#aaa]">
                      Conversation
                    </p>

                    <p className="mt-2 text-sm">
                      {lead.preferredLanguage === "unknown"
                        ? "Language not captured"
                        : lead.preferredLanguage}
                    </p>

                    {lead.meetingRequested && (
                      <span className="mt-2 inline-flex rounded-full bg-[#171717] px-2.5 py-1 text-[10px] font-medium text-white">
                        Designer meeting requested
                      </span>
                    )}
                  </div>

                  <div className="flex items-start lg:justify-end">
                    <span
  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
    lead.status === "qualified"
      ? "bg-green-50 text-green-700"
      : lead.callStatus === "call_failed" ||
          lead.callStatus === "no_answer"
        ? "bg-red-50 text-red-700"
        : lead.callStatus === "calling" ||
            lead.callStatus === "ringing" ||
            lead.callStatus === "in_progress"
          ? "bg-blue-50 text-blue-700"
          : lead.callStatus === "completed"
            ? "bg-green-50 text-green-700"
            : "bg-[#f1f1ee] text-[#555]"
  }`}
>
  {statusLabel(
    lead.status === "qualified"
      ? lead.status
      : lead.callStatus ?? lead.status
  )}
</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
