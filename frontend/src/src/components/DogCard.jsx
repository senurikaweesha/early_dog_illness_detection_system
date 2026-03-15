import React, { useState } from "react";
import { DogIcon, ActivityIcon } from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { ConfirmationDialog } from "./ConfirmationDialog";

export const DogCard = ({ dog, onViewHistory, onEdit, onDelete }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete(dog.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="card group hover:shadow-lg transition-shadow">
        <div className="flex items-start gap-4 mb-4">
          {/* Show photo if exists, otherwise show icon */}
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {dog.photo ? (
              <img
                src={dog.photo}
                alt={dog.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <DogIcon className="w-8 h-8 text-secondary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-primary mb-1 truncate">
              {dog.name}
            </h3>
            <p className="text-sm text-gray-500 mb-2">{dog.breed}</p>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>{dog.age} years</span>
              <span className="text-gray-300">•</span>
              <span>{dog.weight} kg</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <ActivityIcon className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              TOTAL ANALYSES
            </p>
            <p className="text-sm font-medium text-gray-900">
              {dog.totalAnalyses || 0} videos analyzed
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          fullWidth
          onClick={() => onViewHistory(dog.id)}
          className="mb-3"
        >
          View History
        </Button>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 border border-gray-200"
            onClick={() => onEdit(dog.id)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 border border-gray-200 text-danger hover:bg-danger/5 hover:border-danger"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Dog Profile"
        message={`Are you sure you want to delete ${dog.name}'s profile? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
      />
    </>
  );
};