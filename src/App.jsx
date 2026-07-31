import { MotionConfig } from "framer-motion";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Research from "./components/Research.jsx";
import Projects from "./components/Projects.jsx";
import Publications from "./components/Publications.jsx";
import People from "./components/People.jsx";
import News from "./components/News.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <About />
          <Research />
          <Projects />
          <Publications />
          <People />
          <News />
          <Contact />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
