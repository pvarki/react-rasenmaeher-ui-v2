"use client";

interface GuideShotProps {
  src: string;
  caption: string;
}

/**
 * The picture of what is about to happen, sat in the space between the step
 * title and the action. It shrinks to whatever room is left rather than
 * pushing the button off screen, and the caption carries the meaning so the
 * image itself is decorative to a screen reader.
 */
export function GuideShot({ src, caption }: GuideShotProps) {
  return (
    <figure
      data-testid="guide-shot"
      className="flex w-full min-h-0 shrink flex-col items-center justify-center gap-4"
    >
      {/* Capped rather than flexed: an image carries its intrinsic height into
          the flex basis, which pushed the action off the bottom of the screen. */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="h-auto max-h-[min(34vh,300px)] w-auto max-w-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
      />
      <figcaption className="w-full shrink-0 text-center text-base leading-snug text-balance text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}
