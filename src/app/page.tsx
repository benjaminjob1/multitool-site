"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Flashlight, Compass, Calculator, Ruler, RotateCcw, Camera, Move, Trash2, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";

export default function Multitool() {
  const [activeTool, setActiveTool] = useState<string>("level");
  const [animating, setAnimating] = useState(false);

  const handleToolChange = (toolId: string) => {
    if (toolId === activeTool) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveTool(toolId);
      setAnimating(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 text-white overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
          Multitool
        </h1>
      </header>

      {/* Tool Container */}
      <main className={`relative z-10 transition-all duration-300 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl mx-4 overflow-hidden shadow-2xl">
          {activeTool === "flashlight" && <FlashlightTool />}
          {activeTool === "level" && <LevelTool />}
          {activeTool === "protractor" && <ProtractorTool />}
          {activeTool === "calculator" && <CalculatorTool />}
          {activeTool === "ruler" && <RulerTool />}
          {activeTool === "arruler" && <ARRulerTool />}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="relative z-20 p-4 pb-6">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2 flex justify-around items-center gap-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolChange(tool.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                activeTool === tool.id 
                  ? "bg-gradient-to-b from-purple-500/30 to-purple-600/20 text-white shadow-lg" 
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <div className={`transition-transform duration-200 ${activeTool === tool.id ? 'scale-110' : ''}`}>
                {tool.icon}
              </div>
              <span className="text-[10px] font-medium">{tool.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// Tool definitions
const tools = [
  { id: "flashlight", label: "Light", icon: <Flashlight size={20} /> },
  { id: "level", label: "Level", icon: <Compass size={20} /> },
  { id: "protractor", label: "Angle", icon: <Move size={20} /> },
  { id: "calculator", label: "Calc", icon: <Calculator size={20} /> },
  { id: "ruler", label: "Ruler", icon: <Ruler size={20} /> },
  { id: "arruler", label: "Measure", icon: <Camera size={20} /> },
];

// Flashlight Tool
function FlashlightTool() {
  const [on, setOn] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const toggle = async () => {
    if (on) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setOn(false);
      return;
    }

    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const track = stream.getVideoTracks()[0];
      const caps = track.getCapabilities();
      if (caps && 'torch' in caps) {
        await track.applyConstraints({ advanced: [{ torch: true } as any] });
        streamRef.current = stream;
        setOn(true);
        setError("");
      } else {
        stream.getTracks().forEach(t => t.stop());
        setError("Flashlight not supported");
      }
    } catch {
      setError("Camera access denied");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-6">
      <div 
        className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer active:scale-95 ${
          on 
            ? "bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-[0_0_60px_rgba(250,204,21,0.6)]" 
            : "bg-gradient-to-br from-slate-700 to-slate-800"
        }`}
        onClick={toggle}
      >
        <Flashlight size={56} className={on ? "text-black" : "text-slate-400"} />
      </div>
      
      <button
        onClick={toggle}
        disabled={loading}
        className={`px-8 py-3 rounded-full font-semibold transition-all duration-200 active:scale-95 ${
          on 
            ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" 
            : "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black"
        } ${loading ? 'opacity-50' : ''}`}
      >
        {loading ? "..." : on ? "Tap to Turn Off" : "Tap to Turn On"}
      </button>

      {error && (
        <p className="text-red-400 text-sm text-center bg-red-500/10 px-4 py-2 rounded-full">{error}</p>
      )}
    </div>
  );
}

// Level Tool with beautiful bubble
function LevelTool() {
  const [roll, setRoll] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [calibrated, setCalibrated] = useState({ roll: 0, pitch: 0 });
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [sound, setSound] = useState(false);
  const calibratedRef = useRef({ roll: 0, pitch: 0 });
  const lastBeepRef = useRef(0);

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      if (e.gamma === null) return;
      const newRoll = e.gamma - calibratedRef.current.roll;
      const newPitch = e.beta !== null ? e.beta - calibratedRef.current.pitch : 0;
      setRoll(newRoll);
      setPitch(newPitch);
      setHasPermission(true);
      
      // Sound feedback when nearly level
      const overall = Math.sqrt(newRoll * newRoll + newPitch * newPitch);
      if (sound && overall < 2 && Date.now() - lastBeepRef.current > 500) {
        lastBeepRef.current = Date.now();
      }
    };
    
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, [sound]);

  const calibrate = () => {
    calibratedRef.current = { roll, pitch };
  };

  const overall = Math.sqrt(roll * roll + pitch * pitch);
  const isLevel = overall < 2;
  const bubbleColor = isLevel ? "#22c55e" : overall < 5 ? "#eab308" : "#ef4444";

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
      {hasPermission === false ? (
        <div className="text-center text-slate-400">
          <Compass size={48} className="mx-auto mb-4 opacity-50" />
          <p>Motion sensors not available</p>
        </div>
      ) : (
        <>
          {/* Beautiful bubble level */}
          <div className="relative w-52 h-52 rounded-full border-4 border-white/20 bg-slate-800/50 backdrop-blur overflow-hidden shadow-inner">
            {/* Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-white/10" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="h-full w-px bg-white/10" />
              </div>
            </div>
            
            {/* Center target */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-green-400/50" />
            
            {/* Bubble */}
            <div 
              className="absolute w-16 h-16 rounded-full transition-all duration-100 ease-out shadow-lg"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${bubbleColor}cc, ${bubbleColor})`,
                top: `calc(50% + ${Math.min(Math.max(pitch * 3, -80), 80)}px - 32px)`,
                left: `calc(50% + ${Math.min(Math.max(roll * 3, -80), 80)}px - 32px)`,
                boxShadow: `0 0 20px ${bubbleColor}88`
              }}
            />
          </div>

          {/* Readings */}
          <div className="grid grid-cols-2 gap-6 text-center">
            <div className="bg-white/5 rounded-xl p-3 backdrop-blur">
              <div className="text-xs text-slate-400 mb-1">Horizontal</div>
              <div className={`text-2xl font-mono font-bold ${Math.abs(roll) < 2 ? 'text-green-400' : 'text-white'}`}>
                {roll.toFixed(1)}°
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 backdrop-blur">
              <div className="text-xs text-slate-400 mb-1">Vertical</div>
              <div className={`text-2xl font-mono font-bold ${Math.abs(pitch) < 2 ? 'text-green-400' : 'text-white'}`}>
                {pitch.toFixed(1)}°
              </div>
            </div>
          </div>

          {/* Level indicator */}
          <div className={`text-3xl font-bold ${isLevel ? 'text-green-400 animate-pulse' : 'text-slate-400'}`}>
            {isLevel ? "✦ LEVEL ✦" : `${overall.toFixed(1)}° off`}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={calibrate}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur transition-all"
            >
              <RotateCcw size={16} /> Zero
            </button>
            <button
              onClick={() => setSound(!sound)}
              className={`p-2.5 rounded-xl backdrop-blur transition-all ${sound ? 'bg-green-500/30' : 'bg-white/10'}`}
            >
              {sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
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

  const clear = () => {
    setDisplay("0");
    setPrevious(null);
    setOperator(null);
    setWaitForOperand(false);
  };

  const calculate = () => {
    if (!previous || !operator) return;
    const prev = parseFloat(previous);
    const curr = parseFloat(display);
    let result = 0;
    switch (operator) {
      case "+": result = prev + curr; break;
      case "-": result = prev - curr; break;
      case "*": result = prev * curr; break;
      case "/": result = curr !== 0 ? prev / curr : 0; break;
    }
    setDisplay(result.toString().slice(0, 12).replace(/\.0+$/, ''));
    setPrevious(null);
    setOperator(null);
    setWaitForOperand(true);
  };

  const performOp = (op: string) => {
    if (operator && !waitForOperand) calculate();
    setPrevious(display);
    setOperator(op);
    setWaitForOperand(true);
  };

  const buttons = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  return (
    <div className="p-4 flex flex-col gap-2">
      <div className="bg-slate-800/80 rounded-2xl p-4 mb-2 backdrop-blur">
        <div className="text-slate-400 text-sm h-6">{previous} {operator}</div>
        <div className="text-white text-4xl font-mono text-right truncate">{display}</div>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {buttons.flat().map((btn, i) => {
          const isOp = ["÷", "×", "−", "+", "="].includes(btn);
          const isNum = !isOp && !["C", "±", "%", "."].includes(btn);
          
          return (
            <button
              key={i}
              onClick={() => {
                if (isNum) inputDigit(btn);
                else if (btn === "C") clear();
                else if (btn === ".") setDisplay(d => d.includes(".") ? d : d + ".");
                else if (btn === "±") setDisplay(d => (parseFloat(d) * -1).toString());
                else if (btn === "%") setDisplay(d => (parseFloat(d) / 100).toString());
                else if (btn === "=") calculate();
                else performOp(btn);
              }}
              className={`
                aspect-square rounded-2xl text-xl font-semibold transition-all active:scale-95
                ${isOp ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600" : 
                  btn === "C" ? "bg-slate-700 text-slate-300" :
                  "bg-white/10 hover:bg-white/20 text-white"}
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

// Ruler Tool
function RulerTool() {
  const [cm, setCm] = useState(15);
  const pxPerCm = 40;

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setCm(Math.max(5, cm - 5))} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl text-lg font-bold backdrop-blur">-5</button>
        <button onClick={() => setCm(Math.max(1, cm - 1))} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl text-lg font-bold backdrop-blur">-</button>
        <div className="text-2xl font-bold w-20 text-center">{cm} cm</div>
        <button onClick={() => setCm(Math.min(50, cm + 1))} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl text-lg font-bold backdrop-blur">+</button>
        <button onClick={() => setCm(Math.min(50, cm + 5))} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl text-lg font-bold backdrop-blur">+5</button>
      </div>

      <div className="w-full overflow-x-auto pb-4">
        <div className="inline-block" style={{ width: cm * pxPerCm }}>
          <div className="h-24 bg-white rounded-lg border-2 border-slate-300 relative overflow-hidden shadow-lg">
            {Array.from({ length: cm + 1 }).map((_, i) => (
              <div key={i} className="absolute top-0 h-full flex flex-col">
                <div className="w-px h-full bg-slate-800" />
                <span className="text-xs text-slate-600 absolute top-1 left-0.5">{i}</span>
              </div>
            ))}
            {Array.from({ length: cm * 10 }).map((_, i) => {
              if (i % 10 === 0) return null;
              const mm = i % 10;
              return (
                <div
                  key={i}
                  className="absolute top-0 bg-slate-500"
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

      <p className="text-slate-400 text-sm text-center">Place your device against an object to measure</p>
    </div>
  );
}

// AR Ruler Tool - Camera based
function ARRulerTool() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<{x: number; y: number}[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [refSize, setRefSize] = useState(10); // cm
  const [cameraReady, setCameraReady] = useState(false);
  const [useFront, setUseFront] = useState(false);

  useEffect(() => {
    let stream: MediaStream;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: useFront ? "user" : "environment", width: 1280, height: 720 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraReady(true);
        }
      } catch {
        setCameraReady(false);
      }
    };
    
    startCamera();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [useFront]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (points.length >= 2) {
      setPoints([{x, y}]);
      setDistance(null);
    } else {
      setPoints(prev => [...prev, {x, y}]);
    }
  };

  useEffect(() => {
    if (points.length === 2 && videoRef.current?.videoWidth) {
      const dx = points[1].x - points[0].x;
      const dy = points[1].y - points[0].y;
      const px = Math.sqrt(dx*dx + dy*dy);
      const focal = 800;
      const cmVal = (refSize * focal) / px;
      setDistance(cmVal);
    }

    // Draw
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !videoRef.current) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (points.length === 2) {
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();
      
      const mx = (points[0].x + points[1].x) / 2;
      const my = (points[0].y + points[1].y) / 2;
      
      if (distance) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(mx - 50, my - 25, 100, 40);
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${(distance / 100).toFixed(2)}m`, mx, my + 6);
      }
    }
    
    points.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? "#22c55e" : "#ef4444";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [points, distance]);

  const clear = () => { setPoints([]); setDistance(null); };

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 bg-black min-h-[300px]">
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
          height={360}
          onClick={handleClick}
          className="absolute inset-0 w-full h-full cursor-crosshair"
        />
        
        <div className="absolute top-3 left-3 right-3 flex justify-between">
          <span className="bg-black/50 px-3 py-1 rounded-full text-sm backdrop-blur">
            {points.length < 2 ? `Tap point ${points.length + 1}` : "Tap to restart"}
          </span>
          <button
            onClick={() => setUseFront(!useFront)}
            className="bg-black/50 px-3 py-1 rounded-full text-sm backdrop-blur"
          >
            {useFront ? "Back" : "Front"} cam
          </button>
        </div>
        
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <Camera size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-slate-400">Camera unavailable</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-800/80 space-y-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400 whitespace-nowrap">Reference:</span>
          <input
            type="range"
            min="1"
            max="30"
            value={refSize}
            onChange={(e) => setRefSize(Number(e.target.value))}
            className="flex-1 accent-orange-400"
          />
          <span className="w-12 text-right font-mono">{refSize}cm</span>
        </div>
        <button
          onClick={clear}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur"
        >
          <Trash2 size={18} /> Clear
        </button>
      </div>
    </div>
  );
}

// Protractor Tool
function ProtractorTool() {
  const [angle, setAngle] = useState(0);
  const [calibrated, setCalibrated] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const calibratedRef = useRef(0);

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      if (e.alpha === null) return;
      let a = e.alpha - calibratedRef.current;
      if (a < 0) a += 360;
      if (a > 180) a -= 360;
      setAngle(a);
      setHasPermission(true);
    };
    
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, []);

  const calibrate = () => {
    const handler = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        calibratedRef.current = e.alpha;
        setCalibrated(e.alpha);
        window.removeEventListener("deviceorientation", handler);
      }
    };
    window.addEventListener("deviceorientation", handler);
    setTimeout(() => window.removeEventListener("deviceorientation", handler), 100);
  };

  const absAngle = Math.abs(angle);
  const color = absAngle < 2 ? "text-green-400" : absAngle < 10 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-6">
      {hasPermission === false ? (
        <div className="text-center text-slate-400">
          <Move size={48} className="mx-auto mb-4 opacity-50" />
          <p>Compass not available</p>
        </div>
      ) : (
        <>
          {/* Visual arc */}
          <div className="relative w-64">
            <svg viewBox="0 0 200 110" className="w-full">
              <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#374151" strokeWidth="8" />
              {Array.from({length: 37}).map((_, i) => {
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
                      <text x={100 + 52 * Math.cos(rad)} y={100 + 52 * Math.sin(rad)} fill="#9ca3af" fontSize="8" textAnchor="middle" dominantBaseline="middle">
                        {deg}
                      </text>
                    )}
                  </g>
                );
              })}
              <line
                x1="100" y1="100"
                x2={100 + 70 * Math.cos((angle - 90) * Math.PI / 180)}
                y2={100 + 70 * Math.sin((angle - 90) * Math.PI / 180)}
                stroke="#fbbf24" strokeWidth="3"
              />
              <circle cx="100" cy="100" r="5" fill="#fbbf24" />
            </svg>
          </div>

          <div className="text-center">
            <div className={`text-6xl font-mono font-bold ${color}`}>{angle.toFixed(1)}°</div>
            <div className="text-slate-400 mt-2">{absAngle < 2 ? "Perfect angle!" : `${absAngle.toFixed(1)}° off`}</div>
          </div>

          <button
            onClick={calibrate}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur"
          >
            <RotateCcw size={18} /> Calibrate
          </button>
        </>
      )}
    </div>
  );
}
