
import { Handshake, Lightbulb, Globe } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">About ASL Translator</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our mission is to break down communication barriers by leveraging 
            technology to translate American Sign Language in real-time.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Handshake size={32} className="text-gold" />
            </div>
            <h3 className="text-xl font-semibold text-navy mb-3">Accessibility</h3>
            <p className="text-gray-600">
              We believe communication should be accessible to everyone. 
              Our tool helps bridge the gap between the deaf community and those who don't know sign language.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb size={32} className="text-gold" />
            </div>
            <h3 className="text-xl font-semibold text-navy mb-3">Innovation</h3>
            <p className="text-gray-600">
              Using advanced computer vision and machine learning algorithms, 
              our technology can recognize and translate sign language gestures with increasing accuracy.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe size={32} className="text-gold" />
            </div>
            <h3 className="text-xl font-semibold text-navy mb-3">Inclusivity</h3>
            <p className="text-gray-600">
              We're working towards a more inclusive world where language 
              barriers are minimized and everyone has equal opportunities to communicate.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
