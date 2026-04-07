"""
model_builder.py - Build model architecture and load weights
FIXED: Layer names now match Kaggle extraction
"""

import json
import numpy as np
from tensorflow import keras
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import MobileNetV2


def build_model_from_scratch():
    """
    Build the exact CNN+LSTM architecture that matches Kaggle training
    Layer names MUST match the exported weights!
    """
    print("Building model architecture...")
    
    # Video input: 30 frames of 224x224 RGB images
    video_input = layers.Input(shape=(30, 224, 224, 3), name='video_input')
    
    # === CNN Feature Extractor (MobileNetV2) ===
    base_model = MobileNetV2(include_top=False,weights='imagenet',input_shape=(224, 224, 3)
    )
    
    # Freeze first 100 layers (transfer learning)
    for layer in base_model.layers[:100]:
        layer.trainable = False
    
    # Add pooling and dropout to CNN
    cnn_model = keras.Sequential([base_model,layers.GlobalAveragePooling2D(),layers.Dropout(0.3)
    ])
    
    # Apply CNN to each frame - matches Kaggle name
    features = layers.TimeDistributed(cnn_model, name='time_distributed')(video_input)
    
    # === LSTM Sequence Processing ===
    # First LSTM layer - matches Kaggle name 'lstm'
    x = layers.LSTM(64,return_sequences=True,kernel_regularizer=keras.regularizers.l2(0.01),recurrent_dropout=0.2,name='lstm')(features)
    x = layers.Dropout(0.5, name='dropout_1')(x)
    
    # Second LSTM layer - matches Kaggle name 'lstm_1'
    x = layers.LSTM(32,kernel_regularizer=keras.regularizers.l2(0.01),recurrent_dropout=0.2,name='lstm_1')(x)
    x = layers.Dropout(0.5, name='dropout_2')(x)
    
    # === Dense Classification Layers ===
    # First dense layer - matches Kaggle name 'dense'
    x = layers.Dense(32,activation='relu',kernel_regularizer=keras.regularizers.l2(0.01),name='dense')(x)
    x = layers.Dropout(0.3, name='dropout_3')(x)
    
    # Second dense layer - matches Kaggle name 'dense_1'
    x = layers.Dense(16,activation='relu',kernel_regularizer=keras.regularizers.l2(0.01),name='dense_1')(x)
    x = layers.Dropout(0.4, name='dropout_4')(x)
    
    # Output layer - matches Kaggle name 'dense_2'
    output = layers.Dense(1, activation='sigmoid', name='dense_2')(x)
    
    # Build final model
    model = Model(inputs=video_input, outputs=output, name='ImprovedDogIllnessDetector')
    
    print("\nModel architecture built!")
    print(f"Total params: {model.count_params():,}")
    
    return model


def load_weights_from_json(model, weights_path):
    """
    Load trained weights from JSON file into model
    """
    print(f"\nLoading weights from: {weights_path}")
    
    try:
        with open(weights_path, 'r') as f:
            weights_dict = json.load(f)
        
        print(f"Weights file loaded ({len(weights_dict)} layers)")
        
        loaded_count = 0
        skipped_count = 0
        
        for layer in model.layers:
            if layer.name in weights_dict:
                try:
                    # Convert JSON lists back to numpy arrays
                    layer_weights = [np.array(w, dtype=np.float32) for w in weights_dict[layer.name]]
                    layer.set_weights(layer_weights)
                    loaded_count += 1
                    print(f"  Loaded: {layer.name:30s} ({len(layer_weights)} arrays)")
                except Exception as e:
                    print(f"  Failed: {layer.name:30s} - {str(e)[:50]}")
                    skipped_count += 1
            else:
                # Layer has no weights (like Dropout, Input, etc.)
                if len(layer.get_weights()) > 0:
                    print(f"  Missing: {layer.name:30s}")
                    skipped_count += 1
        
        print(f"\nWeight loading complete!")
        print(f"   Loaded: {loaded_count} layers")
        if skipped_count > 0:
            print(f"   Skipped: {skipped_count} layers")
        
        if loaded_count == 0:
            raise Exception("NO WEIGHTS LOADED! Layer names don't match.")
        
        return model
        
    except Exception as e:
        print(f"Error loading weights: {e}")
        raise


def create_production_model(weights_path='model/model_weights.json'):
    """
    Create production-ready model with trained weights
    """
    print("CREATING PRODUCTION MODEL")
    
    # Step 1: Build architecture
    model = build_model_from_scratch()
    
    # Step 2: Load trained weights
    model = load_weights_from_json(model, weights_path)
    
    # Step 3: Compile for predictions
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    print("\nMODEL READY FOR PREDICTIONS!")
    print(f"   Input shape:  {model.input_shape}")
    print(f"   Output shape: {model.output_shape}")
    print(f"   Parameters:   {model.count_params():,}")
    
    return model


if __name__ == "__main__":
    # Test model creation
    print("Testing model builder...")
    model = create_production_model()
    print("\nTest successful!")