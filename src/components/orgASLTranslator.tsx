import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, CameraOff, RotateCcw, Send, Book } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const ASLTranslator = () => {
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [textInput, setTextInput] = useState("");
  const { toast } = useToast();
  
  useEffect(() => {
    let stream = null;
    
    const setupCamera = async () => {
      try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        
        // Connect the stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Start translation after camera is ready
        setTimeout(() => {
          setIsTranslating(true);
          simulateTranslation();
        }, 2000);
        
      } catch (error) {
        console.error("Error accessing camera:", error);
        setIsCameraActive(false);
        toast({
          title: "Camera error",
          description: "Could not access your camera. Please check permissions.",
          variant: "destructive"
        });
      }
    };
    
    // Setup camera when active, cleanup when inactive
    if (isCameraActive) {
      setupCamera();
    } else {
      // Stop all camera streams when inactive
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
    
    // Cleanup function for when component unmounts or isCameraActive changes
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isCameraActive, toast]);
  
  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    
    if (!isCameraActive) {
      toast({
        title: "Camera activating",
        description: "Please allow camera access if prompted.",
      });
    } else {
      setIsTranslating(false);
      toast({
        title: "Camera stopped",
        description: "The camera has been turned off.",
      });
    }
  };
  
  const resetTranslation = () => {
    setTranslatedText("");
    toast({
      title: "Translation reset",
      description: "The translation has been cleared.",
    });
  };
  
  const simulateTranslation = () => {
    const examplePhrases = [
      "Hello, how are you?",
      "My name is...",
      "Thank you",
      "Nice to meet you",
      "I understand"
    ];
    
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < examplePhrases.length && isCameraActive) {
        setTranslatedText(prev => 
          prev ? `${prev}\n\n${examplePhrases[currentIndex]}` : examplePhrases[currentIndex]
        );
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  };

  const handleTextToASLTranslate = () => {
    if (!textInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to translate.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Translating text to ASL",
      description: "Converting your text to American Sign Language...",
    });
    
    // Simulate translation processing
    setTimeout(() => {
      toast({
        title: "Translation complete",
        description: "Your text has been converted to ASL signs.",
      });
    }, 1500);
  };

  return (
    <section id="translator" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">ASL Translator</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our translator converts between American Sign Language and text in real-time. 
            Choose a mode and start translating now.
          </p>
        </div>
        
        <Tabs defaultValue="asl-to-text" className="max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="asl-to-text" className="data-[state=active]:bg-gold data-[state=active]:text-navy">
              ASL to Text
            </TabsTrigger>
            <TabsTrigger value="text-to-asl" className="data-[state=active]:bg-gold data-[state=active]:text-navy">
              Text to ASL
            </TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-gold data-[state=active]:text-navy">
              ASL Courses
            </TabsTrigger>
          </TabsList>
          
          {/* ASL to Text Tab */}
          <TabsContent value="asl-to-text" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left side - Camera */}
              <div className="bg-gray-100 rounded-lg shadow-md overflow-hidden">
                <div className="camera-container h-64">
                  {isCameraActive ? (
                    <div className="relative w-full h-full">
                      <video 
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-navy/5"></div>
                    </div>
                  ) : (
                    <div className="camera-overlay h-full flex flex-col items-center justify-center">
                      <Camera size={48} className="text-gold mb-4" />
                      <p>Camera is inactive</p>
                      <p className="text-sm text-gray-400 mt-2">Click the button below to start</p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-navy text-white flex justify-between items-center">
                  <span className={`text-sm ${isCameraActive ? 'text-gold' : 'text-white/70'}`}>
                    {isCameraActive ? 'Camera Active' : 'Camera Inactive'}
                  </span>
                  <Button
                    onClick={toggleCamera}
                    variant={isCameraActive ? "destructive" : "default"}
                    className={isCameraActive ? "bg-red-600 hover:bg-red-700" : "bg-gold hover:bg-gold/90 text-navy"}
                  >
                    {isCameraActive ? (
                      <>
                        <CameraOff size={16} className="mr-2" />
                        Stop Camera
                      </>
                    ) : (
                      <>
                        <Camera size={16} className="mr-2" />
                        Start Camera
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Right side - Text output */}
              <div className="bg-gray-100 rounded-lg shadow-md flex flex-col">
                <div className="p-4 bg-navy text-white flex justify-between items-center">
                  <span className="font-medium">Translated Text</span>
                  <Button
                    onClick={resetTranslation}
                    variant="outline"
                    className="border-gold/50 text-gold hover:bg-navy hover:text-gold/80"
                    disabled={!translatedText}
                  >
                    <RotateCcw size={16} className="mr-2" />
                    Reset
                  </Button>
                </div>
                <div className="output-container p-4 flex-grow h-64 overflow-y-auto">
                  {isTranslating ? (
                    <div className="h-full">
                      {translatedText ? (
                        <p className="text-navy whitespace-pre-line">{translatedText}</p>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-gray-500 animate-pulse">Analyzing gestures...</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">
                        {isCameraActive 
                          ? "Getting ready..." 
                          : "Waiting for camera to be activated"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center text-gray-600 max-w-3xl mx-auto">
              <p className="text-sm">
                <span className="font-medium text-navy">Note:</span> For best results, 
                ensure you're in a well-lit environment and position your hands clearly 
                in front of the camera.
              </p>
            </div>
          </TabsContent>
          
          {/* Text to ASL Tab */}
          <TabsContent value="text-to-asl" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left side - Text input */}
              <div className="bg-gray-100 rounded-lg shadow-md flex flex-col">
                <div className="p-4 bg-navy text-white">
                  <span className="font-medium">Enter Text to Translate</span>
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <Textarea 
                    placeholder="Type your text here..." 
                    className="flex-grow min-h-[240px] mb-4 resize-none"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleTextToASLTranslate}
                      className="bg-gold hover:bg-gold/90 text-navy"
                    >
                      <Send size={16} className="mr-2" />
                      Translate to ASL
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Right side - ASL visualization */}
              <div className="bg-gray-100 rounded-lg shadow-md flex flex-col">
                <div className="p-4 bg-navy text-white">
                  <span className="font-medium">ASL Signs</span>
                </div>
                <div className="flex-grow flex items-center justify-center p-6 min-h-[300px]">
                  {textInput ? (
                    <div className="text-center">
                      <div className="mb-4 bg-gold/20 p-6 rounded-lg inline-block">
                        <span className="text-6xl">👐</span>
                      </div>
                      <p className="text-gray-500">
                        ASL visualization would appear here in a real implementation.
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">
                      Enter text on the left and press translate to see the ASL signs.
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center text-gray-600 max-w-3xl mx-auto">
              <p className="text-sm">
                <span className="font-medium text-navy">Note:</span> Our system translates common phrases and words. 
                For more complex translations, please consult with an ASL interpreter.
              </p>
            </div>
          </TabsContent>
          
          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Course cards */}
              <Card className="overflow-hidden">
                <div className="h-40 bg-navy flex items-center justify-center">
                  <Book size={64} className="text-gold" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy mb-2">ASL Basics</h3>
                  <p className="text-gray-600 mb-4">Learn the fundamental signs and grammar structure of American Sign Language.</p>
                  <Button className="w-full bg-gold hover:bg-gold/90 text-navy">
                    Start Learning
                  </Button>
                </div>
              </Card>
              
              <Card className="overflow-hidden">
                <div className="h-40 bg-navy flex items-center justify-center">
                  <Book size={64} className="text-gold" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy mb-2">Conversational ASL</h3>
                  <p className="text-gray-600 mb-4">Build your skills with common phrases and everyday conversation patterns.</p>
                  <Button className="w-full bg-gold hover:bg-gold/90 text-navy">
                    Start Learning
                  </Button>
                </div>
              </Card>
              
              <Card className="overflow-hidden">
                <div className="h-40 bg-navy flex items-center justify-center">
                  <Book size={64} className="text-gold" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy mb-2">Advanced ASL</h3>
                  <p className="text-gray-600 mb-4">Master complex concepts, slang, and cultural aspects of American Sign Language.</p>
                  <Button className="w-full bg-gold hover:bg-gold/90 text-navy">
                    Start Learning
                  </Button>
                </div>
              </Card>
            </div>
            
            <div className="mt-10 text-center">
              <h3 className="text-xl font-bold text-navy mb-4">Why Learn ASL?</h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                American Sign Language is a complete, natural language with its own grammar and syntax. 
                Learning ASL opens up communication with the deaf and hard-of-hearing community, 
                promotes inclusivity, and can even enhance your cognitive abilities.
              </p>
              <Button className="bg-navy hover:bg-navy/90 text-gold">
                View All Courses
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ASLTranslator;