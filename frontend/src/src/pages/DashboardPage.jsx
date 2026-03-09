import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DogIcon,
  VideoIcon,
  AlertTriangleIcon,
  PlusIcon,
  UploadCloudIcon,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { PredictionCard } from "../components/PredictionCard";
import { StatsCard } from "../components/StatsCard";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { getHistory, getDogs } from "../services/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [stats, setStats] = useState({
    totalDogs: 0,
    totalAnalyses: 0,
    recentAlerts: 0,
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [historyData, dogsData] = await Promise.all([
          getHistory(),
          getDogs(),
        ]);
        setRecentAnalyses(historyData.slice(0, 3));
        const alerts = historyData.filter((h) => h.urgency === "High").length;
        setStats({
          totalDogs: dogsData.length,
          totalAnalyses: historyData.length,
          recentAlerts: alerts,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  const statCards = [
    {
      title: "Total Dogs",
      value: `${stats.totalDogs} Dog${stats.totalDogs === 1 ? '' : 's'} Registered`,
      icon: <DogIcon className="w-8 h-8 text-secondary" />,
      bg: "bg-secondary/10",
    },
    {
      title: "Total Analyses",
      value: `${stats.totalAnalyses} Videos Analyzed`,
      icon: <VideoIcon className="w-8 h-8 text-accent-dark" />,
      bg: "bg-accent/20",
    },
    {
      title: "Recent Alerts",
      value: `${stats.recentAlerts} High Urgency Alert${stats.recentAlerts !== 1 ? "s" : ""}`,
      icon: (
        <AlertTriangleIcon
          className={`w-8 h-8 ${stats.recentAlerts > 0 ? "text-danger" : "text-success"}`}
        />
      ),

      bg: stats.recentAlerts > 0 ? "bg-danger/10" : "bg-success/10",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <PageHeader
        heading={`Welcome back, ${user?.name}!`}
        description="Manage your dogs and monitor their health"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {statCards.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bg={stat.bg}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.3,
          }}
        >
          <Button
            fullWidth
            size="md"
            className="h-20 text-lg font-bold shadow-md hover:shadow-lg transition-all"
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => navigate("/add-dog")}
          >
            Add New Dog Profile
          </Button>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.4,
          }}
        >
          <Button
            variant="secondary"
            fullWidth
            size="md"
            className="h-20 text-lg font-bold shadow-md hover:shadow-lg transition-all border-2 border-secondary"
            icon={<UploadCloudIcon className="w-5 h-5" />}
            onClick={() => navigate("/analyze")}
          >
            Upload Video for Analysis
          </Button>
        </motion.div>
      </div>

      {/* Recent Analyses */}
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
          delay: 0.5,
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Recent Analyses</h2>
          <Button variant="ghost" onClick={() => navigate("/history")}>
            View All
          </Button>
        </div>

        {recentAnalyses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentAnalyses.map((prediction, index) => (
              <motion.div
                key={prediction.id}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.6 + index * 0.1,
                }}
              >
                <PredictionCard
                  prediction={prediction}
                  onViewDetails={(id) => navigate(`/history?id=${id}`)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<VideoIcon className="w-12 h-12" />}
            heading="No analyses yet"
            message="Upload your first video to get started"
            actionLabel="Analyze Video Now"
            onAction={() => navigate("/analyze")}
          />
        )}
      </motion.div>
    </div>
  );
};
