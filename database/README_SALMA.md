# Module Réservations (Salma)

Réservation **multichambre** : une RESERVATION concerne plusieurs chambres via l'association
CONCERNER (`ReservationChambre`), chacune avec ses dates, ses occupants et son tarif.

## Mise en place
```bash
cd backend
python manage.py migrate        # reservations 0001 (tables) + 0002 (triggers)
python manage.py test apps.reservations --settings=config.settings_test
```
Les triggers MySQL sont aussi dans `database/scripts/triggers_reservations.sql` (installation manuelle).
Prérequis : migration `sejours` de Hamza alignée sur son modèle (colonnes `id_reservation`, `id_chambre`).

## API (`/api/docs/`)
| Méthode | URL | Rôle |
|---|---|---|
| GET/POST | `/api/reservations/` | liste (`q`, `statut_reservation`, `client`, `chambre`, `date_from`, `date_to`) / création multichambre |
| GET/PATCH/DELETE | `/api/reservations/{id}/` | détail / modification des chambres / suppression contrôlée |
| POST | `/api/reservations/{id}/confirmer\|annuler\|terminer/` | changement de statut |
| GET | `/api/reservations/disponibilites/?date_debut=&date_fin=` | chambres libres/occupées + raison |

## Vérifications (API : `services.py`, base : triggers)
- départ > arrivée, au moins 1 occupant, arrivée pas dans le passé, au moins une chambre, pas de doublon de chambre ;
- capacité de la catégorie, chambre non hors service, pas de maintenance bloquante, pas de séjour en cours ;
- aucun chevauchement avec une autre réservation active (intervalle [arrivée, départ[) ;
- employé actif ; transitions de statut : EN_ATTENTE → CONFIRMEE/ANNULEE, CONFIRMEE → ANNULEE/TERMINEE.

## Triggers (`apps/reservations/triggers.py`)
| Trigger | Table | Rôle |
|---|---|---|
| `trg_resch_bi` / `trg_resch_bu` | CONCERNER | dates, occupants, capacité, hors service, chevauchement, réservation annulée/terminée |
| `trg_resch_ai` / `_au` / `_ad` | CONCERNER | recalcul auto de `nb_personnes_total` et `montant_estime` |
| `trg_res_bu` | RESERVATION | transitions de statut valides, confirmation impossible sans chambre |
| `trg_res_bd` | RESERVATION | suppression interdite si confirmée ou terminée |

## Frontend
`pages/ReservationsPage.jsx`, `components/reservations/*`, `utils/reservations.js`, `reservationsApi` dans `api/index.js`.
