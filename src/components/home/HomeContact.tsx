import HomeSection from "./HomeSection.tsx";
import ContactInfo from "../ContactInfo.tsx";

export default function HomeContact() {
  return (
    <HomeSection eyebrow="Contact" title="Contact" viewAllHref="/contact" viewAllLabel="Full contact page">
      <ContactInfo />
    </HomeSection>
  );
}
