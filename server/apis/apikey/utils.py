import os
import base64

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding

def encrypt_message(message: str) -> str:
    
    hex_key = os.getenv("SECRET_KEY")
    if not hex_key:
        raise ValueError("Secret key not found in environment")
    key = bytes.fromhex(hex_key)

    iv = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()

    padder = padding.PKCS7(128).padder()
    padded_message = padder.update(message.encode()) + padder.finalize()

    encrypted_message = encryptor.update(padded_message) + encryptor.finalize()

    return base64.b64encode(iv + encrypted_message).decode('utf-8')