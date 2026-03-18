import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ActivityIcon,
  HeartPulseIcon,
  FileTextIcon,
  SaveIcon,
  RefreshCwIcon,
  ListIcon,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { Badge } from "../components/ui/Badge";
import { DisclaimerBox } from "../components/DisclaimerBox";
import { VideoUpload } from "../components/VideoUpload";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useToast } from "../hooks/useToast";
import { getDogs, analyzeVideo } from "../services/api";
import { formatConfidence } from "../utils/helpers";
import { VIDEO_CONSTRAINTS } from "../constants";
export const AnalyzePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [dogs, setDogs] = useState([]);
  const [selectedDog, setSelectedDog] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [showTechnical, setShowTechnical] = useState(false);
  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const dogsData = await getDogs();
        setDogs(
          dogsData.map((d) => ({
            value: d.id,
            label: d.name,
          })),
        );
      } catch (error) {
        showToast("Failed to load dogs", "error");
      }
    };
    fetchDogs();
  }, [showToast]);

  const validateVideo = (file) => {
    // Check file type
    if (!VIDEO_CONSTRAINTS.ALLOWED_TYPES.includes(file.type)) {
      showToast(
        `Invalid file type. Allowed: ${VIDEO_CONSTRAINTS.ALLOWED_EXTENSIONS.join(', ')}`,
        'error'
      );
      return false;
    }

    // Check file size
    if (file.size > VIDEO_CONSTRAINTS.MAX_SIZE_BYTES) {
      showToast(
        `File too large. Maximum size: ${VIDEO_CONSTRAINTS.MAX_SIZE_MB}MB`,
        'error'
      );
      return false;
    }

    return true;
  };

  const handleVideoChange = (file) => {
    if (file && validateVideo(file)) {
      setSelectedFile(file);
      showToast('Video selected successfully', 'success');
    } else {
      setSelectedFile(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedDog || !selectedFile) return;
    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + 10;
      });
    }, 300);
    try {
      const analysisResult = await analyzeVideo(selectedFile, selectedDog);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setResult(analysisResult);
        setIsAnalyzing(false);
        showToast("Analysis complete!", "success");
      }, 500);
    } catch (error) {
      clearInterval(interval);
      setIsAnalyzing(false);
      showToast("Analysis failed. Please try again.", "error");
    }
  };
  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setProgress(0);
  };
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-primary mb-2">
          Upload Dog Behavior Video
        </h1>
        <p className="text-gray-600">
          Our AI will analyze the video for early signs of illness.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!result && !isAnalyzing && (
          <motion.div
            key="upload"
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
            }}
            className="card space-y-8"
          >
            {/* Step 1 */}
            <div>
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-sm">
                  1
                </span>
                Select Dog
              </h3>
              {dogs.length > 0 ? (
                <Select
                  label="Which dog is this video for?"
                  options={dogs}
                  value={selectedDog}
                  onChange={(e) => setSelectedDog(e.target.value)}
                  required
                />
              ) : (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-center justify-between">
                  <p className="text-warning-dark font-medium">
                    Please add a dog profile first.
                  </p>
                  <Button size="sm" onClick={() => navigate("/add-dog")}>
                    Add Dog
                  </Button>
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div
              className={!selectedDog ? "opacity-50 pointer-events-none" : ""}
            >
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-sm">
                  2
                </span>
                Upload Video
              </h3>
              <VideoUpload
                selectedFile={selectedFile}
                onFileSelect={handleVideoChange}
                onClear={() => setSelectedFile(null)}
                disabled={!selectedDog}
              />
            </div>

            {/* Step 3 */}
            <div className="pt-4 border-t border-gray-100">
              <Button
                fullWidth
                size="lg"
                onClick={handleAnalyze}
                disabled={!selectedDog || !selectedFile}
                icon={<ActivityIcon className="w-5 h-5" />}
              >
                Analyze Video
              </Button>
            </div>
          </motion.div>
        )}

        {isAnalyzing && (
          <motion.div
            key="analyzing"
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
            }}
            className="card flex flex-col items-center justify-center py-16"
          >
            <LoadingSpinner size="lg" className="mb-6" />
            <h3 className="text-xl font-bold text-primary mb-2">
              Analyzing video...
            </h3>
            <p className="text-gray-500 mb-8">This may take 30-60 seconds</p>

            <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
              <motion.div
                className="bg-secondary h-2.5 rounded-full"
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${progress}%`,
                }}
                transition={{
                  duration: 0.3,
                }}
              ></motion.div>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {progress}% Complete
            </p>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="result"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="space-y-6"
          >
            {/* Top Result Card */}
            <div className="card overflow-hidden">
              <div
                className={`h-2 w-full ${result.classification === "Abnormal" ? "bg-danger" : "bg-success"}`}
              ></div>
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-primary mb-2">
                      Analysis Result
                    </h2>
                    <p className="text-gray-500 flex items-center gap-2">
                      <FileTextIcon className="w-4 h-4" /> {result.filename}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={
                        result.classification === "Abnormal"
                          ? "abnormal"
                          : "normal"
                      }
                      className="text-lg px-4 py-2"
                    >
                      {result.classification}
                    </Badge>
                    <Badge variant={result.urgency.toLowerCase()}>
                      {result.urgency} Urgency
                    </Badge>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Confidence Score
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {formatConfidence(result.confidence)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className={`h-3 rounded-full ${result.classification === "Abnormal" ? "bg-danger" : "bg-success"}`}
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${result.confidence}%`,
                      }}
                      transition={{
                        duration: 1,
                        delay: 0.5,
                        ease: "easeOut",
                      }}
                    ></motion.div>
                  </div>
                </div>

                {/* XAI Insights */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary border-b border-gray-100 pb-2">
                    Explainable AI Insights
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                      <h4 className="font-bold text-secondary flex items-center gap-2 mb-3">
                        <ActivityIcon className="w-5 h-5" /> Observations
                      </h4>
                      <ul className="space-y-2">
                        {(result.xaiInsights?.observations || []).map((obs, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-gray-700"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0"></span>
                            {obs}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-orange-50/50 rounded-xl p-5 border border-orange-100">
                      <h4 className="font-bold text-warning-dark flex items-center gap-2 mb-3">
                        <HeartPulseIcon className="w-5 h-5" /> Health Concerns
                      </h4>
                      <ul className="space-y-2">
                        {(result.xaiInsights?.concerns || []).map((concern, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-gray-700"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0"></span>
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-green-50/50 rounded-xl p-5 border border-green-100">
                    <h4 className="font-bold text-success-dark flex items-center gap-2 mb-3">
                      <CheckCircle2Icon className="w-5 h-5" /> Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {(result.xaiInsights?.recommendations || []).map((rec, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="card p-0 overflow-hidden">
              <button
                onClick={() => setShowTechnical(!showTechnical)}
                className="w-full p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-bold text-gray-700">
                  Technical Details
                </span>
                {showTechnical ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>

              <AnimatePresence>
                {showTechnical && (
                  <motion.div
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    className="p-4 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 uppercase text-xs mb-1">
                          Model
                        </p>
                        <p className="font-medium text-gray-900">
                          CNN+LSTM MobileNetV2
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase text-xs mb-1">
                          Frames Analyzed
                        </p>
                        <p className="font-medium text-gray-900">
                          {result.framesAnalyzed}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase text-xs mb-1">
                          Probability Score
                        </p>
                        <p className="font-medium text-gray-900">
                          {result.probability.toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 uppercase text-xs mb-1">
                          Threshold
                        </p>
                        <p className="font-medium text-gray-900">0.3</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Disclaimer */}
            <DisclaimerBox variant="alert">
              <strong>Important:</strong> This system provides behavioral
              analysis only and is not a diagnostic tool. Always consult a
              qualified veterinarian for professional medical advice.
            </DisclaimerBox>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                className="flex-1"
                icon={<SaveIcon className="w-4 h-4" />}
              >
                Save to History
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleReset}
                icon={<RefreshCwIcon className="w-4 h-4" />}
              >
                Analyze Another
              </Button>
              <Button
                variant="ghost"
                className="flex-1 border border-gray-200"
                onClick={() => navigate("/history")}
                icon={<ListIcon className="w-4 h-4" />}
              >
                View History
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
