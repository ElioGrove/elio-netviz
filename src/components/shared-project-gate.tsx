import { translate, useLocale } from "@/i18n";
import { useEffect, useRef, useState } from "react";
import type { FlowSnapshot } from "@/lib/storage";
import {
  createFlowSnapshot,
  downloadSnapshot,
  hasWorkspaceContent,
  parseSharedProject,
  urlWithoutSharePayload,
} from "@/lib/storage";
import { useFlowStore } from "@/store/flow-store";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/ui/dialog";
import { Button } from "@/ui/button";

function currentSnapshot() {
  return createFlowSnapshot(useFlowStore.getState());
}

function removeSharePayload() {
  window.history.replaceState(
    null,
    "",
    urlWithoutSharePayload(window.location.href)
  );
}

export function SharedProjectConflictContent({
  projectName,
  onDownload,
  onCancel,
  onOpen,
}: {
  projectName: string;
  onDownload: () => void;
  onCancel: () => void;
  onOpen: () => void;
}) {
  useLocale();
  return (
    <>
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          {translate("Open shared project?")}
        </h2>
        <p className="pt-1.5 text-xs leading-relaxed text-muted-foreground">
          {translate("This link contains")}<strong className="text-foreground">{projectName}</strong>{translate(". Opening it will replace your current local workspace.")}
        </p>
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {translate("Download your existing work first, or open this link in an incognito/private window to keep both projects separate.")}
      </p>
      <DialogFooter className="grid-cols-3">
        <Button variant="outline" onClick={onCancel}>
          {translate("Cancel")}
        </Button>
        <Button
          variant="outline"
          aria-label={translate("Download current project")}
          onClick={onDownload}
        >
          {translate("Download")}
        </Button>
        <Button variant="destructive" onClick={onOpen}>
          {translate("Open project")}
        </Button>
      </DialogFooter>
    </>
  );
}

export function SharedProjectGate() {
  useLocale();
  const started = useRef(false);
  const [pending, setPending] = useState<FlowSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const openSharedProject = () => {
      if (started.current || !window.location.hash.includes("share=")) return;
      started.current = true;
      void parseSharedProject(window.location.hash)
        .then((snapshot) => {
          if (!snapshot) return;
          if (hasWorkspaceContent(currentSnapshot())) {
            setPending(snapshot);
            return;
          }
          removeSharePayload();
          useFlowStore.getState().replaceDocument(snapshot);
        })
        .catch(() => setError(translate("The shared-project link is invalid or damaged.")));
    };

    if (useFlowStore.persist.hasHydrated()) {
      openSharedProject();
      return;
    }
    return useFlowStore.persist.onFinishHydration(openSharedProject);
  }, []);

  const cancel = () => {
    setPending(null);
    removeSharePayload();
  };

  const open = () => {
    if (!pending) return;
    removeSharePayload();
    useFlowStore.getState().replaceDocument(pending);
    setPending(null);
  };

  const closeError = () => {
    setError(null);
    removeSharePayload();
  };

  return (
    <>
      <Dialog open={!!pending} onOpenChange={(next) => !next && cancel()}>
        <DialogContent>
          <DialogTitle className="sr-only">{translate("Open shared project?")}</DialogTitle>
          {pending ? (
            <SharedProjectConflictContent
              projectName={pending.projectName}
              onDownload={() => {
                const snapshot = currentSnapshot();
                downloadSnapshot(snapshot, snapshot.projectName);
              }}
              onCancel={cancel}
              onOpen={open}
            />
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog open={!!error} onOpenChange={(next) => !next && closeError()}>
        <DialogContent>
          <DialogTitle>{translate("Could not open shared project")}</DialogTitle>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {error}
          </p>
          <DialogFooter className="grid-cols-1">
            <Button onClick={closeError}>{translate("Close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
