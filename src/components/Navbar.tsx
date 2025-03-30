
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-navy text-white py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
            <span className="text-navy font-bold text-xl">A</span>
          </div>
          <span className="font-bold text-xl hidden sm:block">ASL Translator</span>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-6">
          <a href="#" className="hover:text-gold transition-colors">Home</a>
          <a href="#translator" className="hover:text-gold transition-colors">Translator</a>
          <a href="#about" className="hover:text-gold transition-colors">About</a>
          <a href="#contact" className="hover:text-gold transition-colors">Contact</a>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <Button 
            variant="ghost" 
            className="text-white hover:text-gold p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-navy border-t border-gold/20 py-4">
          <div className="container mx-auto flex flex-col space-y-4 px-6">
            <a href="#" className="hover:text-gold transition-colors" onClick={() => setIsMenuOpen(false)}>Home</a>
            <a href="#translator" className="hover:text-gold transition-colors" onClick={() => setIsMenuOpen(false)}>Translator</a>
            <a href="#about" className="hover:text-gold transition-colors" onClick={() => setIsMenuOpen(false)}>About</a>
            <a href="#contact" className="hover:text-gold transition-colors" onClick={() => setIsMenuOpen(false)}>Contact</a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
