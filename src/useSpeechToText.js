import { useRef, useState, useCallback } from 'react';

// Load Transformers.js from a CDN at runtime instead of `npm install`-ing it.
// Vite's dev-mode ESM transform is known to be incompatible with onnxruntime-web's
// internal module registration (the "registerBackend" error) — importing it as a
// plain runtime URL bypasses Vite's bundler entirely for this package, same as
// loading it via a <script type="module"> tag would.
let transformersModulePromise = null;
function loadTransformers() {
  if (!transformersModulePromise) {
    transformersModulePromise = import(
      /* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2'
    );
  }
  return transformersModulePromise;
}

/**
 * In-browser speech-to-text using Transformers.js (Whisper), no server, no API key.
 * Works identically in Chrome, Edge, and Brave, since it doesn't depend on the
 * native webkitSpeechRecognition API at all.
 *
 * @param {string} modelName - e.g. 'Xenova/whisper-tiny.en'
 */
export function useSpeechToText(modelName = 'Xenova/whisper-base.en') {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);

  const transcriberRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const loadModel = useCallback(async () => {
    if (transcriberRef.current || isModelLoading) return;
    setIsModelLoading(true);
    setError(null);

    try {
      const { pipeline, env } = await loadTransformers();
      env.allowLocalModels = false;

      transcriberRef.current = await pipeline('automatic-speech-recognition', modelName, {
        progress_callback: (data) => {
          if (data.status === 'progress' && typeof data.progress === 'number') {
            setLoadProgress(Math.min(data.progress, 100));
          }
        },
      });
      setIsModelReady(true);
    } catch (err) {
      console.error('Model load failed:', err);
      setError(err.message || 'Failed to load model');
    } finally {
      setIsModelLoading(false);
    }
  }, [modelName, isModelLoading]);

  // Decode recorded audio and resample to 16kHz mono Float32Array (required by Whisper)
  const blobToWhisperInput = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);

    const targetRate = 16000;
    const offlineCtx = new OfflineAudioContext(1, Math.ceil(decoded.duration * targetRate), targetRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = decoded;

    if (decoded.numberOfChannels > 1) {
      const merger = offlineCtx.createChannelMerger(1);
      const splitter = offlineCtx.createChannelSplitter(decoded.numberOfChannels);
      source.connect(splitter);
      for (let ch = 0; ch < decoded.numberOfChannels; ch++) splitter.connect(merger, ch, 0);
      merger.connect(offlineCtx.destination);
    } else {
      source.connect(offlineCtx.destination);
    }

    source.start(0);
    const rendered = await offlineCtx.startRendering();
    audioCtx.close();
    return rendered.getChannelData(0);
  };

  const startListening = useCallback(async () => {
    setError(null);

    if (!transcriberRef.current) {
      setError('Model not loaded yet — call loadModel() first');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setIsTranscribing(true);
        try {
          const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
          const audioData = await blobToWhisperInput(blob);
          const output = await transcriberRef.current(audioData, {
            chunk_length_s: 20,
            stride_length_s: 5,
          });
          const text = (output?.text || '')
          .replace(/\[BLANK_AUDIO\]/gi, '')
          .replace(/\[MUSIC\]/gi, '')
          .replace(/♪/g, '')
          .replace(/\s+/g, ' ')
          .trim();
          if (text) {
            setTranscript((prev) => (prev ? `${prev} ${text}` : text));
          }
        } catch (err) {
          console.error('Transcription failed:', err);
          setError(err.message || 'Transcription failed');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setListening(true);
    } catch (err) {
      console.error('Mic access failed:', err);
      setError(err.message || 'Microphone access denied');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && listening) {
      mediaRecorderRef.current.stop();
      setListening(false);
    }
  }, [listening]);

  const resetTranscript = useCallback(() => setTranscript(''), []);

  return {
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
  };
}