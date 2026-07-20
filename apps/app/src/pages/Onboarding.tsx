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
    <div className="fixed inset-0 animate-up flex flex-col">
      <div className="px-7 py-[18px] border-b border-line shrink-0">
        <p className="eyebrow">Al-Fath Berkarya · onboarding</p>
      </div>

      <div className="flex-1 flex flex-col min-h-0 px-7 pb-5">
        <div className="max-w-[var(--container-page)] mx-auto w-full flex-1 flex flex-col min-h-0">
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
