import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  StethoscopeIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  FileTextIcon,
  UserIcon,
  DogIcon,
  ActivityIcon,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/Modal";
import { Textarea } from "../components/ui/Textarea";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useToast } from "../hooks/useToast";
import { getVetCases, submitVetFeedback } from "../services/api";
import { formatDate, formatConfidence } from "../utils/helpers";
export const VetDashboardPage = () => {
  const { showToast } = useToast();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({
    status: "Confirmed",
    comments: "",
    recommendations: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const data = await getVetCases();
        setCases(data);
      } catch (error) {
        showToast("Failed to load vet cases", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [showToast]);
  const handleReviewClick = (caseItem) => {
    setSelectedCase(caseItem);
    setFeedback({
      status: "Confirmed",
      comments: "",
      recommendations: "",
    });
    setIsModalOpen(true);
  };
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    // Optional: if (!feedback.comments.trim() || !feedback.recommendations.trim()) {
    //   showToast("Please provide both comments and recommendations", "warning");
    //   return;
    // }
    setIsSubmitting(true);
    try {
      await submitVetFeedback(selectedCase.id, feedback);
      // Update local state
      setCases((prev) =>
        prev.map((c) =>
          c.id === selectedCase.id
            ? {
              ...c,
              status: "Reviewed",
            }
            : c,
        ),
      );
      showToast("Feedback submitted successfully", "success");
      setIsModalOpen(false);
    } catch (error) {
      showToast("Failed to submit feedback", "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-8 flex items-center gap-4"
      >
        <div className="p-3 bg-secondary/10 rounded-xl">
          <StethoscopeIcon className="w-8 h-8 text-secondary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">
            Veterinarian Portal
          </h1>
          <p className="text-gray-600">
            Review dog owner cases and provide expert feedback
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.1,
        }}
        className="card overflow-hidden p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-bold">Owner & Dog</th>
                <th className="p-4 font-bold">Upload Date</th>
                <th className="p-4 font-bold">AI Result</th>
                <th className="p-4 font-bold">Urgency</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {cases.map((caseItem, index) => (
                  <motion.tr
                    key={caseItem.id}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                          {caseItem.dogName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-primary">
                            {caseItem.dogName}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />{" "}
                            {caseItem.ownerName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatDate(caseItem.uploadDate)}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant={
                            caseItem.classification === "Abnormal"
                              ? "abnormal"
                              : "normal"
                          }
                        >
                          {caseItem.classification}
                        </Badge>
                        <span className="text-xs text-gray-500 font-medium">
                          {formatConfidence(caseItem.confidence)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={caseItem.urgency.toLowerCase()}>
                        {caseItem.urgency}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          caseItem.status === "Reviewed"
                            ? "reviewed"
                            : "pending"
                        }
                      >
                        {caseItem.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant={
                          caseItem.status === "Reviewed" ? "ghost" : "primary"
                        }
                        className={
                          caseItem.status === "Reviewed"
                            ? "border border-gray-200"
                            : ""
                        }
                        onClick={() => handleReviewClick(caseItem)}
                      >
                        {caseItem.status === "Reviewed"
                          ? "View Details"
                          : "Review Case"}
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {cases.length === 0 && (
            <div className="text-center py-12">
              <FileTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No cases available for review.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Case Review"
        size="xl"
      >
        {selectedCase && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Case Details */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                  <UserIcon className="w-5 h-5 text-secondary" /> Owner &
                  Patient Info
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Owner Name</p>
                    <p className="font-medium text-gray-900">
                      {selectedCase.ownerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Upload Date</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(selectedCase.uploadDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Patient Name</p>
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <DogIcon className="w-4 h-4 text-gray-400" />{" "}
                      {selectedCase.dogName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Breed / Age</p>
                    <p className="font-medium text-gray-900">
                      Golden Retriever, 3y
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                <h3 className="font-bold text-secondary mb-4 flex items-center gap-2 border-b border-blue-200 pb-2">
                  <ActivityIcon className="w-5 h-5" /> AI Analysis Results
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <Badge
                    variant={
                      selectedCase.classification === "Abnormal"
                        ? "abnormal"
                        : "normal"
                    }
                    className="text-lg px-4 py-1"
                  >
                    {selectedCase.classification}
                  </Badge>
                  <div className="text-sm">
                    <span className="text-gray-500 mr-2">Confidence:</span>
                    <span className="font-bold text-primary">
                      {formatConfidence(selectedCase.confidence)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      XAI Observations
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {(selectedCase.xaiInsights?.observations || []).map((obs, i) => (
                        <li key={i}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Health Concerns
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {(selectedCase.xaiInsights?.concerns || []).map((concern, i) => (
                        <li key={i}>{concern}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-warning/10 border-l-4 border-warning p-3 rounded-r-lg flex gap-3">
                <AlertCircleIcon className="w-5 h-5 text-warning flex-shrink-0" />
                <p className="text-xs text-warning-dark">
                  Video file has been deleted in compliance with GDPR. Only
                  metadata and extracted feature summaries are retained.
                </p>
              </div>
            </div>

            {/* Right Column: Feedback Form */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-primary text-lg mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                <FileTextIcon className="w-5 h-5 text-secondary" /> Expert
                Feedback
              </h3>

              {selectedCase.status === "Reviewed" ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-success-dark bg-success/10 p-3 rounded-lg">
                    <CheckCircle2Icon className="w-5 h-5" />
                    <span className="font-medium">
                      Feedback already submitted
                    </span>
                  </div>

                  {selectedCase.vetFeedback && (
                    <div className="mt-4 space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Status</p>
                        <p className="font-medium text-gray-900">{selectedCase.vetFeedback.status}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Expert Comments</p>
                        <p className="text-gray-800 text-sm whitespace-pre-wrap">{selectedCase.vetFeedback.comments}</p>
                      </div>

                      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                        <p className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">Recommendations for Owner</p>
                        <p className="text-gray-800 text-sm whitespace-pre-wrap">{selectedCase.vetFeedback.recommendations}</p>
                      </div>

                      <p className="text-xs text-gray-500 text-right mt-2">
                        Submitted by: {selectedCase.vetFeedback.vetName} on {formatDate(selectedCase.vetFeedback.date)}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Validation Status <span className="text-danger">*</span>
                    </label>
                    <div className="space-y-3">
                      {[
                        {
                          id: "Confirmed",
                          label: "Confirmed (Agree with AI)",
                        },
                        {
                          id: "Needs Further Examination",
                          label:
                            "Needs Further Examination (In-person visit required)",
                        },
                        {
                          id: "Inconclusive",
                          label:
                            "Inconclusive (Disagree with AI / Normal behavior)",
                        },
                      ].map((option) => (
                        <label
                          key={option.id}
                          className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="radio"
                            name="validationStatus"
                            value={option.id}
                            checked={feedback.status === option.id}
                            onChange={(e) =>
                              setFeedback((prev) => ({
                                ...prev,
                                status: e.target.value,
                              }))
                            }
                            className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 mt-0.5"
                          />

                          <span className="text-sm font-medium text-gray-800">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Textarea
                    label="Expert Comments (Optional)"
                    name="comments"
                    value={feedback.comments}
                    onChange={(e) =>
                      setFeedback((prev) => ({
                        ...prev,
                        comments: e.target.value,
                      }))
                    }
                    placeholder="Provide your professional opinion on the AI's findings..."
                    rows={4}
                  />

                  <Textarea
                    label="Recommendations for Owner (Optional)"
                    name="recommendations"
                    value={feedback.recommendations}
                    onChange={(e) =>
                      setFeedback((prev) => ({
                        ...prev,
                        recommendations: e.target.value,
                      }))
                    }
                    placeholder="What should the owner do next? (e.g., Book appointment, monitor for 24h)"
                    rows={3}
                  />

                  <div className="pt-4 border-t border-gray-100">
                    <Button
                      type="submit"
                      fullWidth
                      loading={isSubmitting}
                      icon={<CheckCircle2Icon className="w-5 h-5" />}
                    >
                      Submit Feedback
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
