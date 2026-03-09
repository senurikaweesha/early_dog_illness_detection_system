import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon, DogIcon } from "lucide-react";
import { Button } from "../components/ui/Button";
import { DogCard } from "../components/DogCard";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { getDogs, deleteDog } from "../services/api";
import { useToast } from "../hooks/useToast";
import { useFetchData } from "../hooks/useFetchData";

export const DogsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: dogs, loading, error, refetch } = useFetchData(getDogs);

  const handleDelete = async (id) => {
    try {
      await deleteDog(id);
      showToast("Dog profile deleted successfully", "success");
      refetch();
    } catch (error) {
      showToast("Failed to delete dog profile", "error");
    }
  };
  if (loading || !dogs) {
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Dogs</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={refetch}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        heading="My Dogs"
        description="Manage your registered dog profiles"
        action={
          <Button
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => navigate("/add-dog")}
          >
            Add New Dog
          </Button>
        }
      />

      {dogs.length > 0 ? (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 0.2,
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {dogs.map((dog, index) => (
              <motion.div
                key={dog.id}
                layout
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.1,
                }}
              >
                <DogCard
                  dog={dog}
                  onViewHistory={(id) => navigate(`/history?dogId=${id}`)}
                  onEdit={(id) => navigate(`/edit-dog/${id}`)}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <EmptyState
          icon={<DogIcon className="w-12 h-12" />}
          heading="No dogs added yet"
          message="You haven't added any dogs yet. Add your first dog profile to start monitoring their health."
          actionLabel="Add Your First Dog"
          onAction={() => navigate("/add-dog")}
        />
      )}
    </div>
  );
};
