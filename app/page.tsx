import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Projects from "@/components/Projects";
import Services from "@/components/Services";
import SmoothScroll from "@/components/SmoothScroll";
import Snapshot from "@/components/Snapshot";

export default function Home() {
  return (
    <SmoothScroll>
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <Snapshot />
        <Projects />
        <Services />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
