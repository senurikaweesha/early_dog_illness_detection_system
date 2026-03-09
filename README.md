# Early Dog Illness Detection System

**Author:** Herath Mudiyanselage Nethmini (H.M. Senuri Kaweesha Nethmini)  
**Student ID:** 20221487 / W1956416  
**Institution:** Informatics Institute of Technology (IIT), University of Westminster, UK  
**Supervisor:** Mr. Obhasha Priyankara  
**Academic Year:** 2024/2025

---

## 📋 Project Overview

An AI-powered web application that detects early signs of illness in dogs through behavioral video analysis using CNN+LSTM deep learning.

### Key Features
- Binary classification: Normal vs. Abnormal behavior
- CNN+LSTM hybrid architecture with MobileNetV2 backbone
- 91.67% validation accuracy, 100% precision, 83.33% recall
- React + Flask full-stack application
- Explainable AI (XAI) for predictions
- GDPR-compliant video deletion

---

## 🎯 Performance Metrics

| Metric | Value |
|--------|-------|
| Validation Accuracy | 91.67% |
| Precision | 100% |
| Recall | 83.33% |
| Threshold | 0.3 |

---

## 🏗️ Project Structure
```
early_dog_illness_detection_system/
├── backend/              # Flask API
├── frontend/             # React UI
└── model_training/       # Training notebooks
```

---

## 🚀 Getting Started

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📦 Large Files Excluded

**Model weights (87 MB):** `backend/model/model_weights.json`  
Download: [Add Google Drive link]

---

## 🛠️ Tech Stack

**Backend:** Flask, TensorFlow, OpenCV  
**Frontend:** React, Vite, Tailwind CSS  
**Database:** Firebase Firestore

---

## 📞 Contact

Herath Mudiyanselage Nethmini  
Informatics Institute of Technology
