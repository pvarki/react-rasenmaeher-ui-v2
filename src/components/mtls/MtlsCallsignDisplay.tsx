"use client";

interface MtlsCallsignDisplayProps {
  callsign: string;
}

export function MtlsCallsignDisplay({ callsign }: MtlsCallsignDisplayProps) {
  return (
    <div className="pt-2 p-4 bg-muted/50 border border-border rounded-lg">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold">Password: </span>
        <span className="font-mono font-semibold text-foreground bg-card px-2 py-0.5 rounded inline-block mt-1">
          {callsign}
        </span>
      </p>
    </div>
  );
}
