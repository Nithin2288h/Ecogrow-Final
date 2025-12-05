import sys
import os
os.chdir('C:\\copy\\PlantDiseaseSystem')
sys.path.insert(0, 'C:\\copy\\PlantDiseaseSystem')

from app import model, plant_disease

print('='*50)
print('Model Status:')
print('  Model loaded:', model is not None)
print('  Disease data loaded:', plant_disease is not None if plant_disease else False)
print('  Disease classes:', len(plant_disease) if plant_disease else 0)
if model:
    print('  Model input shape:', model.input_shape)
    print('  Model output shape:', model.output_shape)
print('='*50)
print('')

if model:
    print('SUCCESS! Model is loaded and ready!')
    print('Opening browser...')
    import subprocess
    subprocess.Popen(['start', 'http://127.0.0.1:5000/plant-disease'], shell=True)
else:
    print('ERROR: Model failed to load. Check logs above.')

