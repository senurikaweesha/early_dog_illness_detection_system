import React, { useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  Dog,
  Calendar,
  FileVideoIcon,
  ChevronRightIcon,
  Trash2Icon,
  AlertCircleIcon,
} from "lucide-react";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { formatDate, formatConfidence, truncateText } from "../utils/helpers";
export const PredictionCard = ({ prediction, onViewDetails, onDelete }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isAbnormal = prediction.classification === "Abnormal";
  return (
    <>
      <motion.div
        whileHover={{
          y: -2,
        }}
        className="card flex flex-col h-full border-l-4"
        style={{
          borderLeftColor: isAbnormal ? "#f44336" : "#4caf50",
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {prediction.dogPhoto ? (
                <img 
                  src={prediction.dogPhoto} 
                  alt={prediction.dogName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Dog className="w-6 h-6 text-blue-900" strokeWidth={1.5} />
              )}
            </div>
            <div>
              <h4 className="font-bold text-primary tracking-wider">{prediction.dogName}</h4>
              <div className="flex items-center text-xs text-gray-500 gap-1 tracking-wider">
                <Calendar className="w-3 h-3" />
                {formatDate(prediction.date)}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={isAbnormal ? "abnormal" : "normal"}>
              {prediction.classification}
            </Badge>
            <Badge variant={prediction.urgency.toLowerCase()}>
              {prediction.urgency} Urgency
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg text-sm">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider">
              Confidence
            </p>
            <p className="font-bold text-primary">
              {formatConfidence(prediction.confidence)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
              Video
            </p>
            <div className="flex items-center gap-1 text-primary font-medium truncate">
              <FileVideoIcon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{prediction.filename}</span>
            </div>
          </div>
        </div>

        <div className="mb-6 flex-1">
          <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50/50 p-3 rounded-lg border border-blue-100 tracking-wider">
            <AlertCircleIcon className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
            <p>
              {truncateText(prediction.recommendation, 100)}
              {prediction.recommendation.length > 100 && (
                <button
                  onClick={() => onViewDetails(prediction.id)}
                  className="text-secondary font-medium ml-1 hover:underline"
                >
                  Read more...
                </button>
              )}
            </p>
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => onViewDetails(prediction.id)}
            icon={<ChevronRightIcon className="w-4 h-4" />}
          >
            View Details
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              className="px-3 border border-gray-200 text-gray-400 hover:text-danger hover:bg-danger/10 hover:border-danger/30"
              onClick={() => setIsDeleteDialogOpen(true)}
              aria-label="Delete record"
            >
              <Trash2Icon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>

      {onDelete && (
        <ConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => {
            onDelete(prediction.id);
            setIsDeleteDialogOpen(false);
          }}
          title="Delete Prediction?"
          message="Are you sure you want to delete this prediction record? This action cannot be undone."
          confirmText="Delete"
          variant="danger"
        />
      )}
    </>
  );
};

PredictionCard.propTypes = {
  prediction: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    classification: PropTypes.string.isRequired,
    dogPhoto: PropTypes.string,
    dogName: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    urgency: PropTypes.string.isRequired,
    confidence: PropTypes.number.isRequired,
    filename: PropTypes.string.isRequired,
    recommendation: PropTypes.string.isRequired,
  }).isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
};
