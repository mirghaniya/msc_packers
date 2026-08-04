export const FaqSection = ({
  faqs,
  heading = "Frequently Asked Questions",
}: {
  faqs: { q: string; a: string }[];
  heading?: string;
}) => {
  if (!faqs.length) return null;
  return (
    <section className="mt-16" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="font-playfair font-bold text-2xl md:text-3xl text-foreground mb-6">
        {heading}
      </h2>
      <dl className="space-y-4">
        {faqs.map((f) => (
          <div key={f.q} className="bg-card border rounded-lg p-4 md:p-6">
            <dt className="font-inter font-semibold text-foreground mb-1">{f.q}</dt>
            <dd className="font-inter text-sm text-muted-foreground">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
