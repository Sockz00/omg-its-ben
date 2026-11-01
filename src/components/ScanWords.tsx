/**
 * Renders text as individual word spans (`.mk-scan-word`), matching the markup the
 * original "scan" easter egg injects into the h1 – layout is identical to plain text.
 */
export function ScanWords({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, i) =>
        part === "" || /^\s+$/.test(part) ? (
          part
        ) : (
          <span key={i} className="mk-scan-word" data-word={part.replace(/[^a-zA-Z]/g, "")}>
            {part}
          </span>
        ),
      )}
    </>
  );
}
