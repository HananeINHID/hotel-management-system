"""
Module Clients + Avis (Safae) - Accès à la base MySQL via Python

Ce programme :
  1. établit la connexion à MySQL (base hotel_bdr) ;
  2. exécute plusieurs requêtes sur les clients et les avis ;
  3. affiche les résultats sous forme de tableaux ;
  4. montre le trigger en action : un avis invalide est refusé par la base.

Installation (une seule fois) :
    pip install mysql-connector-python

Lancement :
    python 06_acces_python_clients_avis.py
    python 06_acces_python_clients_avis.py --user root --password monmotdepasse --host 127.0.0.1
"""
import argparse
import getpass

import mysql.connector
from mysql.connector import Error

REQUETES = [
    (
        "Clients marocains ayant un email (sélection + filtrage)",
        """
        SELECT nom, prenom, telephone, email
        FROM CLIENT
        WHERE nationalite = %s AND email IS NOT NULL
        ORDER BY nom, prenom
        """,
        ("Marocaine",),
    ),
    (
        "Derniers avis avec client et chambre (jointure)",
        """
        SELECT CONCAT(c.prenom, ' ', c.nom) AS client,
               ch.numero_chambre            AS chambre,
               a.note,
               a.date_avis,
               a.commentaire
        FROM AVIS a
        JOIN CLIENT   c  ON c.id_client   = a.id_client
        JOIN SEJOUR   s  ON s.id_sejour   = a.id_sejour
        JOIN CHAMBRE ch ON ch.id_chambre = s.id_chambre
        ORDER BY a.date_avis DESC
        LIMIT 5
        """,
        None,
    ),
    (
        "Note moyenne par nationalité (GROUP BY)",
        """
        SELECT c.nationalite,
               COUNT(a.id_avis)      AS nb_avis,
               ROUND(AVG(a.note), 2) AS note_moyenne
        FROM CLIENT c
        JOIN AVIS a ON a.id_client = c.id_client
        GROUP BY c.nationalite
        ORDER BY note_moyenne DESC
        """,
        None,
    ),
    (
        "Clients sans aucun avis et leur nombre de réservations (sous-requête)",
        """
        SELECT c.nom, c.prenom,
               (SELECT COUNT(*) FROM RESERVATION r WHERE r.id_client = c.id_client) AS nb_reservations
        FROM CLIENT c
        WHERE c.id_client NOT IN (SELECT a.id_client FROM AVIS a)
        ORDER BY nb_reservations DESC, c.nom
        """,
        None,
    ),
    (
        "Répartition des notes en pourcentage",
        """
        SELECT note,
               COUNT(*) AS nb_avis,
               ROUND(100 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pourcentage
        FROM AVIS
        GROUP BY note
        ORDER BY note DESC
        """,
        None,
    ),
]


def afficher_tableau(colonnes, lignes):
    """Affiche un résultat de requête sous forme de tableau texte."""
    if not lignes:
        print("  (aucun résultat)")
        return
    textes = [["" if v is None else str(v) for v in ligne] for ligne in lignes]
    largeurs = [
        min(45, max(len(col), *(len(t[i]) for t in textes)))
        for i, col in enumerate(colonnes)
    ]

    def ligne_txt(valeurs):
        return " | ".join(v[:45].ljust(largeurs[i]) for i, v in enumerate(valeurs))

    print("  " + ligne_txt(list(colonnes)))
    print("  " + "-+-".join("-" * w for w in largeurs))
    for t in textes:
        print("  " + ligne_txt(t))
    print(f"  ({len(lignes)} ligne(s))")


def executer(cursor, titre, sql, params=None):
    print(f"\n=== {titre} ===")
    cursor.execute(sql, params or ())
    afficher_tableau(cursor.column_names, cursor.fetchall())


def demo_trigger(connexion):
    """Tente d'insérer un avis sur un séjour EN_COURS : le trigger doit le refuser."""
    print("\n=== Démonstration du trigger trg_avis_before_insert ===")
    cursor = connexion.cursor()
    cursor.execute(
        """
        SELECT s.id_sejour, r.id_client
        FROM SEJOUR s
        JOIN RESERVATION r ON r.id_reservation = s.id_reservation
        WHERE s.statut_sejour = 'EN_COURS'
        LIMIT 1
        """
    )
    ligne = cursor.fetchone()
    if ligne is None:
        print("  Aucun séjour en cours dans la base : démonstration impossible.")
        cursor.close()
        return
    id_sejour, id_client = ligne
    print(f"  Tentative : avis 5/5 sur le séjour {id_sejour}, qui est EN COURS...")
    try:
        cursor.execute(
            "INSERT INTO AVIS (date_avis, note, commentaire, id_client, id_sejour) "
            "VALUES (CURDATE(), 5, 'test trigger', %s, %s)",
            (id_client, id_sejour),
        )
        connexion.rollback()
        print("  ATTENTION : l'avis a été accepté. Le trigger est-il installé ? (03_trigger_avis.sql)")
    except Error as erreur:
        connexion.rollback()
        print(f"  Refusé par la base, comme prévu : {erreur.msg}")
    finally:
        cursor.close()


def main():
    parser = argparse.ArgumentParser(description="Accès Python à la base hotel_bdr")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=3306)
    parser.add_argument("--user", default="root")
    parser.add_argument("--password", default=None, help="sinon demandé au clavier")
    parser.add_argument("--database", default="hotel_bdr")
    args = parser.parse_args()
    mot_de_passe = args.password if args.password is not None else getpass.getpass("Mot de passe MySQL : ")

    # 1. Connexion
    try:
        connexion = mysql.connector.connect(
            host=args.host,
            port=args.port,
            user=args.user,
            password=mot_de_passe,
            database=args.database,
            charset="utf8mb4",
        )
    except Error as erreur:
        print(f"Connexion impossible : {erreur}")
        return

    print(f"Connecté à MySQL {getattr(connexion, "server_info", None) or connexion.get_server_info()} - base '{args.database}'")

    # 2 et 3. Requêtes + affichage
    cursor = connexion.cursor()
    try:
        for titre, sql, params in REQUETES:
            executer(cursor, titre, sql, params)
    finally:
        cursor.close()

    # 4. Trigger
    demo_trigger(connexion)

    connexion.close()
    print("\nConnexion fermée.")


if __name__ == "__main__":
    main()
