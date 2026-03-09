"""
model_loader.py - Simple loader using model_builder
"""

from model_builder import create_production_model


def load_model_safe(model_path='model/model_weights.json'):
    """
    Load production model with trained weights
    """
    print("\nLoading model for production...")
    
    try:
        model = create_production_model(model_path)
        return model
        
    except Exception as e:
        print(f"\nMODEL LOADING FAILED")
        print(f"Error: {e}")
        print("\nRunning in DEMO MODE")
        print("Backend functional, model integration pending\n")
        
        # Return None to trigger demo mode in app.py
        return None