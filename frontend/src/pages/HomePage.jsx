import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  VideoIcon,
  BrainIcon,
  BarChart3Icon,
  ClockIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { DisclaimerBox } from "../components/DisclaimerBox";
export const HomePage = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: <VideoIcon className="w-8 h-8 text-accent-dark" />,
      title: "Upload Dog Behavior Video",
      description:
        "Upload a short video of your dog's behavior for AI analysis",
    },
    {
      icon: <BrainIcon className="w-8 h-8 text-accent-dark" />,
      title: "AI-Powered Analysis",
      description:
        "Our CNN+LSTM model analyzes 30 frames to detect behavioral patterns",
    },
    {
      icon: <BarChart3Icon className="w-8 h-8 text-accent-dark" />,
      title: "Instant Results",
      description:
        "Get classification (Normal/Abnormal), confidence score, and explainable insights",
    },
    {
      icon: <ClockIcon className="w-8 h-8 text-accent-dark" />,
      title: "Track History",
      description:
        "View past analyses for each of your dogs, organized by date",
    },
  ];

  const steps = [
    "Create an account and log in",
    "Add your dog's profile (name, breed, age, weight)",
    "Upload a short video (10-60 seconds) of your dog's behavior",
    "Receive AI analysis with Normal/Abnormal classification",
    "View explainable insights and recommendations",
    "Track results in your history dashboard",
  ];

  return (
    <div className="bg-surface-muted">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-secondary text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{
                opacity: 0,
                x: -50,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                Detect Early Signs of Illness in Your Dog
              </h1>
              <p className="text-xl sm:text-2xl text-accent-light mb-10 max-w-2xl font-light">
                Simply upload a short video of your dog. Our AI analyzes behavior patterns to identify possible discomfort or health issues before they become serious.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/signup")}
                  className="!bg-[#00B4D8] !text-white hover:!bg-[#0096B4] shadow-xl font-bold"
                >
                  Get Started Now
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="border-2 border-white/30 text-white hover:bg-white/10"
                  onClick={() =>
                    document.getElementById("how-it-works")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                >
                  Learn How It Works
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: "easeOut",
              }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative w-full max-w-lg">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
                <img
                  src="/dog_health_dashboard.png"
                  alt="Dog illness detection app dashboard"
                  className="relative z-10 w-full h-auto object-contain rounded-2xl shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              How Our AI Helps You
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Monitor your dog's behavior and detect potential health issues
              effectively.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                className="card hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes with our simple 6-step process.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                className="flex items-start gap-6 mb-8 relative"
              >
                {index !== steps.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-[-2rem] w-0.5 bg-secondary/20"></div>
                )}
                <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-lg flex-shrink-0 z-10 shadow-md">
                  {index + 1}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1">
                  <p className="text-lg font-medium text-primary">{step}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
            >
              <h2 className="text-3xl font-bold text-primary mb-6">
                About This System
              </h2>
              <div className="prose prose-lg text-gray-600 space-y-6">
                <p>
                  This system uses a custom-trained CNN+LSTM deep learning model to analyze
                  short videos of dog behavior and classify them as Normal or
                  Abnormal. It is designed as an early screening tool to help
                  dog owners identify potential health concerns before they
                  become serious.
                </p>
                <p>
                  The model extracts 30 frames from each video, processes them
                  through a MobileNetV2 convolutional neural network for spatial feature
                  extraction, and then uses an LSTM layer to capture temporal
                  behavioral patterns. <strong>Our latest trained model achieved an impressive 83.33% validation accuracy</strong> on unseen behavioral test data.
                </p>
              </div>
              <br />
              <DisclaimerBox>
                <p>
                  This tool is not a substitute for professional veterinary
                  advice. Always consult a qualified veterinarian for diagnosis
                  and treatment decisions.
                </p>
              </DisclaimerBox>
            </motion.div>
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              className="bg-primary rounded-3xl p-8 text-white shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-8">Technical Overview</h3>
              <ul className="space-y-6">
                {[
                  {
                    title: "Video Upload",
                    desc: "User uploads MP4/AVI/MOV/MKV video (max 100MB)",
                  },
                  {
                    title: "Preprocessing",
                    desc: "OpenCV extracts 30 uniformly sampled frames, resizes to 224×224, normalizes to [0,1]",
                  },
                  {
                    title: "AI Analysis",
                    desc: "MobileNetV2 CNN extracts spatial features, LSTM processes temporal patterns",
                  },
                  {
                    title: "Classification",
                    desc: "Binary prediction (Normal/Abnormal) with 83.33% validated accuracy",
                  },
                  {
                    title: "XAI Generation",
                    desc: "Feature-based explainer generates behavioral observations",
                  },
                  {
                    title: "GDPR Compliance",
                    desc: "Video automatically deleted after processing (metadata only retained)",
                  },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <CheckCircle2Icon className="w-6 h-6 text-accent flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-white">{item.title}</h4>
                      <p className="text-sm text-gray-300 mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-secondary to-primary text-center text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Monitor Your Dog's Health?
            </h2>
            <p className="text-xl text-accent-light mb-10">
              Join today and get peace of mind with AI-powered behavioral
              analysis.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="!bg-[#00B4D8] !text-white hover:!bg-[#0096B4] shadow-xl text-lg px-10 py-4 font-bold"
              icon={<ArrowRightIcon className="w-5 h-5" />}
            >
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
