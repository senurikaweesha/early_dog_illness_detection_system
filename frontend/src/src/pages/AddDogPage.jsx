import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CameraIcon, SaveIcon, XIcon } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import { useToast } from "../hooks/useToast";
import { getDogs, addDog, updateDog } from "../services/api";
import { formatAge } from "../utils/helpers";

export const AddDogPage = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    ageYears: "0",     // Years dropdown
    ageMonths: "0",    // Months dropdown
    age: 0,            // Calculated decimal age
    weight: "",
    gender: "Male",
    notes: "",
    photo: null, // Add photo field
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (isEditing) {
      const fetchDog = async () => {
        try {
          const dogs = await getDogs();
          const dog = dogs.find((d) => d.id === id);
          if (dog) {
            // Convert decimal age back to years and months
            const years = Math.floor(dog.age);
            const months = Math.round((dog.age - years) * 12);

            setFormData({
              name: dog.name,
              breed: dog.breed,
              age: dog.age.toString(),
              weight: dog.weight.toString(),
              gender: dog.gender,
              notes: dog.notes || "",
              photo: dog.photo || null,
            });
            // Set preview if photo exists
            if (dog.photo) {
              setPhotoPreview(dog.photo);
            }
          } else {
            showToast("Dog not found", "error");
            navigate("/dogs");
          }
        } catch (error) {
          showToast("Failed to load dog details", "error");
        }
      };
      fetchDog();
    }
  }, [id, isEditing, navigate, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle age changes (years or months)
  const handleAgeChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      
      // Calculate decimal age
      const years = parseInt(updatedData.ageYears) || 0;
      const months = parseInt(updatedData.ageMonths) || 0;
      const decimalAge = years + (months / 12);
      
      return {
        ...updatedData,
        age: decimalAge,
      };
    });
    
    // Clear age error if exists
    if (errors.age) {
      setErrors((prev) => ({ ...prev, age: "" }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showToast("File size must be less than 5MB", "error");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        showToast("Please select an image file", "error");
        return;
      }

      // Create preview and save to formData
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPhotoPreview(base64String);
        setFormData((prev) => ({
          ...prev,
          photo: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChooseImageClick = () => {
    document.getElementById("photo-upload").click();
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.breed.trim()) newErrors.breed = "Breed is required";
    
    // Validate age (at least 1 month)
    if (formData.age === 0) {
      newErrors.age = "Please select dog's age";
    }

    if (!formData.weight) newErrors.weight = "Weight is required";
    else if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0)
      newErrors.weight = "Weight must be a positive number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        age: Number(formData.age),
        weight: Number(formData.weight),
        photo: formData.photo, // Include photo
      };
      if (isEditing) {
        await updateDog(id, data);
        showToast("Dog profile updated successfully", "success");
      } else {
        await addDog(data);
        showToast("Dog profile created successfully", "success");
      }
      navigate("/dogs");
    } catch (error) {
      showToast(
        `Failed to ${isEditing ? "update" : "create"} profile`,
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonBreeds = [
    { value: "Sinhala Hound", label: "Sinhala Hound" },
    { value: "Golden Retriever", label: "Golden Retriever" },
    { value: "German Shepherd", label: "German Shepherd" },
    { value: "Labrador Retriever", label: "Labrador Retriever" },
    { value: "French Bulldog", label: "French Bulldog" },
    { value: "Bulldog", label: "Bulldog" },
    { value: "Poodle", label: "Poodle" },
    { value: "Beagle", label: "Beagle" },
    { value: "Rottweiler", label: "Rottweiler" },
    { value: "Mixed Breed", label: "Mixed Breed" },
    { value: "Other", label: "Other" },
  ];

    // Age dropdown options
  const yearOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i.toString(),
    label: i === 0 ? "0 years" : i === 1 ? "1 year" : `${i} years`,
  }));

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: i === 0 ? "0 months" : i === 1 ? "1 month" : `${i} months`,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="border-b border-gray-100 pb-6 mb-6">
          <h1 className="text-2xl font-bold text-primary">
            {isEditing ? "Edit Dog Profile" : "Add New Dog Profile"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing
              ? "Update your dog's information"
              : "Enter your dog's details to create a new profile"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Photo Upload */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div
              onClick={handleChooseImageClick}
              className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-secondary transition-colors cursor-pointer relative group overflow-hidden"
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Dog preview"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <>
                  <CameraIcon className="w-8 h-8 mb-2 group-hover:text-secondary transition-colors" />
                  <span className="text-xs font-medium group-hover:text-secondary transition-colors">
                    Upload Photo
                  </span>
                </>
              )}
              <input
                id="photo-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>
            <div className="flex-1 text-center sm:text-left pt-2">
              <h3 className="text-sm font-bold text-gray-700 mb-1">
                Profile Photo (Optional)
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Upload a clear photo of your dog. Max size 5MB.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleChooseImageClick}
              >
                Choose Image
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Dog's Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="e.g. Bruno"
            />

            <Select
              label="Breed"
              name="breed"
              options={commonBreeds}
              value={formData.breed}
              onChange={handleChange}
              error={errors.breed}
              required
            />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Years"
                name="ageYears"
                options={yearOptions}
                value={formData.ageYears}
                onChange={handleAgeChange}
              />
              <Select
                label="Months"
                name="ageMonths"
                options={monthOptions}
                value={formData.ageMonths}
                onChange={handleAgeChange}
              />
            </div>
            {errors.age && (
              <p className="text-red-500 text-xs mt-2">{errors.age}</p>
            )}
            {formData.age > 0 && (
              <p className="text-sm text-gray-600 mt-2 bg-blue-50 px-3 py-2 rounded border border-blue-100">
                <span className="font-medium">Age:</span> {formatAge(formData.age)}
              </p>
            )}
          </div>

            <Input
              label="Weight (kg)"
              name="weight"
              type="number"
              step="0.1"
              min="0"
              value={formData.weight}
              onChange={handleChange}
              error={errors.weight}
              required
              placeholder="e.g. 25.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={formData.gender === "Male"}
                  onChange={handleChange}
                  className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300"
                />
                <span className="text-sm text-gray-700">Male</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={formData.gender === "Female"}
                  onChange={handleChange}
                  className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300"
                />
                <span className="text-sm text-gray-700">Female</span>
              </label>
            </div>
          </div>

          <Textarea
            label="Additional Notes (Optional)"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any medical history, allergies, or behavioral quirks..."
            rows={4}
          />

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
            <Button
              type="submit"
              className="flex-1 sm:flex-none"
              loading={isSubmitting}
              icon={<SaveIcon className="w-4 h-4" />}
            >
              Save Profile
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1 sm:flex-none border border-gray-200"
              onClick={() => navigate("/dogs")}
              icon={<XIcon className="w-4 h-4" />}
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};