/// <reference types="vite/client" />
import axios from "axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";
import config from "../config/env";
import { auth, db } from '../config/firebase';
import { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

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
    "ngrok-skip-browser-warning": "69420",
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
  const currentUserObj = localStorage.getItem("currentUser");
  const currentUser = currentUserObj ? JSON.parse(currentUserObj) : null;
  
  if (!currentUser) {
    console.log("No user logged in");
    return [];
  }
  
  console.log("Fetching history for user:", currentUser.id, currentUser.accountType);
  
  // Get all history from backend
  const historyResponse = await api.get(API_ENDPOINTS.HISTORY);
  
  // Get vet feedbacks
  const feedbacksStr = localStorage.getItem("vetFeedbacks");
  const vetFeedbacks = feedbacksStr ? JSON.parse(feedbacksStr) : {};
  
  // Attach feedback to each item
  let result = historyResponse.data.map(item => ({
    ...item,
    vetFeedback: vetFeedbacks[item.id] || null
  }));
  
  // Fetch all dogs from Firebase to hydrate the placeholders
  let fbDogs = [];
  try {
    const qSnap = await getDocs(collection(db, "dogs"));
    qSnap.forEach(doc => { fbDogs.push({ id: doc.id, ...doc.data() }); });
  } catch (e) {
    console.error("Could not fetch firebase dogs for history mapping", e);
  }

  // Always hydrate the placeholder "Dog (Firebase Profile)" with real Firebase dog data
  result = result.map(item => {
    const currentDog = fbDogs.find(d => d.id === item.dogId);
    if (currentDog) {
      return {
        ...item,
        dogName: currentDog.name,
        dogPhoto: currentDog.photo || item.dogPhoto
      };
    }
    return item;
  });

  // Filter for dog owners only (vets see all)
  if (currentUser.accountType === "owner") {
    const userDogIds = fbDogs.filter(d => d.userId === currentUser.id).map(d => d.id);
    
    console.log(`User owns ${userDogIds.length} dogs:`, userDogIds);
    
    // Filter predictions to only show user's dogs
    result = result.filter(item => {
      const belongs = userDogIds.includes(item.dogId);
      if (!belongs) {
        console.log(`Filtering out prediction for dogId: ${item.dogId} (not owned by user)`);
      }
      return belongs;
    });
      
    console.log(`Filtered to ${result.length} predictions for user's dogs`);
  }
  
  return result;
};

export const getHistoryByDog = async (dogId) => {
  const response = await api.get(`${API_ENDPOINTS.HISTORY}?dogId=${dogId}`);

  const feedbacksStr = localStorage.getItem("vetFeedbacks");
  const vetFeedbacks = feedbacksStr ? JSON.parse(feedbacksStr) : {};

  // Fetch the specific dog's real name from Firebase
  let realDogName = "Dog (Firebase Profile)";
  let realDogPhoto = null;
  try {
    const fireDog = await getDogById(dogId);
    if (fireDog) {
      realDogName = fireDog.name;
      realDogPhoto = fireDog.photo;
    }
  } catch (e) {
    console.error("Could not fetch dog for history mapping", e);
  }

  // Attach feedback and merge name
  return response.data.map(item => ({
    ...item,
    dogName: realDogName,
    dogPhoto: realDogPhoto || item.dogPhoto,
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
  const currentUserObj = localStorage.getItem("currentUser");
  if (!currentUserObj) return [];
  const currentUser = JSON.parse(currentUserObj);
  
  try {
    const q = query(collection(db, "dogs"), where("userId", "==", currentUser.id));
    const querySnapshot = await getDocs(q);
    const dogs = [];
    querySnapshot.forEach((doc) => {
      dogs.push({ id: doc.id, ...doc.data() });
    });
    return dogs;
  } catch(error) {
    console.error("Failed to fetch dogs from Firebase:", error);
    throw new APIError("Failed to fetch dogs", 500, error);
  }
};

export const getDogById = async (id) => {
  try {
    const docRef = doc(db, "dogs", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Dog not found");
    return { id: docSnap.id, ...docSnap.data() };
  } catch(error) {
    throw new APIError("Failed to fetch dog", 500, error);
  }
};

export const addDog = async (dogData) => {
  const currentUserObj = localStorage.getItem("currentUser");
  const currentUser = currentUserObj ? JSON.parse(currentUserObj) : null;
  const userId = currentUser?.id || 'unknown';
  
  const dogDataWithUser = {
    ...dogData,
    userId: userId
  };
  
  try {
    const docRef = await addDoc(collection(db, "dogs"), dogDataWithUser);
    return { id: docRef.id, ...dogDataWithUser };
  } catch(error) {
    console.error("Failed to add dog to Firebase:", error);
    throw new APIError("Failed to add dog", 500, error);
  }
};

export const updateDog = async (id, dogData) => {
  try {
    const docRef = doc(db, "dogs", id);
    await updateDoc(docRef, dogData);
    return { id, ...dogData };
  } catch(error) {
    throw new APIError("Failed to update dog", 500, error);
  }
};

export const deleteDog = async (id) => {
  try {
    const docRef = doc(db, "dogs", id);
    await deleteDoc(docRef);
    return { success: true };
  } catch(error) {
    throw new APIError("Failed to delete dog", 500, error);
  }
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

    // Vet Dashboard mapping
    let allFirebaseDogs = [];
    let allFirebaseUsers = [];
    try {
      const qDogs = await getDocs(collection(db, "dogs"));
      qDogs.forEach(doc => { allFirebaseDogs.push({ id: doc.id, ...doc.data() }); });
      
      const qUsers = await getDocs(collection(db, "users"));
      qUsers.forEach(doc => { allFirebaseUsers.push({ id: doc.id, ...doc.data() }); });
    } catch (e) { console.error("Could not fetch firebase metadata for vet dashboard", e); }

    // Map history objects to match what the Vet Dashboard expects
    return response.data.map(item => {
      const fb = vetFeedbacks[item.id];
      const fireDog = allFirebaseDogs.find(d => d.id === item.dogId);
      const fireUser = fireDog ? allFirebaseUsers.find(u => u.id === fireDog.userId) : null;
      
      return {
        id: item.id,
        dogName: fireDog ? fireDog.name : (item.dogName || "Unknown Patient"),
        ownerName: fireUser ? fireUser.name : (item.ownerName || "User (Anonymous)"),
        dogPhoto: (fireDog && fireDog.photo) ? fireDog.photo : (item.dogPhoto || null),
        uploadDate: item.date,
        classification: item.classification === "Normal" ? "Normal" : "Abnormal",
        confidence: item.confidence,
        urgency: item.urgency === "High" ? "High" : item.urgency === "Medium" ? "Medium" : "Low",
        status: fb ? "Reviewed" : "Pending Review",
        xaiInsights: item.xaiInsights || {},
        vetFeedback: fb || null,
        dogNotes: item.dogNotes || ""
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