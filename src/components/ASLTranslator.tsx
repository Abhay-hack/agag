import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, CameraOff, RotateCcw, Send, Book } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

// CDN script loading function
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const ASLTranslator = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [textInput, setTextInput] = useState("");
  const [hands, setHands] = useState(null);
  const [mediaPipeLoaded, setMediaPipeLoaded] = useState(false);
  const [gestureHistory, setGestureHistory] = useState([]);
  const { toast } = useToast();
  
  // Load MediaPipe scripts
  useEffect(() => {
    const loadMediaPipeScripts = async () => {
      try {
        // Load MediaPipe scripts from CDN
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
        
        setMediaPipeLoaded(true);
        console.log('MediaPipe scripts loaded successfully');
      } catch (error) {
        console.error('Error loading MediaPipe scripts:', error);
        toast({
          title: "Error",
          description: "Failed to load hand tracking components. Please refresh the page.",
          variant: "destructive"
        });
      }
    };
    
    loadMediaPipeScripts();
  }, [toast]);
  
  // Function to initialize MediaPipe hands
  const initializeHands = async () => {
    if (!window.Hands) {
      toast({
        title: "Error",
        description: "Hand tracking components not loaded. Please refresh the page.",
        variant: "destructive"
      });
      return null;
    }
    
    // Initialize MediaPipe Hands
    const handsInstance = new window.Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    // Configure the hands model
    handsInstance.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    // Set up result handling
    handsInstance.onResults(onHandResults);
    
    return handsInstance;
  };
  
  // Function to handle MediaPipe results
  const onHandResults = (results) => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvasCtx = canvasRef.current.getContext('2d');
    
    // Clear canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw video frame
    canvasCtx.drawImage(
      results.image, 0, 0, canvasRef.current.width, canvasRef.current.height
    );
    
    // Draw hand landmarks
    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        window.drawConnectors(
          canvasCtx, landmarks, window.HAND_CONNECTIONS,
          { color: '#FFC107', lineWidth: 2 }
        );
        window.drawLandmarks(
          canvasCtx, landmarks,
          { color: '#001F3F', lineWidth: 1, radius: 3 }
        );
      }
      
      // Process hand gestures and translate to ASL
      if (results.multiHandLandmarks.length > 0) {
        const handLandmarks = results.multiHandLandmarks[0];
        const handedness = results.multiHandedness[0].label; // 'Left' or 'Right'
        recognizeGesture(handLandmarks, handedness);
      }
    }
    
    canvasCtx.restore();
  };
  
  // Improved gesture recognition function with 5 specific ASL signs
  const recognizeGesture = (landmarks, handedness) => {
    // Get finger landmarks
    const thumb = {
      tip: landmarks[4],
      ip: landmarks[3],
      mcp: landmarks[2]
    };
    
    const index = {
      tip: landmarks[8],
      dip: landmarks[7],
      pip: landmarks[6],
      mcp: landmarks[5]
    };
    
    const middle = {
      tip: landmarks[12],
      dip: landmarks[11],
      pip: landmarks[10],
      mcp: landmarks[9]
    };
    
    const ring = {
      tip: landmarks[16],
      dip: landmarks[15],
      pip: landmarks[14],
      mcp: landmarks[13]
    };
    
    const pinky = {
      tip: landmarks[20],
      dip: landmarks[19],
      pip: landmarks[18],
      mcp: landmarks[17]
    };
    
    const wrist = landmarks[0];
    
    // Helper functions
    const distanceBetween = (a, b) => {
      return Math.sqrt(
        Math.pow(a.x - b.x, 2) + 
        Math.pow(a.y - b.y, 2) + 
        Math.pow(a.z - b.z, 2)
      );
    };
    
    const isFingerExtended = (finger) => {
      // Check if finger tip is significantly higher than MCP (base)
      return finger.tip.y < finger.mcp.y - 0.1;
    };
    
    const isFingerCurled = (finger) => {
      // Check if finger tip is below or close to MCP (base)
      return finger.tip.y > finger.mcp.y - 0.05;
    };
    
    const isFingertipTouching = (finger1, finger2) => {
      const distance = distanceBetween(finger1.tip, finger2.tip);
      return distance < 0.05; // Threshold for "touching"
    };
    
    let gesture = null;
    
    // 1. ASL for "YES" / Nodding (A hand gesture approximation)
    // Closed fist with thumb extended upward
    if (isFingerExtended(thumb) && 
        isFingerCurled(index) && 
        isFingerCurled(middle) && 
        isFingerCurled(ring) && 
        isFingerCurled(pinky)) {
      gesture = "Yes";
    }
    
    // 2. ASL for "NO" / Head shake (A hand gesture approximation)
    // Extended index finger wagging side to side (we detect just the position)
    else if (isFingerExtended(index) && 
             !isFingerExtended(middle) && 
             !isFingerExtended(ring) && 
             !isFingerExtended(pinky) && 
             !isFingerExtended(thumb)) {
      gesture = "No";
    }
    
    // 3. ASL for "HELLO" / Waving
    // Open hand with all fingers extended, palm facing viewer
    else if (isFingerExtended(index) && 
             isFingerExtended(middle) && 
             isFingerExtended(ring) && 
             isFingerExtended(pinky) && 
             (thumb.tip.x > thumb.ip.x) && // Thumb somewhat extended outward
             (Math.abs(index.tip.y - middle.tip.y) < 0.05) && // Fingers roughly even
             (Math.abs(middle.tip.y - ring.tip.y) < 0.05) && 
             (Math.abs(ring.tip.y - pinky.tip.y) < 0.05)) {
      gesture = "Hello";
    }
    
    // 4. ASL for "THANK YOU"
    // Flat hand with fingers together, starts at chin and moves forward/down
    else if (isFingerExtended(index) && 
             isFingerExtended(middle) && 
             isFingerExtended(ring) && 
             isFingerExtended(pinky) && 
             (Math.abs(index.tip.y - middle.tip.y) < 0.05) && // Fingers together
             (Math.abs(middle.tip.y - ring.tip.y) < 0.05) && 
             (Math.abs(ring.tip.y - pinky.tip.y) < 0.05) &&
             (distanceBetween(index.tip, middle.tip) < 0.04) && // Fingers close to each other
             (distanceBetween(middle.tip, ring.tip) < 0.04) &&
             (distanceBetween(ring.tip, pinky.tip) < 0.04)) {
      gesture = "Thank you";
    }
    
    // 5. ASL for "I LOVE YOU" (Combination of I, L, Y handshapes)
    // Pinky and index extended, middle and ring curled, thumb extended
    else if (isFingerExtended(index) && 
             !isFingerExtended(middle) && 
             !isFingerExtended(ring) && 
             isFingerExtended(pinky) && 
             isFingerExtended(thumb)) {
      gesture = "I love you";
    }
    
    // 6. ASL for "PLEASE"
    // Flat hand rubbing in circular motion on chest
    // We can approximate with flat hand position
    else if (isFingerExtended(index) && 
             isFingerExtended(middle) && 
             isFingerExtended(ring) && 
             isFingerExtended(pinky) && 
             (Math.abs(index.tip.y - middle.tip.y) < 0.04) && // Flat hand detection
             (Math.abs(middle.tip.y - ring.tip.y) < 0.04) && 
             (Math.abs(ring.tip.y - pinky.tip.y) < 0.04) &&
             (wrist.y > 0.6)) { // Hand positioned lower, near chest
      gesture = "Please";
    }
    
    // Update state with recognized gesture
    if (gesture) {
      updateTranslation(gesture);
      
      // Add to gesture history for more robust detection
      setGestureHistory(prev => {
        const newHistory = [...prev, gesture].slice(-10); // Keep last 10 gestures
        return newHistory;
      });
    }
  };
  
  // Improved translation update with debounce and gesture stabilization
  const updateTranslation = (() => {
    let lastGesture = "";
    let lastTime = 0;
    let gestureCount = 0;
    
    return (gesture) => {
      const now = Date.now();
      
      // If same gesture detected
      if (gesture === lastGesture) {
        gestureCount++;
        
        // Only register gesture after multiple consistent detections (3) or after time passes
        if ((gestureCount >= 3 && now - lastTime > 1000) || now - lastTime > 3000) {
          setTranslatedText(prev => {
            // Avoid duplicates in a row
            const sentences = prev.split('\n\n');
            if (sentences[sentences.length - 1] === gesture) {
              return prev;
            }
            return prev ? `${prev}\n\n${gesture}` : gesture;
          });
          
          lastTime = now;
          gestureCount = 0;
        }
      } 
      // New gesture detected
      else {
        lastGesture = gesture;
        gestureCount = 1;
        lastTime = now;
      }
    };
  })();
  
  useEffect(() => {
    let cameraInstance = null;
    let handsInstance = null;
    
    const setupCamera = async () => {
      try {
        if (!mediaPipeLoaded) {
          toast({
            title: "Loading",
            description: "Still loading hand tracking components. Please wait...",
          });
          return;
        }
        
        // Initialize canvas size
        if (canvasRef.current && videoRef.current) {
          canvasRef.current.width = 640;
          canvasRef.current.height = 480;
        }
        
        // Initialize MediaPipe hands
        handsInstance = await initializeHands();
        setHands(handsInstance);
        
        if (!handsInstance) {
          throw new Error("Failed to initialize hand tracking");
        }
        
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false,
        });
        
        // Connect the stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = resolve;
          });
          videoRef.current.play();
        }
        
        // Initialize camera processor
        cameraInstance = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (handsInstance) {
              await handsInstance.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });
        
        await cameraInstance.start();
        
        // Start translation after camera is ready
        setTimeout(() => {
          setIsTranslating(true);
        }, 2000);
        
      } catch (error) {
        console.error("Error accessing camera or initializing MediaPipe:", error);
        setIsCameraActive(false);
        toast({
          title: "Setup error",
          description: `Could not access camera or initialize hand tracking: ${error.message}`,
          variant: "destructive"
        });
      }
    };
    
    // Setup camera and MediaPipe when active, cleanup when inactive
    if (isCameraActive && mediaPipeLoaded) {
      setupCamera();
    } else if (!isCameraActive) {
      // Stop camera processor
      if (cameraInstance) {
        cameraInstance.stop();
      }
      
      // Stop all camera streams when inactive
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      
      // Stop hands processing
      if (handsInstance) {
        handsInstance.close();
      }
    }
    
    // Cleanup function for when component unmounts or isCameraActive changes
    return () => {
      if (cameraInstance) {
        cameraInstance.stop();
      }
      
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      
      if (handsInstance) {
        handsInstance.close();
      }
    };
  }, [isCameraActive, mediaPipeLoaded, toast]);
  
  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    
    if (!isCameraActive) {
      toast({
        title: "Camera activating",
        description: "Please allow camera access if prompted.",
      });
    } else {
      setIsTranslating(false);
      setTranslatedText("");
      setGestureHistory([]);
      toast({
        title: "Camera stopped",
        description: "The camera has been turned off.",
      });
    }
  };
  
  const resetTranslation = () => {
    setTranslatedText("");
    setGestureHistory([]);
    toast({
      title: "Translation reset",
      description: "The translation has been cleared.",
    });
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
                <div className="camera-container h-64 relative">
                  {isCameraActive ? (
                    <>
                      <video 
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover invisible"
                      />
                      <canvas
                        ref={canvasRef} 
                        className="absolute top-0 left-0 w-full h-full object-cover"
                      />
                      {!mediaPipeLoaded && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <p className="text-white">Loading hand tracking...</p>
                        </div>
                      )}
                    </>
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
                    disabled={!mediaPipeLoaded}
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
            
            {/* Added ASL Reference Guide */}
            <div className="mt-8 bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-navy mb-3">Recognized ASL Signs</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded shadow-sm">
                  <h4 className="font-medium text-navy">Yes</h4>
                  <p className="text-sm text-gray-600">Closed fist with thumb extended upward</p>
                </div>
                <div className="p-3 bg-white rounded shadow-sm">
                  <h4 className="font-medium text-navy">No</h4>
                  <p className="text-sm text-gray-600">Extended index finger (pointing)</p>
                </div>
                <div className="p-3 bg-white rounded shadow-sm">
                  <h4 className="font-medium text-navy">Hello</h4>
                  <p className="text-sm text-gray-600">Open hand with all fingers extended, palm facing viewer</p>
                </div>
                <div className="p-3 bg-white rounded shadow-sm">
                  <h4 className="font-medium text-navy">Thank you</h4>
                  <p className="text-sm text-gray-600">Flat hand with fingers together moving forward from chin</p>
                </div>
                <div className="p-3 bg-white rounded shadow-sm">
                  <h4 className="font-medium text-navy">I love you</h4>
                  <p className="text-sm text-gray-600">Index finger, pinky and thumb extended (other fingers curled)</p>
                </div>
                <div className="p-3 bg-white rounded shadow-sm">
                  <h4 className="font-medium text-navy">Please</h4>
                  <p className="text-sm text-gray-600">Flat hand position (lower, as if on chest)</p>
                </div>
              </div>
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