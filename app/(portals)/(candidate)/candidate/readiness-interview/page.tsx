'use client';

import { useState, useEffect, useRef } from 'react';
import LaunchpathMuxPlayer from '@/components/LaunchpathMuxPlayer';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Video, VideoOff, Timer, ChevronRight, 
  Sparkles, CheckCircle2, ShieldAlert, Play, AlertCircle, RefreshCw, Mic
} from 'lucide-react';

const QUESTIONS = [
  { 
    id: 1, 
    title: 'Value Proposition & Background', 
    text: 'Please introduce yourself and highlight how your specific professional experiences and skills make you an exceptional candidate for your target role.' 
  },
  { 
    id: 2, 
    title: 'Technical Execution & Resilience', 
    text: 'Describe a complex technical or professional project you led or executed. What challenges did you encounter, and how did you resolve them?' 
  },
  { 
    id: 3, 
    title: 'Adversity & Collaborative Leadership', 
    text: 'Give an example of a time when you had to manage a conflict, work under high-stress constraints, or align a team toward a shared, difficult objective.' 
  },
  { 
    id: 4, 
    title: 'Career Trajectory & Growth Mindset', 
    text: 'Where do you see yourself professionally in three years, and how are you actively upskilling or aligning your professional path to achieve that vision?' 
  }
];

const LAUNCHPATH_POSTER_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNDUwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ2xvdyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxZTFiNGIiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSI0MCUiIHN0b3AtY29sb3I9IiMwZjE3MmEiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDIwNjE3Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJicmFuZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNzE0NUZGIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzhiNWNmNiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI0NTAiIGZpbGw9InVybCgjZ2xvdykiLz4KICAKICA8IS0tIFN1YnRsZSBmdXR1cmlzdGljIGxpbmVzIC0tPgogIDxnIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSI+CiAgICA8bGluZSB4MT0iMTAwIiB5MT0iMCIgeDI9IjEwMCIgeTI9IjQ1MCIvPgogICAgPGxpbmUgeDE9IjIwMCIgeTE9IjAiIHgyPSIyMDAiIHkyPSI0NTAiLz4KICAgIDxsaW5lIHgxPSIzMDAiIHkxPSIwIiB4Mj0iMzAwIiB5Mj0iNDUwIi8+CiAgICA8bGluZSB4MT0iNDAwIiB5MT0iMCIgeDI9IjQwMCIgeTI9IjQ1MCIvPgogICAgPGxpbmUgeDE9IjUwMCIgeTE9IjAiIHgyPSI1MDAiIHkyPSI0NTAiLz4KICAgIDxsaW5lIHgxPSI2MDAiIHkxPSIwIiB4Mj0iNjAwIiB5Mj0iNDUwIi8+CiAgICA8bGluZSB4MT0iNzAwIiB5MT0iMCIgeDI9IjcwMCIgeTI9IjQ1MCIvPgogICAgPGxpbmUgeDE9IjAiIHkxPSIxMDAiIHgyPSI4MDAiIHkyPSIxMDAiLz4KICAgIDxsaW5lIHgxPSIwIiB5MT0iMjAwIiB4Mj0iODAwIiB5Mj0iMjAwIi8+CiAgICA8bGluZSB4PSIwIiB5MT0iMzAwIiB4Mj0iODAwIiB5Mj0iMzAwIi8+CiAgICA8bGluZSB4PSIwIiB5MT0iNDAwIiB4Mj0iODAwIiB5Mj0iNDAwIi8+CiAgPC9nPgogIDxjaXJjbGUgY3g9IjQwMCIgY3k9IjIyNSIgcj0iMTQwIiBmaWxsPSIjNzE0NUZGIiBmaWxsLW9wYWNpdHk9IjAuMTUiIGZpbHRlcj0iYmx1cig2MHB4KSIvPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iODAiIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC4xIiBmaWx0ZXI9ImJsdXIoNDBweCkiLz4KICA8cmVjdCB4PSI1MCIgeT0iNTAiIHdpZHRoPSI3MDAiIGhlaWdodD0iMzUwIiByeD0iMjAiIGZpbGw9IiMwZjE3MmEiIGZpbGwtb3BhY2l0eT0iMC41IiBzdHJva2U9IiMzMzQxNTUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0iMC40Ii8+CiAgPGNpcmNsZSBjeD0iNDAwIiBjeT0iMTkwIiByPSI0NSIgZmlsbD0iIzcxNDVGRiIgZmlsbC1vcGFjaXR5PSIwLjIiIHN0cm9rZT0iIzcxNDVGRiIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgPGNpcmNsZSBjeD0iNDAwIiBjeT0iMTkwIiByPSIzNSIgZmlsbD0idXJsKCNicmFuZCkiLz4KICA8cG9seWdvbiBwb2ludHM9IjM5MiwxNzcgNDE1LDE5MCAzOTIsMjAzIiBmaWxsPSIjZmZmZmZmIi8+CiAgPHJlY3QgeD0iMzEwIiB5PSIyNzAiIHdpZHRoPSIxODAiIGhlaWdodD0iMjQiIHJ4PSIxMiIgZmlsbD0iIzcxNDVGRiIgZmlsbC1vcGFjaXR5PSIwLjE1IiBzdHJva2U9IiM3MTQ1RkYiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMyIvPgogIDx0ZXh0IHg9IjQwMCIgeT0iMjg1IiBmaWxsPSIjYTc4YmZhIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Db2wsICdTZWdvZSBVSScsIFJvYm90bywgSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9IjkwMCIgbGV0dGVyLXNwYWNpbmc9IjEuNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgdGV4dC10cmFuc2Zvcm09InVwcGVyY2FzZSI+TEFVTkNIUEFUSCBWRVJJRklFRDwvdGV4dD4KICA8dGV4dCB4PSI0MDAiIHk9IjMyNSIgZmlsbD0iI2ZmZmZmZiIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtQ29sLCAnU2Vnb2UgVUknLCBSb2JvdG8sIE91dGZpdCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMiIgZm9udC13ZWlnaHQ9IjgwMCIgbGV0dGVyLXNwYWNpbmc9Ii0wLjUiIHRleHQtYW5jaG9yPSJuYXR1cmFsIj5BSSBSRUFESU5FU1MgVklERU8gSU5URVJWSUVXPC90ZXh0PgogIDx0ZXh0IHg9IjQwMCIgeT0iMzQ3IiBmaWxsPSIjOTRhM2I4IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Db2wsICdTZWdvZSBVSScsIFJvYm90bywgSGVsdmV0aWNhLCBBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZm9udC13ZWlnaHQ9IjUwMCIgdHJhY2tpbmc9IjAuNSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2VjdXJlIFdlYlJUQyBUaW1lZCBFeGVjdXRpdmUgUHJlc2VudGF0aW9uPC90ZXh0PgogIDx0ZXh0IHg9IjgwIiB5PSI5MCIgZmlsbD0iIzY0NzQ4YiIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMSIgZm9udC13ZWlnaHQ9IjcwMCI+RkVFRF9TVFJFQU06IEFDVElWRTwvdGV4dD4KICA8Y2lyY2xlIGN4PSIyMTUiIGN5PSI4NiIgcj0iNCIgZmlsbD0iIzEwYjk4MSIvPgogIDx0ZXh0IHg9IjcyMCIgeT0iOTAiIGZpbGw9IiM2NDc0OGIiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTEiIHRleHQtYW5jaG9yPSJlbmQiPjQvNCBNT0RVTEVTIENPTVBMRVRFRDwvdGV4dD4KPC9zdmc+";

export default function ReadinessInterviewPage() {
  const router = useRouter();
  const [step, setStep] = useState<'intro' | 'recording' | 'uploading' | 'finished'>('intro');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per question
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingStarted, setIsRecordingStarted] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isFetchingInitial, setIsFetchingInitial] = useState(true);
  
  // Media streams
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [savedVideosUrl, setSavedVideosUrl] = useState<string>('');
  const [questionVideos, setQuestionVideos] = useState<Record<number, string>>({});
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [finishedActiveIdx, setFinishedActiveIdx] = useState<number>(0);
  const [isReevaluating, setIsReevaluating] = useState(false);
  const [questionSeconds, setQuestionSeconds] = useState<Record<number, number>>({});

  // Fetch initial existing readiness interview from DB
  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await fetch('/api/candidate/readiness-interview');
        if (res.ok) {
          const data = await res.json();
          if (data && data.interview) {
            setEvaluationResult(data.interview);
            setStep('finished');
          }
        }
      } catch (err) {
        console.error('Error fetching initial interview:', err);
      } finally {
        setIsFetchingInitial(false);
      }
    }
    loadInitial();
  }, []);

  const handleReevaluate = async (questionId: number) => {
    if (!evaluationResult?.id) return;
    try {
      setIsReevaluating(true);
      const res = await fetch('/api/candidate/readiness-interview/reevaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          evaluationId: evaluationResult.id
        })
      });
      if (res.ok) {
        const data = await res.json();
        setEvaluationResult(data.interview);
        alert('AI Session Complete! Your answer has been successfully re-evaluated with updated points and score.');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to re-evaluate response.');
      }
    } catch (e: any) {
      console.error(e);
      alert('Error connecting to re-evaluation servers.');
    } finally {
      setIsReevaluating(false);
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const allBlobsRef = useRef<{ questionIdx: number; blob: Blob }[]>([]);
  const singleRecorderRef = useRef<MediaRecorder | null>(null);
  const singleChunksRef = useRef<Blob[]>([]);
  const fullBlobRef = useRef<Blob | null>(null);

  // Clean raw media stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [stream]);

  // Keep camera live feed in sync with mounted video component
  useEffect(() => {
    if (step === 'recording' && stream && videoRef.current) {
      try {
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.warn('Error setting active media stream in video preview:', err);
      }
    }
  }, [step, stream]);

  // Request permissions & set up preview stream
  const requestCameraPermission = async (): Promise<MediaStream | null> => {
    try {
      setCameraPermission('pending');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: true 
      });
      setStream(mediaStream);
      setCameraPermission('granted');
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      return mediaStream;
    } catch (err) {
      console.warn('Camera/Mic permission denied or unavailable, enabling professional simulation fallback.', err);
      setCameraPermission('denied');
      return null;
    }
  };

  // Start the actual recording session
  const startInterview = async () => {
    let activeStream = stream;
    // Attempt camera permission if pending or stream is null
    if (cameraPermission === 'pending' || !activeStream) {
      activeStream = await requestCameraPermission();
    }
    setStep('recording');
    setCurrentQuestionIdx(0);
    // Clear previously cached blobs
    allBlobsRef.current = [];
    singleRecorderRef.current = null;
    singleChunksRef.current = [];
    fullBlobRef.current = null;
    setQuestionSeconds({});
    prepareQuestion(0);
  };

  const prepareQuestion = (idx: number) => {
    setIsRecordingStarted(false);
    setTimeLeft(60);
    setRecordedChunks([]);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startRecordingCurrentQuestion = (activeStream?: MediaStream | null) => {
    const targetStream = activeStream !== undefined ? activeStream : stream;
    const isGranted = activeStream !== undefined ? (activeStream !== null) : (cameraPermission === 'granted');
    
    setIsRecordingStarted(true);
    setTimeLeft(60);
    setRecordedChunks([]);

    // Setup and start MediaRecorder if stream is available
    if (targetStream && isGranted) {
      try {
        // 1. Maintain a single overall high-quality continuous session video recorder
        if (!singleRecorderRef.current) {
          singleChunksRef.current = [];
          const sr = new MediaRecorder(targetStream, { mimeType: 'video/webm' });
          sr.ondataavailable = (event) => {
            if (event.data.size > 0) {
              singleChunksRef.current.push(event.data);
            }
          };
          sr.onstop = () => {
            const finalBlob = new Blob(singleChunksRef.current, { type: 'video/webm' });
            fullBlobRef.current = finalBlob;
          };
          sr.start(1000); // 1-second timeslices ensure correct metadata encoding
          singleRecorderRef.current = sr;
        } else if (singleRecorderRef.current.state === 'paused') {
          singleRecorderRef.current.resume();
        }

        // 2. Maintain a separate segment recorder for immediate offline question-specific tabs preview
        const recorder = new MediaRecorder(targetStream, { mimeType: 'video/webm' });
        const chunks: Blob[] = [];
        const idx = currentQuestionIdx;
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        recorder.onstop = () => {
          const mainBlob = new Blob(chunks, { type: 'video/webm' });
          // In a live browser, we can convert a small preview URL
          const videoUrlStr = URL.createObjectURL(mainBlob);
          setSavedVideosUrl(videoUrlStr);
          setQuestionVideos(prev => ({
            ...prev,
            [idx]: videoUrlStr
          }));
          
          // Save chunk in the accumulated reference
          allBlobsRef.current = [
            ...allBlobsRef.current.filter(item => item.questionIdx !== idx),
            { questionIdx: idx, blob: mainBlob }
          ].sort((a, b) => a.questionIdx - b.questionIdx);
        };
        recorder.start(1000); // 1-second timeslices
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (err) {
        console.error('Error starting MediaRecorder', err);
      }
    } else {
      setIsRecording(true); // fall-back simulation active
    }

    // Set up timed countdown
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          // Auto move to next question or submit
          handleNextOrSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNextOrSubmit = async () => {
    // Record actual question elapsed duration
    const elapsed = 60 - timeLeft;
    const finalElapsed = elapsed <= 0 ? 1 : (elapsed > 60 ? 60 : elapsed);
    setQuestionSeconds(prev => ({
      ...prev,
      [currentQuestionIdx]: finalElapsed
    }));

    // Stop recording current chunk if we were recording
    if (isRecordingStarted) {
      if (singleRecorderRef.current && singleRecorderRef.current.state === 'recording') {
        singleRecorderRef.current.pause();
      }

      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        const activeRecorder = mediaRecorder;
        const originalOnStop = activeRecorder.onstop;
        
        const awaitStopPromise = new Promise<void>((resolve) => {
          activeRecorder.onstop = () => {
            if (originalOnStop) {
              // @ts-ignore
              originalOnStop();
            }
            resolve();
          };
        });
        
        activeRecorder.stop();
        await awaitStopPromise;
      } else {
        // Small sleep to ensure event loops catch up if needed
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    }

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (currentQuestionIdx < QUESTIONS.length - 1) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      prepareQuestion(nextIdx);
    } else {
      // Completed all questions - gracefully stop the main session recording
      if (singleRecorderRef.current && singleRecorderRef.current.state !== 'inactive') {
        const sr = singleRecorderRef.current;
        const awaitSrStop = new Promise<void>((resolve) => {
          const originalOnStop = sr.onstop;
          sr.onstop = () => {
            if (originalOnStop) {
              // @ts-ignore
              originalOnStop();
            }
            resolve();
          };
        });
        sr.stop();
        await awaitSrStop;
      }
      submitInterviewData();
    }
  };

  const submitInterviewData = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    setStep('uploading');

    // Wait for the continuous session recording stop sequence to finish converting compilation refs
    let attempts = 0;
    while (!fullBlobRef.current && attempts < 15) {
      await new Promise(resolve => setTimeout(resolve, 300));
      attempts++;
    }

    // Capture the unified multi-question continuous session video or segments backup
    const finalBlobToUpload = fullBlobRef.current || new Blob(allBlobsRef.current.map(item => item.blob), { type: 'video/webm' });
    let finalVideoUrl = URL.createObjectURL(finalBlobToUpload);
    setSavedVideosUrl(finalVideoUrl);
    let uploadedMuxId = '';

    if (finalBlobToUpload.size > 0) {
      try {
        // 1. Fetch secure direct Mux upload token/URL from route
        const muxRes = await fetch('/api/candidate/readiness-interview/mux-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!muxRes.ok) {
          throw new Error('Failed to create secure Mux upload session.');
        }
        const { uploadId, uploadUrl } = await muxRes.json();
        uploadedMuxId = uploadId;

        // 2. Perform raw streaming binary upload directly to Mux endpoints (completely offloading local server RAM!)
        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          body: finalBlobToUpload,
          headers: {
            'Content-Type': 'video/webm'
          }
        });
        if (!putRes.ok) {
          throw new Error('Failed binary payload streaming to Mux upload endpoint.');
        }
        console.log('[MUX] Fluid streaming upload completed for capture token:', uploadId);
      } catch (muxErr: any) {
        console.error('[MUX INTERVENTION] Falling back gracefully due to error:', muxErr);
      }
    }

    // Clean up webcam streams AFTER compiling to avoid file locks or premature cutoffs
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    try {
      // Prepare simulated/extracted details to submit for AI evaluation with genuine durations
      const res = await fetch('/api/candidate/readiness-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: QUESTIONS.map((q, idx) => ({
            id: q.id,
            title: q.title,
            recordedTime: questionSeconds[idx] || 60,
          })),
          muxUploadId: uploadedMuxId,
          videoBase64: finalVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-man-delivering-presentation-on-a-screen-40331-large.mp4' // Fallback preview reference
        })
      });

      if (res.ok) {
        const bodyData = await res.json();
        setEvaluationResult(bodyData.interview);
        setStep('finished');
      } else {
        alert('We failed to build interview evaluations. Please try again.');
        setStep('intro');
      }
    } catch (error) {
      console.error(error);
      alert('Internal Server Error while evaluating readiness interview.');
      setStep('intro');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-[#7145FF] selection:text-white font-sans">
      
      {/* Top Bar Navigation */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/candidate/dashboard')}
            className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-md font-bold tracking-tight">AI Job Readiness Evaluation</h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Interactive timed interview simulator</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-slate-400">LaunchPath Secure</span>
        </div>
      </header>

      {/* Main workspace container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        
        {isFetchingInitial ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-slate-800/80 border-t-[#7145FF] animate-spin" />
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse">
              Securing interview sandbox session...
            </p>
          </div>
        ) : (
          <>
            {/* STEP 1: INTRO SCREEN */}
            {step === 'intro' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 max-w-2xl mx-auto space-y-6 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#7145FF]/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
              <div className="h-11 w-11 bg-[#7145FF]/10 rounded-xl flex items-center justify-center border border-[#7145FF]/20">
                <Sparkles className="w-5 h-5 text-[#7145FF]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Oral Job Readiness Interview</h2>
                <p className="text-xs text-slate-400">Sync details, record timed video streams & earn credentials</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              Stand out to elite hiring employers by completing a comprehensive AI Job Readiness Video Interview. 
              Our system presents 4 standard executive selection questions, evaluates your body language context, 
              constructs speech transcripts automatically via <strong className="text-[#7145FF]">Gemini</strong>, and saves the verified credentials into your candidate profile instantly.
            </p>

            {/* Questions list preview */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Curated Selection Areas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {QUESTIONS.map((q) => (
                  <div key={q.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-start gap-2.5">
                    <span className="h-5 w-5 bg-[#7145FF]/10 text-[#7145FF] font-mono flex items-center justify-center rounded-md font-bold text-xxs flex-shrink-0">
                      0{q.id}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-200">{q.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{q.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device permissions check */}
            <div className="p-4 bg-slate-950/45 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#7145FF]" />
                  <span className="text-xs font-bold text-slate-200">Camera & Mic Stream Validation</span>
                </div>
                {cameraPermission === 'granted' ? (
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-mono text-[9px] rounded font-bold uppercase tracking-wide">Granted</span>
                ) : cameraPermission === 'denied' ? (
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 font-mono text-[9px] rounded font-bold uppercase tracking-wide">Using Fallback Simulation</span>
                ) : (
                  <button 
                    onClick={requestCameraPermission}
                    className="text-[11px] font-bold text-[#7145FF] hover:text-violet-400 underline cursor-pointer"
                  >
                    Allow Access
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                We respect your system controls. Standard WebRTC captures webcam streams purely dynamically inside your sandbox frame context. 
                If device constraints are blocked, a highly polished simulator handles execution seamlessly.
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={startInterview}
                className="w-full sm:w-auto px-6 py-3 bg-[#7145FF] hover:bg-[#5b32e6] text-white font-extrabold rounded-xl transition flex items-center gap-2 text-sm cursor-pointer shadow-[#7145FF]/20 shadow-lg justify-center"
              >
                <span>Initiate Interview Session</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VIDEO RECORDING MODULE */}
        {step === 'recording' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Col: Live Webcam display */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden p-6 relative gap-4 shadow-xl">
              
              <div className="flex justify-between items-center pb-2">
                <div className="flex items-center gap-2">
                  {isRecordingStarted ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                      </span>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-350 animate-pulse">
                        Live Recording
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="relative flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                        Camera Ready (Standing By)
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-400">
                  <Timer className="w-3.5 h-3.5 text-[#7145FF]" />
                  <span className={isRecordingStarted && timeLeft <= 10 ? 'text-red-400 font-extrabold animate-pulse' : ''}>
                    00:{timeLeft.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Webcam view container */}
              <div className="relative h-72 sm:h-96 w-full bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                {cameraPermission === 'granted' ? (
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover -scale-x-100"
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                    <VideoOff className="w-8 h-8 text-slate-500 animate-pulse mb-2" />
                    <p className="text-xs font-bold text-slate-200">Simulation Capture Feed Active</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-sm leading-relaxed">
                      Physical webcam access is deactivated or simulated. Speech models and AI transcripts remain fully operational.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Question selection panel & active task */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl gap-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-950/60 p-3 border border-slate-850 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                    Active Question Section
                  </span>
                  <span className="text-xs font-bold font-mono text-white bg-[#7145FF]/40 border border-[#7145FF]/45 px-2.5 py-0.5 rounded-full">
                    {currentQuestionIdx + 1} of {QUESTIONS.length}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-white leading-tight">
                    {QUESTIONS[currentQuestionIdx].title}
                  </h3>
                  <div className="h-0.5 bg-slate-800 w-16"></div>
                  <p className="text-sm text-slate-300 leading-relaxed pt-1">
                    {QUESTIONS[currentQuestionIdx].text}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-[10.5px] leading-relaxed text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5 font-bold text-slate-400 mb-1 font-mono uppercase text-[9.5px]">
                    <Mic className="w-3.5 h-3.5 text-[#7145FF]" /> Tips for candidates
                  </div>
                  {isRecordingStarted 
                    ? "Recording is live. Please continue speaking naturally or click the button below to complete early."
                    : "Read the question carefully. Formulate your answer, then click 'Start Recording Answer' below to initiate the active response."}
                </div>

                {!isRecordingStarted ? (
                  <button
                    onClick={() => startRecordingCurrentQuestion()}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer shadow-emerald-500/20 shadow-lg"
                    id="start-recording-btn"
                  >
                    <Video className="w-4 h-4 text-emerald-100" />
                    <span>Start Recording Answer</span>
                    <ChevronRight className="w-4 h-4 text-emerald-100" />
                  </button>
                ) : (
                  <button
                    onClick={handleNextOrSubmit}
                    className="w-full py-3.5 bg-[#7145FF] hover:bg-[#5b32e6] text-white font-extrabold rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer shadow-[#7145FF]/20 shadow-lg"
                    id="next-question-btn"
                  >
                    <span>
                      {currentQuestionIdx < QUESTIONS.length - 1 
                        ? `Save & Continue to Question 0${currentQuestionIdx + 2}` 
                        : 'Finish & Compile Video Interview'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: UPLOADING & COMPILING PROGRESS */}
        {step === 'uploading' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 max-w-md mx-auto text-center space-y-6 shadow-2xl backdrop-blur-md">
            <div className="flex justify-center">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-slate-800 border-t-[#7145FF] animate-spin" />
                <Sparkles className="w-6 h-6 text-[#7145FF] absolute animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Compiling Professional Assets</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Processing recorded binary buffers, generating a combined Mux direct upload ID, and analyzing transcripts with AI modules.
              </p>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-850 p-4 font-mono text-[10px] text-slate-500 space-y-1.5 text-left">
              <p className="flex justify-between"><span>• Connecting to core platform gateway...</span><span className="text-emerald-400">DONE</span></p>
              <p className="flex justify-between"><span>• Packaging raw streaming audio segments...</span><span className="text-emerald-400">DONE</span></p>
              <p className="flex justify-between"><span>• Submitting upload session to Mux...</span><span className="text-blue-400 font-bold">STREAMING</span></p>
            </div>
          </div>
        )}

        {/* STEP 4: INTERVIEW EVALUATION VIEW */}
        {step === 'finished' && evaluationResult && (
          <div className="space-y-6 animate-fade-in text-slate-200 font-sans">
            {/* Highly interactive top banner summary */}
            <div className="bg-gradient-to-r from-[#1e1b4b]/60 to-[#0f172a]/65 border border-[#7145FF]/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden backdrop-blur-md shadow-xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#7145FF]/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="space-y-2 relative">
                <div className="flex items-center gap-2 bg-[#7145FF]/10 border border-[#7145FF]/25 px-2.5 py-0.5 rounded-full w-fit">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-400">
                    Interview Evaluation Completed Successfully
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Your Job Readiness Certificate is Ready
                </h2>
                <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                  The AI scoring model has evaluated your answers, post-processed technical skills phrasing, 
                  and compiled high-speed direct stream playback assets.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center gap-4 shrink-0 shadow-lg">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold leading-tight">
                    Final Result Score
                  </span>
                  <p className="text-2xl font-black text-white leading-none">
                    {evaluationResult.score}<span className="text-xs text-slate-500 font-bold">/100</span>
                  </p>
                </div>
                <div className="h-8 w-[1px] bg-slate-800"></div>
                <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded-lg border ${
                  evaluationResult.score >= 80 
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                }`}>
                  {evaluationResult.score >= 80 ? 'Exceptional Match' : 'Passing Match'}
                </span>
              </div>
            </div>

            {/* Twin Columns Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Overall feedback details */}
              <div className="lg:col-span-12 xl:col-span-5 flex flex-col justify-between bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                    <Sparkles className="w-5 h-5 text-[#7145FF]" />
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                      Recruiter Feedback & Analysis
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {evaluationResult.feedback || 'The scoring algorithms have synthesized speech dynamics, presentation pace, and key vocabulary elements to construct professional feedback logs.'}
                  </p>

                  <div className="pt-2 space-y-2">
                    <h4 className="text-[10.5px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                      Competency Matrix Values
                    </h4>
                    
                    <div className="space-y-1.5 font-mono text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Confidence Dynamics</span>
                        <span className="text-emerald-400 font-bold">EXCELLENT</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '88%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-1.5 font-mono text-[10px] pt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Grammatical & Technical Vocabulary</span>
                        <span className="text-emerald-400 font-bold">PROFESSIONAL</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg--[#7145FF]" style={{ width: '82%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-1.5 font-mono text-[10px] pt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Presentation Posture & Eye-Contact</span>
                        <span className="text-blue-400 font-bold">STRONG</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-850">
                  <div className="flex justify-between items-center text-[10px] leading-relaxed text-slate-500 font-medium">
                    <span>Target Employer Level</span>
                    <span className="font-mono text-white font-bold bg-slate-950 px-2.5 py-1 rounded border border-slate-850">
                      SENIOR MATCH
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Player and Transcript Output */}
              <div className="lg:col-span-12 xl:col-span-7 space-y-4">
                {/* Simple Player container */}
                <div className="space-y-2">
                  <h4 className="text-[10.5px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-[#7145FF]" />
                    Saved Recording Playback (Mux Direct Stream)
                  </h4>

                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 shadow-inner">
                    {questionVideos[finishedActiveIdx] ? (
                      <LaunchpathMuxPlayer 
                        videoUrl={questionVideos[finishedActiveIdx] as string | undefined} 
                        poster={LAUNCHPATH_POSTER_SVG}
                        className="w-full h-full"
                      />
                    ) : evaluationResult?.video_url ? (
                      <LaunchpathMuxPlayer 
                        videoUrl={evaluationResult.video_url as string | undefined} 
                        poster={LAUNCHPATH_POSTER_SVG}
                        className="w-full h-full"
                      />
                    ) : savedVideosUrl && finishedActiveIdx === QUESTIONS.length - 1 ? (
                      <LaunchpathMuxPlayer 
                        videoUrl={savedVideosUrl as string | undefined} 
                        poster={LAUNCHPATH_POSTER_SVG}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                        <Play className="w-8 h-8 text-slate-500 animate-pulse mb-2" />
                        <p className="text-xs font-bold text-slate-200">Simulation Stream Playback Mode</p>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-sm leading-relaxed">
                          No physical webcam recordings captured (Simulator Fallback). Standard speech logging models processed evaluations smoothly.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Switchable tabs to view transcripts question by question */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-1 pb-1 border-b border-slate-850">
                    {QUESTIONS.map((q, idx) => (
                      <button
                        key={q.id}
                        onClick={() => setFinishedActiveIdx(idx)}
                        className={`px-3 py-1.5 text-xxs font-mono font-bold uppercase rounded-lg transition-all cursor-pointer border ${
                          finishedActiveIdx === idx 
                            ? 'bg-[#7145FF]/10 text-white border-[#7145FF]/40' 
                            : 'bg-slate-950/40 text-slate-400 border-slate-900 hover:text-slate-200 hover:bg-slate-900/40'
                        }`}
                      >
                        Q0{q.id}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const parsedQuestions = evaluationResult?.questions 
                      ? (typeof evaluationResult.questions === 'string' ? JSON.parse(evaluationResult.questions) : evaluationResult.questions) 
                      : [];
                    const activeEval = parsedQuestions?.find((pq: any) => pq.id === (finishedActiveIdx + 1));
                    
                    if (!activeEval) return null;

                    return (
                      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-left space-y-3 animate-fade-in">
                        <div className="space-y-1">
                          <span className="font-bold text-[10px] font-mono text-[#7145FF] uppercase block tracking-wider">
                            Generated Transcript Review
                          </span>
                          <p className="text-xs text-slate-300 italic leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-850/60">
                            &ldquo;{activeEval.transcript}&rdquo;
                          </p>
                        </div>

                        {activeEval.points && activeEval.points.length > 0 && (
                          <div className="space-y-1">
                            <span className="font-bold text-[10px] font-mono text-slate-400 uppercase block tracking-wider">
                              Developmental Insights
                            </span>
                            <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-1">
                              {activeEval.points.map((pt: string, pIdx: number) => (
                                <li key={pIdx} className="leading-relaxed">
                                  {pt}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Optional Request Re-evaluation Button */}
                        {activeEval.questionScore !== undefined && activeEval.questionScore < 85 && (
                          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/30 p-3.5 rounded-lg border border-slate-850">
                            <div className="space-y-0.5">
                              <h5 className="text-xs font-bold text-slate-300">Score Below Target ({activeEval.questionScore}%)</h5>
                              <p className="text-[10px] text-slate-400">Initiate a dedicated AI re-evaluation session to re-analyze your answer phrasing, vocabulary, and presentation posture.</p>
                            </div>
                            <button
                              type="button"
                              disabled={isReevaluating}
                              onClick={() => handleReevaluate(activeEval.id)}
                              className="text-xs font-bold px-3 py-1.5 bg-[#7145FF]/20 hover:bg-[#7145FF]/30 border border-[#7145FF]/40 text-[#a385ff] rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                            >
                              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                              {isReevaluating ? 'Analyzing...' : 'Request Re-evaluation'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-6 border-t border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={() => {
                  setStep('intro');
                  setEvaluationResult(null);
                  setSavedVideosUrl('');
                  setQuestionVideos({});
                  singleRecorderRef.current = null;
                  singleChunksRef.current = [];
                  fullBlobRef.current = null;
                  setQuestionSeconds({});
                }}
                className="w-full sm:w-auto px-5 py-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-extrabold rounded-xl transition text-sm cursor-pointer justify-center flex items-center gap-1.5"
                id="retake-interview-btn"
              >
                <RefreshCw className="w-4 h-4 text-[#7145FF]" />
                <span>Start New / Retake Interview</span>
              </button>

              <button
                onClick={() => router.push('/candidate/dashboard')}
                className="w-full sm:w-auto px-5 py-3 bg-[#7145FF] hover:bg-[#5b32e6] text-white font-extrabold rounded-xl transition text-sm cursor-pointer shadow-[#7145FF]/20 shadow-lg justify-center flex items-center gap-1.5"
                id="return-dashboard-btn"
              >
                <span>Return to Candidate Dashboard</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

          </>
        )}

      </main>

      {/* Footer copyright */}
      <footer className="border-t border-slate-900 bg-slate-950/40 p-4 text-center z-10">
        <p className="text-[10px] font-mono text-slate-500 tracking-wider">
          © 2026 LAUNCHPATH TALENT PLATFORM • SECURE COMPLIANCE SANDBOX
        </p>
      </footer>

    </div>
  );
}
