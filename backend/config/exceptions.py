from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Gestionnaire global d'exceptions pour garantir un format d'erreur JSON uniforme.
    Format retourné :
    {
        "status_code": 400,
        "error": "ValidationError",
        "detail": "Description compréhensible du problème",
        "errors": { ... }  # détails éventuels par champ
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            'status_code': response.status_code,
            'error': exc.__class__.__name__,
            'detail': 'Une erreur est survenue lors du traitement de la requête.',
            'errors': None,
        }

        if isinstance(response.data, dict):
            if 'detail' in response.data and len(response.data) == 1:
                custom_data['detail'] = str(response.data['detail'])
            else:
                custom_data['errors'] = response.data
                first_key = next(iter(response.data))
                first_val = response.data[first_key]
                if isinstance(first_val, list) and first_val:
                    custom_data['detail'] = f"{first_key}: {first_val[0]}"
                else:
                    custom_data['detail'] = f"{first_key}: {first_val}"
        elif isinstance(response.data, list):
            custom_data['errors'] = response.data
            if response.data:
                custom_data['detail'] = str(response.data[0])

        response.data = custom_data

    return response
