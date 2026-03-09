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
export const AddDogPage = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    weight: "",
    gender: "Male",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (isEditing) {
      const fetchDog = async () => {
        try {
          const dogs = await getDogs();
          const dog = dogs.find((d) => d.id === id);
          if (dog) {
            setFormData({
              name: dog.name,
              breed: dog.breed,
              age: dog.age.toString(),
              weight: dog.weight.toString(),
              gender: dog.gender,
              notes: dog.notes || "",
            });
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
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.breed.trim()) newErrors.breed = "Breed is required";
    if (!formData.age) newErrors.age = "Age is required";
    else if (isNaN(Number(formData.age)) || Number(formData.age) < 0)
      newErrors.age = "Age must be a positive number";
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
    {
      value: "Golden Retriever",
      label: "Golden Retriever",
    },
    {
      value: "German Shepherd",
      label: "German Shepherd",
    },
    {
      value: "Labrador Retriever",
      label: "Labrador Retriever",
    },
    {
      value: "French Bulldog",
      label: "French Bulldog",
    },
    {
      value: "Bulldog",
      label: "Bulldog",
    },
    {
      value: "Poodle",
      label: "Poodle",
    },
    {
      value: "Beagle",
      label: "Beagle",
    },
    {
      value: "Rottweiler",
      label: "Rottweiler",
    },
    {
      value: "Mixed Breed",
      label: "Mixed Breed",
    },
    {
      value: "Other",
      label: "Other",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
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
          {/* Photo Upload (Mock) */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="w-32 h-32 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-secondary transition-colors cursor-pointer relative group overflow-hidden">
              <CameraIcon className="w-8 h-8 mb-2 group-hover:text-secondary transition-colors" />
              <span className="text-xs font-medium group-hover:text-secondary transition-colors">
                Upload Photo
              </span>
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
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
                className="pointer-events-none"
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

            <Input
              label="Age (Years)"
              name="age"
              type="number"
              step="0.1"
              min="0"
              value={formData.age}
              onChange={handleChange}
              error={errors.age}
              required
              placeholder="e.g. 3"
            />

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
