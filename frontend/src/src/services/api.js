/// <reference types="vite/client" />
import axios from "axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";
import config from "../config/env";

const API_BASE_URL = config.apiBaseUrl;

// Custom error class
export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const status = error.response?.status;

    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status,
      message,
    });

    if (status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = "/login";
    }

    return Promise.reject(new APIError(message, status, error.response?.data));
  }
);

// ============================================
// Helper function for error handling
// ============================================
const handleAPICall = async (apiCall, errorMessage = 'Operation failed') => {
  try {
    const response = await apiCall();
    return response.data;
  } catch (error) {
    console.error(errorMessage, error);
    throw new APIError(
      error.message || errorMessage,
      error.status,
      error.data
    );
  }
};

// ============================================
// VIDEO ANALYSIS
// ============================================

export const analyzeVideo = async (videoFile, dogId) => {
  return handleAPICall(async () => {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('dogId', dogId);

    return api.post(API_ENDPOINTS.PREDICT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }, 'Failed to analyze video');
};

// ============================================
// PREDICTION HISTORY
// ============================================

export const getHistory = async () => {
  const response = await api.get(API_ENDPOINTS.HISTORY);

  const currentUserObj = localStorage.getItem("currentUser");
  const currentUser = currentUserObj ? JSON.parse(currentUserObj) : null;
  const isVet = currentUser?.accountType === "vet";

  const ownershipMapStr = localStorage.getItem("dogOwnershipMap");
  const ownershipMap = ownershipMapStr ? JSON.parse(ownershipMapStr) : {};

  const feedbacksStr = localStorage.getItem("vetFeedbacks");
  const vetFeedbacks = feedbacksStr ? JSON.parse(feedbacksStr) : {};

  // Attach feedback and filter
  let result = response.data.map(item => ({
    ...item,
    vetFeedback: vetFeedbacks[item.id] || null
  }));

  if (!isVet && currentUser) {
    result = result.filter(item => ownershipMap[item.dogId] === currentUser.id);
  }

  return result;
};

export const getHistoryByDog = async (dogId) => {
  const response = await api.get(`${API_ENDPOINTS.HISTORY}?dogId=${dogId}`);

  const feedbacksStr = localStorage.getItem("vetFeedbacks");
  const vetFeedbacks = feedbacksStr ? JSON.parse(feedbacksStr) : {};

  // Attach feedback
  return response.data.map(item => ({
    ...item,
    vetFeedback: vetFeedbacks[item.id] || null
  }));
};

export const deleteHistory = async (id) => {
  return handleAPICall(
    async () => api.delete(`${API_ENDPOINTS.HISTORY}/${id}`),
    'Failed to delete history entry'
  );
};

// ============================================
// DOG PROFILES
// ============================================

export const getDogs = async () => {
  const response = await api.get(API_ENDPOINTS.DOGS);

  // MOCK: Filter dogs by current user
  const currentUserObj = localStorage.getItem("currentUser");
  if (!currentUserObj) return [];
  const currentUser = JSON.parse(currentUserObj);

  // Vets can see all dogs (for cases)
  if (currentUser.accountType === "vet") return response.data;

  // Retrieve ownership map
  const ownershipMapStr = localStorage.getItem("dogOwnershipMap");
  let ownershipMap = ownershipMapStr ? JSON.parse(ownershipMapStr) : {};

  // Seed default backend dogs to demo-owner-id if map is empty
  if (Object.keys(ownershipMap).length === 0) {
    response.data.forEach(dog => {
      ownershipMap[dog.id] = "demo-owner-id";
    });
    localStorage.setItem("dogOwnershipMap", JSON.stringify(ownershipMap));
  }

  return response.data.filter(dog => ownershipMap[dog.id] === currentUser.id);
};

export const getDogById = async (id) => {
  return handleAPICall(
    async () => api.get(`${API_ENDPOINTS.DOGS}/${id}`),
    'Failed to fetch dog'
  );
};

export const addDog = async (dogData) => {
  const response = await api.post(API_ENDPOINTS.DOGS, dogData);

  // MOCK: Save ownership
  const currentUserObj = localStorage.getItem("currentUser");
  if (currentUserObj) {
    const currentUser = JSON.parse(currentUserObj);
    const newDogId = response.data.id;
    const ownershipMapStr = localStorage.getItem("dogOwnershipMap");
    const ownershipMap = ownershipMapStr ? JSON.parse(ownershipMapStr) : {};
    ownershipMap[newDogId] = currentUser.id;
    localStorage.setItem("dogOwnershipMap", JSON.stringify(ownershipMap));
  }

  return response.data;
};

export const updateDog = async (id, dogData) => {
  return handleAPICall(
    async () => api.put(`${API_ENDPOINTS.DOGS}/${id}`, dogData),
    'Failed to update dog'
  );
};

export const deleteDog = async (id) => {
  return handleAPICall(
    async () => api.delete(`${API_ENDPOINTS.DOGS}/${id}`),
    'Failed to delete dog'
  );
};

// ============================================
// AUTHENTICATION
// ============================================

export const register = async (userData) => {
  return handleAPICall(
    async () => api.post(API_ENDPOINTS.REGISTER, userData),
    'Failed to register'
  );
};

export const login = async (email, password) => {
  return handleAPICall(
    async () => api.post(API_ENDPOINTS.LOGIN, { email, password }),
    'Failed to login'
  );
};

// ============================================
// VET DASHBOARD 
// ============================================

export const getVetCases = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.HISTORY);

    // MOCK: Attach feedback
    const feedbacksStr = localStorage.getItem("vetFeedbacks");
    const vetFeedbacks = feedbacksStr ? JSON.parse(feedbacksStr) : {};

    // Map history objects to match what the Vet Dashboard expects
    return response.data.map(item => {
      const fb = vetFeedbacks[item.id];
      return {
        id: item.id,
        dogName: item.dogName || "Unknown Patient",
        ownerName: "User (Anonymous)",
        uploadDate: item.date,
        classification: item.classification === "Normal" ? "Normal" : "Abnormal",
        confidence: item.confidence,
        urgency: item.urgency === "High" ? "High" : item.urgency === "Medium" ? "Medium" : "Low",
        status: fb ? "Reviewed" : "Pending Review",
        xaiInsights: item.xaiInsights || {},
        vetFeedback: fb || null
      };
    });
  } catch (error) {
    console.error("Error fetching vet cases:", error);
    return [];
  }
};

export const submitVetFeedback = async (caseId, feedback) => {
  // MOCK: Save feedback
  const currentUserObj = localStorage.getItem("currentUser");
  const vetName = currentUserObj ? JSON.parse(currentUserObj).name : "Dr. Veterinarian";

  const feedbacksStr = localStorage.getItem("vetFeedbacks");
  const vetFeedbacks = feedbacksStr ? JSON.parse(feedbacksStr) : {};

  vetFeedbacks[caseId] = {
    ...feedback,
    vetName,
    date: new Date().toISOString()
  };

  localStorage.setItem("vetFeedbacks", JSON.stringify(vetFeedbacks));
  return Promise.resolve({ success: true, feedback: vetFeedbacks[caseId] });
};

export default api;
