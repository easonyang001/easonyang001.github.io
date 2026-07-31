import PageShell from "../components/PageShell.tsx";
import ContactInfo from "../components/ContactInfo.tsx";

export default function ContactPage() {
  return (
    <PageShell eyebrow="Contact" title="Contact">
      <ContactInfo />
    </PageShell>
  );
}
