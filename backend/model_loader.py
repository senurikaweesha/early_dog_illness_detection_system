"""
model_loader.py - Load trained model from H5 file
"""

import os
import tensorflow as tf
from tensorflow import keras

# Path to the trained model
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, 'best_model_frozen.keras')
FALLBACK_MODEL_PATH = os.path.join(MODEL_DIR, 'best_model_improved.keras')

def load_model_safe(model_path=None):
    """
    Load the trained CNN+LSTM model from .h5 file
    
    Args:
        model_path: Optional path to model file
    
    Returns:
        Loaded Keras model or None if loading fails
    """
    
    if model_path is None:
        model_path = MODEL_PATH
    
    print("\n" + "="*60)
    print("LOADING TRUSTPAW AI MODEL")
    print("="*60)
    print(f"Model path: {model_path}")
    
    # Check if file exists
    if not os.path.exists(model_path):
        print(f" Model file not found: {model_path}")
        
        # Try fallback
        if os.path.exists(FALLBACK_MODEL_PATH):
            print(f"  Trying fallback: {FALLBACK_MODEL_PATH}")
            model_path = FALLBACK_MODEL_PATH
        else:
            print(f"\n  Available models in {MODEL_DIR}:")
            for file in os.listdir(MODEL_DIR):
                if file.endswith('.h5'):
                    print(f"   - {file}")
            
            print("\n MODEL LOADING FAILED - Running in demo mode\n")
            return None
    
    try:
        # Check file size
        file_size = os.path.getsize(model_path) / (1024 * 1024)
        print(f"Model size: {file_size:.1f} MB")
        
        # Load model
        print("Loading model...")
        model = keras.models.load_model(model_path, compile=False)
        
        # Recompile with training settings
        print("Compiling model...")
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.0001),
            loss='binary_crossentropy',
            metrics=[
                'accuracy',
                keras.metrics.Precision(name='precision'),
                keras.metrics.Recall(name='recall'),
                keras.metrics.AUC(name='auc')
            ]
        )
        
        print(f"Model loaded successfully!")
        print(f"   Architecture: {model.name}")
        print(f"   Total parameters: {model.count_params():,}")
        print(f"   Input shape: {model.input_shape}")
        print(f"   Output shape: {model.output_shape}")
        print(f"   Layers: {len(model.layers)}")
        print("="*60 + "\n")
        
        return model
        
    except Exception as e:
        print(f"\n MODEL LOADING FAILED")
        print(f"Error: {str(e)}")
        
        import traceback
        print("\nTraceback:")
        traceback.print_exc()
        
        print("\nRunning in DEMO MODE\n")
        return None


# Global model instance
_MODEL_INSTANCE = None

def get_model():
    """
    Get the global model instance (singleton pattern)
    Loads model on first call, returns cached instance on subsequent calls
    
    Returns:
        Loaded Keras model or None if loading failed
    """
    global _MODEL_INSTANCE
    
    if _MODEL_INSTANCE is None:
        _MODEL_INSTANCE = load_model_safe()
    
    return _MODEL_INSTANCE


# Try to load model when module is imported
try:
    print("\n Initializing model on startup...")
    _MODEL_INSTANCE = load_model_safe()
    
    if _MODEL_INSTANCE is not None:
        print(" Model ready for inference!")
    else:
        print("  Model not loaded - running in demo mode")
        
except Exception as e:
    print(f"  Startup loading failed: {str(e)}")
    print("  Model will attempt to load on first prediction request")
    _MODEL_INSTANCE = None


# Test function
if __name__ == "__main__":
    print("Testing model loader...")
    try:
        model = get_model()
        if model is not None:
            print("\n Model loader test PASSED!")
            print(f"  Model ready for predictions")
        else:
            print("\n  Model not loaded (demo mode)")
    except Exception as e:
        print(f"\n Model loader test FAILED!")
        print(f"   Error: {e}")