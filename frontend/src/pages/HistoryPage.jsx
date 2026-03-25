import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dog,
  SearchIcon,
  FolderOpenIcon,
  CalendarIcon,
  ActivityIcon,
  StethoscopeIcon,
  CheckCircle2Icon,
  EditIcon,
} from "lucide-react";

import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { Button } from "../components/ui/Button";
import { PredictionCard } from "../components/PredictionCard";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Pagination } from "../components/Pagination";
import { Modal } from "../components/Modal";
import { Badge } from "../components/ui/Badge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { getHistory, getDogs, submitVetFeedback } from "../services/api";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import { useFetchData } from "../hooks/useFetchData";
import { formatDate, formatConfidence } from "../utils/helpers";

export const HistoryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialPredictionId = searchParams.get("id");
  const { showToast } = useToast();

  const { data: history, loading, error, refetch } = useFetchData(getHistory);

// DEBUG: Log history data
useEffect(() => {
  console.log("=== HISTORY PAGE DATA ===");
  console.log("Type:", typeof history);
  console.log("Is Array:", Array.isArray(history));
  console.log("Length:", history?.length);
  console.log("Data:", history);
  
  if (history) {
    console.log("HistoryPage received:", history.length, "predictions");
    console.log("Dog IDs in history:", [...new Set(history.map(h => h.dogId))]);
  }
}, [history]);

  const [filteredHistory, setFilteredHistory] = useState([]);
  const [dogs, setDogs] = useState([]);
  // Filters
  const [selectedDog, setSelectedDog] = useState("");
  const [selectedResult, setSelectedResult] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Modal
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Vet Feedback form state
  const { user } = useAuth();
  const [feedback, setFeedback] = useState({
    status: "Confirmed",
    comments: "",
    recommendations: "",
  });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);

  useEffect(() => {
    const fetchDogsOptions = async () => {
      if (!history) return;

      try {
        const dogsData = await getDogs();

        setDogs([
          {
            value: "",
            label: "All Dogs",
          },
          ...dogsData.map((d) => ({
            value: d.id,
            label: d.name,
          })),
        ]);

        if (initialPredictionId) {
          const pred = history.find((p) => p.id === initialPredictionId);
          if (pred) {
            setSelectedPrediction(pred);
            setIsModalOpen(true);
          }
        }
      } catch (error) {
        console.error("Failed to load dogs dropdown", error);
      }
    };
    fetchDogsOptions();
  }, [history, initialPredictionId]);

  useEffect(() => {
    if (!history) return;
    let result = history;
    if (selectedDog) {
      result = result.filter((p) => p.dogId === selectedDog);
    }
    if (selectedResult) {
      result = result.filter((p) => p.classification === selectedResult);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.filename.toLowerCase().includes(query) ||
          p.dogName.toLowerCase().includes(query),
      );
    }
    setFilteredHistory(result);
    setCurrentPage(1);
  }, [history, selectedDog, selectedResult, searchQuery]);

  const handleDelete = (id) => {
    refetch();
  };

  const openDetails = (id) => {
    const pred = history.find((p) => p.id === id);
    if (pred) {
      setSelectedPrediction(pred);
      setFeedback({
        status: "Confirmed",
        comments: "",
        recommendations: "",
      });
      setIsEditingFeedback(false);
      setIsModalOpen(true);
    }
  };

  const handleEditFeedback = () => {
    if (selectedPrediction.vetFeedback) {
      setFeedback({
        status: selectedPrediction.vetFeedback.status,
        comments: selectedPrediction.vetFeedback.comments,
        recommendations: selectedPrediction.vetFeedback.recommendations,
      });
      setIsEditingFeedback(true);
    }
  };

  const handleCancelEdit = () => {
    setFeedback({
      status: "Confirmed",
      comments: "",
      recommendations: "",
    });
    setIsEditingFeedback(false);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPrediction) return;

    setIsSubmittingFeedback(true);
    try {
      const res = await submitVetFeedback(selectedPrediction.id, feedback);

      // Trigger refetch
      refetch();

      // Update selected prediction locally
      setSelectedPrediction(prev => ({ ...prev, vetFeedback: res.feedback }));

      setIsEditingFeedback(false);
      showToast("Feedback submitted successfully", "success");
    } catch (error) {
      showToast("Failed to submit feedback", "error");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (loading || !history) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load History</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="bg-secondary text-white px-6 py-2 rounded-lg hover:bg-secondary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalItems = filteredHistory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        heading="Prediction History"
        description="View all your past video analyses"
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-8 p-4"
      >
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/4">
            <Select
              label="Filter by Dog"
              options={dogs}
              value={selectedDog}
              onChange={(e) => setSelectedDog(e.target.value)}
            />
          </div>
          <div className="w-full md:w-1/4">
            <Select
              label="Filter by Result"
              options={[
                { value: "", label: "All Results" },
                { value: "Normal", label: "Normal" },
                { value: "Abnormal", label: "Abnormal" },
              ]}
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
            />
          </div>
          <div className="w-full md:w-1/2">
            <Input
              label="Search"
              placeholder="Search by filename or dog name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<SearchIcon className="w-5 h-5" />}
            />
          </div>
        </div>
      </motion.div>

      {/* History Grid */}
      {filteredHistory.length > 0 ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {currentItems.map((prediction, index) => (
                <motion.div
                  key={prediction.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <PredictionCard
                    prediction={prediction}
                    onViewDetails={openDetails}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <EmptyState
          icon={<FolderOpenIcon className="w-12 h-12 text-blue-900" strokeWidth={1.5}/>}
          heading="No history found"
          message="Try adjusting your filters or upload a new video."
          actionLabel="Analyze Video Now"
          onAction={() => navigate("/analyze")}
        />
      )}

      {/* Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsEditingFeedback(false);
        }}
        title="Analysis Details"
        size="lg"
      >
        {selectedPrediction && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
                  {selectedPrediction.dogPhoto ? (
                    <img
                      src={selectedPrediction.dogPhoto}
                      alt={selectedPrediction.dogName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Dog className="w-8 h-8 text-blue-900" strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">
                    {selectedPrediction.dogName}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                    <CalendarIcon className="w-4 h-4" />
                    {formatDate(selectedPrediction.date)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge
                  variant={
                    selectedPrediction.classification === "Abnormal"
                      ? "abnormal"
                      : "normal"
                  }
                  className="text-lg px-4 py-1"
                >
                  {selectedPrediction.classification}
                </Badge>
                <Badge variant={selectedPrediction.urgency.toLowerCase()}>
                  {selectedPrediction.urgency} Urgency
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
              <div>
                <p className="text-sm text-gray-400 font-bold">
                  Confidence Score
                </p>
                <p className="text-xl text-blue-900 font-bold">
                  {formatConfidence(selectedPrediction.confidence)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-bold">
                  Video File
                </p>
                <p className="text-sm text-gray-900 font">
                  {selectedPrediction.filename}
                </p>
              </div>
            </div>

            {/* Additional Notes */}
            {selectedPrediction.dogNotes?.trim() ? (
              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <p className="text-base font-bold text-orange-400 tracking-wide mb-1">
                  Additional Notes
                </p>
                <p className="text-sm text-gray-800">
                  {selectedPrediction.dogNotes}
                </p>
              </div>
            ) : null}

            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 mt-6">
              <h4 className="font-bold text-secondary flex items-center gap-2 mb-3">
                <ActivityIcon className="w-5 h-5" /> Recommendation
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedPrediction.recommendation}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-bold text-gray-700 mb-3 text-base">
                Technical Details
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Model</p>
                  <p className="font-medium text-gray-900">
                    CNN+LSTM MobileNetV2
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Frames</p>
                  <p className="font-medium text-gray-900">
                    {selectedPrediction.framesAnalyzed}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Probability</p>
                  <p className="font-medium text-gray-900">
                    {selectedPrediction.probability.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Threshold</p>
                  <p className="font-medium text-gray-900">0.3</p>
                </div>
              </div>
            </div>

            {/* Vet Feedback Section */}
            {(selectedPrediction.vetFeedback || user?.accountType === "vet") && (
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mt-6">
                <h4 className="font-bold text-primary flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
                  <StethoscopeIcon className="w-5 h-5 text-secondary" /> Expert Veterinarian Review
                </h4>

                {selectedPrediction.vetFeedback && !isEditingFeedback ? (
                  /* Show existing feedback (READ ONLY for non-vets, EDITABLE for vets) */
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Status</p>
                      <p className="text-sm text-gray-900">{selectedPrediction.vetFeedback.status}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Expert Comments</p>
                      <p className="text-gray-800 text-sm whitespace-pre-wrap">{selectedPrediction.vetFeedback.comments}</p>
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                      <p className="text-xs text-secondary font-bold uppercase tracking-wider mb-1">Recommendations for Owner</p>
                      <p className="text-gray-800 text-sm whitespace-pre-wrap">{selectedPrediction.vetFeedback.recommendations}</p>
                    </div>

                    <p className="text-xs text-gray-500 text-right mt-2">
                      Submitted by: {selectedPrediction.vetFeedback.vetName} on {formatDate(selectedPrediction.vetFeedback.date)}
                    </p>

                    {/* EDIT BUTTON FOR VETS */}
                    {user?.accountType === "vet" && (
                      <Button
                        type="button"
                        variant="ghost"
                        fullWidth
                        onClick={handleEditFeedback}
                        icon={<EditIcon className="w-4 h-4" />}
                        className="border border-gray-200 mt-4"
                      >
                        Edit Feedback
                      </Button>
                    )}
                  </div>
                ) : user?.accountType === "vet" ? (
                  /* Show form ONLY for vets when no feedback exists OR when editing */
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-blue-900 mb-2">
                        Validation Status <span className="text-danger">*</span>
                      </label>
                      <select
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary text-sm"
                        value={feedback.status}
                        onChange={e => setFeedback(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="Confirmed">Confirmed (Agree with AI)</option>
                        <option value="Needs Further Examination">Needs Further Examination (In-person visit required)</option>
                        <option value="Inconclusive">Inconclusive (Disagree with AI / Normal behavior)</option>
                      </select>
                    </div>

                    <Textarea
                      label="Expert Comments (Optional)"
                      value={feedback.comments}
                      onChange={(e) => setFeedback((prev) => ({ ...prev, comments: e.target.value }))}
                      placeholder="Provide your professional opinion on the AI's findings..."
                      rows={3}
                    />

                    <Textarea
                      label="Recommendations for Owner (Optional)"
                      value={feedback.recommendations}
                      onChange={(e) => setFeedback((prev) => ({ ...prev, recommendations: e.target.value }))}
                      placeholder="What should the owner do next?"
                      rows={2}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1"
                        loading={isSubmittingFeedback}
                        icon={<CheckCircle2Icon className="w-5 h-5" />}
                      >
                        {isEditingFeedback ? "Update Feedback" : "Submit Feedback"}
                      </Button>
                      {isEditingFeedback && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="border border-gray-200"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                ) : null}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};