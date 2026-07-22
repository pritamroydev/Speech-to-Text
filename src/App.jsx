import React, { useState, useEffect, useRef } from 'react';
import { useSpeechToText } from './useSpeechToText';
import Footer from './Footer';
import { 
  MicrophoneIcon, 
  StopIcon, 
  ArrowsClockwiseIcon, 
  CopyIcon, 
  CheckIcon, 
  DownloadSimpleIcon, 
  SquaresFourIcon,
  ArrowSquareOutIcon,
  SparkleIcon
} from '@phosphor-icons/react';

const App = () => {
  const {
    transcript,
    listening,
    isModelLoading,
    isModelReady,
    isTranscribing,
    loadProgress,
    error,
    loadModel,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechToText('Xenova/whisper-tiny.en');

  const [isCopied, setIsCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showAppConsole, setShowAppConsole] = useState(false);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Close floating popover if clicking outside
  useEffect(() => {
    if (!showAppConsole) return;
    const handleOutsideClick = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target)) {
        setShowAppConsole(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showAppConsole]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleCopy = async () => {
    if (!transcript) return;
    await navigator.clipboard.writeText(transcript);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  const pritamApps = [
    {
      name: 'Folio',
      desc: 'Local-first, block-based personal notes engine with wiki-links and graph view.',
      url: 'https://pritamroy-folio.vercel.app/', // Pulls dynamically from Vercel hosting setup
      tag: 'FLAGSHIP'
    },
    {
      name: 'Portfolio',
      desc: 'Personal developer showcase, interactive engineering projects, and contact hubs.',
      url: 'https://pritamroy-portfolio.vercel.app/', // Pulls from personal project data context
      tag: 'HUB'
    }
  ];

  const statusLabel = isModelLoading
    ? `LOADING ${Math.round(loadProgress)}%`
    : isTranscribing
    ? 'TRANSCRIBING'
    : listening
    ? 'RECORDING'
    : isModelReady
    ? 'READY'
    : 'STANDBY';

  const ledClass = isModelLoading || isTranscribing
    ? 'bg-amber shadow-[0_0_8px] shadow-amber animate-pulse'
    : listening
    ? 'bg-rec shadow-[0_0_8px] shadow-rec animate-pulse'
    : isModelReady
    ? 'bg-cyan shadow-[0_0_8px] shadow-cyan'
    : 'bg-white/30';

  const meterHeights = ['h-2', 'h-4', 'h-6', 'h-3', 'h-8', 'h-5', 'h-3', 'h-7'];

  // Liquid glass styling reserved perfectly for overlay panels like this floating popover
  const glassPanel =
    'glass-sheen bg-glass backdrop-blur-2xl border border-glass-border rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]';

  const glassButton =
    'font-mono text-xs font-medium tracking-wide uppercase rounded-full px-5 py-2.5 bg-glass backdrop-blur-xl border border-glass-border text-ivory transition hover:enabled:bg-glass-strong active:enabled:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2';

  return (
    <div className="relative min-h-screen bg-ink text-ivory font-sans overflow-hidden">
      {/* Background Blobs */}
      <div className="pointer-events-none fixed inset-0">
        <div className="blob w-105 h-105 bg-violet -top-20 -left-24" />
        <div className="blob w-95 h-95 bg-pink top-1/3 -right-20" style={{ animationDelay: '4s' }} />
        <div className="blob w-85 h-85 bg-cyan bottom-0 left-1/4" style={{ animationDelay: '9s' }} />
        <div className="blob w-75 h-75 bg-amber top-1/2 left-1/2" style={{ animationDelay: '13s' }} />
      </div>

      {/* Full Window Parent Container */}
      <div className="relative max-w-6xl min-h-screen mx-auto flex flex-col justify-between px-5 py-10 pb-16 overflow-y-auto">
        
        <div>
          {/* Expanded Window Header Wrapper */}
          <div className="w-full flex items-center justify-between mb-10 md:mb-15 px-2 relative">
            {/* Premium Branded Header Block */}
          <div className="flex items-center gap-3.5 select-none">

            {/* Typography Stack */}
            <div className="flex flex-col">
    <h1 className="font-sans text-3xl md:text-4xl tracking-tight leading-none text-white">
      <span className="font-semibold">Echo</span>
      <span className="text-muted font-normal font-serif  px-0.5 text-3xl md:text-4xl">Script</span>
    </h1>
    <span className="font-mono text-[8.5px] tracking-widest text-muted-dim mt-1 uppercase">
      INTELLIGENT TRANSCRIPTION
    </span>
  </div>
          </div>
            
            <div ref={triggerRef} className="flex items-center gap-2 shrink-0 relative">
              {deferredPrompt && !isInstalled && (
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-[10.5px] font-semibold tracking-wider hover:bg-emerald-500/30 transition-all cursor-pointer shadow-sm animate-pulse"
                >
                  <DownloadSimpleIcon size={13} weight="bold" />
                  <span>INSTALL</span>
                </button>
              )}

              <button
                onClick={() => setShowAppConsole(!showAppConsole)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-muted font-mono text-[10.5px] tracking-wider transition-all cursor-pointer ${
                  showAppConsole 
                    ? 'bg-white/20 text-ivory border-white/30' 
                    : 'bg-white/5 border-glass-border hover:bg-white/10'
                }`}
              >
                <SquaresFourIcon size={14} weight={showAppConsole ? "fill" : "regular"} />
                <span className="font-mono text-[10.5px] tracking-wider md:block hidden">MORE APPS</span>
              </button>

              {/* Floating App Console Menu */}
              {showAppConsole && (
                <div className="absolute right-0 top-full mt-2 w-72 md:w-80 p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="font-mono text-[10px] tracking-widest text-muted/80 mb-3 flex items-center gap-1">
                    <SparkleIcon size={12} className="text-amber animate-pulse" />
                    <span>MORE APPS BY PRITAM</span>
                  </div>
                  <div className="grid gap-2">
                    {pritamApps.map((app) => (
                      <a
                        key={app.name}
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1.5">
                            <span className="font-sans font-semibold text-xs text-ivory group-hover:text-white transition-colors">
                              {app.name}
                            </span>
                            <span className="font-mono text-[8px] px-1 py-0.25 rounded bg-white/10 text-muted tracking-wider">
                              {app.tag}
                            </span>
                          </div>
                          <ArrowSquareOutIcon size={14} className="text-muted group-hover:text-ivory transition-colors" />
                        </div>
                        <p className="font-sans text-[11px] text-muted mt-1 leading-normal">
                          {app.desc}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Centered Deck Columns Layer */}
          <div className="font-mono max-w-full items-center justify-center flex flex-col text-[13px] text-muted sm:text-center md:text-left mb-8">
            
            <header className={`${glassPanel} flex w-xl max-w-full items-center justify-between gap-4 px-5 py-4 mb-5`}>
              <div>
                <p className="text-[12.5px] text-muted mt-0.5">Private. Runs entirely on your device.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-glass-border shrink-0">
                <span className={`w-1.5 h-1.5 rounded-full ${ledClass}`} />
                <span className="font-mono text-[10.5px] tracking-widest text-muted">{statusLabel}</span>
              </div>
            </header>

            {/* Model panel */}
            <section className={`${glassPanel} p-5 mb-4 w-xl max-w-full`}>
              <div className="font-mono text-[10.5px] tracking-widest text-muted-dim mb-4">
                MODEL
              </div>

              {!isModelReady ? (
                <>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <p className="text-[13.5px] text-muted leading-relaxed">
                      {isModelLoading
                        ? "Preparing transcription engine..."
                        : "Load the transcription engine to begin."}
                    </p>

                    {!isModelLoading && (
                      <button
                        onClick={loadModel}
                        className="
                          h-9
                          px-4
                          shrink-0
                          rounded-full
                          border border-white/15
                          bg-white/5
                          text-[11px]
                          font-semibold
                          uppercase
                          tracking-wider
                          text-muted
                          hover:bg-white/10
                          hover:border-white/25
                          transition-all
                          duration-200
                          cursor-pointer

                        "
                      >
                        Load
                      </button>
                    )}
                  </div>

                  {isModelLoading && (
                    <div className="space-y-2">
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-violet via-pink to-amber transition-all duration-200"
                          style={{ width: `${loadProgress}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center font-mono text-[11px] text-muted-dim">
                        <span>Downloading model...</span>
                        <span>{Math.round(loadProgress)}%</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-[13.5px] text-muted">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Ready to transcribe.</span>
                </div>
              )}
            </section>

            {/* Input panel */}
            <section className={`${glassPanel} p-5 mb-4 w-xl max-w-full`}>

              <div className="font-mono text-[10.5px] tracking-widest text-muted-dim mb-4">INPUT</div>

              <div className="flex items-end gap-1 h-12 mb-5 px-2 bg-black/20 rounded-2xl p-2 border border-white/5" aria-hidden="true">
                {Array.from({ length: 16 }).map((_, i) => {
                  // Generate a sleek studio curve (higher in the middle, lower at the boundaries)
                  const baseHeight = 20 + Math.sin((i / 15) * Math.PI) * 65; 
                  
                  return (
                    <span
                      key={i}
                      className="flex-1 rounded-full bg-linear-to-t from-violet to-cyan transition-all duration-300 ease-out"
                      style={{
                        height: `${baseHeight}%`,
                        opacity: listening ? 1 : 0.25,
                        transformOrigin: 'bottom',
                        transform: listening ? 'scaleY(1)' : 'scaleY(0.35)',
                        // Triggers our specialized hardware-accelerated fluid oscillation engine
                        animation: listening ? 'fluid-bounce 0.6s ease-in-out infinite alternate' : 'none',
                        // Stagger the loops using alternating patterns so the peaks look dynamic and live
                        animationDelay: listening ? `${(i * 0.04) + (i % 2 === 0 ? 0.15 : 0)}s` : '0s',
                      }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={startListening}
                  disabled={!isModelReady || listening}
                  className={`${glassButton} ${
                    listening ? 'bg-rec/25 border-rec/40 text-white' : ''
                  } cursor-pointer`}
                >
                  <MicrophoneIcon size={14} weight="fill" />
                  <span>{listening ? 'Recording…' : 'Start listening'}</span>
                </button>
                <button onClick={stopListening} disabled={!listening} className={`${glassButton} cursor-pointer`}>
                  <StopIcon size={14} weight="fill" />
                  <span>Stop</span>
                </button>
                <button onClick={resetTranscript} className={`${glassButton} bg-transparent cursor-pointer`}>
                  <ArrowsClockwiseIcon size={14} />
                  <span>Reset</span>
                </button>
              </div>

              {error && <p className="font-mono text-[12.5px] text-rec mt-3">⚠ {error}</p>}
            </section>

            {/* Transcript panel */}
            <section className={`${glassPanel} p-5 w-xl max-w-full`}>
              <div className="font-mono text-[10.5px] tracking-widest text-muted-dim mb-4">TRANSCRIPT</div>
              <div
                className={`min-h-30 bg-black/20 border border-white/10 rounded-2xl p-4 text-[15px] leading-relaxed whitespace-pre-wrap wrap-break-words mb-4 font-sans ${
                  !transcript ? 'text-muted-dim italic' : 'text-ivory'
                }`}
              >
                {transcript || 'Nothing recorded yet.'}
              </div>
              <button onClick={handleCopy} disabled={!transcript} className={`${glassButton} cursor-pointer`}>
                {isCopied ? <CheckIcon size={14} weight="bold" /> : <CopyIcon size={14} />}
                <span>{isCopied ? 'Copied' : 'Copy to clipboard'}</span>
              </button>
            </section>
          </div>
        </div>

      </div>
        <div>
          <Footer />
        </div>
    </div>
  );
};

export default App;