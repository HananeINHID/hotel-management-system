# STUB TEMPORAIRE : Modèle Sejour (Hmza)
> ⚠️ **À SUPPRIMER À L'INTÉGRATION FINALE**

Ce package contient une version minimale du modèle `Sejour` requise pour développer et tester le module de Karima (**Paiements**, **Services**, **Consommations**) de façon autonome sans bloquer sur l'avancement de Hmza.

---

## 3 étapes pour basculer vers le vrai modèle de Hmza :

1. **Retirer l'application stub des paramètres Django** :
   Dans `backend/config/settings.py`, supprimer la ligne `'apps.stubs',` de la liste `INSTALLED_APPS`.

2. **Remplacer l'import dans `backend/apps/sejours/models.py`** :
   Ouvrir `backend/apps/sejours/models.py`, retirer l'import de `apps.stubs.models`, et coller la définition finale du modèle `Sejour` de Hmza.

3. **Supprimer le dossier stub** :
   Supprimer définitivement le dossier `backend/apps/stubs/`.

Toutes les requêtes d'accès aux données séjour du module Karima sont isolées dans `selectors.py` (ex: `apps/paiements/selectors.py`), ce qui garantit qu'aucune modification des contrôleurs ou modèles de Karima ne sera nécessaire lors du basculement !
