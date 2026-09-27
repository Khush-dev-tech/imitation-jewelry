import Image from "next/image";

/**
 * Client's actual logo mark, cropped from their printed business card
 * (no vector/source file was available). Fixed aspect ratio (640x260).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/maruti-logo.png"
      alt="Maruti Imitation Jewelry"
      width={640}
      height={260}
      priority
      className={className}
    />
  );
}
