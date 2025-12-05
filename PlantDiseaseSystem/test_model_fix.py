import sys
import os
os.chdir('C:\\copy\\PlantDiseaseSystem')
sys.path.insert(0, 'C:\\copy\\PlantDiseaseSystem')

from app import model

print('='*60)
print('MODEL LOADING TEST')
print('='*60)
print('Model loaded:', model is not None)
if model:
    print('SUCCESS! Model is loaded!')
    print('Input shape:', model.input_shape)
    print('Output shape:', model.output_shape)
else:
    print('Model failed to load - will use AI fallback')
print('='*60)

