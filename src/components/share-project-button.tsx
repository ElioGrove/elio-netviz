import { translate, useLocale } from "@/i18n";
import { useEffect, useRef, useState } from "react";
import { createFlowSnapshot, createShareUrl } from "@/lib/storage";
import { useFlowStore } from "@/store/flow-store";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Input } from "@/ui/input";

type ShareState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; link: string }
  | { status: "error"; message: string };

export function ShareProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  useLocale();
  const [share, setShare] = useState<ShareState>({ status: "idle" });
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let current = true;
    setCopied(false);
    setShare({ status: "loading" });
    const snapshot = createFlowSnapshot(useFlowStore.getState());
    void createShareUrl(snapshot)
      .then((link) => {
        if (current) setShare({ status: "ready", link });
      })
      .catch((error: unknown) => {
        if (!current) return;
        setShare({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : translate("Could not create a share link."),
        });
      });
    return () => {
      current = false;
    };
  }, [open]);

  const copyLink = async () => {
    if (share.status !== "ready") return;
    inputRef.current?.select();
    try {
      await navigator.clipboard.writeText(share.link);
    } catch {
      document.execCommand("copy");
    }
    setCopied(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
          <DialogHeader>
            <DialogTitle>{translate("Share project")}</DialogTitle>
            <DialogDescription>
              {translate("Anyone with this link can open an editable copy of the project.")}
            </DialogDescription>
          </DialogHeader>
          {share.status === "loading" || share.status === "idle" ? (
            <div className="flex h-9 items-center rounded-lg bg-input px-3 text-xs text-muted-foreground">
              {translate("Creating compressed link…")}
            </div>
          ) : share.status === "error" ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs leading-relaxed text-destructive">
              {translate(share.message)}
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  readOnly
                  value={share.link}
                  onFocus={(event) => event.currentTarget.select()}
                  aria-label={translate("Share link")}
                  className="min-w-0 font-mono text-xs"
                />
                <Button onClick={() => void copyLink()}>
                  {copied ? translate("Copied") : translate("Copy link")}
                </Button>
              </div>
              {share.link.length > 50_000 ? (
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {translate("This is a large link because the project contains a lot of data. Some messaging apps may shorten it.")}
                </p>
              ) : null}
            </>
          )}
          <DialogFooter className="grid-cols-1">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {translate("Close")}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
