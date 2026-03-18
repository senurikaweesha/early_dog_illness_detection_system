import React, { useState, useRef } from "react";
import {
  UploadCloudIcon,
  FileVideoIcon,
  XIcon,
  AlertCircleIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { VIDEO_CONSTRAINTS } from "../constants";

export const VideoUpload = ({
  onFileSelect,
  selectedFile,
  onClear,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const { MAX_SIZE_MB, ALLOWED_TYPES, ALLOWED_EXTENSIONS } = VIDEO_CONSTRAINTS;

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const validateAndSetFile = (file) => {
    setError(null);

    // Check type explicitly since we extracted from constants
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }

    if (file.size > VIDEO_CONSTRAINTS.MAX_SIZE_BYTES) {
      setError(`File size exceeds ${MAX_SIZE_MB}MB limit.`);
      return;
    }

    onFileSelect(file);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  if (selectedFile) {
    return (
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="card border-secondary/20 bg-secondary/5 flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="p-3 bg-white rounded-lg shadow-sm text-secondary flex-shrink-0">
            <FileVideoIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-primary truncate">
              {selectedFile.name}
            </p>
            <p className="text-sm text-gray-500">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          disabled={disabled}
          className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-full transition-colors flex-shrink-0 ml-4"
          aria-label="Remove file"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </motion.div>
    );
  }
  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200" : isDragging ? "border-secondary bg-secondary/5 scale-[1.02]" : "border-gray-300 hover:border-secondary/50 hover:bg-gray-50 cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept={ALLOWED_TYPES.join(',')}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center gap-4 pointer-events-none">
          <div
            className={`p-4 rounded-full ${isDragging ? "bg-secondary text-white" : "bg-gray-100 text-gray-500"}`}
          >
            <UploadCloudIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-semibold text-primary mb-1">
              {isDragging ? "Drop video here" : "Click or drag video to upload"}
            </p>
            <p className="text-sm text-gray-500">
              MP4, AVI, MOV, MKV up to {MAX_SIZE_MB}MB
            </p>
          </div>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{
            opacity: 0,
            height: 0,
          }}
          animate={{
            opacity: 1,
            height: "auto",
          }}
          className="flex items-center gap-2 mt-3 text-sm text-danger"
        >
          <AlertCircleIcon className="w-4 h-4" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};
