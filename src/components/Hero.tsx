
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const Hero = () => {
  const scrollToTranslator = () => {
    const translatorSection = document.getElementById("translator");
    if (translatorSection) {
      translatorSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="bg-navy text-white py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="text-gold">ASL</span> to Text Translator
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/80">
            Breaking barriers in communication with advanced American Sign Language recognition technology
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={scrollToTranslator}
              className="bg-gold hover:bg-gold/90 text-navy font-semibold px-8 py-6 text-lg"
            >
              Start Translating
            </Button>
            <Button
              variant="outline"
              className="border-gold text-gold hover:bg-gold/10"
            >
              Learn More
            </Button>
          </div>
          <div className="mt-16 animate-bounce">
            <Button
              variant="ghost"
              onClick={scrollToTranslator}
              className="text-gold hover:text-gold/80 hover:bg-transparent"
            >
              <ChevronDown size={28} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
