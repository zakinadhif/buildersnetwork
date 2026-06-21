import {
  approveKaryaMember,
  declineKaryaMember,
  joinKarya,
  useGetKarya,
} from "@myapp/api-client-react";
import { useState } from "react";
import { Avatar, Loading, STAGE_LABELS } from "@/components/ui-atoms";

export default function Karya({ id }: { id: string }) {
  const { data: karya, isLoading, refetch } = useGetKarya(id);
  const [busy, setBusy] = useState(false);

  if (isLoading) return <Loading />;
  if (!karya) {
    return (
      <div className="screen" style={{ display: "flex", alignItems: "center" }}>
        <div className="wrap">
          <p className="sub">karya tidak ditemukan.</p>
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginTop: 24 }}
            onClick={() => window.history.back()}
          >
            ← balik
          </button>
        </div>
      </div>
    );
  }

  const membership = karya.viewerMembership;
  const isOwner = membership?.role === "owner";

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      await refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen" style={{ overflowY: "auto" }}>
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <button
          type="button"
          onClick={() => window.history.back()}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--ink2)",
            fontSize: 13,
            padding: 0,
            marginBottom: 40,
          }}
        >
          ← balik
        </button>

        <h1
          style={{
            fontSize: 28,
            fontWeight: 300,
            letterSpacing: "-0.025em",
            marginBottom: 12,
          }}
        >
          {karya.title}
        </h1>

        <div className="skills-wrap" style={{ marginBottom: 24 }}>
          {karya.stages.map((s) => (
            <span key={s} className="stage-chip">
              {STAGE_LABELS[s]}
            </span>
          ))}
        </div>

        <p style={{ fontSize: 15, lineHeight: 1.65, marginBottom: 32 }}>
          {karya.description}
        </p>

        {/* CTA driven by viewer membership */}
        {!membership && (
          <button
            type="button"
            className="btn btn-dark"
            disabled={busy}
            onClick={() => act(() => joinKarya(id))}
          >
            Minta gabung
          </button>
        )}
        {membership?.status === "pending" && (
          <button
            type="button"
            className="btn btn-outline"
            disabled
            style={{ opacity: 0.6, cursor: "default" }}
          >
            Menunggu persetujuan
          </button>
        )}

        <hr className="hr" />

        {karya.interests.length > 0 && (
          <div className="pf">
            <p className="label">Minat / tag</p>
            <div className="skills-wrap">
              {karya.interests.map((s) => (
                <span key={s} className="chip" style={{ cursor: "default" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pf">
          <p className="label">Kontributor ({karya.roster.length})</p>
          <div className="roster">
            {karya.roster.map((m) => (
              <Avatar
                key={m.id}
                name={m.name}
                handle={m.handle}
                image={m.image}
              />
            ))}
          </div>
        </div>

        {/* Owner-only: pending join requests */}
        {isOwner && karya.pendingRequests.length > 0 && (
          <div className="pf">
            <p className="label">Permintaan gabung</p>
            {karya.pendingRequests.map((m) => (
              <div key={m.id} className="pending-row">
                <div className="pending-id">
                  <Avatar
                    name={m.name}
                    handle={m.handle}
                    image={m.image}
                    size={28}
                  />
                  <span style={{ fontSize: 14 }}>{m.name}</span>
                </div>
                <div className="pending-actions">
                  <button
                    type="button"
                    className="btn btn-dark"
                    disabled={busy}
                    onClick={() => act(() => approveKaryaMember(id, m.id))}
                  >
                    Terima
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={busy}
                    onClick={() => act(() => declineKaryaMember(id, m.id))}
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <hr className="hr" />

        {/* Post stream — Sprint 3 (DECISION-F). Empty-state placeholder only. */}
        <div className="pf">
          <p className="label">Update</p>
          <p className="empty-state">belum ada update.</p>
        </div>
      </div>
    </div>
  );
}
