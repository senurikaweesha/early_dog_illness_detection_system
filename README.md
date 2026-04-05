<div align="center">
  <h1> TrustPaw AI 🐾❤️‍🩹🐶</h1>
  <p><strong>Early Dog Illness Detection System</strong></p>
  <p>
    <a href="https://github.com/senurikaweesha/early_dog_illness_detection_system">
      <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=flat-square&logo=github" alt="GitHub Repo" />
    </a>
  </p>
</div>

<!-- 
Note regarding the previous README file:
The initial version of this README included earlier preliminary metrics (91.67% validation accuracy). This version has been fully updated to reflect the formalized testing metrics obtained after Stratified K-Fold cross-validation and rigorous evaluation on the testing set. The formatting has also been enhanced for a better presentation. 
-->

---

##  Project Overview

An AI-powered web application that detects early signs of illness in dogs through behavioral video analysis using a CNN+LSTM deep learning architecture.

###  Key Features
- **Binary Classification:** Classifies dog behavior as *Normal* or *Abnormal*.
- **CNN+LSTM Hybrid Architecture:** Utilizes a `MobileNetV2` backbone for spatial feature extraction combined with an LSTM network for temporal sequence modeling.
- **Explainable AI (XAI):** Transparent insights into the model's predictions (e.g., Grad-CAM like visualizations or probability analysis).
- **Privacy-First:** GDPR-compliant handling of data, ensuring automatic video deletion after analysis.
- **Full-stack System:** Complete integration of a reliable Flask API with an interactive React frontend.

---

##  Performance Metrics

Following rigorous Stratified K-Fold Cross-Validation, the final mean performance metrics for the model are:

| Metric | Score |
|--------|-------|
| **Mean Accuracy** | 70.58% ± 7.87% |
| **Mean Precision** | 69.61% ± 8.06% |
| **Mean Recall** | 76.04% ± 15.18% |
| **Mean F1-Score** | 0.7168 ± 0.0799 |
| **Mean AUC** | 0.8219 ± 0.0941 |

*(Note: These metrics represent the average results across all folds during cross-validation, demonstrating the model's robustness across different data subsets.)*

---

##  Project Structure
```text
early_dog_illness_detection_system/
├── backend/              # Flask API (Model Inference, Routes)
├── frontend/             # React UI (Vite, Tailwind CSS, Dashboard)
└── model_training/       # Training Notebooks and Test Results
```

---

##  Getting Started

### 1. Backend Setup
Navigate to the backend directory, initialize a virtual environment, and run the Flask API.
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### 2. Frontend Setup
Navigate to the frontend directory, install dependencies, and start the Vite development server.
```bash
cd frontend
npm install
npm run dev
```

---

##  Tech Stack

* **Backend:** Flask, TensorFlow/Keras, OpenCV, Python
* **Frontend:** React, Vite, Tailwind CSS, JavaScript
* **Database:** Firebase Firestore (NoSQL)

---

##  Contact & Author Info

**Herath Mudiyanselage Nethmini**  
**Student ID: 20221487 | W1956416**  
**Institution: Informatics Institute of Technology (IIT), University of Westminster, UK**  
**Supervisor: Mr. Obhasha Priyankara** 
**Academic Year: 2025/2026**
