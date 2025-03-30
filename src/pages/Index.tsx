
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ASLTranslator from "@/components/ASLTranslator";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <ASLTranslator />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
