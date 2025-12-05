"""Shim to expose Functional class at keras.src.models.functional

This module imports the real Functional class from the installed keras
package (which is available as `keras.models.functional`) and re-exports it
so models saved with the internal path `keras.src.models.functional` can
be deserialized.
"""
from importlib import import_module

# Import the real implementation and re-export the name expected by the
# serialized model files.
_real = import_module('keras.models.functional')
Functional = getattr(_real, 'Functional')

__all__ = ['Functional']
