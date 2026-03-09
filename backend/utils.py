"""
utils.py - Helper functions for video processing
"""

import cv2
import numpy as np
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import os
import tempfile

def extract_frames(video_path, num_frames=30, target_size=(224, 224)):
    """
    Extract exactly num_frames from video uniformly
    """
    print(f"Opening video: {video_path}")
    
    # Open video
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        raise ValueError(f"Cannot open video file: {video_path}")
    
    # Get total frames
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    duration = total_frames / fps if fps > 0 else 0
    
    print(f"   Total frames: {total_frames}")
    print(f"   FPS: {fps}")
    print(f"   Duration: {duration:.2f} seconds")
    
    # Calculate frame indices to extract uniformly
    if total_frames >= num_frames:
        indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
    else:
        indices = np.linspace(0, total_frames - 1, total_frames, dtype=int)
    
    frames = []
    
    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        
        if not ret:
            print(f"Warning: Could not read frame {idx}")
            continue
        
        # Convert BGR to RGB
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Resize to target size
        frame = cv2.resize(frame, target_size)
        
        frames.append(frame)
    
    cap.release()
    
    print(f"Extracted {len(frames)} frames")
    
    # Pad with last frame if needed
    while len(frames) < num_frames:
        print(f"   Padding: duplicating last frame ({len(frames)}/{num_frames})")
        frames.append(frames[-1].copy())
    
    # Convert to numpy array
    frames_array = np.array(frames[:num_frames])  # Take exactly num_frames
    
    print(f"   Final shape: {frames_array.shape}")
    
    return frames_array


def preprocess_frames(frames):
    """
    Preprocess frames for model input
    
    Args:
        frames: numpy array of shape (num_frames, 224, 224, 3)
    
    Returns:
        Preprocessed frames normalized to [0, 1]
    """
    print(f"Preprocessing frames...")
    
    # Convert to float32
    frames = frames.astype('float32')
    
    # Normalize to [0, 1]
    frames = frames / 255.0
    
    print(f"   Normalized to range: [{frames.min():.3f}, {frames.max():.3f}]")
    
    return frames


def save_uploaded_file(file):
    """
    Save uploaded file to temporary location
    
    Args:
        file: FileStorage object from Flask request
    
    Returns:
        Path to saved file
    """
    # Create temporary file
    temp_dir = tempfile.gettempdir()
    filename = file.filename
    filepath = os.path.join(temp_dir, filename)
    
    print(f"Saving uploaded file to: {filepath}")
    file.save(filepath)
    
    # Get file size
    file_size = os.path.getsize(filepath)
    print(f"File size: {file_size / (1024*1024):.2f} MB")
    
    return filepath


def cleanup_file(filepath):
    """
    Delete temporary file
    
    Args:
        filepath: Path to file to delete
    """
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"Cleaned up: {filepath}")
    except Exception as e:
        print(f"Could not delete {filepath}: {e}")


def get_video_metadata(video_path):
    """
    Extract metadata from video
    
    Args:
        video_path: Path to video file
    
    Returns:
        Dictionary with video metadata
    """
    cap = cv2.VideoCapture(video_path)
    
    metadata = {
        'total_frames': int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
        'fps': int(cap.get(cv2.CAP_PROP_FPS)),
        'width': int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
        'height': int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
        'duration': 0
    }
    
    if metadata['fps'] > 0:
        metadata['duration'] = metadata['total_frames'] / metadata['fps']
    
    cap.release()
    
    return metadata