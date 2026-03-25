import os
import tensorflow as tf

model_dir = '/Users/senurikaweesha/Documents/fyp_6COSC023C.Y Computer Science Final Project/early_dog_illness_detection_system/backend/model'
h5_path = os.path.join(model_dir, 'best_model_frozen.h5')
keras_path = os.path.join(model_dir, 'best_model_frozen.keras')

print(f'Loading {h5_path} natively...')
try:
    model = tf.keras.models.load_model(h5_path, compile=False)
    print('Saving as .keras...')
    model.save(keras_path)
    print('Model successfully converted to .keras format!')
except Exception as e:
    print(f'Failed to load/convert: {e}')
