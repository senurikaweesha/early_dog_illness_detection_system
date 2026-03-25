"""
model_loader.py - Load model with TF 2.21 compatibility
"""

import os

import tensorflow as tf
from tensorflow import keras

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, 'best_model_frozen.keras')
FALLBACK_MODEL_PATH = os.path.join(MODEL_DIR, 'best_model_improved.keras')

def load_model_safe(model_path=None):
    """Load model with compatibility fixes"""
    
    if model_path is None:
        model_path = MODEL_PATH
    
    print("\n" + "="*60)
    print("LOADING TRUSTPAW AI MODEL")
    print("="*60)
    print(f"\nModel path: {model_path}")
    
    if not os.path.exists(model_path):
        print(f" Model not found")
        return None
    
    try:
        file_size = os.path.getsize(model_path) / (1024 * 1024)
        print(f"Model size: {file_size:.1f} MB")
        
        from tensorflow.keras import layers, Model, regularizers
        from tensorflow.keras.applications import MobileNetV2
        
        def build_model():
            video_input = layers.Input(shape=(30, 224, 224, 3), name='video_input')
            base_cnn = MobileNetV2(weights=None, include_top=False, input_shape=(224, 224, 3))
            cnn_model = tf.keras.Sequential([
                base_cnn,
                layers.GlobalAveragePooling2D(),
                layers.Dropout(0.3)
            ], name='cnn_extractor')
            cnn_features = layers.TimeDistributed(cnn_model)(video_input)
            
            lstm_out = layers.LSTM(256, return_sequences=True, kernel_regularizer=regularizers.l2(0.01), name='lstm_1')(cnn_features)
            lstm_out = layers.Dropout(0.5)(lstm_out)
            lstm_out = layers.LSTM(128, kernel_regularizer=regularizers.l2(0.01), name='lstm_2')(lstm_out)
            lstm_out = layers.Dropout(0.5)(lstm_out)
            
            dense_out = layers.Dense(64, activation='relu', kernel_regularizer=regularizers.l2(0.01), name='dense_1')(lstm_out)
            dense_out = layers.Dropout(0.3)(dense_out)
            dense_out = layers.Dense(32, activation='relu', kernel_regularizer=regularizers.l2(0.01), name='dense_2')(dense_out)
            dense_out = layers.Dropout(0.4)(dense_out)
            
            output = layers.Dense(1, activation='sigmoid', name='output')(dense_out)
            return Model(inputs=video_input, outputs=output, name='TrustPaw_AI')
            
        try:
            model = build_model()
            model.load_weights(model_path)
            print("\nWeights loaded successfully into architecture!")
        except Exception as e1:
            print(f"\nArchitecture/Weights load failed: {str(e1)}")
            raise e1
        
        print("Compiling model...")
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.0001),
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        print(f"\nModel loaded!")
        print(f"   Parameters: {model.count_params():,}")
        print(f"   Input: {model.input_shape}")
        print(f"   Output: {model.output_shape}")
        print("="*60 + "\n")
        
        return model
        
    except Exception as e:
        print(f"\n Loading failed: {str(e)}")
        
        # Try fallback
        if model_path != FALLBACK_MODEL_PATH and os.path.exists(FALLBACK_MODEL_PATH):
            print(f"\n Trying fallback...")
            return load_model_safe(FALLBACK_MODEL_PATH)
        
        print("\nRunning in DEMO MODE\n")
        return None


_MODEL_INSTANCE = None

def get_model():
    """Get the global model instance"""
    global _MODEL_INSTANCE
    
    if _MODEL_INSTANCE is None:
        _MODEL_INSTANCE = load_model_safe()
    
    return _MODEL_INSTANCE


print("\nInitializing model...")
_MODEL_INSTANCE = load_model_safe()

if _MODEL_INSTANCE is not None:
    print("\nModel ready!")
else:
    print("Demo mode")
