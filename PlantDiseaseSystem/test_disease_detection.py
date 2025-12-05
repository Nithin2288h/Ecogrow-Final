#!/usr/bin/env python3
"""
Test script to verify disease detection functionality
"""
import os
import sys
import json

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_model_loading():
    """Test if the model can be loaded successfully"""
    print("Testing model loading...")
    
    try:
        # Import the functions from app.py
        from app import load_model_on_cpu, model, plant_disease
        
        # Try to load the model
        load_model_on_cpu()
        
        if model is None:
            print("[FAIL] Model failed to load")
            return False
        else:
            print("[OK] Model loaded successfully")
            
        if plant_disease is None:
            print("[FAIL] Plant disease data failed to load")
            return False
        else:
            print("[OK] Plant disease data loaded successfully")
            print(f"   Number of disease classes: {len(plant_disease)}")
            
        return True
        
    except Exception as e:
        print(f"[FAIL] Error during model loading test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_disease_info_functions():
    """Test the disease cause and cure functions"""
    print("\nTesting disease information functions...")
    
    try:
        from app import get_disease_cause, get_disease_cure
        
        # Test with a known disease
        test_disease = "Tomato___Early_blight"
        cause = get_disease_cause(test_disease)
        cure = get_disease_cure(test_disease)
        
        print(f"[OK] Disease: {test_disease}")
        print(f"   Cause: {cause}")
        print(f"   Cure: {cure}")
        
        # Test with unknown disease
        unknown_cause = get_disease_cause("Unknown_Disease")
        unknown_cure = get_disease_cure("Unknown_Disease")
        
        print(f"[OK] Unknown disease handling:")
        print(f"   Cause: {unknown_cause}")
        print(f"   Cure: {unknown_cure}")
        
        return True
        
    except Exception as e:
        print(f"[FAIL] Error during disease info test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_file_structure():
    """Test if required files exist"""
    print("\nTesting file structure...")
    
    required_files = [
        "models/plant_disease_recog_model_pwp.keras",
        "plant_disease.json",
        "templates/home.html"
    ]
    
    all_exist = True
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"[OK] {file_path} exists")
        else:
            print(f"[MISSING] {file_path} missing")
            all_exist = False
    
    # Check upload directory
    upload_dir = "uploadimages"
    if os.path.exists(upload_dir):
        print(f"[OK] {upload_dir} directory exists")
    else:
        print(f"[WARNING] {upload_dir} directory missing (will be created automatically)")
    
    return all_exist

if __name__ == "__main__":
    print("Plant Disease Detection Test Suite")
    print("=" * 50)
    
    # Run tests
    file_test = test_file_structure()
    model_test = test_model_loading()
    info_test = test_disease_info_functions()
    
    print("\n" + "=" * 50)
    print("Test Results:")
    print(f"   File Structure: {'PASS' if file_test else 'FAIL'}")
    print(f"   Model Loading:  {'PASS' if model_test else 'FAIL'}")
    print(f"   Disease Info:   {'PASS' if info_test else 'FAIL'}")
    
    if all([file_test, model_test, info_test]):
        print("\nAll tests passed! Disease detection should work correctly.")
    else:
        print("\nSome tests failed. Please check the errors above.")