from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
import numpy as np

# Import your existing modules
from model.model_loader import get_model as load_model_instance
from utils import extract_frames, preprocess_frames, cleanup_file
from xai_feature_explainer import generate_xai_insights

app = Flask(__name__)

# Environment configuration
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
PORT = int(os.environ.get('PORT', 5001))

# ============================================
# CORS CONFIGURATION
# ============================================

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "https://trustpaw-ai.vercel.app",
            "https://trustpawaiearlydogillnessdetections.vercel.app",
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"]
    }
})

# ============================================
# GLOBAL MODEL INSTANCE
# ============================================

MODEL = None

def get_model():
    """Get the loaded model instance"""
    global MODEL
    if MODEL is None:
        MODEL = load_model_instance()
    return MODEL

# ============================================
# IN-MEMORY DATABASE
# ============================================


# ============================================
# DATA PERSISTENCE FUNCTIONS
# ============================================

DATA_DIR = 'data'
DOGS_FILE = os.path.join(DATA_DIR, 'dogs.json')
HISTORY_FILE = os.path.join(DATA_DIR, 'history.json')
USERS_FILE = os.path.join(DATA_DIR, 'users.json')

def ensure_data_dir():
    """Create data directory if it doesn't exist"""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

def save_to_file(data, filepath):
    """Save data to JSON file"""
    ensure_data_dir()
    import json
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

def load_from_file(filepath):
    """Load data from JSON file"""
    import json
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return []

dogs_db = load_from_file(DOGS_FILE)
history_db = load_from_file(HISTORY_FILE)
users_db = load_from_file(USERS_FILE)

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
    
def detect_dog_in_video(frames, confidence_threshold=0.3):
    """
    Detect if EXACTLY ONE dog is present in the video frames using MobileNet-SSD
    Returns: (has_dog, detection_info)
    """
    import cv2
    
    # Load pre-trained MobileNet-SSD model
    model_path = 'model/detector/mobilenet_iter_73000.caffemodel'
    config_path = 'model/detector/deploy.prototxt'
    
    if not os.path.exists(model_path) or not os.path.exists(config_path):
        print("Dog detector model not found. Skipping dog detection.")
        return True, {"note": "Detection skipped - model files missing"}
    
    # Load the model
    net = cv2.dnn.readNetFromCaffe(config_path, model_path)
    
    # COCO class labels (MobileNet-SSD classes)
    CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat",
               "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
               "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
               "sofa", "train", "tvmonitor"]
    
    DOG_CLASS_ID = 12  # "dog" is class 12
    CAT_CLASS_ID = 8   # "cat" is class 8
    PERSON_CLASS_ID = 15  # "person" is class 15
    
    print(f"\nDetecting objects in video:")
    
    total_dog_detections = 0
    cat_detections = 0
    person_detections = 0
    frames_checked = 0
    
    # NEW: Track multiple dogs per frame
    frames_with_multiple_dogs = 0
    frames_with_one_dog = 0
    frames_with_no_dog = 0
    max_dogs_in_frame = 0
    
    # Check every 3rd frame (more thorough detection)
    for i in range(0, len(frames), 3):
        frame = frames[i]
        
        # Convert from normalized [0,1] back to [0,255] if needed
        if frame.max() <= 1.0:
            frame = (frame * 255).astype(np.uint8)
        
        # Prepare frame for detection
        blob = cv2.dnn.blobFromImage(frame, 0.007843, (224, 224), 127.5)
        net.setInput(blob)
        detections = net.forward()
        
        # Count dogs in THIS frame
        dogs_in_this_frame = 0
        
        # Process detections
        for j in range(detections.shape[2]):
            confidence = detections[0, 0, j, 2]
            
            if confidence > confidence_threshold:
                class_id = int(detections[0, 0, j, 1])
                
                if class_id == DOG_CLASS_ID:
                    dogs_in_this_frame += 1
                    total_dog_detections += 1
                elif class_id == CAT_CLASS_ID:
                    cat_detections += 1
                elif class_id == PERSON_CLASS_ID:
                    person_detections += 1
        
        # Track statistics
        if dogs_in_this_frame == 0:
            frames_with_no_dog += 1
        elif dogs_in_this_frame == 1:
            frames_with_one_dog += 1
        else:  # 2 or more dogs
            frames_with_multiple_dogs += 1
        
        max_dogs_in_frame = max(max_dogs_in_frame, dogs_in_this_frame)
        frames_checked += 1
    
    print(f"   Frames checked: {frames_checked}")
    print(f"   Total dog detections: {total_dog_detections}")
    print(f"   Frames with 1 dog: {frames_with_one_dog}")
    print(f"   Frames with multiple dogs: {frames_with_multiple_dogs}")
    print(f"   Max dogs in single frame: {max_dogs_in_frame}")
    print(f"   Cat detections: {cat_detections}")
    print(f"   Person detections: {person_detections}")
    
    # Decision logic
    detection_info = {
        "total_dog_detections": int(total_dog_detections),
        "frames_with_one_dog": int(frames_with_one_dog),
        "frames_with_multiple_dogs": int(frames_with_multiple_dogs),
        "max_dogs_in_frame": int(max_dogs_in_frame),
        "cat_detections": int(cat_detections),
        "person_detections": int(person_detections),
        "frames_checked": int(frames_checked)
    }
    
    # Calculate minimum required frames with dog
    min_dog_frames = max(2, frames_checked * 0.3)
    print(f"   Minimum dog frames needed: {min_dog_frames:.0f}")
    
    # No dog detected at all
    if total_dog_detections == 0:
        print("\nNo dog detected in video")
        return False, detection_info
    
    # Not enough single-dog frames (need 30% coverage)
    if frames_with_one_dog < min_dog_frames:
        print(f"\nInsufficient dog visibility ({frames_with_one_dog}/{min_dog_frames:.0f} frames required)")
        return False, detection_info
    
    # Multiple dogs in MULTIPLE frames
    # Allow 1-2 frames with detection errors, but reject if clearly multiple dogs
    if frames_with_multiple_dogs > 2:
        print(f"\nMultiple dogs detected in {frames_with_multiple_dogs} frames")
        return False, detection_info
    
    # Too many dogs in one frame (3+ dogs clearly multiple)
    if max_dogs_in_frame >= 3:
        print(f"{max_dogs_in_frame} dogs detected in a single frame")
        return False, detection_info
    
    # Cat is CLEARLY dominant (not just present)
    if cat_detections > total_dog_detections:
        print("\nMore cat detections than dog detections (likely a cat video)")
        return False, detection_info
    
    # Human is CLEARLY dominant
    if person_detections > total_dog_detections * 1.5:
        print("\nToo many human detections compared to dog (human is primary subject)")
        return False, detection_info
    
    # Dog must appear with reasonable consistency
    dog_coverage_ratio = frames_with_one_dog / frames_checked
    if dog_coverage_ratio < 0.2:  # At least 20% of frames
        print(f"\nDog appears in too few frames ({dog_coverage_ratio*100:.0f}% coverage, need 20%)")
        return False, detection_info
    
    # All checks passed
    print(f"\nSingle dog detected ({frames_with_one_dog}/{frames_checked} frames, {dog_coverage_ratio*100:.0f}% coverage)!")
    return True, detection_info

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
        save_to_file(users_db, USERS_FILE)
        
        return jsonify({
            "message": "Registration successful",
            "user": new_user,
            "token": f"mock_token_{new_user['id']}"
        }), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Login user - returns existing user or creates new one"""
    try:
        data = request.json
        email = data.get('email')
        
        # Find existing user by email
        user = next((u for u in users_db if u['email'] == email), None)
        
        if not user:
            # Create new user with proper sequential ID
            new_id = f"user_{len(users_db) + 1}"
            user = {
                "id": new_id,
                "name": email.split('@')[0],
                "email": email,
                "accountType": "owner",
                "createdAt": datetime.now().isoformat()
            }
            users_db.append(user)
            save_to_file(users_db, USERS_FILE)
            
            print(f"\nNEW USER CREATED:")
            print(f"   ID: {new_id}")
            print(f"   Email: {email}")
        else:
            print(f"\nEXISTING USER LOGGED IN:")
            print(f"   ID: {user['id']}")
            print(f"   Email: {email}")
            print(f"   Name: {user['name']}")
        
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
    """Get dogs for current user only"""
    user_id = request.args.get('userId')
    
    # No userId = no access (security)
    if not user_id:
        print(f"\nGET /api/dogs - No userId provided, returning empty")
        return jsonify([]), 200
    
    # Filter dogs by userId (even vets only see their own if they have any)
    user_dogs = [dog for dog in dogs_db if dog.get('userId') == user_id]
    
    print(f"\nGET /api/dogs - User: {user_id}")
    print(f"  Total dogs in DB: {len(dogs_db)}")
    print(f"  User's dogs: {len(user_dogs)}")
    
    return jsonify(user_dogs), 200

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
            "photo": data.get('photo'),
            "userId": data.get('userId', 'unknown'), 
            "totalAnalyses": 0,
            "createdAt": datetime.now().isoformat()
        }
        
        dogs_db.append(new_dog)
        save_to_file(dogs_db, DOGS_FILE)
        
        return jsonify(new_dog), 201
        
    except Exception as e:
        print(f"ERROR in add_dog: {e}")
        import traceback
        traceback.print_exc()
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
                dog['photo'] = data.get('photo', dog.get('photo'))
                dog['updatedAt'] = datetime.now().isoformat()
                save_to_file(dogs_db, DOGS_FILE)
                
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
        save_to_file(dogs_db, DOGS_FILE)
        save_to_file(history_db, HISTORY_FILE)
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
    
    # Inject latest notes from dogs_db
    enhanced_history = []
    for h in history_db:
        h_copy = h.copy()
        dog = next((d for d in dogs_db if d.get('id') == h.get('dogId')), None)
        h_copy['dogNotes'] = dog.get('notes', '') if dog else ''
        enhanced_history.append(h_copy)
    
    if dog_id:
        filtered = [h for h in enhanced_history if h.get('dogId') == dog_id]
        return jsonify(filtered), 200
    
    sorted_history = sorted(enhanced_history, key=lambda x: x.get('date', ''), reverse=True)
    return jsonify(sorted_history), 200

@app.route('/api/history/<history_id>', methods=['DELETE'])
def delete_history(history_id):
    """Delete prediction record"""
    global history_db
    
    initial_length = len(history_db)
    history_db = [h for h in history_db if h['id'] != history_id]
    save_to_file(history_db, HISTORY_FILE)
    
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

    model = get_model()
    
    if model is None:
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
        print("\n" + "-"*80)
        print(f"Analyzing video: {file.filename}")
        
        # ============================================
        # EXTRACT FRAMES
        # ============================================
        print("\nExtracting frames...")
        frames = extract_frames(video_path, num_frames=30, target_size=(224, 224))
        
        # ============================================
        # DETECT DOG IN VIDEO
        # ============================================
        print("\nDetecting dog in video...")
        has_dog, detection_info = detect_dog_in_video(frames)
        
        if not has_dog:
            cleanup_file(video_path)
            
            # Determine what was detected and provide specific error
            if detection_info.get('frames_with_multiple_dogs', 0) > 0 or detection_info.get('max_dogs_in_frame', 0) > 1:
                error_msg = f"Multiple dogs detected in this video ({detection_info.get('max_dogs_in_frame')} dogs in some frames). Our AI model is trained to analyze individual dogs only. Please upload a video showing only one dog."
            elif detection_info.get('cat_detections', 0) > 0:
                error_msg = "This video appears to contain a cat, not a dog. Please upload a video of your dog."
            elif detection_info.get('person_detections', 0) > 0:
                error_msg = "This video appears to contain a human, not a dog. Please upload a video showing your dog's behavior."
            else:
                error_msg = "No dog detected in this video. Please ensure your dog is clearly visible and is the main subject of the video."
            
            return jsonify({
                'error': error_msg,
                'suggestion': 'Upload a clear video where ONE dog is the primary subject, well-lit, and actively moving.',
                'detection_details': detection_info
            }), 400
        
        # ============================================
        # PREPROCESS FRAMES
        # ============================================
        print("\nPreprocessing frames...")
        preprocessed_frames = preprocess_frames(frames)
        
        input_data = np.expand_dims(preprocessed_frames, axis=0)
        print(f"   Input shape: {input_data.shape}")
        
        # ============================================
        # RUN AI MODEL PREDICTION
        # ============================================
        print("\nRunning CNN+LSTM model...")
        prediction = MODEL.predict(input_data, verbose=0)
        probability = float(prediction[0][0])
        print(f"   Raw probability: {probability:.6f}")
        
        # ============================================
        # APPLY THRESHOLD & CLASSIFY
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
        # GENERATE XAI INSIGHTS
        # ============================================
        print("\nGenerating XAI insights...")
        
        xai_result = generate_xai_insights(
            frames=preprocessed_frames,
            probability=probability,
            prediction_class='abnormal' if is_abnormal else 'normal',
            threshold=threshold
        )
        
        print(f"   Generated {len(xai_result['observations'])} observations")
        print(f"   Generated {len(xai_result['concerns'])} concerns")
        print(f"   Generated {len(xai_result['recommendations'])} recommendations")
        
        # ============================================
        # CREATE RESULT
        # ============================================
        
        result_id = f"result_{len(history_db) + 1}"

        # Find the owner information from the dog's userId
        print(f"\nFINDING OWNER INFO:")
        print(f"   Dog ID: {dog_id}")
        print(f"   Dog userId: {dog.get('userId', 'NOT SET')}")
        print(f"   Total users in DB: {len(users_db)}")

        owner = None
        if 'userId' in dog and dog['userId'] and dog['userId'] != 'unknown':
            owner = next((u for u in users_db if u['id'] == dog['userId']), None)
            print(f"Found owner: {owner['name'] if owner else 'NOT FOUND'}")
        else:
            print(f"Dog has no userId set!")

        owner_name = owner['name'] if owner else 'User (Anonymous)'

        print(f"OwnerName: {owner_name}")

        result = {
            "id": result_id,
            "dogId": dog_id,
            "dogName": dog['name'],
            "dogPhoto": dog.get('photo'),
            "ownerName": owner_name,  # THIS IS THE KEY LINE
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

        print(f"\nResult created with owner: {result['ownerName']}")
        
        # Save to history
        history_db.append(result)
        save_to_file(history_db, HISTORY_FILE)
        
        # Update dog's total analyses count
        dog['totalAnalyses'] = dog.get('totalAnalyses', 0) + 1
        save_to_file(dogs_db, DOGS_FILE)
        
        # ============================================
        # CLEANUP (GDPR)
        # ============================================
        print("\nGDPR compliance - deleting video...")
        cleanup_file(video_path)
        print("Video deleted (metadata retained)")

        print("\n" + "="*80)
        print("ANALYSIS COMPLETE!")
        print(f"   Classification: {classification}")
        print(f"   Confidence: {confidence:.2f}%")
        print(f"   Urgency: {urgency}")
        print("="*80 + "\n")
        
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
        "message": "TrustPaw AI - Early Dog Illness Detection API is running",
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
    import os
    import logging
    
    # Get port from environment (Render sets this)
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('DEBUG', 'False') == 'True'
    
    # Suppress Flask's werkzeug logs in production
    if not debug:
        log = logging.getLogger('werkzeug')
        log.setLevel(logging.WARNING)
    
    # Only show startup message once
    if debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        print("\n" + "="*80)
        print("🐾 TRUSTPAW AI - EARLY DOG ILLNESS DETECTION SYSTEM")
        print("="*80)
        
        model = get_model()
        model_status = "Loaded ✅" if model is not None else "Not Loaded ⚠️"
        model_params = f"{model.count_params():,} params" if model is not None else "N/A"
        
        print(f"  Environment:    {'Development' if debug else 'Production'}")
        print(f"  API Server:     http://0.0.0.0:{port}")
        print(f"  AI Model:       {model_status} ({model_params})")
        print(f"  Database:       {len(users_db)} users, {len(dogs_db)} dogs, {len(history_db)} analyses")
        print(f"  Debug Mode:     {'ON' if debug else 'OFF'}")
        print("="*80)
        print("  Status: Ready to accept requests")
        if debug:
            print("  Press CTRL+C to stop the server")
        print("="*80 + "\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug, use_reloader=False)