import tensorflow as tf
print("TensorFlow version:", tf.__version__)
print("Loading model...")
model = tf.keras.models.load_model("models/plant_disease_recog_model_pwp.keras", compile=False)
print("Model loaded successfully!")
print("Model summary:")
model.summary()