import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { useToast } from "../hooks/useToast";
import { getDogs, deleteDog } from "../services/api";
import { formatAge } from "../utils/helpers";
import { PlusIcon, Dog, Activity } from "lucide-react";

export const DogsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    fetchDogs();
  }, []);

  const fetchDogs = async () => {
    try {
      setLoading(true);
      const data = await getDogs();
      setDogs(data);
    } catch (error) {
      showToast("Failed to load dogs", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dogId) => {
    if (window.confirm("Are you sure you want to delete this dog profile?")) {
      try {
        await deleteDog(dogId);
        showToast("Dog profile deleted successfully", "success");
        fetchDogs();
      } catch (error) {
        showToast("Failed to delete dog profile", "error");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Dogs</h1>
          <p className="text-gray-500 mt-1">Manage your registered dog profiles</p>
        </div>
        <Button
          onClick={() => navigate("/add-dog")}
          icon={<PlusIcon className="w-5 h-5" />}
        >
          Add New Dog
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading dogs...</p>
        </div>
      ) : dogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No dogs registered yet</p>
          <Button
            onClick={() => navigate("/add-dog")}
            className="mt-4"
            icon={<PlusIcon className="w-5 h-5" />}
          >
            Add Your First Dog
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dogs.map((dog) => (
            <motion.div
              key={dog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              {/* Dog Photo */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {dog.photo ? (
                    <img
                      src={dog.photo}
                      alt={dog.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                     <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                      <Dog className="w-10 h-10 text-blue-800" strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary">{dog.name}</h3>
                  <p className="text-sm text-gray-500">{dog.breed}</p>
                  
                  {/* AGE DISPLAY - UPDATED */}
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>{formatAge(dog.age)}</span>
                    <span>{dog.weight} kg</span>
                  </div>
                </div>
              </div>

              {/* Total Analyses */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider mb-1">
                  <Activity className="w-3 h-3" />
                  Total Analyses
                </div>
                <p className="text-lg font-bold text-primary">
                  {dog.totalAnalyses || 0} videos analyzed
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => navigate(`/history?dog=${dog.id}`)}
                >
                  View History
                </Button>
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  variant="ghost"
                  className="flex-1 border border-gray-200"
                  onClick={() => navigate(`/edit-dog/${dog.id}`)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200"
                  onClick={() => handleDelete(dog.id)}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};