import React, { useState } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  DogIcon,
  ActivityIcon,
  Edit2Icon,
  Trash2Icon,
  HistoryIcon,
} from "lucide-react";
import { Button } from "./ui/Button";
import { ConfirmationDialog } from "./ConfirmationDialog";
export const DogCard = ({ dog, onViewHistory, onEdit, onDelete }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  return (
    <>
      <motion.div
        whileHover={{
          y: -4,
        }}
        className="card flex flex-col h-full"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-secondary/20">
            {dog.photo ? (
              <img
                src={dog.photo}
                alt={dog.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <DogIcon className="w-10 h-10 text-secondary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-primary truncate">
              {dog.name}
            </h3>
            <p className="text-sm text-gray-500 font-medium truncate">
              {dog.breed}
            </p>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
              <span className="bg-gray-100 px-2 py-1 rounded-md">
                {dog.age} years
              </span>
              <span className="bg-gray-100 px-2 py-1 rounded-md">
                {dog.weight} kg
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-6 flex items-center gap-3">
          <div className="p-2 bg-white rounded-md shadow-sm text-accent-dark">
            <ActivityIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
              Total Analyses
            </p>
            <p className="font-bold text-primary">
              {dog.totalAnalyses} videos analyzed
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <Button
            variant="secondary"
            fullWidth
            icon={<HistoryIcon className="w-4 h-4" />}
            onClick={() => onViewHistory(dog.id)}
          >
            View History
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1 border border-gray-200"
              icon={<Edit2Icon className="w-4 h-4" />}
              onClick={() => onEdit(dog.id)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              className="flex-1 border border-gray-200 text-danger hover:bg-danger/10 hover:text-danger hover:border-danger/30"
              icon={<Trash2Icon className="w-4 h-4" />}
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </motion.div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          onDelete(dog.id);
          setIsDeleteDialogOpen(false);
        }}
        title="Delete Dog Profile?"
        message={`This will permanently delete ${dog.name} and all associated prediction history. This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};

DogCard.propTypes = {
  dog: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    photo: PropTypes.string,
    name: PropTypes.string.isRequired,
    breed: PropTypes.string.isRequired,
    age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    totalAnalyses: PropTypes.number.isRequired,
  }).isRequired,
  onViewHistory: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
};
