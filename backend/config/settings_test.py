"""
Settings de test : utilise SQLite en mémoire pour ne pas dépendre de MySQL.
Usage : python manage.py test --settings=config.settings_test
"""
from .settings import *  # noqa: F401, F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Le test runner de Django/DRF utilise 'testserver' comme host
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'testserver']
