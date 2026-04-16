"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Flashlight, Compass, Calculator, Ruler, RotateCcw, Camera, Move, Trash2 } from "lucide-react";

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
          {/* Bubble level indicator */}
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

          {/* Numeric displays */}
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
  
  const pxPerCm = 38; // Approximate pixels per cm at typical viewing distance
  
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setLength(Math.max(5, length - 5))}
          className="w-12 h-12 bg-gray-700 rounded-xl text-xl"
        >
          -5
        </button>
        <button
          onClick={() => setLength(Math.max(1, length - 1))}
          className="w-12 h-12 bg-gray-700 rounded-xl text-xl"
        >
          -
        </button>
        <div className="text-2xl font-bold w-24 text-center">{length} cm</div>
        <button
          onClick={() => setLength(Math.min(50, length + 1))}
          className="w-12 h-12 bg-gray-700 rounded-xl text-xl"
        >
          +
        </button>
        <button
          onClick={() => setLength(Math.min(50, length + 5))}
          className="w-12 h-12 bg-gray-700 rounded-xl text-xl"
        >
          +5
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <div className="inline-block min-w-full" style={{ width: length * pxPerCm }}>
          {/* Ruler body */}
          <div className="h-20 bg-gray-100 rounded-lg border-2 border-gray-400 relative overflow-hidden">
            {/* CM markings */}
            {Array.from({ length: length + 1 }).map((_, i) => (
              <div key={i} className="absolute top-0 h-full flex flex-col">
                <div className="w-px h-full bg-gray-800" />
                <span className="text-xs text-gray-600 absolute top-1 -translate-x-1/2">{i}</span>
              </div>
            ))}
            {/* MM markings */}
            {Array.from({ length: length * 10 }).map((_, i) => {
              if (i % 10 === 0) return null;
              const cm = Math.floor(i / 10);
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

// AR Ruler Tool
function ARRulerTool() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [knownObjectSize, setKnownObjectSize] = useState(10); // cm, default credit card width
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: 1280, height: 720 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
        setCameraError("");
      }
    } catch (err) {
      setCameraError("Could not access camera");
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
    
    if (points.length >= 2) {
      setPoints([{ x, y }]);
      setDistance(null);
    } else {
      setPoints([...points, { x, y }]);
    }
  };

  useEffect(() => {
    if (points.length === 2 && videoRef.current && videoRef.current.videoWidth > 0) {
      const dx = (points[1].x - points[0].x) * (videoRef.current.videoWidth / 640);
      const dy = (points[1].y - points[0].y) * (videoRef.current.videoHeight / 480);
      const pixelDistance = Math.sqrt(dx * dx + dy * dy);
      const focalLength = 800;
      const estimatedCm = (knownObjectSize * focalLength) / Math.max(pixelDistance, 1);
      setDistance(Math.min(estimatedCm, 500));
    }
  }, [points, knownObjectSize]);

  const drawPoints = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw line between points
    if (points.length === 2) {
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();
    }
    
    // Draw points
    points.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? "#22c55e" : "#ef4444";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(i === 0 ? "Start" : "End", p.x, p.y - 15);
    });
    
    // Draw distance if available
    if (distance !== null && points.length === 2) {
      const midX = (points[0].x + points[1].x) / 2;
      const midY = (points[0].y + points[1].y) / 2;
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(midX - 40, midY - 30, 80, 30);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(`${(distance / 100).toFixed(2)}m`, midX, midY - 10);
    }
  }, [points, distance]);

  useEffect(() => {
    const interval = setInterval(drawPoints, 16);
    return () => clearInterval(interval);
  }, [drawPoints]);

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
        
        {/* Overlay info */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <div className="bg-black/50 px-3 py-1 rounded text-sm">
            Tap 2 points to measure
          </div>
          <button
            onClick={() => {
              setFacingMode(facingMode === "environment" ? "user" : "environment");
              startCamera();
            }}
            className="bg-black/50 px-3 py-1 rounded text-sm"
          >
            Flip Camera
          </button>
        </div>
        
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <p className="text-red-400">{cameraError}</p>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="p-4 bg-gray-800 space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Reference size:</label>
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
          <button
            onClick={clearPoints}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-700 rounded-lg"
          >
            <Trash2 size={16} /> Clear
          </button>
          <button
            onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-700 rounded-lg"
          >
            <Camera size={16} /> Restart
          </button>
        </div>
      </div>
    </div>
  );
}

// Protractor Tool
function ProtractorTool() {
  const [angle, setAngle] = useState(0);
  const [calibrated, setCalibrated] = useState(0);
  const [hasSupport, setHasSupport] = useState(false);

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        let compassAngle = e.alpha - calibrated;
        if (compassAngle < 0) compassAngle += 360;
        if (compassAngle > 180) compassAngle -= 360;
        setAngle(compassAngle);
        setHasSupport(true);
      }
    };
    
    // Request permission for device orientation
    if (typeof DeviceOrientationEvent !== "undefined" && typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      (DeviceOrientationEvent as any).requestPermission().then((response: string) => {
        if (response === "granted") {
          window.addEventListener("deviceorientation", handler);
        }
      });
    } else {
      window.addEventListener("deviceorientation", handler);
    }
    
    return () => window.removeEventListener("deviceorientation", handler);
  }, [calibrated]);

  const calibrate = () => {
    const handler = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setCalibrated(e.alpha);
        window.removeEventListener("deviceorientation", handler);
      }
    };
    window.addEventListener("deviceorientation", handler);
    // Auto-calibrate after 100ms
    setTimeout(() => setCalibrated((prev: number) => prev + 0), 100);
  };

  const absAngle = Math.abs(angle);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      {!hasSupport ? (
        <p className="text-gray-400">Compass not available on this device</p>
      ) : (
        <>
          {/* Visual protractor */}
          <div className="relative w-64 h-32 overflow-hidden">
            {/* Protractor arc */}
            <svg viewBox="0 0 200 100" className="w-full h-full">
              {/* Background arc */}
              <path
                d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none"
                stroke="#374151"
                strokeWidth="8"
              />
              {/* Degree markings */}
              {Array.from({ length: 37 }).map((_, i) => {
                const deg = i * 5;
                const rad = (deg - 90) * Math.PI / 180;
                const x1 = 100 + 80 * Math.cos(rad);
                const y1 = 100 + 80 * Math.sin(rad);
                const x2 = 100 + (deg % 30 === 0 ? 65 : 72) * Math.cos(rad);
                const y2 = 100 + (deg % 30 === 0 ? 65 : 72) * Math.sin(rad);
                return (
                  <g key={deg}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6b7280" strokeWidth={deg % 90 === 0 ? 2 : 1} />
                    {deg % 30 === 0 && (
                      <text x={100 + 50 * Math.cos(rad)} y={100 + 50 * Math.sin(rad)} fill="#9ca3af" fontSize="8" textAnchor="middle" dominantBaseline="middle">
                        {deg}
                      </text>
                    )}
                  </g>
                );
              })}
              {/* Current angle indicator */}
              <line
                x1="100"
                y1="100"
                x2={100 + 70 * Math.cos((angle - 90) * Math.PI / 180)}
                y2={100 + 70 * Math.sin((angle - 90) * Math.PI / 180)}
                stroke="#fbbf24"
                strokeWidth="3"
              />
              {/* Center dot */}
              <circle cx="100" cy="100" r="4" fill="#fbbf24" />
            </svg>
          </div>

          {/* Numeric display */}
          <div className="text-center">
            <div className={`text-6xl font-mono font-bold ${absAngle < 2 ? "text-green-400" : absAngle < 10 ? "text-yellow-400" : "text-red-400"}`}>
              {angle.toFixed(1)}°
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {absAngle < 2 ? "Perfect!" : absAngle < 10 ? "Close" : `${absAngle.toFixed(1)}° off`}
            </p>
          </div>

          <button
            onClick={calibrate}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl"
          >
            <RotateCcw size={18} /> Calibrate to 0°
          </button>
        </>
      )}
    </div>
  );
}

type Tool = "flashlight" | "level" | "calculator" | "ruler" | "arruler" | "protractor";

const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
  { id: "flashlight", label: "Light", icon: <Flashlight size={20} /> },
  { id: "level", label: "Level", icon: <Compass size={20} /> },
  { id: "protractor", label: "Angle", icon: <Move size={20} /> },
  { id: "calculator", label: "Calc", icon: <Calculator size={20} /> },
  { id: "ruler", label: "Ruler", icon: <Ruler size={20} /> },
  { id: "arruler", label: "AR Measure", icon: <Camera size={20} /> },
];

export default function Multitool() {
  const [activeTool, setActiveTool] = useState<Tool>("level");

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="p-3 border-b border-gray-800">
        <h1 className="text-lg font-bold text-center">Multitool</h1>
      </header>

      {/* Tool Selector */}
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

      {/* Tool Content */}
      <main className="flex-1">
        {activeTool === "flashlight" && <FlashlightTool />}
        {activeTool === "level" && <SpiritLevelTool />}
        {activeTool === "protractor" && <ProtractorTool />}
        {activeTool === "calculator" && <CalculatorTool />}
        {activeTool === "ruler" && <RulerTool />}
        {activeTool === "arruler" && <ARRulerTool />}
      </main>
    </div>
  );
}
