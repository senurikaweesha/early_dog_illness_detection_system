import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Dog, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import {
  validateEmail,
  validatePassword,
  getPasswordStrength,
} from "../utils/helpers";

export const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "owner",
    termsAccepted: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email))
      newErrors.email = "Invalid email format";
    const pwdValidation = validatePassword(formData.password);
    if (!pwdValidation.valid) newErrors.password = pwdValidation.message;
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the Terms & Conditions";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Form submitted!');
  console.log('Form data:', formData);
  
  if (!validateForm()) {
    console.log('Validation failed!');
    console.log('Errors:', errors);
    return;
  }
  
  setIsSubmitting(true);
  try {
    console.log('Calling signup...');
    await signup({
      name: formData.fullName,
      email: formData.email,
      password: formData.password,
      accountType: formData.accountType,
    });
    showToast("Account created successfully!", "success");
    navigate("/dashboard");
  } catch (error) {
    console.error('Signup error:', error);
    // Show the actual backend error if available (e.g., "Email already exists")
    const errorMsg = error?.data?.error || error?.message || "Failed to create account. Please try again.";
    showToast(errorMsg, "error");
  } finally {
    setIsSubmitting(false);
  }
};

  // FIXED: Add safety check here
  const pwdStrength = formData.password && formData.password.length > 0 
    ? getPasswordStrength(formData.password) 
    : 'weak';

  const strengthColors = {
    weak: "bg-danger",
    medium: "bg-warning",
    strong: "bg-success",
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface-muted">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
            <Dog className="w-8 h-8 text-secondary" strokeWidth={1.5}/>
          </div>
          <h3 className="text-3xl font-extrabold text-primary">Join TrustPaw AI!</h3>
          <p className="mt-4 text-base text-gray-600">
            Sign up to monitor your dog’s health and get AI-powered insights
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Full Name"
              name="fullName"
              type="text"
              required
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              icon={<User className="w-5 h-5" />}
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              required
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<Mail className="w-5 h-5" />}
              className="w-full"
            />

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  icon={<Lock className="w-5 h-5" />}
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* FIXED: Add length check before showing strength indicator */}
              {formData.password && formData.password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strengthColors[pwdStrength]}`}
                      style={{
                        width:
                          pwdStrength === "weak"
                            ? "33%"
                            : pwdStrength === "medium"
                              ? "66%"
                              : "100%",
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 capitalize">
                    {pwdStrength}
                  </span>
                </div>
              )}
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                icon={<Lock className="w-5 h-5" />}
              />
              
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type <span className="text-danger">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accountType"
                    value="owner"
                    checked={formData.accountType === "owner"}
                    onChange={handleChange}
                    className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Dog Owner</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accountType"
                    value="vet"
                    checked={formData.accountType === "vet"}
                    onChange={handleChange}
                    className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Veterinarian</span>
                </label>
              </div>
            </div>

            <div className="flex items-start pt-2">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="termsAccepted"
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  I accept the{" "}
                  <a href="#" className="text-secondary hover:underline">
                    Terms & Conditions
                  </a>
                </label>
                {errors.termsAccepted && (
                  <p className="text-danger text-xs mt-1">
                    {errors.termsAccepted}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" fullWidth loading={isSubmitting} onClick={() => console.log('Button clicked!')}>
            Create Account
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-secondary hover:text-secondary-dark transition-colors"
            >
              Log in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};