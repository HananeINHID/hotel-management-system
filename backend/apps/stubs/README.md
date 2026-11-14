# Compatibilité temporaire du modèle Sejour

Le modèle définitif se trouve dans `apps.sejours.models`. Ce package exporte
encore `Sejour` comme alias afin de ne pas casser les tests qui utilisent
l'ancien chemin d'import `apps.stubs.models`. Il n'est plus nécessaire
d'enregistrer `apps.stubs` dans `INSTALLED_APPS`.
