"use client";

import { useState } from "react";
import { Flashlight, Compass, Calculator, Ruler, RotateCcw } from "lucide-react";

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
      if (track.getCapabilities() && ('torch' in track.getCapabilities()!)) {
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
  const [supported, setSupported] = useState(true);

  if (typeof window !== "undefined" && window.DeviceOrientationEvent && !supported) {
    window.addEventListener("deviceorientation", (e) => {
      if (e.gamma !== null && e.beta !== null) {
        setRoll(e.gamma - calibrated.roll);
        setPitch(e.beta - calibrated.pitch);
      }
    });
    setSupported(true);
  }

  const calibrate = () => {
    setCalibrated({ roll, pitch });
  };

  const levelColor = (value: number) => {
    const abs = Math.abs(value);
    if (abs < 1) return "text-green-400";
    if (abs < 5) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
      {/* Horizontal indicator */}
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">Horizontal (Roll)</p>
        <div className={`text-6xl font-mono font-bold ${levelColor(roll)}`}>
          {roll.toFixed(1)}°
        </div>
        <div className="w-64 h-2 bg-gray-700 rounded-full mt-2 relative overflow-hidden">
          <div 
            className="absolute top-0 left-1/2 w-1 h-full bg-green-400 transform -translate-x-1/2 transition-all"
            style={{ transform: `translateX(calc(-50% + ${Math.max(-30, Math.min(30, roll)) * 5}px)` }}
          />
          <div 
            className="absolute top-0 h-full bg-yellow-400 transition-all"
            style={{ 
              left: "50%", 
              width: `${Math.max(0, 50 - Math.abs(roll))}%`,
              transform: "translateX(-50%)"
            }}
          />
        </div>
      </div>

      {/* Vertical indicator */}
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">Vertical (Pitch)</p>
        <div className={`text-6xl font-mono font-bold ${levelColor(pitch)}`}>
          {pitch.toFixed(1)}°
        </div>
        <div className="w-64 h-2 bg-gray-700 rounded-full mt-2 relative overflow-hidden">
          <div 
            className="absolute top-0 left-1/2 w-1 h-full bg-green-400 transform -translate-x-1/2 transition-all"
            style={{ transform: `translateX(calc(-50% + ${Math.max(-30, Math.min(30, pitch)) * 5}px)` }}
          />
          <div 
            className="absolute top-0 h-full bg-yellow-400 transition-all"
            style={{ 
              left: "50%", 
              width: `${Math.max(0, 50 - Math.abs(pitch))}%`,
              transform: "translateX(-50%)"
            }}
          />
        </div>
      </div>

      {/* Flat indicator */}
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">Level</p>
        <div className={`text-4xl font-bold ${levelColor(Math.sqrt(roll*roll + pitch*pitch))}`}>
          {Math.sqrt(roll*roll + pitch*pitch).toFixed(1)}°
        </div>
      </div>

      <button
        onClick={calibrate}
        className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl"
      >
        <RotateCcw size={18} /> Calibrate / Zero
      </button>
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

    setDisplay(result.toString());
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
          const isZero = btn === "0";
          const isEquals = btn === "=";
          
          return (
            <button
              key={i}
              onClick={() => {
                if (isNumber) inputDigit(btn);
                else if (btn === ".") inputDecimal();
                else if (btn === "C") clear();
                else if (btn === "±") setDisplay((parseFloat(display) * -1).toString());
                else if (btn === "%") setDisplay((parseFloat(display) / 100).toString());
                else if (isEquals) calculate();
                else performOp(btn);
              }}
              className={`
                ${isNumber ? "bg-gray-700 hover:bg-gray-600" : "bg-orange-500 hover:bg-orange-400 text-white"}
                ${isEquals ? "col-span-1" : ""}
                ${isZero ? "col-span-1" : ""}
                aspect-square rounded-xl text-2xl font-semibold transition-colors
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
  const [length, setLength] = useState(10);
  
  const cmToPx = (cm: number) => (cm / 2.54) * 96;
  
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setLength(Math.max(1, length - 1))}
          className="w-12 h-12 bg-gray-700 rounded-xl text-2xl"
        >
          -
        </button>
        <div className="text-3xl font-bold w-20 text-center">{length} cm</div>
        <button
          onClick={() => setLength(Math.min(50, length + 1))}
          className="w-12 h-12 bg-gray-700 rounded-xl text-2xl"
        >
          +
        </button>
      </div>

      <div className="relative" style={{ width: cmToPx(length) }}>
        {/* Ruler body */}
        <div className="h-16 bg-gray-200 rounded border-2 border-gray-400 relative">
          {/* Markings */}
          {Array.from({ length: length * 10 + 1 }).map((_, i) => {
            const cm = Math.floor(i / 10);
            const mm = i % 10;
            const isCm = mm === 0;
            const height = isCm ? 16 : mm === 5 ? 12 : 8;
            
            return (
              <div
                key={i}
                className={`absolute top-0 w-px bg-gray-800`}
                style={{ 
                  left: `${(i / 10) * (cmToPx(1))}px`,
                  height: `${height}px`
                }}
              />
            );
          })}
        </div>
        
        {/* Labels */}
        <div className="flex justify-between text-xs text-gray-600 mt-1" style={{ width: cmToPx(length) }}>
          {Array.from({ length: length + 1 }).map((_, i) => (
            <span key={i}>{i}</span>
          ))}
        </div>
      </div>

      <p className="text-gray-400 text-sm text-center">
        Place your phone against an object to measure
      </p>
    </div>
  );
}

type Tool = "flashlight" | "level" | "calculator" | "ruler";

const tools: { id: Tool; label: string; icon: React.ReactNode }[] = [
  { id: "flashlight", label: "Flashlight", icon: <Flashlight size={24} /> },
  { id: "level", label: "Spirit Level", icon: <Compass size={24} /> },
  { id: "calculator", label: "Calculator", icon: <Calculator size={24} /> },
  { id: "ruler", label: "Ruler", icon: <Ruler size={24} /> },
];

export default function Multitool() {
  const [activeTool, setActiveTool] = useState<Tool>("flashlight");

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-center">Multitool</h1>
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
      <main className="h-[calc(100vh-120px)]">
        {activeTool === "flashlight" && <FlashlightTool />}
        {activeTool === "level" && <SpiritLevelTool />}
        {activeTool === "calculator" && <CalculatorTool />}
        {activeTool === "ruler" && <RulerTool />}
      </main>
    </div>
  );
}
