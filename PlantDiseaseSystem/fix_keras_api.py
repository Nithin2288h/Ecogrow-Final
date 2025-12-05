"""
Fix for keras.api module issue
This script creates the missing keras.api module structure and verifies TensorFlow/Keras setup
"""
import os
import sys
import types
import importlib

# Set environment variables first
os.environ['KERAS_BACKEND'] = 'tensorflow'
os.environ['TF_USE_LEGACY_KERAS'] = '1'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

def create_keras_api_structure():
    """Create the missing keras.api module structure"""
    try:
        # Import tensorflow first
        import tensorflow as tf
        
        # Create keras.api module
        keras_api = types.ModuleType('keras.api')
        sys.modules['keras.api'] = keras_api
        
        # Create keras.api._v2 module
        keras_api_v2 = types.ModuleType('keras.api._v2')
        keras_api._v2 = keras_api_v2
        sys.modules['keras.api._v2'] = keras_api_v2
        
        # Create keras.api._v2.keras module and populate it with tf.keras
        keras_api_v2_keras = types.ModuleType('keras.api._v2.keras')
        
        # Copy all tf.keras attributes to keras.api._v2.keras
        for attr_name in dir(tf.keras):
            if not attr_name.startswith('_'):
                setattr(keras_api_v2_keras, attr_name, getattr(tf.keras, attr_name))
        
        keras_api_v2.keras = keras_api_v2_keras
        sys.modules['keras.api._v2.keras'] = keras_api_v2_keras
        
        print("✓ Created keras.api module structure")
        return True
        
    except Exception as e:
        print(f"✗ Failed to create keras.api structure: {e}")
        return False

def test_model_loading():
    """Test if model can be loaded after fixing keras.api"""
    try:
        import tensorflow as tf
        
        print("Testing model loading...")
        model = tf.keras.models.load_model("models/plant_disease_recog_model_pwp.keras", compile=False)
        print("✓ Model loaded successfully!")
        print(f"Model input shape: {model.input_shape}")
        print(f"Model output shape: {model.output_shape}")
        return True
        
    except Exception as e:
        print(f"✗ Model loading failed: {e}")
        return False

if __name__ == "__main__":
    print("Fixing keras.api module issue...")
    
    # Create the keras.api structure
    api_fixed = create_keras_api_structure()
    
    if api_fixed:
        # Test model loading
        model_works = test_model_loading()
        
        if model_works:
            print("\n🎉 Success! The model can now be loaded.")
            print("You can now run your Flask app.")
        else:
            print("\n❌ Model still cannot be loaded. There may be other issues.")
    else:
        print("\n❌ Could not fix keras.api issue.")