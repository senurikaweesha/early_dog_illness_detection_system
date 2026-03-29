import tensorflow as tf
from tensorflow.keras import layers, Model

def build_model():
    video_input = layers.Input(shape=(30, 224, 224, 3), name='video_input')
    base_cnn = tf.keras.applications.MobileNetV2(weights=None, include_top=False, input_shape=(224, 224, 3))
    cnn_model = tf.keras.Sequential([
        base_cnn,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.3)
    ], name='cnn_extractor')
    cnn_features = layers.TimeDistributed(cnn_model)(video_input)
    
    lstm_out = layers.LSTM(256, return_sequences=True, name='lstm_1')(cnn_features)
    lstm_out = layers.Dropout(0.5)(lstm_out)
    lstm_out = layers.LSTM(128, name='lstm_2')(lstm_out)
    lstm_out = layers.Dropout(0.5)(lstm_out)
    
    dense_out = layers.Dense(64, activation='relu', name='dense_1')(lstm_out)
    dense_out = layers.Dropout(0.3)(dense_out)
    dense_out = layers.Dense(32, activation='relu', name='dense_2')(dense_out)
    dense_out = layers.Dropout(0.4)(dense_out)
    
    output = layers.Dense(1, activation='sigmoid', name='output')(dense_out)
    model = Model(inputs=video_input, outputs=output, name='TrustPaw_AI')
    return model

model = build_model()
try:
    model.load_weights('/Users/senurikaweesha/Desktop/final_model_training/best_model_frozen.keras')
    print("SUCCESS")
except Exception as e:
    print(f"FAILED: {e}")
