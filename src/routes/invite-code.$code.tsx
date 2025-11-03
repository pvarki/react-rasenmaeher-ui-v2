"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

import QRCode from "react-qr-code";
import { useCopyToClipboard } from "@/hooks/helpers/useCopyToClipboard";

export const Route = createFileRoute("/invite-code/$code")({
  component: InviteCodePage,
});

function InviteCodePage() {
  const { code } = Route.useParams();
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  const { isCopied, handleCopy } = useCopyToClipboard();

  let hostname = new URL(window.location.origin).hostname;
  hostname = hostname.replace(/^mtls\./, "");
  const inviteUrl =
    window.location.protocol +
    "//" +
    hostname +
    (window.location.port ? ":" + window.location.port : "") +
    "/login?code=" +
    (code ?? "");

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Invite Code {code}</h1>
            </div>

            <div className="md:bg-card md:border border-border rounded-xl flex flex-col items-center space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-lg mt-8">
                <QRCode value={inviteUrl} bgColor="#FFFFFF" size={280} />
              </div>
              <Button
                onClick={() => handleCopy(inviteUrl)}
                className="w-full max-w-sm bg-primary hover:bg-primary/90 h-12 text-base font-medium rounded-xl relative overflow-hidden mb-8"
              >
                <span className={cn("transition-all", isCopied && "opacity-0")}>
                  Copy invite link
                </span>
                {isCopied && (
                  <span className="absolute inset-0 flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Copied!
                  </span>
                )}
              </Button>
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                <span className="text-primary font-semibold">1. Show</span> this
                QR code to your user.
              </p>
              <p>
                <span className="text-primary font-semibold">
                  2. Alternatively,
                </span>{" "}
                press the <span className="font-medium">Copy invite link</span>{" "}
                button above, and paste & send the link to the user you want to
                enroll.
              </p>
              <p>
                <span className="text-primary font-semibold">3.</span> Via the
                QR code or the link, your user can log in and get to set their{" "}
                <span className="text-primary font-medium">callsign</span>.
              </p>
              <p>
                <span className="text-primary font-semibold">4.</span> After
                that, they are in the Waiting Room.
              </p>
              <p>
                <span className="text-primary font-semibold">5. Approve</span>{" "}
                your user by one of the three ways:
              </p>
            </div>

            <Collapsible
              open={instructionsOpen}
              onOpenChange={setInstructionsOpen}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-card border border-border rounded-xl hover:bg-accent/30 transition-colors">
                <span className="font-medium">Approval methods (details)</span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 transition-transform",
                    instructionsOpen && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 p-6 bg-card border border-border rounded-xl space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  You may approve your user either by taking the{" "}
                  <span className="font-semibold text-primary">
                    approval code
                  </span>{" "}
                  from their Waiting Room screen,{" "}
                  <span className="font-semibold text-primary">OR</span> by
                  asking them to provide you the approval code as a{" "}
                  <span className="font-semibold text-primary">link</span>, OR
                  by asking them their approval code & doing that in the{" "}
                  <span className="font-semibold text-primary">
                    "Approve Users"
                  </span>{" "}
                  view.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </main>
      </div>
    </div>
  );
}
