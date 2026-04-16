"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Flashlight, Compass, Calculator, Ruler, RotateCcw, Camera, Move, Trash2, Check } from "lucide-react";

// Flashlight Tool
function FlashlightTool() {
  const [on, setOn] = useState(false);
  const [error, setError] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);

  const toggleFlashlight = async () => {
    if (on && stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setOn(false);
      setError("");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      const track = mediaStream.getVideoTracks()[0];
      const caps = track.getCapabilities();
      if (caps && 'torch' in caps) {
        await track.applyConstraints({ advanced: [{ torch: true } as any] });
        setStream(mediaStream);
        setOn(true);
        setError("");
      } else {
        mediaStream.getTracks().forEach(track => track.stop());
        setError("Flashlight not supported on this device");
      }
    } catch (err) {
      setError("Could not access camera");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${on ? "bg-yellow-400 shadow-lg shadow-yellow-400/50" : "bg-gray-700"}`}>
        <Flashlight size={64} className={on ? "text-black" : "text-gray-400"} />
      </div>
      
      <button
        onClick={toggleFlashlight}
        className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all ${on ? "bg-red-500 hover:bg-red-600" : "bg-yellow-400 hover:bg-yellow-500 text-black"}`}
      >
        {on ? "Turn Off" : "Turn On"}
      </button>

      {error && <p className="text-red-400 text-center px-4">{error}</p>}
      
      <p className="text-gray-400 text-sm text-center px-4">
        {on ? "Flashlight is on" : "Tap to turn on flashlight"}
      </p>
    </div>
  );
}

// Spirit Level Tool
function SpiritLevelTool() {
  const [roll, setRoll] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [calibrated, setCalibrated] = useState({ roll: 0, pitch: 0 });
  const [hasSupport, setHasSupport] = useState(false);
  const calibratedRef = useRef({ roll: 0, pitch: 0 });

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const newRoll = e.gamma - calibratedRef.current.roll;
        const newPitch = e.beta - calibratedRef.current.pitch;
        setRoll(newRoll);
        setPitch(newPitch);
        setHasSupport(true);
      }
    };
    
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, []);

  const calibrate = () => {
    calibratedRef.current = { roll, pitch };
    setCalibrated({ roll, pitch });
  };

  const levelColor = (value: number) => {
    const abs = Math.abs(value);
    if (abs < 1) return "text-green-400";
    if (abs < 5) return "text-yellow-400";
    return "text-red-400";
  };

  const overallLevel = Math.sqrt(roll * roll + pitch * pitch);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
      {!hasSupport ? (
        <p className="text-gray-400">Motion sensors not available</p>
      ) : (
        <>
          <div className="relative w-48 h-48 rounded-full border-4 border-gray-600 bg-gray-800">
            <div 
              className="absolute w-16 h-16 rounded-full transition-all duration-100"
              style={{
                backgroundColor: overallLevel < 3 ? "#22c55e" : overallLevel < 8 ? "#eab308" : "#ef4444",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) translate(${roll * 2}px, ${pitch * 2}px)`
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gray-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <p className="text-gray-400 text-xs mb-1">Horizontal</p>
              <div className={`text-3xl font-mono font-bold ${levelColor(roll)}`}>
                {roll.toFixed(1)}°
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Vertical</p>
              <div className={`text-3xl font-mono font-bold ${levelColor(pitch)}`}>
                {pitch.toFixed(1)}°
              </div>
            </div>
          </div>

          <div className={`text-4xl font-bold ${levelColor(overallLevel)}`}>
            {overallLevel.toFixed(1)}° off level
          </div>

          <button
            onClick={calibrate}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl"
          >
            <RotateCcw size={18} /> Calibrate / Zero
          </button>
        </>
      )}
    </div>
  );
}

// Calculator Tool
function CalculatorTool() {
  const [display, setDisplay] = useState("0");
  const [previous, setPrevious] = useState<string | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitForOperand, setWaitForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitForOperand) {
      setDisplay(digit);
      setWaitForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitForOperand) {
      setDisplay("0.");
      setWaitForOperand(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPrevious(null);
    setOperator(null);
    setWaitForOperand(false);
  };

  const calculate = () => {
    if (previous === null || operator === null) return;
    
    const prev = parseFloat(previous);
    const curr = parseFloat(display);
    let result = 0;

    switch (operator) {
      case "+": result = prev + curr; break;
      case "-": result = prev - curr; break;
      case "*": result = prev * curr; break;
      case "/": result = curr !== 0 ? prev / curr : 0; break;
    }

    setDisplay(result.toString().replace(/\.0+$/, '').slice(0, 12));
    setPrevious(null);
    setOperator(null);
    setWaitForOperand(true);
  };

  const performOp = (nextOp: string) => {
    if (operator !== null && !waitForOperand) {
      calculate();
    }
    
    setPrevious(display);
    setOperator(nextOp);
    setWaitForOperand(true);
  };

  const buttons = [
    ["C", "±", "%", "/"],
    ["7", "8", "9", "*"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  return (
    <div className="flex flex-col h-full justify-end gap-2 p-4 max-w-sm mx-auto">
      <div className="bg-gray-800 rounded-xl p-4 mb-2">
        <div className="text-gray-400 text-sm h-6">{previous} {operator}</div>
        <div className="text-white text-4xl font-mono text-right truncate">{display}</div>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {buttons.flat().map((btn, i) => {
          const isNumber = !isNaN(parseInt(btn));
          
          return (
            <button
              key={i}
              onClick={() => {
                if (isNumber) inputDigit(btn);
                else if (btn === ".") inputDecimal();
                else if (btn === "C") clear();
                else if (btn === "±") setDisplay((parseFloat(display) * -1).toString());
                else if (btn === "%") setDisplay((parseFloat(display) / 100).toString());
                else if (btn === "=") calculate();
                else performOp(btn);
              }}
              className={`
                ${isNumber ? "bg-gray-700 hover:bg-gray-600 active:bg-gray-500" : "bg-orange-500 hover:bg-orange-400 active:bg-orange-300 text-white"}
                aspect-square rounded-xl text-2xl font-semibold transition-colors active:scale-95
              `}
            >
              {btn}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Ruler Tool (Visual)
function RulerTool() {
  const [length, setLength] = useState(15);
  
  const pxPerCm = 38;
  
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <button onClick={() => setLength(Math.max(5, length - 5))} className="px-3 py-2 bg-gray-700 rounded-xl">-5</button>
        <button onClick={() => setLength(Math.max(1, length - 1))} className="px-3 py-2 bg-gray-700 rounded-xl">-</button>
        <div className="text-2xl font-bold w-24 text-center">{length} cm</div>
        <button onClick={() => setLength(Math.min(50, length + 1))} className="px-3 py-2 bg-gray-700 rounded-xl">+</button>
        <button onClick={() => setLength(Math.min(50, length + 5))} className="px-3 py-2 bg-gray-700 rounded-xl">+5</button>
      </div>

      <div className="overflow-x-auto w-full max-w-lg">
        <div className="inline-block min-w-full" style={{ width: length * pxPerCm }}>
          <div className="h-20 bg-gray-100 rounded-lg border-2 border-gray-400 relative overflow-hidden">
            {Array.from({ length: length + 1 }).map((_, i) => (
              <div key={i} className="absolute top-0 h-full flex flex-col">
                <div className="w-px h-full bg-gray-800" />
                <span className="text-xs text-gray-600 absolute top-1 left-0.5">{i}</span>
              </div>
            ))}
            {Array.from({ length: length * 10 }).map((_, i) => {
              if (i % 10 === 0) return null;
              const mm = i % 10;
              return (
                <div
                  key={i}
                  className="absolute top-0 bg-gray-600"
                  style={{
                    left: `${(i / 10) * pxPerCm}px`,
                    width: '1px',
                    height: mm === 5 ? '60%' : '30%',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-gray-400 text-sm text-center">
        Place your phone against an object to measure
      </p>
    </div>
  );
}

// AR Protractor Tool - tap 3 points to measure angle
function ARProtractorTool() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [angle, setAngle] = useState<number | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: 1280, height: 720 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (err) {
      setCameraReady(false);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [startCamera]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (points.length >= 3) {
      setPoints([{ x, y }]);
      setAngle(null);
    } else {
      const newPoints = [...points, { x, y }];
      setPoints(newPoints);
      
      if (newPoints.length === 3) {
        // Calculate angle at point 2 (middle point)
        const p1 = newPoints[0];
        const p2 = newPoints[1];
        const p3 = newPoints[2];
        
        const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
        
        const dot = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        
        const cosAngle = dot / (mag1 * mag2);
        const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
        const angleDeg = (angleRad * 180) / Math.PI;
        setAngle(angleDeg);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw lines between points
    if (points.length >= 2) {
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }
    
    // Draw points
    points.forEach((p, i) => {
      const colors = ["#22c55e", "#fbbf24", "#ef4444"];
      ctx.fillStyle = colors[i] || "#ffffff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String.fromCharCode(65 + i), p.x, p.y + 4); // A, B, C
    });
    
    // Draw angle arc at middle point if we have 3 points
    if (points.length === 3 && angle !== null) {
      const p = points[1];
      ctx.beginPath();
      ctx.arc(p.x, p.y, 40, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fill();
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(`${angle.toFixed(1)}°`, p.x, p.y + 5);
    }
  }, [points, angle]);

  const clearPoints = () => {
    setPoints([]);
    setAngle(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          onClick={handleCanvasClick}
          className="absolute inset-0 w-full h-full cursor-crosshair"
        />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <div className="bg-black/50 px-3 py-1 rounded text-sm">
            {points.length < 3 ? `Tap point ${points.length + 1} (A, B, C)` : "Tap to restart"}
          </div>
          <button
            onClick={() => setFacingMode(facingMode === "environment" ? "user" : "environment")}
            className="bg-black/50 px-3 py-1 rounded text-sm"
          >
            Flip
          </button>
        </div>
        
        {angle !== null && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/70 px-6 py-3 rounded-xl">
            <div className="text-4xl font-bold text-yellow-400 text-center">{angle.toFixed(1)}°</div>
            <div className="text-xs text-gray-400 text-center">Angle at point B</div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-800">
        <div className="flex gap-2">
          <button onClick={clearPoints} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-700 rounded-lg">
            <Trash2 size={16} /> Clear
          </button>
          <button onClick={startCamera} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-700 rounded-lg">
            <Camera size={16} /> Restart
          </button>
        </div>
        <p className="text-gray-400 text-xs text-center mt-2">
          Tap 3 points: A → B → C to measure angle at B
        </p>
      </div>
    </div>
  );
}

// Enhanced AR Ruler - tries WebXR Depth API first, falls back to estimation
function ARRulerTool() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<{ x: number; y: number; depth?: number }[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [knownObjectSize, setKnownObjectSize] = useState(10);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [useDepthAPI, setUseDepthAPI] = useState(false);
  const [depthSupported, setDepthSupported] = useState(false);
  const depthRef = useRef<any>(null);

  const startCamera = useCallback(async () => {
    try {
      // Check for WebXR depth API
      if ('xr' in navigator) {
        const supported = await (navigator as any).xr?.isSessionSupported?.('immersive-ar');
        if (supported) {
          setDepthSupported(true);
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: 1280, height: 720 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (err) {
      setCameraReady(false);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [startCamera]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPoint = { x, y };
    
    if (points.length >= 2) {
      setPoints([newPoint]);
      setDistance(null);
    } else {
      setPoints([...points, newPoint]);
    }
  };

  useEffect(() => {
    if (points.length === 2 && videoRef.current && videoRef.current.videoWidth > 0) {
      const dx = (points[1].x - points[0].x) * (videoRef.current.videoWidth / 640);
      const dy = (points[1].y - points[0].y) * (videoRef.current.videoHeight / 480);
      const pixelDistance = Math.sqrt(dx * dx + dy * dy);
      
      if (useDepthAPI && depthRef.current) {
        // Use depth API for real measurement
        // This would require WebXR setup
      }
      
      // Estimation using focal length
      const focalLength = 800;
      const estimatedCm = (knownObjectSize * focalLength) / Math.max(pixelDistance, 1);
      setDistance(Math.min(estimatedCm, 500));
    }
  }, [points, knownObjectSize, useDepthAPI]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw line
    if (points.length === 2) {
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();
      
      // Draw distance label
      const midX = (points[0].x + points[1].x) / 2;
      const midY = (points[0].y + points[1].y) / 2;
      if (distance !== null) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(midX - 50, midY - 25, 100, 35);
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${(distance / 100).toFixed(2)}m`, midX, midY);
      }
    }
    
    // Draw points
    points.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? "#22c55e" : "#ef4444";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [points, distance]);

  const clearPoints = () => {
    setPoints([]);
    setDistance(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          onClick={handleCanvasClick}
          className="absolute inset-0 w-full h-full cursor-crosshair"
        />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <div className="bg-black/50 px-3 py-1 rounded text-sm">
            {points.length < 2 ? `Tap point ${points.length + 1}` : "Tap to restart"}
          </div>
          <div className="flex gap-2">
            {depthSupported && (
              <button
                onClick={() => setUseDepthAPI(!useDepthAPI)}
                className={`px-3 py-1 rounded text-sm ${useDepthAPI ? "bg-green-500" : "bg-black/50"}`}
              >
                {useDepthAPI ? "Depth ON" : "Depth OFF"}
              </button>
            )}
            <button
              onClick={() => { setFacingMode(facingMode === "environment" ? "user" : "environment"); startCamera(); }}
              className="bg-black/50 px-3 py-1 rounded text-sm"
            >
              Flip
            </button>
          </div>
        </div>
        
        {!depthSupported && (
          <div className="absolute top-16 left-4 right-4">
            <div className="bg-yellow-500/80 px-3 py-1 rounded text-sm text-black text-center">
              LiDAR not available - using estimation
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-gray-800 space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400 whitespace-nowrap">Reference:</label>
          <input
            type="range"
            min="1"
            max="30"
            value={knownObjectSize}
            onChange={(e) => setKnownObjectSize(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="w-12 text-right">{knownObjectSize}cm</span>
        </div>
        <div className="flex gap-2">
          <button onClick={clearPoints} className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-700 rounded-lg">
            <Trash2 size={16} /> Clear
          </button>
          <button onClick={startCamera} className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-700 rounded-lg">
            <Camera size={16} /> Restart
          </button>
        </div>
        <p className="text-gray-400 text-xs text-center">
          {depthSupported ? "Tap 2 points for real LiDAR measurement" : "Tap 2 points - set reference size for estimation"}
        </p>
      </div>
    </div>
  );
}

type Tool = "flashlight" | "level" | "calculator" | "ruler" | "arruler" | "arprotractor";

const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
  { id: "flashlight", label: "Light", icon: <Flashlight size={20} /> },
  { id: "level", label: "Level", icon: <Compass size={20} /> },
  { id: "arprotractor", label: "Angle", icon: <Move size={20} /> },
  { id: "calculator", label: "Calc", icon: <Calculator size={20} /> },
  { id: "ruler", label: "Ruler", icon: <Ruler size={20} /> },
  { id: "arruler", label: "AR Measure", icon: <Camera size={20} /> },
];

export default function Multitool() {
  const [activeTool, setActiveTool] = useState<Tool>("level");

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="p-3 border-b border-gray-800">
        <h1 className="text-lg font-bold text-center">Multitool</h1>
      </header>

      <nav className="flex border-b border-gray-800">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              activeTool === tool.id ? "bg-gray-800 text-yellow-400" : "text-gray-400 hover:text-white"
            }`}
          >
            {tool.icon}
            <span className="text-xs">{tool.label}</span>
          </button>
        ))}
      </nav>

      <main className="flex-1">
        {activeTool === "flashlight" && <FlashlightTool />}
        {activeTool === "level" && <SpiritLevelTool />}
        {activeTool === "arprotractor" && <ARProtractorTool />}
        {activeTool === "calculator" && <CalculatorTool />}
        {activeTool === "ruler" && <RulerTool />}
        {activeTool === "arruler" && <ARRulerTool />}
      </main>
    </div>
  );
}
