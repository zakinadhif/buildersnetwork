import { useLocation } from "wouter";
import AssistantChat from "@/components/AssistantChat";
import { INTRO_NEW } from "@/lib/assistant-copy";
import { useOnboarding } from "@/lib/onboarding-ctx";

/**
 * The standalone onboarding flow (opt-in — no longer a gate; see issue #8). Now
 * a thin wrapper over the shared `AssistantChat`: the extracted draft is stashed
 * for `/review` to edit + publish, exactly as before. The chat mechanics live in
 * `AssistantChat` so the in-shell `/assistant` tab reuses them.
 */
export default function Onboarding() {
  const { setDraft } = useOnboarding();
  const [, navigate] = useLocation();

  return (
    <div
      className="screen"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          padding: "18px 28px",
          borderBottom: "1px solid var(--color-line)",
          flexShrink: 0,
        }}
      >
        <p className="eyebrow">Al-Fath Berkarya · onboarding</p>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          padding: "0 28px 20px",
        }}
      >
        <div
          className="wrap"
          style={{
            padding: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <AssistantChat
            intro={INTRO_NEW}
            onProfile={(draft) => {
              setDraft(draft);
              navigate("/review");
            }}
          />
        </div>
      </div>
    </div>
  );
}
