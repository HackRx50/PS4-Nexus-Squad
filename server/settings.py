import os

CORS_ALLOWED_ORIGINS = [
    "*",
]

BASE_DIR = os.getcwd()

AGENT_NOT_ALLOWED_NAME = [
    'backend', 'dashboard', 'user', '-invalid', 'console', 'register', 'sysadmin', '123', 'test_', 'system', 'superuser', 'api', 'root', 'login', 'admin-panel', 'auth', 'root-', 'admin', 'user-portal', 'client', 'support', 'help', 'dev', 'avnica'
]


PINECONE_INDEX_NAME="nexaflow-test-index"