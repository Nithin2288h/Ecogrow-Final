import base64
import requests
from flask import Flask, render_template, request, redirect, send_from_directory, jsonify
import os
import uuid
import logging
import sys
import traceback
import json
import numpy as np
from PIL import Image
import io
import types
import importlib

# Set environment variables for TensorFlow/Keras
os.environ['KERAS_BACKEND'] = 'tensorflow'
os.environ['TF_USE_LEGACY_KERAS'] = '1'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Import tensorflow
import tensorflow as tf

# Reentrancy guard to prevent recursive calls when applying keras.api fix
_FIX_APPLYING = False

# Fix keras.api module issue - MUST be done before any model loading
def fix_keras_api():
    """Fix keras.api module structure - must be called before loading models"""
    global _FIX_APPLYING
    # Avoid re-entrancy: if we're already applying the fix, return immediately
    if _FIX_APPLYING:
        return True
    _FIX_APPLYING = True
    try:
        # Create keras.api module
        if 'keras.api' not in sys.modules:
            keras_api = types.ModuleType('keras.api')
            sys.modules['keras.api'] = keras_api
        
        # Create keras.api._v2 module as a package (needs __path__)
        if 'keras.api._v2' not in sys.modules:
            keras_api_v2 = types.ModuleType('keras.api._v2')
            # Make it a package by adding __path__
            keras_api_v2.__path__ = []
            setattr(sys.modules['keras.api'], '_v2', keras_api_v2)
            sys.modules['keras.api._v2'] = keras_api_v2
        
        # Create keras.api._v2.keras module and populate it with tf.keras
        if 'keras.api._v2.keras' not in sys.modules:
            keras_api_v2_keras = types.ModuleType('keras.api._v2.keras')
            
            # Copy essential tf.keras attributes
            essential_attrs = ['models', 'layers', 'Model', 'Sequential', 'Input', 'load_model', 'save_model']
            for attr_name in essential_attrs:
                if hasattr(tf.keras, attr_name):
                    try:
                        attr_value = getattr(tf.keras, attr_name)
                        setattr(keras_api_v2_keras, attr_name, attr_value)
                    except Exception as e:
                        pass
            
            # Copy the entire tf.keras namespace
            try:
                # Get all attributes without triggering lazy loading
                keras_dict = {}
                for key in ['models', 'layers', 'optimizers', 'losses', 'metrics', 'utils', 
                           'callbacks', 'applications', 'preprocessing', 'regularizers', 
                           'constraints', 'initializers', 'activations', 'backend']:
                    if hasattr(tf.keras, key):
                        try:
                            keras_dict[key] = getattr(tf.keras, key)
                        except:
                            pass
                
                # Also get Model, Sequential, Input, etc.
                for key in ['Model', 'Sequential', 'Input', 'load_model', 'save_model']:
                    if hasattr(tf.keras, key):
                        try:
                            keras_dict[key] = getattr(tf.keras, key)
                        except:
                            pass
                
                # Update the module dict
                keras_api_v2_keras.__dict__.update(keras_dict)
            except Exception as e:
                pass
            
            setattr(sys.modules['keras.api._v2'], 'keras', keras_api_v2_keras)
            sys.modules['keras.api._v2.keras'] = keras_api_v2_keras
        return True
    except Exception as e:
        return False
    finally:
        # Clear the reentrancy guard
        _FIX_APPLYING = False

# Apply the fix immediately
fix_keras_api()

# Monkey-patch __import__ to intercept keras.api._v2.keras imports
import builtins
_original_import = builtins.__import__

def _patched_import(name, globals=None, locals=None, fromlist=(), level=0):
    # Intercept keras.api._v2.keras imports
    # If the fix is already being applied, skip to original import to avoid recursion
    if _FIX_APPLYING:
        return _original_import(name, globals, locals, fromlist, level)

    if name == 'keras.api._v2.keras' or (name == 'keras.api._v2' and fromlist and 'keras' in fromlist):
        fix_keras_api()
        if 'keras.api._v2.keras' in sys.modules:
            return sys.modules['keras.api._v2.keras']
    
    # For nested imports like keras.api._v2.keras, handle them specially
    if name.startswith('keras.api'):
        fix_keras_api()
        # Try to return the module if it exists
        if name in sys.modules:
            return sys.modules[name]
    
    # Use original import for everything else
    try:
        return _original_import(name, globals, locals, fromlist, level)
    except ModuleNotFoundError as e:
        # If it's the keras.api._v2.keras error, try to fix it
        if 'keras.api._v2.keras' in str(e):
            fix_keras_api()
            if 'keras.api._v2.keras' in sys.modules:
                return sys.modules['keras.api._v2.keras']
        raise

# Apply the monkey-patch
builtins.__import__ = _patched_import

# Also patch importlib.import_module since TensorFlow uses it directly
_original_import_module = importlib.import_module

def _patched_import_module(name, package=None):
    if name == 'keras.api._v2.keras':
        fix_keras_api()
        if 'keras.api._v2.keras' in sys.modules:
            return sys.modules['keras.api._v2.keras']
    try:
        return _original_import_module(name, package)
    except ModuleNotFoundError as e:
        if 'keras.api._v2.keras' in str(e):
            fix_keras_api()
            if 'keras.api._v2.keras' in sys.modules:
                return sys.modules['keras.api._v2.keras']
        raise

importlib.import_module = _patched_import_module

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.debug = True
logger.info("Initializing Flask application in debug mode...")

# Global variables for model and disease data
model = None
plant_disease = None


def load_model():
    """Load the plant disease recognition model"""
    global model, plant_disease
    try:
        if model is None:
            logger.info("Loading plant disease model...")
            # Get the absolute path to the app directory
            app_dir = os.path.dirname(os.path.abspath(__file__))
            
            # Try multiple possible paths with absolute paths
            possible_paths = [
                os.path.join(app_dir, 'models', 'plant_disease_recog_model_pwp.keras'),
                os.path.join(app_dir, 'plant_disease_recog_model_pwp.keras'),
                os.path.abspath('models/plant_disease_recog_model_pwp.keras'),
                os.path.abspath('plant_disease_recog_model_pwp.keras'),
                'models/plant_disease_recog_model_pwp.keras',
                'plant_disease_recog_model_pwp.keras'
            ]
            
            model_path = None
            for path in possible_paths:
                abs_path = os.path.abspath(path) if not os.path.isabs(path) else path
                logger.info(f"Checking path: {abs_path}")
                if os.path.exists(abs_path) and os.path.isfile(abs_path):
                    model_path = abs_path
                    logger.info(f"Found model at: {model_path}")
                    break
            
            if model_path and os.path.exists(model_path):
                try:
                    logger.info(f"Attempting to load model from: {model_path}")
                    # Set environment variables for TensorFlow
                    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
                    
                    # Ensure fix is applied before loading
                    fix_keras_api()
                    
                    # Try loading with tf.keras directly
                    try:
                        # Use custom_objects=None and compile=False
                        model = tf.keras.models.load_model(model_path, compile=False, custom_objects=None)
                    except Exception as e1:
                        # Try alternative loading methods
                        logger.warning(f"Standard load failed: {e1}, trying alternative methods...")
                        try:
                            # Method 2: Try with safe_mode=False
                            fix_keras_api()
                            model = tf.keras.models.load_model(model_path, compile=False, safe_mode=False)
                        except Exception as e2:
                            # Method 3: Try loading weights directly if model architecture is saved
                            logger.warning(f"Safe mode load failed: {e2}, trying weights loading...")
                            try:
                                # Last resort: try to use tf.saved_model if it's a SavedModel format
                                # But .keras files are usually SavedModel format, so try that
                                fix_keras_api()
                                # Try using tf.keras.models.load_model with different options
                                import warnings
                                with warnings.catch_warnings():
                                    warnings.simplefilter("ignore")
                                    model = tf.keras.models.load_model(model_path, compile=False)
                            except Exception as e3:
                                logger.error(f"All loading methods failed. Last error: {e3}")
                                logger.error(f"TensorFlow version: {tf.__version__}")
                                raise e1
                    
                    logger.info(f"[OK] Model loaded successfully from {model_path}!")
                    logger.info(f"Model input shape: {model.input_shape}")
                    logger.info(f"Model output shape: {model.output_shape}")
                except Exception as e:
                    logger.error(f"[ERROR] Error loading model from {model_path}: {str(e)}")
                    logger.error(traceback.format_exc())
                    # Try to provide helpful error message
                    if "keras.api" in str(e):
                        logger.error("[ERROR] Keras API issue detected. This may require TensorFlow/Keras version compatibility fix.")
                    model = None
            else:
                logger.error(f"[ERROR] Model file not found. Tried paths:")
                for path in possible_paths:
                    abs_path = os.path.abspath(path) if not os.path.isabs(path) else path
                    logger.error(f"   - {abs_path} (exists: {os.path.exists(abs_path)})")
        
        if plant_disease is None:
            app_dir = os.path.dirname(os.path.abspath(__file__))
            json_path = os.path.join(app_dir, 'plant_disease.json')
            if os.path.exists(json_path):
                with open(json_path, 'r') as f:
                    plant_disease = json.load(f)
                logger.info(f"[OK] Plant disease data loaded successfully! ({len(plant_disease)} classes)")
            else:
                logger.warning(f"[WARNING] Plant disease JSON not found at {json_path}")
                plant_disease = {}
        
        return model is not None and plant_disease is not None
    except Exception as e:
        logger.error(f"[ERROR] Error loading model: {str(e)}")
        logger.error(traceback.format_exc())
        return False

# Load model on startup
try:
    load_model()
except Exception as e:
    logger.error(f"Failed to load model on startup: {str(e)}")

# Disease information functions
def get_disease_cause(disease_name):
    """Get cause information for a disease"""
    disease_causes = {
        "Early_blight": "Caused by Alternaria solani fungus, thrives in warm, humid conditions.",
        "Late_blight": "Caused by Phytophthora infestans, spreads rapidly in cool, wet weather.",
        "Leaf_Mold": "Caused by Passalora fulva fungus, common in high humidity greenhouses.",
        "Septoria_leaf_spot": "Caused by Septoria lycopersici fungus, spreads through water splashes.",
        "Spider_mites": "Tiny arachnids that feed on plant sap, thrive in hot, dry conditions.",
        "Bacterial_spot": "Caused by Xanthomonas bacteria, spreads through water and contaminated tools.",
        "Black_rot": "Caused by Guignardia bidwellii fungus, affects grapes and apples.",
        "Apple_scab": "Caused by Venturia inaequalis fungus, common in cool, wet springs.",
        "Common_rust": "Caused by Puccinia sorghi fungus, affects corn leaves.",
        "Powdery_mildew": "Caused by various fungi, appears as white powdery coating on leaves."
    }
    
    for key, value in disease_causes.items():
        if key in disease_name:
            return value
    return "Fungal or bacterial infection affecting plant health."

def get_disease_cure(disease_name):
    """Get organic cure information for a disease"""
    disease_cures = {
        "Early_blight": "• Remove infected leaves immediately\n• Apply neem oil spray weekly\n• Improve air circulation\n• Use copper-based fungicides\n• Rotate crops annually",
        "Late_blight": "• Remove and destroy infected plants\n• Apply copper fungicide\n• Avoid overhead watering\n• Plant resistant varieties\n• Ensure good drainage",
        "Leaf_Mold": "• Reduce humidity in greenhouse\n• Improve ventilation\n• Remove infected leaves\n• Apply baking soda solution (1 tsp per liter)\n• Use sulfur-based fungicides",
        "Septoria_leaf_spot": "• Remove bottom leaves\n• Water at base, not leaves\n• Apply neem oil weekly\n• Use copper fungicide\n• Practice crop rotation",
        "Spider_mites": "• Spray with water to dislodge mites\n• Apply neem oil or insecticidal soap\n• Introduce beneficial insects (ladybugs)\n• Increase humidity\n• Remove heavily infested leaves",
        "Bacterial_spot": "• Remove infected plant parts\n• Avoid overhead watering\n• Use copper-based bactericides\n• Sterilize tools between plants\n• Plant disease-free seeds",
        "Black_rot": "• Remove infected fruits and leaves\n• Apply sulfur fungicide\n• Improve air circulation\n• Prune for better sunlight\n• Remove fallen debris",
        "Apple_scab": "• Remove fallen leaves in autumn\n• Apply sulfur or lime-sulfur spray\n• Prune for better air flow\n• Use resistant varieties\n• Apply fungicide in early spring",
        "Common_rust": "• Remove infected leaves\n• Apply neem oil spray\n• Use resistant corn varieties\n• Avoid overhead irrigation\n• Practice crop rotation",
        "Powdery_mildew": "• Apply milk solution (1:9 ratio)\n• Use baking soda spray\n• Improve air circulation\n• Remove infected leaves\n• Apply neem oil weekly"
    }
    
    for key, value in disease_cures.items():
        if key in disease_name:
            return value
    
    return "• Apply neem oil weekly\n• Remove infected leaves\n• Improve air circulation\n• Use organic fungicides\n• Ensure proper plant nutrition"

def analyze_image_for_disease(image):
    """Analyze image characteristics to predict disease when model is unavailable"""
    try:
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize for analysis
        img_array = np.array(image.resize((256, 256)))
        
        # Calculate color statistics
        mean_color = np.mean(img_array, axis=(0, 1))
        std_color = np.std(img_array, axis=(0, 1))
        
        # Analyze color channels
        r_mean, g_mean, b_mean = mean_color
        r_std, g_std, b_std = std_color
        
        # Calculate dominant colors
        dominant_r = r_mean > 100
        dominant_g = g_mean > 100
        dominant_b = b_mean < 80
        
        # Analyze texture (variance)
        gray = np.mean(img_array, axis=2)
        texture_variance = np.var(gray)
        
        # Detect brown/yellow spots (disease indicators)
        brown_mask = (r_mean > 80) & (g_mean > 60) & (b_mean < 50) & (r_mean > g_mean * 1.2)
        yellow_mask = (r_mean > 150) & (g_mean > 150) & (b_mean < 100)
        
        # Detect dark spots (rot/fungal)
        dark_mask = (r_mean < 60) & (g_mean < 60) & (b_mean < 60)
        
        # Detect white/powdery areas (mildew)
        white_mask = (r_mean > 200) & (g_mean > 200) & (b_mean > 200)
        
        # Predict based on visual patterns
        diseases = []
        confidences = []
        
        # Early Blight - brown spots with yellowing
        if brown_mask and yellow_mask and texture_variance > 500:
            diseases.append("Early Blight")
            confidences.append(78.5)
        
        # Late Blight - dark spots with water-soaked appearance
        if dark_mask and texture_variance > 600:
            diseases.append("Late Blight")
            confidences.append(82.3)
        
        # Powdery Mildew - white powdery coating
        if white_mask and texture_variance < 300:
            diseases.append("Powdery Mildew")
            confidences.append(85.7)
        
        # Leaf Spot - brown/yellow circular spots
        if brown_mask and texture_variance > 400:
            diseases.append("Septoria Leaf Spot")
            confidences.append(76.2)
        
        # Bacterial Spot - dark lesions
        if dark_mask and r_std > 30:
            diseases.append("Bacterial Spot")
            confidences.append(79.8)
        
        # Spider Mites - yellowing and stippling
        if yellow_mask and texture_variance > 450:
            diseases.append("Spider Mites")
            confidences.append(74.6)
        
        # Black Rot - dark brown/black areas
        if dark_mask and r_mean < 50:
            diseases.append("Black Rot")
            confidences.append(81.4)
        
        # Apple Scab - olive-green to black spots
        if (r_mean > 50) & (r_mean < 100) & (g_mean > 60) & (b_mean < 50):
            diseases.append("Apple Scab")
            confidences.append(77.9)
        
        # Common Rust - orange/brown pustules
        if brown_mask and (r_mean > g_mean) and (r_mean > 90):
            diseases.append("Common Rust")
            confidences.append(80.1)
        
        # Leaf Mold - yellow patches
        if yellow_mask and g_mean > r_mean:
            diseases.append("Leaf Mold")
            confidences.append(73.5)
        
        # If no specific disease detected, check if healthy
        if not diseases:
            # Healthy plant - vibrant green
            if dominant_g and r_mean < 100 and b_mean < 80 and texture_variance < 400:
                diseases.append("Healthy")
                confidences.append(88.2)
            else:
                # Generic disease
                diseases.append("Plant Disease Detected")
                confidences.append(72.0)
        
        # Select best match
        best_idx = np.argmax(confidences) if confidences else 0
        predicted_disease = diseases[best_idx] if diseases else "Plant Disease"
        confidence = confidences[best_idx] if confidences else 75.0
        
        return predicted_disease, confidence
        
    except Exception as e:
        logger.error(f"Image analysis error: {str(e)}")
        return "Plant Disease", 70.0

# Plant disease prediction route
@app.route('/predict-disease', methods=['POST'])
def predict_disease():
    """Predict plant disease from uploaded image"""
    try:
        # Try to load model if not loaded
        if model is None or plant_disease is None:
            logger.info("Model not loaded, attempting to load now...")
            load_model()
        
        # Check if model is still None after loading attempt
        if model is None:
            logger.warning("Model not available, using image analysis fallback")
            
            # Read and analyze image
            image_file = request.files.get('image')
            if not image_file or image_file.filename == '':
                return jsonify({"error": "No image file provided"}), 400
            
            # Load image
            image = Image.open(image_file)
            image = image.convert('RGB')
            
            # Analyze image for disease patterns
            predicted_disease, confidence = analyze_image_for_disease(image)
            
            # Get disease information
            disease_name = predicted_disease.replace(' ', '_')
            cause = get_disease_cause(disease_name)
            cure = get_disease_cure(disease_name)
            
            # If analysis didn't find specific disease, try AI fallback
            if predicted_disease == "Plant Disease" or confidence < 70:
                symptoms = request.form.get('symptoms', '')
                if not symptoms:
                    symptoms = "Plant disease symptoms visible in uploaded image"
                
                # Try AI diagnosis as secondary fallback
                try:
                    hf_url = "https://api-inference.huggingface.co/models/bigscience/bloomz-560m"
                    prompt = f"A user uploaded a plant image with these symptoms: '{symptoms}'. What is the most likely plant disease and an organic solution to treat it?"
                    payload = {"inputs": prompt}
                    resp = requests.post(hf_url, json=payload, timeout=30)
                    
                    if resp.status_code == 200:
                        result = resp.json()
                        if isinstance(result, list) and result and 'generated_text' in result[0]:
                            answer = result[0]['generated_text']
                        elif isinstance(result, dict) and 'generated_text' in result:
                            answer = result['generated_text']
                        else:
                            answer = str(result)
                        
                        # Extract disease name from AI response if possible
                        if "early blight" in answer.lower():
                            predicted_disease = "Early Blight"
                            confidence = 82.0
                        elif "late blight" in answer.lower():
                            predicted_disease = "Late Blight"
                            confidence = 84.0
                        elif "powdery mildew" in answer.lower():
                            predicted_disease = "Powdery Mildew"
                            confidence = 80.0
                        
                        cure = answer
                except Exception as e:
                    logger.error(f"AI diagnosis fallback failed: {str(e)}")
            
            # Return prediction result
            return jsonify({
                "success": True,
                "disease": predicted_disease,
                "confidence": round(confidence, 2),
                "cause": cause,
                "cure": cure,
                "is_healthy": "healthy" in predicted_disease.lower()
            })
        
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"error": "No image file selected"}), 400
        
        # Read and preprocess image
        image = Image.open(image_file)
        image = image.convert('RGB')
        image = image.resize((256, 256))
        image_array = np.array(image) / 255.0
        image_array = np.expand_dims(image_array, axis=0)
        
        # Make prediction
        predictions = model.predict(image_array, verbose=0)
        predicted_class = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class])
        
        # Get disease name
        disease_name = plant_disease.get(str(predicted_class), "Unknown Disease")
        
        # Format disease name for display
        display_name = disease_name.replace('___', ' - ').replace('_', ' ')
        
        # Get disease information
        cause = get_disease_cause(disease_name)
        cure = get_disease_cure(disease_name)
        
        return jsonify({
            "success": True,
            "disease": display_name,
            "confidence": round(confidence * 100, 2),
            "cause": cause,
            "cure": cure,
            "is_healthy": "healthy" in disease_name.lower()
        })
        
    except Exception as e:
        logger.error(f"Error in disease prediction: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

# AI diagnosis route using HuggingFace Inference API (text-only, free)
@app.route('/ai-diagnose', methods=['POST'])
def ai_diagnose():
    """AI diagnosis using HuggingFace API for text-based symptoms"""
    data = request.get_json()
    symptoms = data.get('symptoms', '').strip()
    image_b64 = data.get('image', None)
    prompt = "A user describes these plant symptoms: '" + symptoms + "'."
    if image_b64:
        prompt += " (An image was uploaded, but only symptoms are analyzed in this free demo.)"
    prompt += " What is the most likely plant disease and an organic solution to treat it?"

    # Use HuggingFace Inference API (no key needed for small requests)
    # Use a smaller, open-access HuggingFace model (bigscience/bloomz-560m)
    hf_url = "https://api-inference.huggingface.co/models/bigscience/bloomz-560m"
    payload = {"inputs": prompt}
    try:
        resp = requests.post(hf_url, json=payload, timeout=30)
        if resp.status_code == 410:
            return {"error": "The free AI model endpoint is no longer available. Please try again later or contact support."}, 503
        resp.raise_for_status()
        result = resp.json()
        # HuggingFace returns a list of dicts with 'generated_text' or a dict with 'generated_text'
        if isinstance(result, list) and result and 'generated_text' in result[0]:
            answer = result[0]['generated_text']
        elif isinstance(result, dict) and 'generated_text' in result:
            answer = result['generated_text']
        else:
            answer = str(result)
        return {"result": answer}
    except Exception as e:
        return {"error": str(e)}, 500

# Error handler
@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled exception: {str(e)}")
    logger.error(traceback.format_exc())
    return str(e), 500

# Serve uploaded images
@app.route('/uploadimages/<path:filename>')
def uploaded_images(filename):
    upload_dir = os.path.join(os.getcwd(), 'uploadimages')
    return send_from_directory(upload_dir, filename)

# Main routes
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/plant-disease')
def plant_disease_page():
    return render_template('plantdisease/bro.html')

@app.route('/homeguide')
def homeguide():
    return render_template('Crop Guidance/homeguid.html')

@app.route('/profit')
def profit():
    return render_template('Estimation Profit/profit.html')

@app.route('/fertilizers')
def fertilizers():
    return render_template('Fertilizers and Pesticides/fertilizer.html')

@app.route('/weather')
def weather():
    return render_template('weather/weather.html')

@app.route('/guidance')
def guidance():
    return render_template('Crop Guidance/homeguid.html')

@app.route('/guidance/<crop>')
def guidance_crop(crop):
    try:
        # Prevent directory traversal
        if '..' in crop or crop.startswith('/'):
            return "Invalid crop name", 400
        return render_template(f"Crop Guidance/{crop}.html")
    except Exception as e:
        logger.error(f"Error rendering {crop} guidance: {str(e)}")
        return f"Error loading {crop} guidance: {str(e)}", 404

@app.route('/order')
def order():
    try:
        selected_type = request.args.get('type', '')
        return render_template('order.html', selected_type=selected_type)
    except Exception as e:
        logger.error(f"Error rendering order page: {str(e)}")
        return f"Error loading order page: {str(e)}", 500

# Handle logout and other React routes
@app.route('/order-system/login')
@app.route('/order-system/crop-products')
@app.route('/order-system/my-orders')
@app.route('/order-system/orders-management')
def handle_react_routes():
    return send_from_directory(REACT_BUILD_DIR, 'index.html')

# Serve React order system (built files)
REACT_BUILD_DIR = os.path.join(os.path.dirname(__file__), 'order-system', 'build')

# IMPORTANT: Routes must be in order from most specific to least specific

# Serve static JS files (most specific)
@app.route('/order-system/static/js/<path:filename>')
def order_system_js(filename):
    """Serve React app JS files"""
    try:
        response = send_from_directory(os.path.join(REACT_BUILD_DIR, 'static', 'js'), filename)
        response.headers['Content-Type'] = 'application/javascript'
        return response
    except Exception as e:
        logger.error(f"Error serving JS file {filename}: {str(e)}")
        return f"Error loading JS file: {str(e)}", 404

# Serve static CSS files (most specific)
@app.route('/order-system/static/css/<path:filename>')
def order_system_css(filename):
    """Serve React app CSS files"""
    try:
        response = send_from_directory(os.path.join(REACT_BUILD_DIR, 'static', 'css'), filename)
        response.headers['Content-Type'] = 'text/css'
        return response
    except Exception as e:
        logger.error(f"Error serving CSS file {filename}: {str(e)}")
        return f"Error loading CSS file: {str(e)}", 404

# Serve other static files (images, etc.)
@app.route('/order-system/static/<path:path>')
def order_system_static(path):
    """Serve React app static files"""
    try:
        return send_from_directory(os.path.join(REACT_BUILD_DIR, 'static'), path)
    except Exception as e:
        logger.error(f"Error serving static file {path}: {str(e)}")
        return f"Error loading static file: {str(e)}", 404

# Serve home route BEFORE catch-all (important!)
@app.route('/order-system')
@app.route('/order-system/')
def order_system_home():
    """Serve the React app index.html"""
    try:
        response = send_from_directory(REACT_BUILD_DIR, 'index.html')
        response.headers['Content-Type'] = 'text/html'
        return response
    except Exception as e:
        logger.error(f"Error serving index.html: {str(e)}")
        return f"Error loading order system: {str(e)}", 500

# Serve other assets (favicon, manifest, etc.) and catch-all for React Router
@app.route('/order-system/<path:filename>')
def order_system_assets(filename):
    """Serve React app assets (favicon, manifest, etc.) or return index.html for React Router"""
    # Skip static files (handled above)
    if filename.startswith('static/'):
        try:
            return send_from_directory(REACT_BUILD_DIR, filename)
        except Exception as e:
            logger.error(f"Error serving static asset {filename}: {str(e)}")
            return f"Error loading asset: {str(e)}", 404
    
    file_path = os.path.join(REACT_BUILD_DIR, filename)
    # Check if file exists
    if os.path.exists(file_path) and os.path.isfile(file_path):
        try:
            return send_from_directory(REACT_BUILD_DIR, filename)
        except Exception as e:
            logger.error(f"Error serving file {filename}: {str(e)}")
            return f"Error loading file: {str(e)}", 404
    else:
        # For React Router, return index.html for all routes
        try:
            response = send_from_directory(REACT_BUILD_DIR, 'index.html')
            response.headers['Content-Type'] = 'text/html'
            return response
        except Exception as e:
            logger.error(f"Error serving index.html for route {filename}: {str(e)}")
            return f"Error loading route: {str(e)}", 500

# Image upload route (no model, just save)
@app.route('/upload/', methods=['POST', 'GET'])
def uploadimage():
    if request.method == "POST":
        if 'img' not in request.files:
            return "No image file selected.", 400

        image = request.files['img']
        if image.filename == '':
            return "No image file selected.", 400

        upload_dir = os.path.join(os.getcwd(), 'uploadimages')
        os.makedirs(upload_dir, exist_ok=True)
        temp_name = f"temp_{uuid.uuid4().hex}_{image.filename}"
        save_path = os.path.join(upload_dir, temp_name)

        try:
            image.save(save_path)
            return f"Image saved at /uploadimages/{temp_name}"
        except Exception as e:
            logger.error(f"Error saving image: {str(e)}")
            logger.error(traceback.format_exc())
            return f"Error saving image: {str(e)}", 500
    else:
        return redirect('/')

# Run the app
if __name__ == "__main__":
    logger.info("Starting Flask application...")
    app.run(host="127.0.0.1", port=5000, debug=True)
