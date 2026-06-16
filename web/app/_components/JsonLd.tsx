/**
 * Renders one or more schema.org JSON-LD blocks. Server-safe (no hooks), so it
 * can be used directly inside server `page.tsx` components and is part of the
 * initial HTML for crawlers.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Escape "<" so admin-editable strings can't break out of the
          // <script> tag (e.g. "</script>") — prevents stored XSS. "\u003c"
          // is still valid inside JSON-LD.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(block).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
