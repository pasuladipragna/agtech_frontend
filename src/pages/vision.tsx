import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import {
  ScanEye, Upload, Sparkles, AlertTriangle, CheckCircle2, CloudRain, Droplets, Video, Image as ImageIcon, ExternalLink, ShieldCheck
} from "lucide-react";
import { inspectCropImage, processFieldVideo, fetchDetections } from "@/services/api";

export default function AIVisionLab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"image" | "video">("image");
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [videoResult, setVideoResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchDetections().then(data => {
      if (data) setHistory(data);
    }).catch(err => console.error(err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    setResult(null);
    setVideoResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("field_id", "1");
    formData.append("crop_name", "Roma Tomato");

    try {
      if (activeTab === "image") {
        const res = await inspectCropImage(formData);
        setResult(res);
        setHistory([res, ...history]);
      } else {
        const vRes = await processFieldVideo(formData);
        setVideoResult(vRes);
      }
    } catch (err) {
      console.error("AI Analysis error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-emerald-900/40">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> OpenRouter Vision Gateway Layer
            </div>
            <h1 className="text-2xl font-bold text-white">AI Crop Disease & Pest Inspection Lab</h1>
            <p className="text-xs text-gray-400">Single Crop Photo Classification & Video Keyframe Region Evidence Analyzer</p>
          </div>

          <div className="flex bg-black/60 p-1 rounded-xl border border-emerald-900/40">
            <button
              onClick={() => { setActiveTab("image"); setResult(null); setVideoResult(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === "image" ? "bg-emerald-600 text-black shadow-md glow-emerald" : "text-gray-400"
              }`}
            >
              <ImageIcon className="w-4 h-4" /> <span>Photo Inspection</span>
            </button>
            <button
              onClick={() => { setActiveTab("video"); setResult(null); setVideoResult(null); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === "video" ? "bg-emerald-600 text-black shadow-md glow-emerald" : "text-gray-400"
              }`}
            >
              <Video className="w-4 h-4" /> <span>Video Region Analysis</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-emerald-900/40 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-gray-200 mb-2">
                Upload {activeTab === "image" ? "Crop Foliage Image" : "Field Inspection Video"}
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                {activeTab === "image"
                  ? "Upload a photo captured by the rover camera or farmer phone to identify pests/diseases."
                  : "Upload a video recorded along crop lanes. System extracts keyframe regions & saves evidence to Cloudinary."}
              </p>

              <label className="border-2 border-dashed border-emerald-800/60 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-black/30 transition-all group">
                <input
                  type="file"
                  accept={activeTab === "image" ? "image/*" : "video/*"}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-gray-200">
                  {selectedFile ? selectedFile.name : "Click to select or drag file here"}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  Supported formats: {activeTab === "image" ? "JPG, PNG, WEBP (Max 15MB)" : "MP4, MOV, AVI (Max 100MB)"}
                </div>
              </label>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || analyzing}
              className={`w-full py-3.5 mt-6 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg ${
                selectedFile && !analyzing
                  ? "bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black shadow-emerald-900/40 glow-emerald"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              <ScanEye className="w-4 h-4" />
              <span>{analyzing ? "Analyzing Vision & Saving Evidence..." : "RUN AI VISION INSPECTION"}</span>
            </button>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-emerald-900/40">
            <h3 className="font-bold text-sm text-gray-200 mb-4 flex items-center justify-between">
              <span>AI Vision Diagnostics Output</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Model: OpenRouter / Claude 3.5 Sonnet
              </span>
            </h3>

            {analyzing && (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                <div className="text-xs text-emerald-300 font-semibold">Running Neural Vision Model...</div>
                <div className="text-[10px] text-gray-400">Classifying lesions, severity, and precision spray dosage</div>
              </div>
            )}

            {!analyzing && result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-emerald-900/30">
                  <div>
                    <div className="text-xs text-gray-400">Diagnosis</div>
                    <div className="text-base font-bold text-white">{result.label}</div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded text-xs font-extrabold ${
                      result.is_healthy ? "bg-emerald-950 text-emerald-400 border border-emerald-700" : "bg-red-950 text-red-400 border border-red-700"
                    }`}>
                      {result.severity} SEVERITY
                    </span>
                    <div className="text-[10px] font-mono text-emerald-300 mt-1">{(result.confidence * 100).toFixed(0)}% AI Confidence</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/30 text-xs text-gray-300 space-y-1">
                  <div className="font-semibold text-emerald-400">Recommended Precision Spray Treatment:</div>
                  <div>{result.recommended_treatment}</div>
                  <div className="text-cyan-300 font-bold mt-1">
                    Recommended Spray Volume: {result.recommended_spray_volume_l_per_ha} L/ha
                  </div>
                </div>

                {result.image_url && (
                  <div className="rounded-xl overflow-hidden border border-emerald-900/40 max-h-40">
                    <img src={result.image_url} alt="Evidence" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            {!analyzing && videoResult && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 font-semibold">
                  {videoResult.results?.summary}
                </div>

                <div className="space-y-2">
                  {videoResult.results?.useful_evidence_frames?.map((f: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-black/40 border border-emerald-900/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-200">Keyframe @ {f.timestamp_sec}s</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px]">Cloudinary Saved</span>
                      </div>
                      <div className="text-gray-400 text-[11px]">{f.detection?.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!analyzing && !result && !videoResult && (
              <div className="p-12 text-center text-gray-500 text-xs">
                Upload a photo or video and click "Run AI Vision Inspection" to view diagnostic results.
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-900/40">
          <h3 className="font-bold text-sm text-gray-200 mb-4 flex items-center gap-2">
            <ScanEye className="w-4 h-4 text-emerald-400" /> Saved Cloudinary Evidence Images Log
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {history.map((h: any) => (
              <div key={h.id} className="bg-black/40 rounded-xl overflow-hidden border border-emerald-900/30 flex flex-col justify-between">
                <div className="h-32 bg-gray-900 relative">
                  <img src={h.image_url} alt={h.label} className="w-full h-full object-cover" />
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold ${
                    h.is_healthy ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"
                  }`}>
                    {h.severity}
                  </span>
                </div>

                <div className="p-3 space-y-1">
                  <div className="font-bold text-xs text-gray-200 line-clamp-1">{h.label}</div>
                  <div className="text-[10px] text-gray-400">{h.crop_name || "Roma Tomato"} • {(h.confidence * 100).toFixed(0)}% Confidence</div>
                  <div className="text-[10px] text-cyan-300 font-mono">{h.recommended_spray_volume_l_per_ha} L/ha</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
