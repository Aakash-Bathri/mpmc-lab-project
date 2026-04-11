"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import { preprocessImage } from "@/lib/image-processing";
import { Camera, RefreshCw, Loader2, CheckCircle, Database } from "lucide-react";

export default function ScannerPage() {
    const webcamRef = useRef<Webcam>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // OCR & Form State
    const [plateNumber, setPlateNumber] = useState("");
    const [isNITTExempt, setIsNITTExempt] = useState(false);
    const [ownerName, setOwnerName] = useState("");
    const [drivingLicense, setDrivingLicense] = useState("");
    const [ocrText, setOcrText] = useState("");

    const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [submitMessage, setSubmitMessage] = useState("");

    const captureAndAnalyze = useCallback(async () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (!imageSrc) return;

            setCapturedImage(imageSrc);
            setIsProcessing(true);
            setSubmitStatus("idle");

            try {
                // 1. Preprocess Image
                const enhancedImage = await preprocessImage(imageSrc);
                setProcessedImage(enhancedImage);

                // 2. Run OCR
                const { data: { text } } = await Tesseract.recognize(enhancedImage, 'eng', {
                    logger: m => console.log(m)
                });

                setOcrText(text);

                // 3. Extract Plate Number and Exemption
                const cleanText = text.replace(/\n/g, ' ').toUpperCase();

                // Match Indian Number Plate: TN 45 AB 1234 or TN45AB1234
                // Adding more flexibility for slightly flawed OCR
                const plateRegex = /[A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{1,4}/g;
                const matches = cleanText.match(plateRegex);

                if (matches && matches.length > 0) {
                    // Format correctly
                    const rawPlate = matches[0].replace(/[-\s]/g, '');
                    setPlateNumber(rawPlate);
                } else {
                    // Fallback: If strict regex fails, just strip out all non-alphanumeric characters
                    // and take the longest contiguous alphanumeric block as a best guess
                    const alphanumericOnly = cleanText.replace(/[^A-Z0-9]/g, ' ');
                    const words = alphanumericOnly.split(' ').filter(w => w.length > 3);
                    if (words.length > 0) {
                        // Let user edit the best guess directly in the input box
                        // Sort by length, usually plate numbers are the longest alphanumeric strings
                        words.sort((a, b) => b.length - a.length);
                        setPlateNumber(words[0]);
                    } else {
                        // Extreme fallback: just dump all alphanumerics
                        setPlateNumber(alphanumericOnly.replace(/\s/g, ''));
                    }
                }

                // Check for NITT logo / text match
                if (cleanText.includes("NITT") || cleanText.includes("NATIONAL INSTITUTE OF TECHNOLOGY")) {
                    setIsNITTExempt(true);
                } else {
                    setIsNITTExempt(false);
                }
            } catch (err) {
                console.error("OCR Failed", err);
            } finally {
                setIsProcessing(false);
            }
        }
    }, [webcamRef]);

    const retake = () => {
        setCapturedImage(null);
        setProcessedImage(null);
        setPlateNumber("");
        setIsNITTExempt(false);
        setOcrText("");
        setSubmitStatus("idle");
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitStatus("loading");

        // Validate Indian Number Plate format strictly
        const strictPlateRegex = /^[A-Z]{2}[-\s]?[0-9]{1,2}[-\s]?[A-Z]{1,3}[-\s]?[0-9]{1,4}$/i;
        if (!strictPlateRegex.test(plateNumber.trim())) {
            setSubmitStatus("error");
            setSubmitMessage("Invalid Vehicle Number format (e.g., TN01AB1234)");
            return;
        }

        // Validate Indian Driving License format strictly (if provided)
        // Format: 2 Letters, 2 Digits, Optional Space, 11 Digits
        if (drivingLicense.trim()) {
            const dlRegex = /^[A-Z]{2}[0-9]{2}( )?[0-9]{11}$/i;
            if (!dlRegex.test(drivingLicense.trim())) {
                setSubmitStatus("error");
                setSubmitMessage("Invalid Driving License format (e.g., TN01 20220000000)");
                return;
            }
        }

        try {
            const res = await fetch("/api/logs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plateNumber,
                    ownerName,
                    drivingLicense,
                    isNITTExempt
                })
            });

            if (res.ok) {
                const data = await res.json();
                setSubmitStatus("success");
                setSubmitMessage(`Vehicle successfully logged for ${data.type}!`);
                setOwnerName("");
                setDrivingLicense("");
            } else {
                const err = await res.json();
                throw new Error(err.error || "Failed to submit log");
            }
        } catch (error: any) {
            setSubmitStatus("error");
            setSubmitMessage(error.message || "An error occurred.");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Camera className="h-8 w-8 text-brand-500" />
                    Vehicle Scanner
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Position the number plate within the camera feed to capture.</p>
            </div>

            <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                {/* Camera Flow */}
                <div className="space-y-4">
                    <div className="relative glass rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm aspect-video flex items-center justify-center bg-black">
                        {!capturedImage ? (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{
                                    facingMode: "environment",
                                    width: { ideal: 1920 },
                                    height: { ideal: 1080 }
                                }}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img src={processedImage || capturedImage} alt="Captured" className="w-full h-full object-contain" />
                        )}

                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-4">
                                <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
                                <p className="font-medium animate-pulse">Running OCR & Image Enhancements...</p>
                            </div>
                        )}

                        {/* Outline guide box */}
                        {!capturedImage && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-[90%] h-[40%] border-2 border-brand-400/80 rounded-xl shadow-[0_0_0_9999px_rgba(15,23,42,0.85)] animate-scan flex items-center justify-center overflow-hidden">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-400 rounded-tl-xl"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-400 rounded-tr-xl"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-400 rounded-bl-xl"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-400 rounded-br-xl"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center gap-4">
                        {!capturedImage ? (
                            <button
                                onClick={captureAndAnalyze}
                                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-brand-500/30 transition-all hover:scale-105"
                            >
                                <Camera className="h-5 w-5" />
                                Capture & Scan
                            </button>
                        ) : (
                            <button
                                onClick={retake}
                                disabled={isProcessing}
                                className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white px-6 py-3 rounded-full font-bold transition-all disabled:opacity-50"
                            >
                                <RefreshCw className="h-5 w-5" />
                                Retake
                            </button>
                        )}
                    </div>

                    {/* Debug/Show RAW OCR */}
                    {ocrText && (
                        <div className="bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 p-4 rounded-xl text-xs font-mono text-slate-500 dark:text-slate-400 max-h-32 overflow-y-auto">
                            <strong>Raw OCR Output:</strong><br />
                            {ocrText}
                        </div>
                    )}
                </div>

                {/* Data Form */}
                <div className="glass rounded-3xl p-8 border border-slate-200 dark:border-slate-800 h-fit shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                        <div className="p-2 bg-brand-100 dark:bg-brand-900/40 rounded-xl">
                            <Database className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                        </div>
                        Entry Details
                    </h2>

                    <form onSubmit={handleManualSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Plate Number</label>
                            <input
                                type="text"
                                value={plateNumber}
                                onChange={e => setPlateNumber(e.target.value)}
                                required
                                placeholder="e.g. TN45AB1234"
                                className="w-full px-5 py-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white font-mono uppercase tracking-widest text-lg transition-all shadow-sm"
                            />
                        </div>

                        {isNITTExempt && (
                            <div className="flex items-center gap-3 p-3 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                <span className="font-medium text-green-800 dark:text-green-300 text-sm">Valid NITT Campus Vehicle Detected</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Driver Name <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span></label>
                            <input
                                type="text"
                                value={ownerName}
                                onChange={e => setOwnerName(e.target.value)}
                                placeholder="Enter full name"
                                className="w-full px-5 py-3 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white transition-all shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Driving License <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span></label>
                            <input
                                type="text"
                                value={drivingLicense}
                                onChange={e => setDrivingLicense(e.target.value)}
                                placeholder="License ID string"
                                className="w-full px-5 py-3 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 dark:text-white transition-all uppercase font-mono shadow-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitStatus === "loading" || !plateNumber}
                            className="w-full py-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/40 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex justify-center items-center gap-2 mt-4"
                        >
                            {submitStatus === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                            Log Vehicle Entry
                        </button>

                        {submitStatus === "success" && (
                            <p className="text-green-600 dark:text-green-400 font-medium text-center text-sm">{submitMessage}</p>
                        )}
                        {submitStatus === "error" && (
                            <p className="text-red-600 dark:text-red-400 font-medium text-center text-sm">{submitMessage}</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
