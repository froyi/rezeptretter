"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = "Bestätigen",
  cancelLabel = "Abbrechen",
  onConfirm,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-container-lowest rounded-3xl border-none shadow-xl max-w-sm mx-auto">
        <DialogHeader>
          <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-2">
            <span
              className={`material-symbols-outlined text-3xl ${destructive ? "text-error" : "text-primary"}`}
            >
              {destructive ? "warning" : "help"}
            </span>
          </div>
          <DialogTitle className="text-center text-xl font-headline font-bold text-on-surface">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-on-surface-variant leading-relaxed">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 sm:justify-center mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-full h-12 border-outline-variant text-on-surface-variant font-medium"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={`flex-1 rounded-full h-12 font-medium text-white ${
              destructive
                ? "bg-error hover:bg-error/90"
                : "hero-gradient hover:brightness-110"
            }`}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
