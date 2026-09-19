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
      className="flex w-full min-h-0 flex-1 flex-col items-center justify-center gap-4"
    >
      {/* Capped AND flexible: the cap stops the intrinsic height pushing the
          action off screen, and min-h-0 + flex-1 makes the picture give up room
          when it is tight, so the caption is never the thing that gets squeezed
          under the sticky action bar. */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="min-h-0 w-auto max-h-[min(42vh,380px)] max-w-full flex-1 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
      />
      <figcaption className="w-full shrink-0 text-center text-base leading-snug text-balance text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}
