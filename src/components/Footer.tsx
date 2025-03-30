
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-navy py-12 text-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                <span className="text-navy font-bold text-xl">A</span>
              </div>
              <span className="font-bold text-xl">ASL Translator</span>
            </div>
            <p className="text-white/70 max-w-md">
              Breaking barriers in communication with advanced American Sign Language recognition technology.
              Our mission is to make communication accessible for everyone.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/70 hover:text-gold transition-colors">Home</a></li>
              <li><a href="#translator" className="text-white/70 hover:text-gold transition-colors">Translator</a></li>
              <li><a href="#about" className="text-white/70 hover:text-gold transition-colors">About</a></li>
              <li><a href="#contact" className="text-white/70 hover:text-gold transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-gold transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-white/70 hover:text-gold transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white/70 hover:text-gold transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-white/70 hover:text-gold transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/70 text-sm">
          <p>© {new Date().getFullYear()} ASL Translator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
