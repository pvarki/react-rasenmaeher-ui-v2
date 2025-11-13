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

interface MtlsInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MtlsInfoModal({ open, onOpenChange }: MtlsInfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>What is mTLS?</DialogTitle>
          <DialogDescription>
            Mutual TLS (mTLS) authentication explained
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 text-sm leading-relaxed">
          <p>
            By using an mTLS key installed on your device to connect to our
            service, we can ensure the connection comes from you. No one else
            can impersonate you.
          </p>
          <p>Likewise, you are assured that on the other end, it's us.</p>
          <p className="font-medium text-foreground">
            All services from Deploy App (Rasenmäher) that you take into use
            encrypt their traffic with your mTLS key.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
