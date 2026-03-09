from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
import numpy as np

# Import your existing modules
from model_builder import create_production_model
from utils import extract_frames, preprocess_frames, cleanup_file
from xai_feature_explainer import generate_xai_insights

app = Flask(__name__)

# ============================================
# CORS CONFIGURATION
# ============================================

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"]
    }
})

# ============================================
# GLOBAL MODEL INSTANCE
# ============================================

print("LOADING AI MODEL...")

try:
    # Load your trained model
    MODEL = create_production_model(weights_path='model/model_weights.json')
    print("Model loaded successfully!")
except Exception as e:
    print(f"Failed to load model: {e}")
    MODEL = None

# ============================================
# IN-MEMORY DATABASE
# ============================================

dogs_db = []
history_db = []
users_db = []

# ============================================
# HELPER FUNCTIONS
# ============================================

def determine_urgency(probability, is_abnormal):
    """Determine urgency level based on probability"""
    if is_abnormal and probability > 0.6:
        return "High"
    elif is_abnormal and probability > 0.3:
        return "Medium"
    else:
        return "Low"

# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================

@app.route('/api/register', methods=['POST'])
def register():
    """Register new user"""
    try:
        data = request.json
        
        existing_user = next((u for u in users_db if u['email'] == data.get('email')), None)
        if existing_user:
            return jsonify({"error": "Email already exists"}), 400
        
        new_user = {
            "id": f"user_{len(users_db) + 1}",
            "name": data.get('name'),
            "email": data.get('email'),
            "accountType": data.get('accountType', 'owner'),
            "createdAt": datetime.now().isoformat()
        }
        
        users_db.append(new_user)
        
        return jsonify({
            "message": "Registration successful",
            "user": new_user,
            "token": f"mock_token_{new_user['id']}"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.json
        email = data.get('email')
        
        user = next((u for u in users_db if u['email'] == email), None)
        
        if not user:
            user = {
                "id": f"user_{len(users_db) + 1}",
                "name": email.split('@')[0],
                "email": email,
                "accountType": "owner",
                "createdAt": datetime.now().isoformat()
            }
            users_db.append(user)
        
        return jsonify({
            "message": "Login successful",
            "user": user,
            "token": f"mock_token_{user['id']}"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# DOG PROFILES ENDPOINTS
# ============================================

@app.route('/api/dogs', methods=['GET'])
def get_dogs():
    """Get all dogs"""
    return jsonify(dogs_db), 200

@app.route('/api/dogs/<dog_id>', methods=['GET'])
def get_dog(dog_id):
    """Get specific dog"""
    dog = next((d for d in dogs_db if d['id'] == dog_id), None)
    
    if dog:
        return jsonify(dog), 200
    else:
        return jsonify({"error": "Dog not found"}), 404

@app.route('/api/dogs', methods=['POST'])
def add_dog():
    """Add new dog profile"""
    try:
        data = request.json
        
        dog_id = f"dog_{len(dogs_db) + 1}"
        
        new_dog = {
            "id": dog_id,
            "name": data.get('name'),
            "breed": data.get('breed'),
            "age": data.get('age'),
            "weight": data.get('weight'),
            "gender": data.get('gender'),
            "notes": data.get('notes', ''),
            "photo": None,
            "totalAnalyses": 0,
            "createdAt": datetime.now().isoformat()
        }
        
        dogs_db.append(new_dog)
        
        return jsonify(new_dog), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/dogs/<dog_id>', methods=['PUT'])
def update_dog(dog_id):
    """Update dog profile"""
    try:
        data = request.json
        
        for dog in dogs_db:
            if dog['id'] == dog_id:
                dog['name'] = data.get('name', dog['name'])
                dog['breed'] = data.get('breed', dog['breed'])
                dog['age'] = data.get('age', dog['age'])
                dog['weight'] = data.get('weight', dog['weight'])
                dog['gender'] = data.get('gender', dog['gender'])
                dog['notes'] = data.get('notes', dog['notes'])
                dog['updatedAt'] = datetime.now().isoformat()
                
                return jsonify(dog), 200
        
        return jsonify({"error": "Dog not found"}), 404
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/dogs/<dog_id>', methods=['DELETE'])
def delete_dog(dog_id):
    """Delete dog profile"""
    global dogs_db, history_db
    
    initial_length = len(dogs_db)
    dogs_db = [dog for dog in dogs_db if dog['id'] != dog_id]
    
    if len(dogs_db) < initial_length:
        history_db = [h for h in history_db if h['dogId'] != dog_id]
        return jsonify({"message": "Dog deleted successfully"}), 200
    else:
        return jsonify({"error": "Dog not found"}), 404

# ============================================
# PREDICTION HISTORY ENDPOINTS
# ============================================

@app.route('/api/history', methods=['GET'])
def get_history():
    """Get prediction history"""
    dog_id = request.args.get('dogId')
    
    if dog_id:
        filtered = [h for h in history_db if h['dogId'] == dog_id]
        return jsonify(filtered), 200
    
    sorted_history = sorted(history_db, key=lambda x: x['date'], reverse=True)
    return jsonify(sorted_history), 200

@app.route('/api/history/<history_id>', methods=['DELETE'])
def delete_history(history_id):
    """Delete prediction record"""
    global history_db
    
    initial_length = len(history_db)
    history_db = [h for h in history_db if h['id'] != history_id]
    
    if len(history_db) < initial_length:
        return jsonify({"message": "Record deleted successfully"}), 200
    else:
        return jsonify({"error": "Record not found"}), 404

# ============================================
# VIDEO PREDICTION ENDPOINT (WITH REAL AI MODEL)
# ============================================

@app.route('/api/predict', methods=['POST'])
def predict():
    """Analyze video using real CNN+LSTM model"""
    
    if MODEL is None:
        return jsonify({'error': 'Model not loaded. Please check server logs.'}), 500
    
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    
    file = request.files['video']
    dog_id = request.form.get('dogId')
    
    if not dog_id:
        return jsonify({'error': 'Dog ID is required'}), 400
    
    # Find dog
    dog = next((d for d in dogs_db if d['id'] == dog_id), None)
    if not dog:
        return jsonify({'error': 'Dog not found'}), 404
    
    # Validate file type
    allowed_extensions = {'mp4', 'avi', 'mov', 'mkv'}
    file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    
    if file_ext not in allowed_extensions:
        return jsonify({'error': 'Invalid file format. Please upload MP4, AVI, MOV, or MKV'}), 400
    
    # Save video temporarily
    upload_folder = 'uploads'
    os.makedirs(upload_folder, exist_ok=True)
    video_path = os.path.join(upload_folder, file.filename)
    file.save(video_path)
    
    try:
        print("\n" + "=" * 60)
        print(f"🎥 ANALYZING VIDEO: {file.filename}")
        print("=" * 60)
        
        # ============================================
        # STEP 1: EXTRACT FRAMES
        # ============================================
        print("\nStep 1: Extracting frames...")
        frames = extract_frames(video_path, num_frames=30, target_size=(224, 224))
        print(f"Extracted {len(frames)} frames")
        print(f"Shape: {frames.shape}")
        
        # ============================================
        # STEP 2: PREPROCESS FRAMES
        # ============================================
        print("\nStep 2: Preprocessing frames...")
        preprocessed_frames = preprocess_frames(frames)
        print(f"Normalized to [{preprocessed_frames.min():.3f}, {preprocessed_frames.max():.3f}]")
        
        # Add batch dimension: (1, 30, 224, 224, 3)
        input_data = np.expand_dims(preprocessed_frames, axis=0)
        print(f"Input shape: {input_data.shape}")
        
        # ============================================
        # STEP 3: RUN AI MODEL PREDICTION
        # ============================================
        print("\nStep 3: Running CNN+LSTM model...")
        prediction = MODEL.predict(input_data, verbose=0)
        probability = float(prediction[0][0])
        print(f"Raw probability: {probability:.6f}")
        
        # ============================================
        # STEP 4: APPLY THRESHOLD & CLASSIFY
        # ============================================
        threshold = 0.3
        is_abnormal = probability > threshold
        classification = "Abnormal" if is_abnormal else "Normal"
        
        # Calculate confidence
        if is_abnormal:
            confidence = probability * 100
        else:
            confidence = (1 - probability) * 100
        
        print(f"\nClassification Results:")
        print(f"   Threshold: {threshold}")
        print(f"   Probability: {probability:.4f}")
        print(f"   Classification: {classification}")
        print(f"   Confidence: {confidence:.2f}%")
        
        # Determine urgency
        urgency = determine_urgency(probability, is_abnormal)
        print(f"   Urgency: {urgency}")
        
        # ============================================
        # STEP 5: GENERATE XAI INSIGHTS
        # ============================================
        print("\n🔍 Step 5: Generating XAI insights...")
        
        xai_result = generate_xai_insights(
            frames=preprocessed_frames,
            probability=probability,
            prediction_class='abnormal' if is_abnormal else 'normal',
            threshold=threshold
        )
        
        print(f"Generated {len(xai_result['observations'])} observations")
        print(f"Generated {len(xai_result['concerns'])} concerns")
        print(f"Generated {len(xai_result['recommendations'])} recommendations")
        
        # ============================================
        # STEP 6: CREATE RESULT
        # ============================================
        result_id = f"result_{len(history_db) + 1}"
        
        result = {
            "id": result_id,
            "dogId": dog_id,
            "dogName": dog['name'],
            "dogPhoto": dog.get('photo'),
            "classification": classification,
            "confidence": round(confidence, 2),
            "urgency": urgency,
            "filename": file.filename,
            "framesAnalyzed": 30,
            "probability": round(probability, 4),
            "recommendation": " ".join(xai_result['recommendations'][:2]),
            "date": datetime.now().isoformat(),
            "xaiInsights": {
                "observations": xai_result['observations'],
                "concerns": xai_result['concerns'],
                "recommendations": xai_result['recommendations']
            }
        }
        
        # Save to history
        history_db.append(result)
        
        # Update dog's total analyses count
        dog['totalAnalyses'] = dog.get('totalAnalyses', 0) + 1
        
        # ============================================
        # STEP 7: CLEANUP (GDPR)
        # ============================================
        print("\n🗑️  Step 7: GDPR compliance - deleting video...")
        cleanup_file(video_path)
        print("Video deleted (metadata retained)")

        print("ANALYSIS COMPLETE!")
        print(f"Classification: {classification}")
        print(f"Confidence: {confidence:.2f}%")
        print(f"Urgency: {urgency}")
        print("=" * 60 + "\n")
        
        return jsonify(result), 200
        
    except Exception as e:
        # Clean up video file on error
        if os.path.exists(video_path):
            cleanup_file(video_path)
        
        print(f"\nERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

# ============================================
# HEALTH CHECK ENDPOINT
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if API is running"""
    return jsonify({
        "status": "healthy",
        "message": "Early Dog Illness Detection API is running",
        "model_loaded": MODEL is not None,
        "timestamp": datetime.now().isoformat(),
        "stats": {
            "total_dogs": len(dogs_db),
            "total_analyses": len(history_db),
            "total_users": len(users_db)
        }
    }), 200

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# ============================================
# RUN APPLICATION
# ============================================

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("Early Dog Illness Detection System - Backend API")
    print("=" * 60)
    print(f"Starting Flask server...")
    print(f"API available at: http://localhost:5000")
    print(f"CORS enabled for: http://localhost:5173")
    print(f"AI Model: {'Loaded' if MODEL else 'Not Loaded'}")
    print("=" * 60 + "\n")
    
    app.run(debug=True, port=5001, host='0.0.0.0')
