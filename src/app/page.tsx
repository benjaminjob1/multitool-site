"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Flashlight, Compass, Calculator, Ruler, RotateCcw, Camera, Move, Trash2, Settings, X, RefreshCw, Eye, EyeOff } from "lucide-react";

interface ToolSettings { accent: string; glow: string; brightness: number; }

export default function Multitool() {
  const [activeTool, setActiveTool] = useState<string>("level");
  const [showSettings, setShowSettings] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [settings, setSettings] = useState<ToolSettings>({ accent: "#8b5cf6", glow: "#a855f7", brightness: 0.85 });

  useEffect(() => { const s = localStorage.getItem("mt-settings"); if (s) try { setSettings(JSON.parse(s)); } catch {} }, []);
  const saveSettings = (k: keyof ToolSettings, v: string | number) => { const n = {...settings, [k]: v}; setSettings(n); localStorage.setItem("mt-settings", JSON.stringify(n)); };
  const switchTool = (id: string) => { if (id === activeTool) return; setActiveTool(id); };

  return (
    <div className="min-h-screen text-white flex flex-col" style={{ backgroundColor: "rgb(0,0,0)", filter: `brightness(${settings.brightness})` }}>
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
          <div className="w-72 rounded-2xl p-5 border backdrop-blur-xl" style={{ backgroundColor: "rgba(10,10,10,0.98)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-2 rounded-lg hover:bg-white/10"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Accent</label>
                <div className="flex gap-2">
                  <input type="color" value={settings.accent} onChange={e => saveSettings("accent", e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer border-0" />
                  <input type="text" value={settings.accent} onChange={e => saveSettings("accent", e.target.value)} className="flex-1 px-3 rounded-lg text-sm font-mono border" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Glow</label>
                <div className="flex gap-2">
                  <input type="color" value={settings.glow} onChange={e => saveSettings("glow", e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer border-0" />
                  <input type="text" value={settings.glow} onChange={e => saveSettings("glow", e.target.value)} className="flex-1 px-3 rounded-lg text-sm font-mono border" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Brightness {Math.round(settings.brightness * 100)}%</label>
                <input type="range" min="0.3" max="1" step="0.05" value={settings.brightness} onChange={e => saveSettings("brightness", parseFloat(e.target.value))} className="w-full" style={{ accentColor: settings.accent }} />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {[{n:"Purple",a:"#8b5cf6",g:"#a855f7"},{n:"Blue",a:"#3b82f6",g:"#60a5fa"},{n:"Green",a:"#22c55e",g:"#4ade80"},{n:"Orange",a:"#f97316",g:"#fb923c"},{n:"Red",a:"#ef4444",g:"#f87171"},{n:"Pink",a:"#ec4899",g:"#f472b6"}].map(p => (
                  <button key={p.n} onClick={() => { saveSettings("accent", p.a); saveSettings("glow", p.g); }} className="p-2 rounded-lg text-xs border border-white/5 hover:bg-white/5 transition-all">
                    <div className="flex gap-1 justify-center mb-1"><div className="w-3 h-3 rounded-full" style={{backgroundColor:p.a}} /><div className="w-3 h-3 rounded-full" style={{backgroundColor:p.g}} /></div>
                    {p.n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="relative z-10 p-4 flex justify-between items-center shrink-0">
        <h1 className="text-2xl font-bold" style={{ color: settings.accent }}>Multitool</h1>
        <button onClick={() => setShowSettings(true)} className="p-2 rounded-xl hover:bg-white/10"><Settings size={22} /></button>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="rounded-3xl mx-4 mb-4 overflow-hidden border" style={{ backgroundColor: "rgba(8,8,8,0.95)", borderColor: "rgba(255,255,255,0.05)", boxShadow: `0 0 80px ${settings.glow}11` }}>
          {activeTool === "flashlight" && <FlashlightTool s={settings} />}
          {activeTool === "level" && <LevelAngleTool s={settings} />}
          {activeTool === "calculator" && <CalculatorTool s={settings} />}
          {activeTool === "ruler" && <RulerTool />}
          {activeTool === "arruler" && <ARRulerTool s={settings} />}
        </div>
      </main>

      <button onClick={() => setShowNav(!showNav)} className="fixed z-30 p-2 rounded-xl border" style={{ bottom: "inherit", top: "1rem", left: "0.5rem", backgroundColor: "rgba(8,8,8,0.98)", borderColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
        {showNav ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>

      {showNav && (
      <nav className="fixed left-2 right-2 z-20 flex items-center rounded-xl border portrait:bottom-24 landscape:bottom-6" style={{ backgroundColor: "rgba(8,8,8,0.98)", borderColor: "rgba(255,255,255,0.05)" }}>
          {[{id:"flashlight",l:"Light",i:<Flashlight size={20} />},{id:"level",l:"Level",i:<Compass size={20} />},{id:"calculator",l:"Calc",i:<Calculator size={20} />},{id:"ruler",l:"Ruler",i:<Ruler size={20} />},{id:"arruler",l:"Measure",i:<Camera size={20} />}].map(t => (
            <button key={t.id} onClick={() => switchTool(t.id)} className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all" style={activeTool === t.id ? {background:`linear-gradient(to bottom,${settings.accent}22,${settings.glow}11)`,color:"white"} : {color:"rgba(255,255,255,0.35)"}}>
              <span style={activeTool === t.id ? {color:settings.accent,transform:"scale(1.1)"} : {}}>{t.i}</span>
              <span className="text-[10px] font-medium">{t.l}</span>
            </button>
          ))}
      </nav>
      )}
    </div>
  );
}

// Combined Level + Angle Tool
function LevelAngleTool({s}: {s: ToolSettings}) {
  const [mode, setMode] = useState<"level"|"angle">("level");
  const modeRef = useRef(mode);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  const [roll, setRoll] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [angle, setAngle] = useState(0);
  const [perm, setPerm] = useState<boolean|null>(null);
  const [landscape, setLandscape] = useState(false);
  const calRef = useRef({roll:0, pitch:0}); const angleCalRef = useRef(0);

  // Detect landscape orientation
  useEffect(() => {
    const check = () => setLandscape(window.innerWidth > window.innerHeight);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const reqPerm = async () => {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      try { const p = await (DeviceOrientationEvent as any).requestPermission(); setPerm(p === "granted"); } catch { setPerm(false); }
    } else { setPerm(true); }
  };

  useEffect(() => {
    if (!perm) return;
    let currentLandscape = landscape;
    const h = (e: DeviceOrientationEvent) => {
      if (e.gamma === null && e.alpha === null) return;
      // Spirit Level: gamma controls horizontal (roll), beta controls vertical (pitch)
      // This works correctly in both portrait and landscape since device axes are absolute
      if (e.gamma !== null) setRoll(e.gamma - calRef.current.roll);
      setPitch((e.beta ?? 0) - calRef.current.pitch);
      if (e.gamma !== null) { let a = e.gamma - angleCalRef.current; if (a < 0) a += 360; if (a > 180) a -= 360; setAngle(a); }
    };
    window.addEventListener("deviceorientation", h, true);
    return () => window.removeEventListener("deviceorientation", h, true);
  }, [perm, landscape]);

  const rollRef = useRef(roll); const pitchRef = useRef(pitch); const angleRef = useRef(angle);
  useEffect(() => { rollRef.current = roll; pitchRef.current = pitch; }, [roll, pitch]);
  useEffect(() => { angleRef.current = angle; }, [angle]);

  const calibrateLevel = useCallback(() => { setTimeout(() => { calRef.current = { roll: rollRef.current, pitch: pitchRef.current }; }, 100); }, []);
  const resetLevel = useCallback(() => { calRef.current = { roll: 0, pitch: 0 }; }, []);
  const calibrateAngle = useCallback(() => { setTimeout(() => { angleCalRef.current = angleRef.current; }, 100); }, []);
  const resetAngle = useCallback(() => { angleCalRef.current = 0; }, []);

  const off = Math.sqrt(roll*roll + pitch*pitch);
  const lvl = off < 2;
  const col = lvl ? "#22c55e" : off < 5 ? s.accent : "#ef4444";
  const absAngle = Math.abs(angle);
  const angCol = absAngle < 2 ? "#22c55e" : absAngle < 10 ? s.accent : "#ef4444";

  if (perm === null) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4 cursor-pointer" onClick={reqPerm}>
      <Move size={48} style={{color:"rgba(255,255,255,0.2)"}} />
      <p style={{color:"rgba(255,255,255,0.4)"}}>Tap to enable motion sensors</p>
      <p className="text-xs" style={{color:"rgba(255,255,255,0.25)"}}>Required for Level and Plumb features</p>
    </div>
  );

  if (perm === false) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Move size={48} style={{color:"rgba(239,68,68,0.5)"}} />
      <p style={{color:"#ef4444"}}>Motion sensors denied</p>
      <p className="text-sm" style={{color:"rgba(255,255,255,0.4)"}}>Enable in Settings &gt; Safari &gt; Motion</p>
      <button onClick={reqPerm} className="px-6 py-2 rounded-full font-semibold border" style={{backgroundColor:`${s.accent}18`,borderColor:`${s.accent}50`,color:s.accent}}>Try Again</button>
    </div>
  );

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode("angle")} className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all" style={mode === "angle" ? {backgroundColor:`${s.accent}22`,borderColor:s.accent,color:s.accent} : {borderColor:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)"}}>
          <Compass size={18} />Spirit Level
        </button>
        <button onClick={() => setMode("level")} className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-all" style={mode === "level" ? {backgroundColor:`${s.accent}22`,borderColor:s.accent,color:s.accent} : {borderColor:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)"}}>
          <Move size={18} />Plumb
        </button>
      </div>

      {mode === "level" ? (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="relative w-52 h-52 rounded-full border overflow-hidden" style={{backgroundColor:"rgba(12,12,12,0.9)",borderColor:"rgba(255,255,255,0.08)"}}>
            <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-px" style={{backgroundColor:"rgba(255,255,255,0.06)"}} /><div className="absolute inset-0 flex flex-col items-center justify-center"><div className="h-full w-px" style={{backgroundColor:"rgba(255,255,255,0.06)"}} /></div></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border" style={{borderColor:"rgba(34,197,94,0.4)"}} />
            <div className="absolute w-16 h-16 rounded-full transition-all duration-100" style={{background:`radial-gradient(circle at 30% 30%,${col}cc,${col})`,top:`calc(50% + ${Math.min(Math.max(pitch*3,-80),80)}px - 32px)`,left:`calc(50% + ${Math.min(Math.max(roll*3,-80),80)}px - 32px)`,boxShadow:`0 0 25px ${col}66`}} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-center w-full max-w-xs">
            <div className="p-3 rounded-xl border" style={{backgroundColor:"rgba(12,12,12,0.6)",borderColor:"rgba(255,255,255,0.05)"}}><div className="text-xs mb-1" style={{color:"rgba(255,255,255,0.4)"}}>Horizontal</div><div className="text-xl font-mono font-bold" style={{color:Math.abs(roll)<2?"#22c55e":"white"}}>{roll.toFixed(1)}°</div></div>
            <div className="p-3 rounded-xl border" style={{backgroundColor:"rgba(12,12,12,0.6)",borderColor:"rgba(255,255,255,0.05)"}}><div className="text-xs mb-1" style={{color:"rgba(255,255,255,0.4)"}}>Vertical</div><div className="text-xl font-mono font-bold" style={{color:Math.abs(pitch)<2?"#22c55e":"white"}}>{pitch.toFixed(1)}°</div></div>
          </div>
          <div className="text-2xl font-bold" style={{color:lvl?"#22c55e":"rgba(255,255,255,0.35)"}}>{lvl ? "LEVEL" : `${off.toFixed(1)}° off`}</div>
          <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); calibrateLevel(); }} className="flex items-center gap-2 px-5 py-2 rounded-xl border border-white/10 hover:bg-white/5"><RotateCcw size={16} /> Zero</button>
            <button onClick={(e) => { e.stopPropagation(); resetLevel(); }} className="flex items-center gap-2 px-5 py-2 rounded-xl border border-white/10 hover:bg-white/5"><RotateCcw size={16} /> Reset</button>
          </div>
        </div>
      ) : mode === "angle" ? (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="relative w-64">
            <svg viewBox="0 0 200 110" className="w-full">
              <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8"/>
              {Array.from({length:37}).map((_, i) => {
                const deg = i * 5;
                const rad = (deg - 90) * Math.PI / 180;
                const x1 = 100 + 80 * Math.cos(rad);
                const y1 = 100 + 80 * Math.sin(rad);
                const x2 = 100 + (deg % 30 === 0 ? 65 : 72) * Math.cos(rad);
                const y2 = 100 + (deg % 30 === 0 ? 65 : 72) * Math.sin(rad);
                return (<g key={deg}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" strokeWidth={deg % 90 === 0 ? 2 : 1}/>{deg % 30 === 0 && (<text x={100 + 52 * Math.cos(rad)} y={100 + 52 * Math.sin(rad)} fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle" dominantBaseline="middle">{deg}</text>)}</g>);
              })}
              <line x1="100" y1="100" x2={100 + 70 * Math.cos((angle - 90) * Math.PI / 180)} y2={100 + 70 * Math.sin((angle - 90) * Math.PI / 180)} stroke={s.accent} strokeWidth="3"/>
              <circle cx="100" cy="100" r="5" fill={s.accent}/>
            </svg>
          </div>
          <div className="text-center">
            <div className="text-5xl font-mono font-bold" style={{color:angCol}}>{angle.toFixed(1)}°</div>
            <div className="mt-1" style={{color:"rgba(255,255,255,0.4)"}}>{absAngle < 2 ? "LEVEL" : ""}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); calibrateAngle(); }} className="flex items-center gap-2 px-5 py-2 rounded-xl border border-white/10 hover:bg-white/5"><RotateCcw size={16} /> Zero</button>
            <button onClick={(e) => { e.stopPropagation(); resetAngle(); }} className="flex items-center gap-2 px-5 py-2 rounded-xl border border-white/10 hover:bg-white/5"><RotateCcw size={16} /> Reset</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FlashlightTool({s}: {s: ToolSettings}) {
  const [on, setOn] = useState(false); const [err, setErr] = useState(""); const [loading, setLoading] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const toggle = async () => {
    if (on) { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; setOn(false); return; }
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const track = stream.getVideoTracks()[0];
      const caps = track.getCapabilities() as any;
      if (caps && "torch" in caps) { await track.applyConstraints({ advanced: [{ torch: true } as any] }); streamRef.current = stream; setOn(true); setErr(""); }
      else { stream.getTracks().forEach(t => t.stop()); setErr("Flashlight not supported"); }
    } catch { setErr("Camera access denied"); }
    setLoading(false);
  };
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-6">
      <div className="w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer active:scale-95 border-2" style={{backgroundColor:on?s.accent:"rgba(20,20,20,0.8)",borderColor:s.accent,boxShadow:on?`0 0 80px ${s.glow}`:"none"}} onClick={toggle}>
        <Flashlight size={56} style={{color:on?"white":"rgba(255,255,255,0.3)"}} />
      </div>
      <button onClick={toggle} disabled={loading} className="px-8 py-3 rounded-full font-semibold transition-all active:scale-95 border" style={{backgroundColor:on?"rgba(239,68,68,0.15)":"rgba(255,255,255,0.05)",borderColor:on?"#ef4444":"rgba(255,255,255,0.15)",color:on?"#ef4444":"white"}}>
        {loading ? "..." : on ? "Tap to Turn Off" : "Tap to Turn On"}
      </button>
      {err && <p className="text-red-400 text-sm px-4 py-2 rounded-full" style={{backgroundColor:"rgba(239,68,68,0.1)"}}>{err}</p>}
    </div>
  );
}

function CalculatorTool({s}: {s: ToolSettings}) {
  const [d, setD] = useState("0"); const [p, setP] = useState<string|null>(null); const [o, setO] = useState<string|null>(null); const [w, setW] = useState(false);
  const clr = () => { setD("0"); setP(null); setO(null); setW(false); };
  const calc = () => { if (!p || !o) return; const pr = parseFloat(p); const cu = parseFloat(d); let r = 0; switch(o) { case "+": r=pr+cu; break; case "-": r=pr-cu; break; case "*": r=pr*cu; break; case "/": r=cu!==0?pr/cu:0; break; } setD(r.toString().slice(0,12).replace(/\.0+$/, "")); setP(null); setO(null); setW(true); };
  const op = (op: string) => { if (o && !w) calc(); setP(d); setO(op); setW(true); };
  const btns = [["C","±","%","÷"],["7","8","9","×"],["4","5","6","−"],["1","2","3","+"],["0",".","="]];
  const handle = (b: string) => { if (!isNaN(parseInt(b))) { if (w) { setD(b); setW(false); } else setD(d==="0"?b:d+b); } else if (b==="C") clr(); else if (b===".") setD(x=>x.includes(".")?x:x+"."); else if (b==="±") setD(x=>(parseFloat(x)*-1).toString()); else if (b==="%") setD(x=>(parseFloat(x)/100).toString()); else if (b==="=") calc(); else op(b); };
  const isOp = (b: string) => ["÷","×","−","+","="].includes(b);
  return (
    <div className="p-3 flex flex-col gap-1.5">
      <div className="rounded-2xl p-3 mb-1 border" style={{backgroundColor:"rgba(12,12,12,0.8)",borderColor:"rgba(255,255,255,0.05)"}}><div className="text-sm h-6" style={{color:"rgba(255,255,255,0.35)"}}>{p} {o}</div><div className="text-3xl font-mono text-right truncate">{d}</div></div>
      <div className="grid grid-cols-4 gap-2">{btns.flat().map((b,i) => (<button key={i} onClick={()=>handle(b)} className="aspect-square rounded-xl text-lg font-semibold transition-all active:scale-95 border" style={isOp(b)?{backgroundColor:`${s.accent}18`,borderColor:`${s.accent}40`,color:s.accent}:b==="C"?{backgroundColor:"rgba(50,50,50,0.4)",borderColor:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.5)"}:{backgroundColor:"rgba(25,25,25,0.6)",borderColor:"rgba(255,255,255,0.05)",color:"white"}}>{b}</button>))}</div>
    </div>
  );
}

// Ruler Tool with Calibration
function RulerTool() {
  const [cm, setCm] = useState(() => { const v = localStorage.getItem('mt-ruler-cm'); return v ? parseInt(v) : 15; });
  const [calibration, setCalibration] = useState<number|null>(() => { const v = localStorage.getItem('mt-ruler-cal'); return v ? parseFloat(v) : null; });
  const [calInput, setCalInput] = useState('');
  const [showCal, setShowCal] = useState(false);
  const px = calibration ?? 40;
  
  const saveCm = (v: number) => { setCm(v); localStorage.setItem('mt-ruler-cm', v.toString()); };
  const calibrate = () => {
    if (!calInput) return;
    const real = parseFloat(calInput);
    if (!real || real <= 0) return;
    const newPx = (real / cm) * 40;
    setCalibration(newPx);
    localStorage.setItem('mt-ruler-cal', newPx.toString());
    setCalInput('');
    setShowCal(false);
  };
  const resetCal = () => { setCalibration(null); localStorage.removeItem('mt-ruler-cal'); };

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-6">
      {calibration && (
        <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-full border" style={{borderColor:'rgba(34,197,94,0.3)',color:'#22c55e',backgroundColor:'rgba(34,197,94,0.1)'}}>
          <span>🔧 Calibrated</span>
          <button onClick={resetCal} className="underline opacity-70 hover:opacity-100">Reset</button>
        </div>
      )}
      <div className="flex items-center gap-3">
        <button onClick={() => saveCm(Math.max(5,cm-5))} className="w-12 h-12 rounded-xl border border-white/10 hover:bg-white/5 font-bold">-5</button>
        <button onClick={() => saveCm(Math.max(1,cm-1))} className="w-12 h-12 rounded-xl border border-white/10 hover:bg-white/5 font-bold">-</button>
        <div className="text-2xl font-bold w-20 text-center">{cm} cm</div>
        <button onClick={() => saveCm(Math.min(50,cm+1))} className="w-12 h-12 rounded-xl border border-white/10 hover:bg-white/5 font-bold">+</button>
        <button onClick={() => saveCm(Math.min(50,cm+5))} className="w-12 h-12 rounded-xl border border-white/10 hover:bg-white/5 font-bold">+5</button>
      </div>
      <div className="w-full overflow-x-auto pb-4"><div className="inline-block" style={{width:cm*px}}><div className="h-24 bg-white rounded-lg border-2 border-slate-300 relative overflow-hidden shadow-lg">
        {Array.from({length:cm+1}).map((_,i)=>(<div key={i} className="absolute top-0 h-full"><div className="w-px h-full bg-slate-800" /><span className="text-xs text-slate-600 absolute top-1 left-0.5">{i}</span></div>))}
        {Array.from({length:cm*10}).map((_,i)=>{ if(i%10===0) return null; return <div key={i} className="absolute top-0 bg-slate-500" style={{left:`${(i/10)*px}px`,width:"1px",height:i%5===0?"60%":"30%"}} />; })}
      </div></div></div>
      {showCal ? (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm" style={{color:'rgba(255,255,255,0.5)'}}>Actual size:</span>
          <input type="number" value={calInput} onChange={e=>setCalInput(e.target.value)} placeholder="cm" className="w-20 px-3 py-2 rounded-lg border text-sm" style={{backgroundColor:'rgba(255,255,255,0.05)',borderColor:'rgba(255,255,255,0.1)'}} />
          <button onClick={calibrate} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{backgroundColor:'rgba(34,197,94,0.2)',borderColor:'#22c55e50',color:'#22c55e'}}>Set</button>
          <button onClick={()=>setShowCal(false)} className="px-4 py-2 rounded-lg text-sm border border-white/10 hover:bg-white/5">Cancel</button>
        </div>
      ) : (
        <button onClick={()=>setShowCal(true)} className="text-sm px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5" style={{color:'rgba(255,255,255,0.5)'}}>🔧 Calibrate</button>
      )}
      <p className="text-sm" style={{color:'rgba(255,255,255,0.35)'}}>Place your device against an object to measure</p>
    </div>
  );
}

// AR Measure Tool with Calibration
function ARRulerTool({s}: {s: ToolSettings}) {
  const vRef = useRef<HTMLVideoElement>(null); const cRef = useRef<HTMLCanvasElement>(null);
  const [pts, setPts] = useState<{x:number;y:number}[]>([]); const [dist, setDist] = useState<number|null>(null);
  const [ref, setRef] = useState(10); const [ready, setReady] = useState(false); const [err, setErr] = useState(""); const [front, setFront] = useState(false); const [lidar, setLidar] = useState(false);
  const [calibration, setCalibration] = useState<number|null>(() => { const v = localStorage.getItem('mt-ar-cal'); return v ? parseFloat(v) : null; });
  const [calInput, setCalInput] = useState('');
  const [showCal, setShowCal] = useState(false);
  const streamRef = useRef<MediaStream|null>(null);
  
  const focalLength = calibration ?? 800;
  
  const startCam = useCallback(async () => {
    try { if("xr" in navigator) try { const sp = await (navigator as any).xr?.isSessionSupported?.("immersive-ar"); setLidar(sp??false); } catch { setLidar(false); } } catch {}
    if (streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop());
    try { const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:front?"user":"environment",width:{ideal:1280},height:{ideal:720}}}); streamRef.current = stream; if(vRef.current) { vRef.current.srcObject = stream; vRef.current.onloadedmetadata = ()=>{setReady(true);setErr("");}; } } catch(e:any) { setReady(false); setErr(e.name==="NotAllowedError"?"Camera permission denied":"Camera unavailable"); }
  }, [front]);
  useEffect(()=>{ startCam(); return()=>{ streamRef.current?.getTracks().forEach(t=>t.stop()); }; }, [startCam]);
  
  const click = (e: React.MouseEvent<HTMLCanvasElement>) => { const rect = cRef.current?.getBoundingClientRect(); if(!rect) return; const x=(e.clientX-rect.left)*(640/rect.width); const y=(e.clientY-rect.top)*(360/rect.height); if(pts.length>=2){setPts([{x,y}]);setDist(null);} else setPts(p=>[...p,{x,y}]); };
  
  useEffect(() => {
    if(pts.length===2 && vRef.current?.videoWidth) { const dx=pts[1].x-pts[0].x; const dy=pts[1].y-pts[0].y; const px2=Math.sqrt(dx*dx+dy*dy); if(px2>0) setDist((ref*focalLength)/px2); }
    const canvas = cRef.current; const ctx = canvas?.getContext("2d"); if(!canvas||!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(pts.length===2) { ctx.strokeStyle=s.accent; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y); ctx.lineTo(pts[1].x,pts[1].y); ctx.stroke(); const mx=(pts[0].x+pts[1].x)/2; const my=(pts[0].y+pts[1].y)/2; if(dist){ctx.fillStyle="rgba(0,0,0,0.75)";ctx.fillRect(mx-50,my-25,100,40);ctx.fillStyle=s.accent;ctx.font="bold 18px sans-serif";ctx.textAlign="center";ctx.fillText(`${(dist/100).toFixed(2)}m`,mx,my+6);} }
    pts.forEach((p,i)=>{ctx.fillStyle=i===0?"#22c55e":"#ef4444";ctx.beginPath();ctx.arc(p.x,p.y,12,0,Math.PI*2);ctx.fill();});
  }, [pts,dist,s.accent,focalLength,ref]);
  
  const clear = () => { setPts([]); setDist(null); };
  
  const calibrate = () => {
    if (!calInput || dist === null) return;
    const real = parseFloat(calInput);
    if (!real || real <= 0) return;
    // Calculate actual focal length: focalLength = (dist * px2) / ref
    const dx = pts[1].x - pts[0].x;
    const dy = pts[1].y - pts[0].y;
    const px2 = Math.sqrt(dx*dx + dy*dy);
    if (px2 > 0) {
      const newFocal = (real * 100 * px2) / ref;
      setCalibration(newFocal);
      localStorage.setItem('mt-ar-cal', newFocal.toString());
    }
    setCalInput('');
    setShowCal(false);
  };
  
  const resetCal = () => { setCalibration(null); localStorage.removeItem('mt-ar-cal'); };

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-1 bg-black min-h-[300px]">
        <video ref={vRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        <canvas ref={cRef} width={640} height={360} onClick={click} className="absolute inset-0 w-full h-full cursor-crosshair" />
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
          <span className="px-3 py-1 rounded-full text-sm backdrop-blur-md" style={{backgroundColor:"rgba(0,0,0,0.6)"}}>{pts.length<2?`Tap point ${pts.length+1}`:"Tap to restart"}</span>
          <div className="flex gap-2">
            {lidar&&<span className="px-2 py-1 rounded-full text-xs backdrop-blur-md" style={{backgroundColor:"rgba(34,197,94,0.7)"}}>LiDAR</span>}
            {calibration&&<span className="px-2 py-1 rounded-full text-xs backdrop-blur-md" style={{backgroundColor:"rgba(34,197,94,0.5)"}}>🔧</span>}
            <button onClick={()=>setFront(!front)} className="px-3 py-1 rounded-full text-xs backdrop-blur-md" style={{backgroundColor:"rgba(0,0,0,0.6)"}}>{front?"Front":"Back"}</button>
          </div>
        </div>
        {err&&<div className="absolute inset-0 flex items-center justify-center" style={{backgroundColor:"rgba(5,5,5,0.97)"}}><div className="text-center"><Camera size={48} className="mx-auto mb-2 opacity-30" /><p className="text-red-400 text-sm">{err}</p><button onClick={startCam} className="mt-3 px-4 py-2 rounded-xl border border-white/10 text-sm hover:bg-white/5"><RefreshCw size={16} className="inline mr-1"/>Retry</button></div></div>}
      </div>
      <div className="p-4 space-y-3 border-t" style={{backgroundColor:"rgba(8,8,8,0.98)",borderColor:"rgba(255,255,255,0.05)"}}>
        {showCal ? (
          <div className="flex items-center gap-2">
            <span className="text-sm whitespace-nowrap" style={{color:"rgba(255,255,255,0.4)"}}>Real distance:</span>
            <input type="number" value={calInput} onChange={e=>setCalInput(e.target.value)} placeholder="cm" className="w-20 px-3 py-2 rounded-lg border text-sm" style={{backgroundColor:"rgba(255,255,255,0.05)",borderColor:"rgba(255,255,255,0.1)"}} />
            <button onClick={calibrate} className="px-3 py-2 rounded-lg text-sm font-semibold" style={{backgroundColor:"rgba(34,197,94,0.2)",borderColor:"#22c55e50",color:"#22c55e"}}>Set</button>
            <button onClick={()=>setShowCal(false)} className="px-3 py-2 rounded-lg text-sm border border-white/10 hover:bg-white/5">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm whitespace-nowrap" style={{color:"rgba(255,255,255,0.4)"}}>Reference:</span>
            <input type="range" min="1" max="30" value={ref} onChange={e=>setRef(Number(e.target.value))} className="flex-1" style={{accentColor:s.accent}} />
            <span className="w-12 text-right font-mono">{ref}cm</span>
            <button onClick={()=>setShowCal(true)} className="px-3 py-1 rounded-lg text-xs border border-white/10 hover:bg-white/5" style={{color:"rgba(255,255,255,0.5)"}}>🔧</button>
          </div>
        )}
        {calibration && (
          <button onClick={resetCal} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs border border-white/10 hover:bg-white/5" style={{color:"rgba(255,255,255,0.4)"}}>
            Reset Calibration
          </button>
        )}
        <button onClick={clear} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:bg-white/5"><Trash2 size={18}/>Clear</button>
      </div>
    </div>
  );
}
