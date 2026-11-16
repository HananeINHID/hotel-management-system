-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: hotel_management
-- ------------------------------------------------------
-- Server version	26.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add categorie chambre',7,'add_categoriechambre'),(26,'Can change categorie chambre',7,'change_categoriechambre'),(27,'Can delete categorie chambre',7,'delete_categoriechambre'),(28,'Can view categorie chambre',7,'view_categoriechambre'),(29,'Can add chambre',8,'add_chambre'),(30,'Can change chambre',8,'change_chambre'),(31,'Can delete chambre',8,'delete_chambre'),(32,'Can view chambre',8,'view_chambre'),(33,'Can add Séjour (Stub temporaire)',9,'add_sejour'),(34,'Can change Séjour (Stub temporaire)',9,'change_sejour'),(35,'Can delete Séjour (Stub temporaire)',9,'delete_sejour'),(36,'Can view Séjour (Stub temporaire)',9,'view_sejour'),(37,'Can add Service',10,'add_service'),(38,'Can change Service',10,'change_service'),(39,'Can delete Service',10,'delete_service'),(40,'Can view Service',10,'view_service'),(41,'Can add Consommation de service',11,'add_consommationservice'),(42,'Can change Consommation de service',11,'change_consommationservice'),(43,'Can delete Consommation de service',11,'delete_consommationservice'),(44,'Can view Consommation de service',11,'view_consommationservice'),(45,'Can add Paiement',12,'add_paiement'),(46,'Can change Paiement',12,'change_paiement'),(47,'Can delete Paiement',12,'delete_paiement'),(48,'Can view Paiement',12,'view_paiement'),(49,'Can add Employé',13,'add_employe'),(50,'Can change Employé',13,'change_employe'),(51,'Can delete Employé',13,'delete_employe'),(52,'Can view Employé',13,'view_employe'),(53,'Can add maintenance',14,'add_maintenance'),(54,'Can change maintenance',14,'change_maintenance'),(55,'Can delete maintenance',14,'delete_maintenance'),(56,'Can view maintenance',14,'view_maintenance'),(57,'Can add Client',15,'add_client'),(58,'Can change Client',15,'change_client'),(59,'Can delete Client',15,'delete_client'),(60,'Can view Client',15,'view_client'),(61,'Can add Réservation',16,'add_reservation'),(62,'Can change Réservation',16,'change_reservation'),(63,'Can delete Réservation',16,'delete_reservation'),(64,'Can view Réservation',16,'view_reservation'),(65,'Can add Chambre réservée',17,'add_reservationchambre'),(66,'Can change Chambre réservée',17,'change_reservationchambre'),(67,'Can delete Chambre réservée',17,'delete_reservationchambre'),(68,'Can view Chambre réservée',17,'view_reservationchambre'),(69,'Can add avis',18,'add_avis'),(70,'Can change avis',18,'change_avis'),(71,'Can delete avis',18,'delete_avis'),(72,'Can view avis',18,'view_avis');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avis_avis`
--

DROP TABLE IF EXISTS `avis_avis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avis_avis` (
  `id_avis` int NOT NULL AUTO_INCREMENT,
  `date_avis` date NOT NULL,
  `note` smallint unsigned NOT NULL,
  `commentaire` longtext NOT NULL,
  `id_client` int NOT NULL,
  `id_sejour` int NOT NULL,
  PRIMARY KEY (`id_avis`),
  UNIQUE KEY `id_sejour` (`id_sejour`),
  KEY `avis_avis_id_client_f77a6933_fk_clients_client_id_client` (`id_client`),
  KEY `idx_avis_note_date` (`note`,`date_avis`),
  CONSTRAINT `avis_avis_id_client_f77a6933_fk_clients_client_id_client` FOREIGN KEY (`id_client`) REFERENCES `clients_client` (`id_client`),
  CONSTRAINT `avis_avis_id_sejour_a3f9dce2_fk_sejours_sejour_id_sejour` FOREIGN KEY (`id_sejour`) REFERENCES `sejours_sejour` (`id_sejour`),
  CONSTRAINT `avis_avis_chk_1` CHECK ((`note` >= 0)),
  CONSTRAINT `chk_avis_note_1_5` CHECK (((`note` >= 1) and (`note` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avis_avis`
--

LOCK TABLES `avis_avis` WRITE;
/*!40000 ALTER TABLE `avis_avis` DISABLE KEYS */;
INSERT INTO `avis_avis` VALUES (21,'2026-09-05',5,'Très bon accueil et chambre calme.',141,47),(22,'2026-09-11',4,'Séjour agréable, personnel attentif.',142,48),(23,'2026-09-11',5,'Petit-déjeuner varié et service rapide.',142,49),(24,'2026-09-17',5,'Chambre propre et établissement bien situé.',143,50),(25,'2026-09-20',4,'Bonne expérience avec un excellent rapport qualité-prix.',144,51),(26,'2026-09-26',5,'Nous avons apprécié le cadre et le confort.',145,52),(27,'2026-10-02',4,'Équipe professionnelle et sympathique.',146,53),(28,'2026-10-02',5,'Service efficace, nous reviendrons.',146,54),(29,'2026-10-05',5,'Belle décoration et séjour reposant.',147,55),(30,'2026-10-11',4,'Accueil chaleureux et prestations satisfaisantes.',148,56);
/*!40000 ALTER TABLE `avis_avis` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_avis_before_insert` BEFORE INSERT ON `avis_avis` FOR EACH ROW BEGIN
        DECLARE v_statut VARCHAR(20);
        DECLARE v_client_resa INT;

        SELECT s.statut_sejour, r.id_client
          INTO v_statut, v_client_resa
          FROM sejours_sejour s
          JOIN reservations_reservation r ON r.id_reservation = s.id_reservation
         WHERE s.id_sejour = NEW.id_sejour;

        IF v_statut IS NULL OR v_statut <> 'TERMINE' THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Avis refuse : le sejour n''est pas termine.';
        END IF;

        IF v_client_resa <> NEW.id_client THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Avis refuse : le client n''est pas celui de la reservation du sejour.';
        END IF;
    END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_avis_before_update` BEFORE UPDATE ON `avis_avis` FOR EACH ROW BEGIN
        DECLARE v_statut VARCHAR(20);
        DECLARE v_client_resa INT;

        IF NEW.id_sejour <> OLD.id_sejour OR NEW.id_client <> OLD.id_client THEN
            SELECT s.statut_sejour, r.id_client
              INTO v_statut, v_client_resa
              FROM sejours_sejour s
              JOIN reservations_reservation r ON r.id_reservation = s.id_reservation
             WHERE s.id_sejour = NEW.id_sejour;

            IF v_statut IS NULL OR v_statut <> 'TERMINE' THEN
                SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Avis refuse : le sejour n''est pas termine.';
            END IF;

            IF v_client_resa <> NEW.id_client THEN
                SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Avis refuse : le client n''est pas celui de la reservation du sejour.';
            END IF;
        END IF;
    END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `chambres_categoriechambre`
--

DROP TABLE IF EXISTS `chambres_categoriechambre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chambres_categoriechambre` (
  `id_categorie` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(100) NOT NULL,
  `capacite` int unsigned NOT NULL,
  `tarif_nuit` decimal(10,2) NOT NULL,
  `description` longtext NOT NULL,
  PRIMARY KEY (`id_categorie`),
  CONSTRAINT `chambres_categoriechambre_chk_1` CHECK ((`capacite` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chambres_categoriechambre`
--

LOCK TABLES `chambres_categoriechambre` WRITE;
/*!40000 ALTER TABLE `chambres_categoriechambre` DISABLE KEYS */;
INSERT INTO `chambres_categoriechambre` VALUES (1,'Chambre Standard',2,450.00,'Chambre confortable avec vue sur le jardin, lit double, salle de bain privative.'),(2,'Chambre Superieure',2,650.00,'Chambre spacieuse avec balcon prive, mobilier en bois de cedre et decoration traditionnelle.'),(3,'Suite Junior',3,950.00,'Suite avec salon separe, baignoire balnee et vue panoramique sur la medina.'),(4,'Suite Royale',4,1500.00,'Suite de luxe avec terrasse privee, jacuzzi et service de majordome.'),(5,'Suite Familiale',5,1200.00,'Vaste suite avec deux chambres communicantes, ideale pour les familles.'),(21,'Simple',1,350.00,'Chambre simple confortable avec Wi-Fi'),(22,'Double',2,550.00,'Chambre double avec salle de bain privative'),(23,'Twin',2,600.00,'Chambre avec deux lits simples');
/*!40000 ALTER TABLE `chambres_categoriechambre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chambres_chambre`
--

DROP TABLE IF EXISTS `chambres_chambre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chambres_chambre` (
  `id_chambre` int NOT NULL AUTO_INCREMENT,
  `numero_chambre` varchar(10) NOT NULL,
  `etage` int NOT NULL,
  `etat_physique` varchar(20) NOT NULL,
  `description` longtext NOT NULL,
  `categorie_id` int NOT NULL,
  PRIMARY KEY (`id_chambre`),
  UNIQUE KEY `numero_chambre` (`numero_chambre`),
  KEY `chambres_chambre_categorie_id_b2d5de65_fk_chambres_` (`categorie_id`),
  CONSTRAINT `chambres_chambre_categorie_id_b2d5de65_fk_chambres_` FOREIGN KEY (`categorie_id`) REFERENCES `chambres_categoriechambre` (`id_categorie`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chambres_chambre`
--

LOCK TABLES `chambres_chambre` WRITE;
/*!40000 ALTER TABLE `chambres_chambre` DISABLE KEYS */;
INSERT INTO `chambres_chambre` VALUES (1,'001',0,'disponible','Chambre 001 -- etage 0.',1),(2,'002',0,'disponible','Chambre 002 -- etage 0.',1),(3,'003',0,'en_maintenance','Chambre 003 -- etage 0.',1),(4,'004',0,'disponible','Chambre 004 -- etage 0.',1),(5,'005',0,'hors_service','Chambre 005 -- etage 0.',1),(6,'101',1,'disponible','Chambre 101 -- etage 1.',21),(7,'102',1,'disponible','Chambre 102 -- etage 1.',22),(8,'103',1,'disponible','Chambre 103 -- etage 1.',23),(9,'104',1,'disponible','Chambre 104 -- etage 1.',3),(10,'105',1,'disponible','Chambre 105 -- etage 1.',5),(11,'201',2,'disponible','Chambre 201 -- etage 2.',21),(12,'202',2,'disponible','Chambre 202 -- etage 2.',22),(13,'203',2,'disponible','Chambre 203 -- etage 2.',23),(14,'204',2,'disponible','Chambre 204 -- etage 2.',3),(15,'205',2,'disponible','Chambre 205 -- etage 2.',5),(16,'301',3,'disponible','Chambre 301 -- etage 3.',21),(17,'302',3,'disponible','Chambre 302 -- etage 3.',22),(18,'303',3,'disponible','Chambre 303 -- etage 3.',23),(19,'304',3,'disponible','Chambre 304 -- etage 3.',3),(20,'305',3,'disponible','Chambre 305 -- etage 3.',5),(21,'401',4,'disponible','Chambre 401 -- etage 4.',21),(22,'402',4,'disponible','Chambre 402 -- etage 4.',22),(23,'403',4,'disponible','Chambre 403 -- etage 4.',23),(24,'404',4,'disponible','Chambre 404 -- etage 4.',3),(25,'405',4,'disponible','Chambre 405 -- etage 4.',5),(26,'501',5,'disponible','Chambre 501 -- etage 5.',21),(27,'502',5,'en_maintenance','Chambre 502 -- etage 5.',22),(28,'503',5,'en_maintenance','Chambre 503 -- etage 5.',23),(29,'504',5,'en_maintenance','Chambre 504 -- etage 5.',3),(30,'505',5,'hors_service','Chambre 505 -- etage 5.',5);
/*!40000 ALTER TABLE `chambres_chambre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients_client`
--

DROP TABLE IF EXISTS `clients_client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients_client` (
  `id_client` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `piece_identite` varchar(50) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `email` varchar(254) DEFAULT NULL,
  `nationalite` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_client`),
  UNIQUE KEY `piece_identite` (`piece_identite`),
  KEY `idx_client_nom_prenom` (`nom`,`prenom`)
) ENGINE=InnoDB AUTO_INCREMENT=166 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients_client`
--

LOCK TABLES `clients_client` WRITE;
/*!40000 ALTER TABLE `clients_client` DISABLE KEYS */;
INSERT INTO `clients_client` VALUES (1,'Tazi','Amina','CIN-A10001','+212661000001','amina.tazi@example.com','Marocaine'),(2,'Benjelloun','Karim','CIN-B20002','+212661000002','karim.benjelloun@example.com','Marocaine'),(3,'Alami','Omar','CIN-C30003','+212661000003','omar.alami@example.com','Marocaine'),(4,'Berrada','Mehdi','CIN-D40004','+212661000004','mehdi.berrada@example.com','Marocaine'),(5,'Chaoui','Fatima Zahra','CIN-E50005','+212661000005','fz.chaoui@example.com','Marocaine'),(6,'Kabbaj','Youssef','CIN-F60006','+212661000006','youssef.kabbaj@example.com','Marocaine'),(7,'Mansouri','Leila','CIN-G70007','+212661000007','leila.mansouri@example.com','Marocaine'),(8,'Bennani','Tariq','CIN-H80008','+212661000008','tariq.bennani@example.com','Marocaine'),(9,'Idrissi','Sarah','CIN-I90009','+212661000009','sarah.idrissi@example.com','Marocaine'),(10,'Chraibi','Nadia','CIN-J10010','+212661000010','nadia.chraibi@example.com','Marocaine'),(11,'Dubois','Thomas','PAS-FRA11011','+33612345678','thomas.dubois@example.fr','Étrangère'),(12,'Martin','Sophie','PAS-FRA12012','+33687654321','sophie.martin@example.fr','Étrangère'),(13,'Smith','John','PAS-GBR13013','+447911123456','john.smith@example.co.uk','Étrangère'),(14,'El Fassi','Mohamed','CIN-K14014','+212661000014','mohamed.elfassi@example.com','Marocaine'),(15,'Filali','Zineb','CIN-L15015','+212661000015','zineb.filali@example.com','Marocaine'),(141,'El Mansouri','Amine','DEMO-CIN-001','0000000001','client001@example.test','Marocaine'),(142,'Ait Lahcen','Salma','DEMO-CIN-002','0000000002','client002@example.test','Marocaine'),(143,'Benali','Youssef','DEMO-CIN-003','0000000003','client003@example.test','Marocaine'),(144,'Idrissi','Nadia','DEMO-CIN-004','0000000004','client004@example.test','Marocaine'),(145,'Berrada','Hamza','DEMO-CIN-005','0000000005','client005@example.test','Française'),(146,'El Fassi','Kawtar','DEMO-CIN-006','0000000006','client006@example.test','Marocaine'),(147,'Bouzidi','Imane','DEMO-CIN-007','0000000007','client007@example.test','Marocaine'),(148,'Amrani','Omar','DEMO-CIN-008','0000000008','client008@example.test','Marocaine'),(149,'Tazi','Sara','DEMO-CIN-009','0000000009','client009@example.test','Marocaine'),(150,'Haddad','Ayoub','DEMO-CIN-010','0000000010','client010@example.test','Française'),(151,'Chraibi','Lina','DEMO-CIN-011','0000000011','client011@example.test','Marocaine'),(152,'Ouali','Rachid','DEMO-CIN-012','0000000012','client012@example.test','Marocaine'),(153,'Alaoui','Meriem','DEMO-CIN-013','0000000013','client013@example.test','Marocaine'),(154,'Lahlou','Adil','DEMO-CIN-014','0000000014','client014@example.test','Marocaine'),(155,'Bennani','Noura','DEMO-CIN-015','0000000015','client015@example.test','Française'),(156,'Benkirane','Anas','DEMO-CIN-016','0000000016','client016@example.test','Marocaine'),(157,'El Khatib','Asmae','DEMO-CIN-017','0000000017','client017@example.test','Marocaine'),(158,'Ouazzani','Khalid','DEMO-CIN-018','0000000018','client018@example.test','Marocaine'),(159,'Rami','Hajar','DEMO-CIN-019','0000000019','client019@example.test','Marocaine'),(160,'Chafai','Zineb','DEMO-CIN-020','0000000020','client020@example.test','Française'),(161,'Saidi','Mehdi','DEMO-CIN-021','0000000021','client021@example.test','Marocaine'),(162,'Rahmani','Houda','DEMO-CIN-022','0000000022','client022@example.test','Marocaine'),(163,'Fahmi','Ismail','DEMO-CIN-023','0000000023','client023@example.test','Marocaine'),(164,'Othmani','Yasmina','DEMO-CIN-024','0000000024','client024@example.test','Marocaine'),(165,'Boussaid','Bilal','DEMO-CIN-025','0000000025','client025@example.test','Française');
/*!40000 ALTER TABLE `clients_client` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(4,'auth','user'),(18,'avis','avis'),(7,'chambres','categoriechambre'),(8,'chambres','chambre'),(15,'clients','client'),(5,'contenttypes','contenttype'),(13,'employes','employe'),(14,'maintenances','maintenance'),(12,'paiements','paiement'),(16,'reservations','reservation'),(17,'reservations','reservationchambre'),(9,'sejours','sejour'),(11,'services','consommationservice'),(10,'services','service'),(6,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2026-11-14 16:57:05.037176'),(2,'auth','0001_initial','2026-11-14 16:57:05.585985'),(3,'admin','0001_initial','2026-11-14 16:57:05.698390'),(4,'admin','0002_logentry_remove_auto_add','2026-11-14 16:57:05.704647'),(5,'admin','0003_logentry_add_action_flag_choices','2026-11-14 16:57:05.711507'),(6,'contenttypes','0002_remove_content_type_name','2026-11-14 16:57:05.821205'),(7,'auth','0002_alter_permission_name_max_length','2026-11-14 16:57:05.879450'),(8,'auth','0003_alter_user_email_max_length','2026-11-14 16:57:05.896389'),(9,'auth','0004_alter_user_username_opts','2026-11-14 16:57:05.901153'),(10,'auth','0005_alter_user_last_login_null','2026-11-14 16:57:05.963352'),(11,'auth','0006_require_contenttypes_0002','2026-11-14 16:57:05.964858'),(12,'auth','0007_alter_validators_add_error_messages','2026-11-14 16:57:05.970176'),(13,'auth','0008_alter_user_username_max_length','2026-11-14 16:57:06.024653'),(14,'auth','0009_alter_user_last_name_max_length','2026-11-14 16:57:06.081315'),(15,'auth','0010_alter_group_name_max_length','2026-11-14 16:57:06.094498'),(16,'auth','0011_update_proxy_permissions','2026-11-14 16:57:06.108400'),(17,'auth','0012_alter_user_first_name_max_length','2026-11-14 16:57:06.163727'),(18,'chambres','0001_initial','2026-11-14 16:57:06.267755'),(19,'employes','0001_initial','2026-11-14 16:57:06.295963'),(20,'maintenances','0001_initial','2026-11-14 16:57:06.419178'),(21,'sejours','0001_initial','2026-11-14 16:57:06.433157'),(22,'paiements','0001_initial','2026-11-14 16:57:06.558964'),(23,'services','0001_initial','2026-11-14 16:57:06.683546'),(24,'sessions','0001_initial','2026-11-14 16:57:06.710392'),(25,'clients','0001_initial','2026-11-16 12:16:47.113110'),(26,'avis','0001_initial','2026-11-16 12:16:47.409123'),(27,'clients','0002_alter_client_options_alter_client_email_and_more','2026-11-16 12:16:47.578559'),(28,'reservations','0001_initial','2026-11-16 12:16:47.903549'),(29,'reservations','0002_triggers','2026-11-16 12:16:47.964570'),(30,'sejours','0002_sejour_lifecycle','2026-11-16 12:16:48.016620'),(31,'sejours','0003_alter_sejour_options_and_more','2026-11-16 13:34:58.115287'),(32,'sejours','0004_reconcile_sejours_data','2026-11-16 13:34:58.348328'),(33,'sejours','0005_finalize_sejour_constraints','2026-11-16 13:34:59.206684');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employes_employe`
--

DROP TABLE IF EXISTS `employes_employe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employes_employe` (
  `id_employe` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `poste` varchar(30) NOT NULL,
  `telephone` varchar(25) NOT NULL,
  `email` varchar(254) NOT NULL,
  `date_embauche` date NOT NULL,
  `statut` varchar(20) NOT NULL,
  PRIMARY KEY (`id_employe`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employes_employe`
--

LOCK TABLES `employes_employe` WRITE;
/*!40000 ALTER TABLE `employes_employe` DISABLE KEYS */;
INSERT INTO `employes_employe` VALUES (1,'Benali','Youssef','MANAGER','0661234567','y.benali@riadatlas.ma','2018-03-15','ACTIF'),(2,'Tahiri','Fatima','RECEPTIONNISTE','0662345678','f.tahiri@riadatlas.ma','2020-06-01','ACTIF'),(3,'Ouali','Rachid','MAINTENANCE','0663456789','r.ouali@riadatlas.ma','2019-09-10','ACTIF'),(4,'Ziani','Nadia','FEMME_DE_CHAMBRE','0664567890','n.ziani@riadatlas.ma','2021-01-20','ACTIF'),(5,'Cherkaoui','Omar','RESTAURATION','0665678901','o.cherkaoui@riadatlas.ma','2020-11-05','ACTIF'),(6,'Fassi','Leila','COMPTABLE','0666789012','l.fassi@riadatlas.ma','2017-07-22','ACTIF'),(7,'Idrissi','Hamid','MAINTENANCE','0667890123','h.idrissi@riadatlas.ma','2022-04-01','EN_CONGE'),(8,'Bennani','Salma','RECEPTIONNISTE','0668901234','s.bennani@riadatlas.ma','2023-02-14','ACTIF'),(49,'El Idrissi','Fatima','RECEPTIONNISTE','0000010001','employe01@example.test','2024-02-10','ACTIF'),(50,'El Amrani','Yassine','RECEPTIONNISTE','0000010002','employe02@example.test','2025-03-10','ACTIF'),(51,'Bennani','Kenza','MANAGER','0000010003','employe03@example.test','2023-04-10','ACTIF'),(52,'Othmani','Said','MAINTENANCE','0000010004','employe04@example.test','2024-05-10','ACTIF'),(53,'Tazi','Rania','COMPTABLE','0000010005','employe05@example.test','2025-06-10','ACTIF'),(54,'Alaoui','Mourad','MAINTENANCE','0000010006','employe06@example.test','2023-07-10','ACTIF'),(55,'Ait Omar','Samira','RECEPTIONNISTE','0000010007','employe07@example.test','2024-08-10','ACTIF'),(56,'Lahlou','Zakaria','MANAGER','0000010008','employe08@example.test','2025-09-10','ACTIF');
/*!40000 ALTER TABLE `employes_employe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenances_maintenance`
--

DROP TABLE IF EXISTS `maintenances_maintenance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenances_maintenance` (
  `id_maintenance` int NOT NULL AUTO_INCREMENT,
  `debut` datetime(6) NOT NULL,
  `fin` datetime(6) DEFAULT NULL,
  `type` varchar(20) NOT NULL,
  `description` longtext NOT NULL,
  `cout` decimal(10,2) NOT NULL,
  `statut` varchar(20) NOT NULL,
  `bloquante` tinyint(1) NOT NULL,
  `chambre_id` int NOT NULL,
  `employe_id` int NOT NULL,
  PRIMARY KEY (`id_maintenance`),
  KEY `maintenances_mainten_chambre_id_9581fd1f_fk_chambres_` (`chambre_id`),
  KEY `maintenances_mainten_employe_id_446f5541_fk_employes_` (`employe_id`),
  CONSTRAINT `maintenances_mainten_chambre_id_9581fd1f_fk_chambres_` FOREIGN KEY (`chambre_id`) REFERENCES `chambres_chambre` (`id_chambre`),
  CONSTRAINT `maintenances_mainten_employe_id_446f5541_fk_employes_` FOREIGN KEY (`employe_id`) REFERENCES `employes_employe` (`id_employe`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenances_maintenance`
--

LOCK TABLES `maintenances_maintenance` WRITE;
/*!40000 ALTER TABLE `maintenances_maintenance` DISABLE KEYS */;
INSERT INTO `maintenances_maintenance` VALUES (1,'2026-10-16 19:20:38.036609','2026-10-18 19:20:38.036609','corrective','Fuite d\'eau sous le lavabo, remplacement du joint et du siphon.',320.00,'terminee',1,3,3),(2,'2026-11-20 19:20:38.036609','2026-11-22 19:20:38.036609','preventive','Controle annuel de la plomberie et des installations sanitaires.',0.00,'planifiee',0,3,7),(3,'2026-11-12 19:20:38.036609',NULL,'corrective','Climatiseur en panne - remplacement du compresseur.',1800.00,'en_cours',1,10,3),(4,'2026-09-16 19:20:38.036609','2026-09-21 19:20:38.036609','corrective','Moisissures dans la salle de bain, traitement et peinture.',2200.00,'terminee',1,5,7),(5,'2026-10-26 19:20:38.036609','2026-10-28 19:20:38.036609','preventive','Remplacement complet de la robinetterie vieillissante.',850.00,'terminee',0,5,3),(6,'2026-11-10 19:20:38.036609',NULL,'corrective','Fissure au plafond apres infiltration d\'eau de pluie.',3500.00,'en_cours',1,20,7),(7,'2026-10-01 19:20:38.036609','2026-10-02 19:20:38.036609','preventive','Revision annuelle de l\'installation electrique.',600.00,'terminee',0,11,3),(8,'2026-10-31 19:20:38.036609','2026-11-01 19:20:38.036609','preventive','Desinfection complete de la chambre - traitement preventif.',450.00,'terminee',0,16,7),(9,'2026-11-05 19:20:38.036609','2026-11-06 19:20:38.036609','corrective','Serrure electronique defaillante - remplacement du systeme.',980.00,'terminee',1,21,3),(10,'2026-11-25 19:20:38.036609','2026-11-26 19:20:38.036609','preventive','Remplacement du matelas et entretien du sommier.',1200.00,'planifiee',0,7,7),(11,'2026-11-17 19:20:38.036609','2026-11-20 19:20:38.036609','corrective','Jacuzzi hors service - reparation de la pompe.',4200.00,'planifiee',1,26,3),(12,'2026-11-07 19:20:38.036609','2026-11-08 19:20:38.036609','preventive','Controle et reequilibrage des volets roulants.',380.00,'terminee',0,28,7),(37,'2026-08-10 08:00:00.000000','2026-08-11 17:00:00.000000','preventive','Contrôle de la climatisation',90.00,'terminee',1,27,52),(38,'2026-09-06 08:00:00.000000','2026-09-07 17:00:00.000000','corrective','Révision des installations électriques',145.00,'terminee',1,28,54),(39,'2026-10-05 08:00:00.000000','2026-10-06 17:00:00.000000','preventive','Remplacement de serrure',200.00,'terminee',1,29,52),(40,'2026-11-14 08:00:00.000000','2026-11-19 17:00:00.000000','corrective','Réparation fuite plomberie',255.00,'en_cours',1,27,54),(41,'2026-11-15 08:00:00.000000','2026-11-18 17:00:00.000000','preventive','Vérification du chauffe-eau',310.00,'en_cours',1,28,52),(42,'2026-11-12 08:00:00.000000','2026-11-21 17:00:00.000000','corrective','Entretien du système de ventilation',365.00,'en_cours',1,29,54),(43,'2026-12-02 08:00:00.000000','2026-12-04 17:00:00.000000','preventive','Contrôle des détecteurs de fumée',420.00,'planifiee',1,30,52),(44,'2026-12-09 08:00:00.000000','2026-12-11 17:00:00.000000','corrective','Réparation de la robinetterie',475.00,'planifiee',1,30,54),(45,'2027-01-06 08:00:00.000000','2027-01-08 17:00:00.000000','preventive','Révision des équipements',530.00,'planifiee',1,27,52),(46,'2026-12-16 08:00:00.000000','2026-12-17 17:00:00.000000','corrective','Peinture et entretien léger',585.00,'planifiee',0,28,54),(47,'2026-11-08 08:00:00.000000','2026-11-09 17:00:00.000000','preventive','Diagnostic éclairage',640.00,'annulee',0,29,52),(48,'2026-07-22 08:00:00.000000','2026-07-23 17:00:00.000000','corrective','Inspection préventive',695.00,'terminee',0,30,54);
/*!40000 ALTER TABLE `maintenances_maintenance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paiements_paiement`
--

DROP TABLE IF EXISTS `paiements_paiement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paiements_paiement` (
  `id_paiement` int NOT NULL AUTO_INCREMENT,
  `date_paiement` datetime(6) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `mode_paiement` varchar(30) NOT NULL,
  `statut` varchar(20) NOT NULL,
  `reference_paiement` varchar(50) NOT NULL,
  `id_employe` int NOT NULL,
  `id_sejour` int NOT NULL,
  PRIMARY KEY (`id_paiement`),
  UNIQUE KEY `reference_paiement` (`reference_paiement`),
  KEY `paiements_paiement_id_employe_9b9bb85c_fk_employes_` (`id_employe`),
  KEY `paiements_paiement_id_sejour_f2970ac3_fk_sejours_s` (`id_sejour`),
  CONSTRAINT `paiements_paiement_id_employe_9b9bb85c_fk_employes_` FOREIGN KEY (`id_employe`) REFERENCES `employes_employe` (`id_employe`),
  CONSTRAINT `paiements_paiement_id_sejour_f2970ac3_fk_sejours_s` FOREIGN KEY (`id_sejour`) REFERENCES `sejours_sejour` (`id_sejour`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paiements_paiement`
--

LOCK TABLES `paiements_paiement` WRITE;
/*!40000 ALTER TABLE `paiements_paiement` DISABLE KEYS */;
INSERT INTO `paiements_paiement` VALUES (1,'2026-09-18 17:20:38.064606',1350.00,'CARTE_BANCAIRE','VALIDE','PAY-20260918-BA51',1,1),(2,'2026-09-23 04:20:38.064606',3250.00,'ESPECES','VALIDE','PAY-20260923-0317',2,2),(3,'2026-09-28 05:20:38.064606',900.00,'CARTE_BANCAIRE','VALIDE','PAY-20260928-B919',6,3),(4,'2026-10-03 16:20:38.064606',10500.00,'VIREMENT','VALIDE','PAY-20261003-ED67',8,4),(5,'2026-10-07 23:20:38.064606',2600.00,'CARTE_BANCAIRE','VALIDE','PAY-20261007-648C',1,5),(6,'2026-10-12 17:20:38.064606',1950.00,'ESPECES','VALIDE','PAY-20261012-B02F',2,6),(7,'2026-10-19 13:20:38.064606',5700.00,'CARTE_BANCAIRE','VALIDE','PAY-20261019-4D6D',6,7),(8,'2026-10-23 06:20:38.064606',900.00,'CHEQUE','VALIDE','PAY-20261023-7145',8,8),(9,'2026-10-28 12:20:38.064606',6000.00,'CARTE_BANCAIRE','VALIDE','PAY-20261028-B35D',1,9),(10,'2026-11-01 02:20:38.064606',1350.00,'CARTE_BANCAIRE','VALIDE','PAY-20261101-6D61',2,10),(11,'2026-11-14 02:20:38.064606',650.00,'ESPECES','EN_ATTENTE','PAY-20261114-68E5',6,11),(12,'2026-11-16 07:20:38.064606',450.00,'CARTE_BANCAIRE','EN_ATTENTE','PAY-20261116-4F1A',8,12),(13,'2026-11-16 03:20:38.064606',1500.00,'VIREMENT','EN_ATTENTE','PAY-20261116-2474',1,13),(14,'2026-09-19 19:20:38.064606',450.00,'CARTE_BANCAIRE','VALIDE','PAY-20260919-FBE6',2,1),(15,'2026-10-02 08:20:38.064606',2000.00,'VIREMENT','VALIDE','PAY-20261002-AF16',6,4),(16,'2026-10-19 08:20:38.064606',950.00,'CARTE_BANCAIRE','VALIDE','PAY-20261019-E310',8,7),(17,'2026-10-28 21:20:38.064606',1000.00,'ESPECES','VALIDE','PAY-20261028-CB7A',1,9),(18,'2026-11-05 23:20:38.064606',900.00,'CARTE_BANCAIRE','REMBOURSE','PAY-20261105-6A7F',2,14),(19,'2026-11-11 17:20:38.064606',450.00,'CARTE_BANCAIRE','REMBOURSE','PAY-20261111-766E',6,15),(20,'2026-11-14 19:20:38.064606',325.00,'CHEQUE','REFUSE','PAY-20261114-0255',8,11),(61,'2026-09-01 17:00:00.000000',346.00,'CARTE_BANCAIRE','VALIDE','PAY-20260901-ABA6',49,47),(62,'2026-09-03 10:00:00.000000',519.00,'CARTE_BANCAIRE','VALIDE','PAY-20260903-3AE3',49,47),(63,'2026-09-06 17:00:00.000000',1010.00,'ESPECES','VALIDE','PAY-20260906-6A11',53,48),(64,'2026-09-09 10:00:00.000000',1515.00,'ESPECES','VALIDE','PAY-20260909-2204',53,48),(65,'2026-09-06 17:00:00.000000',1096.00,'VIREMENT','VALIDE','PAY-20260906-29EB',49,49),(66,'2026-09-09 10:00:00.000000',1644.00,'VIREMENT','VALIDE','PAY-20260909-42FE',49,49),(67,'2026-09-11 17:00:00.000000',2596.00,'CARTE_BANCAIRE','VALIDE','PAY-20260911-EDA3',53,50),(68,'2026-09-15 10:00:00.000000',3894.00,'CARTE_BANCAIRE','VALIDE','PAY-20260915-1DEE',53,50),(69,'2026-09-16 17:00:00.000000',688.00,'ESPECES','VALIDE','PAY-20260916-5945',49,51),(70,'2026-09-18 10:00:00.000000',1032.00,'ESPECES','VALIDE','PAY-20260918-E9BD',49,51),(71,'2026-09-21 17:00:00.000000',1240.00,'VIREMENT','VALIDE','PAY-20260921-FF01',53,52),(72,'2026-09-26 17:00:00.000000',2465.00,'CARTE_BANCAIRE','VALIDE','PAY-20260926-D94B',49,53),(73,'2026-09-26 17:00:00.000000',2280.00,'ESPECES','VALIDE','PAY-20260926-146A',53,54),(74,'2026-10-01 17:00:00.000000',2885.00,'VIREMENT','VALIDE','PAY-20261001-890E',49,55),(75,'2026-10-06 17:00:00.000000',3490.00,'CARTE_BANCAIRE','VALIDE','PAY-20261006-04F5',53,56),(76,'2026-10-11 17:00:00.000000',1850.00,'ESPECES','VALIDE','PAY-20261011-374A',49,57),(77,'2026-10-16 17:00:00.000000',1640.00,'VIREMENT','VALIDE','PAY-20261016-2D20',53,58),(78,'2026-10-16 17:00:00.000000',768.00,'CARTE_BANCAIRE','VALIDE','PAY-20261016-25C2',49,59),(79,'2026-10-21 17:00:00.000000',1104.00,'ESPECES','VALIDE','PAY-20261021-DE72',53,60),(80,'2026-10-26 17:00:00.000000',2319.00,'VIREMENT','VALIDE','PAY-20261026-8F6E',49,61);
/*!40000 ALTER TABLE `paiements_paiement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservations_reservation`
--

DROP TABLE IF EXISTS `reservations_reservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations_reservation` (
  `id_reservation` int NOT NULL AUTO_INCREMENT,
  `date_reservation` datetime(6) NOT NULL,
  `statut_reservation` varchar(20) NOT NULL,
  `nb_personnes_total` int unsigned NOT NULL,
  `montant_estime` decimal(10,2) NOT NULL,
  `id_client` int NOT NULL,
  `id_employe` int NOT NULL,
  PRIMARY KEY (`id_reservation`),
  KEY `reservations_reserva_id_client_5433d4e6_fk_clients_c` (`id_client`),
  KEY `reservations_reserva_id_employe_7ccf3dc6_fk_employes_` (`id_employe`),
  CONSTRAINT `reservations_reserva_id_client_5433d4e6_fk_clients_c` FOREIGN KEY (`id_client`) REFERENCES `clients_client` (`id_client`),
  CONSTRAINT `reservations_reserva_id_employe_7ccf3dc6_fk_employes_` FOREIGN KEY (`id_employe`) REFERENCES `employes_employe` (`id_employe`),
  CONSTRAINT `reservations_reservation_chk_1` CHECK ((`nb_personnes_total` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=179 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations_reservation`
--

LOCK TABLES `reservations_reservation` WRITE;
/*!40000 ALTER TABLE `reservations_reservation` DISABLE KEYS */;
INSERT INTO `reservations_reservation` VALUES (1,'2026-11-16 13:34:58.166182','TERMINEE',2,1350.00,1,1),(2,'2026-11-16 13:34:58.193209','TERMINEE',2,3250.00,2,1),(3,'2026-11-16 13:34:58.205188','TERMINEE',1,900.00,3,1),(4,'2026-11-16 13:34:58.216438','TERMINEE',3,10500.00,4,1),(5,'2026-11-16 13:34:58.231243','TERMINEE',2,2600.00,5,1),(6,'2026-11-16 13:34:58.245139','TERMINEE',2,1950.00,6,1),(7,'2026-11-16 13:34:58.260113','TERMINEE',2,5700.00,7,1),(8,'2026-11-16 13:34:58.279782','TERMINEE',1,900.00,8,1),(9,'2026-11-16 13:34:58.288120','TERMINEE',2,6000.00,9,1),(10,'2026-11-16 13:34:58.299540','TERMINEE',2,1350.00,10,1),(11,'2026-11-16 13:34:58.311551','CONFIRMEE',2,1950.00,11,1),(12,'2026-11-16 13:34:58.317415','CONFIRMEE',1,1350.00,12,1),(13,'2026-11-16 13:34:58.323963','CONFIRMEE',2,4500.00,13,1),(14,'2026-11-16 13:34:58.330711','ANNULEE',2,1350.00,14,1),(15,'2026-11-16 13:34:58.335369','ANNULEE',1,900.00,15,1),(149,'2026-11-16 16:32:11.328558','TERMINEE',1,700.00,141,49),(150,'2026-11-16 16:32:11.343681','TERMINEE',4,3450.00,142,50),(151,'2026-11-16 16:32:11.355856','TERMINEE',2,5600.00,143,51),(152,'2026-11-16 16:32:11.366339','TERMINEE',2,1100.00,144,49),(153,'2026-11-16 16:32:11.378241','TERMINEE',1,1050.00,145,50),(154,'2026-11-16 16:32:11.388307','TERMINEE',4,4600.00,146,51),(155,'2026-11-16 16:32:11.401576','TERMINEE',2,2800.00,147,49),(156,'2026-11-16 16:32:11.412163','TERMINEE',2,2850.00,148,50),(157,'2026-11-16 16:32:11.423665','TERMINEE',1,1400.00,149,51),(158,'2026-11-16 16:32:11.434861','TERMINEE',4,2300.00,150,49),(159,'2026-11-16 16:32:11.445371','TERMINEE',2,1650.00,151,50),(160,'2026-11-16 16:32:11.454677','TERMINEE',2,3800.00,152,51),(161,'2026-11-16 16:32:11.466825','CONFIRMEE',4,3500.00,153,49),(162,'2026-11-16 16:32:11.477067','CONFIRMEE',2,1800.00,154,50),(163,'2026-11-16 16:32:11.485356','CONFIRMEE',2,2200.00,155,51),(164,'2026-11-16 16:32:11.493120','CONFIRMEE',3,3100.00,156,49),(165,'2026-11-16 16:32:11.503819','CONFIRMEE',1,1050.00,157,50),(166,'2026-11-16 16:32:11.513724','CONFIRMEE',2,5600.00,158,51),(167,'2026-11-16 16:32:11.522440','CONFIRMEE',2,1800.00,159,49),(168,'2026-11-16 16:32:11.535048','CONFIRMEE',2,2850.00,160,50),(169,'2026-11-16 16:32:11.544338','CONFIRMEE',2,2400.00,161,51),(170,'2026-11-16 16:32:11.553869','EN_ATTENTE',3,4700.00,162,49),(171,'2026-11-16 16:32:11.567618','EN_ATTENTE',2,1650.00,163,50),(172,'2026-11-16 16:32:11.574128','EN_ATTENTE',1,1400.00,164,51),(173,'2026-11-16 16:32:11.581664','EN_ATTENTE',2,2300.00,165,49),(174,'2026-11-16 16:32:11.592045','EN_ATTENTE',2,4200.00,141,50),(175,'2026-11-16 16:32:11.596904','EN_ATTENTE',2,2200.00,142,51),(176,'2026-11-16 16:32:11.600771','ANNULEE',4,5250.00,143,49),(177,'2026-11-16 16:32:11.608079','ANNULEE',2,1800.00,144,50),(178,'2026-11-16 16:32:11.613729','ANNULEE',2,4200.00,145,51);
/*!40000 ALTER TABLE `reservations_reservation` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_res_bu` BEFORE UPDATE ON `reservations_reservation` FOR EACH ROW BEGIN
    IF NEW.statut_reservation <> OLD.statut_reservation THEN
        IF OLD.statut_reservation IN ('ANNULEE','TERMINEE') THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Une reservation annulee ou terminee ne peut plus changer de statut.';
        END IF;
        IF NEW.statut_reservation = 'CONFIRMEE' AND NOT EXISTS (
            SELECT 1 FROM reservations_reservation_chambre WHERE id_reservation = OLD.id_reservation) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Une reservation sans chambre ne peut pas etre confirmee.';
        END IF;
        IF NEW.statut_reservation = 'TERMINEE'
           AND OLD.statut_reservation <> 'CONFIRMEE' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seule une reservation confirmee peut etre terminee.';
        END IF;
        IF NEW.statut_reservation = 'EN_ATTENTE' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Une reservation confirmee ne peut pas revenir en attente.';
        END IF;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_res_bd` BEFORE DELETE ON `reservations_reservation` FOR EACH ROW BEGIN
    IF OLD.statut_reservation IN ('CONFIRMEE','TERMINEE') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Une reservation confirmee ou terminee ne peut pas etre supprimee.';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `reservations_reservation_chambre`
--

DROP TABLE IF EXISTS `reservations_reservation_chambre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations_reservation_chambre` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `date_arrivee_prevue` date NOT NULL,
  `date_depart_prevue` date NOT NULL,
  `nb_occupants` int unsigned NOT NULL,
  `tarif_nuit_applique` decimal(10,2) NOT NULL,
  `id_chambre` int NOT NULL,
  `id_reservation` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_reservation_chambre` (`id_reservation`,`id_chambre`),
  KEY `reservations_reserva_id_chambre_43f4f997_fk_chambres_` (`id_chambre`),
  CONSTRAINT `reservations_reserva_id_chambre_43f4f997_fk_chambres_` FOREIGN KEY (`id_chambre`) REFERENCES `chambres_chambre` (`id_chambre`),
  CONSTRAINT `reservations_reserva_id_reservation_8aabc14b_fk_reservati` FOREIGN KEY (`id_reservation`) REFERENCES `reservations_reservation` (`id_reservation`),
  CONSTRAINT `date_depart_apres_arrivee_reservation` CHECK ((`date_depart_prevue` > `date_arrivee_prevue`)),
  CONSTRAINT `reservations_reservation_chambre_chk_1` CHECK ((`nb_occupants` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=226 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations_reservation_chambre`
--

LOCK TABLES `reservations_reservation_chambre` WRITE;
/*!40000 ALTER TABLE `reservations_reservation_chambre` DISABLE KEYS */;
INSERT INTO `reservations_reservation_chambre` VALUES (1,'2026-09-16','2026-09-19',2,450.00,1,1),(2,'2026-09-21','2026-09-26',2,650.00,8,2),(3,'2026-09-26','2026-09-28',1,450.00,2,3),(4,'2026-10-01','2026-10-08',3,1500.00,26,4),(5,'2026-10-06','2026-10-10',2,650.00,9,5),(6,'2026-10-11','2026-10-14',2,650.00,11,6),(7,'2026-10-16','2026-10-22',2,950.00,16,7),(8,'2026-10-21','2026-10-23',1,450.00,4,8),(9,'2026-10-26','2026-10-30',2,1500.00,27,9),(10,'2026-10-31','2026-11-03',2,450.00,6,10),(11,'2026-11-13','2026-11-16',2,650.00,12,11),(12,'2026-11-14','2026-11-17',1,450.00,7,12),(13,'2026-11-15','2026-11-18',2,1500.00,28,13),(14,'2026-11-05','2026-11-08',2,450.00,1,14),(15,'2026-11-10','2026-11-12',1,450.00,2,15),(187,'2026-09-01','2026-09-03',1,350.00,6,149),(188,'2026-09-06','2026-09-09',2,600.00,13,150),(189,'2026-09-06','2026-09-09',2,550.00,12,150),(190,'2026-09-11','2026-09-15',2,1400.00,20,151),(191,'2026-09-16','2026-09-18',2,550.00,27,152),(192,'2026-09-21','2026-09-24',1,350.00,11,153),(193,'2026-09-26','2026-09-30',2,600.00,18,154),(194,'2026-09-26','2026-09-30',2,550.00,17,154),(195,'2026-10-01','2026-10-03',2,1400.00,25,155),(196,'2026-10-06','2026-10-09',2,950.00,9,156),(197,'2026-10-11','2026-10-15',1,350.00,16,157),(198,'2026-10-16','2026-10-18',2,600.00,23,158),(199,'2026-10-16','2026-10-18',2,550.00,22,158),(200,'2026-10-21','2026-10-24',2,550.00,7,159),(201,'2026-10-26','2026-10-30',2,950.00,14,160),(202,'2026-11-20','2026-11-22',1,350.00,21,161),(203,'2026-11-20','2026-11-22',3,1400.00,20,161),(204,'2026-11-24','2026-11-27',2,600.00,28,162),(205,'2026-11-28','2026-12-02',2,550.00,12,163),(206,'2026-12-02','2026-12-04',1,950.00,19,164),(207,'2026-12-02','2026-12-04',2,600.00,18,164),(208,'2026-12-06','2026-12-09',1,350.00,26,165),(209,'2026-12-10','2026-12-14',2,1400.00,10,166),(210,'2026-12-14','2026-12-16',1,550.00,17,167),(211,'2026-12-14','2026-12-16',1,350.00,16,167),(212,'2026-12-18','2026-12-21',2,950.00,24,168),(213,'2026-12-22','2026-12-26',2,600.00,8,169),(214,'2026-12-05','2026-12-07',2,1400.00,15,170),(215,'2026-12-05','2026-12-07',1,950.00,14,170),(216,'2026-12-10','2026-12-13',2,550.00,22,171),(217,'2026-12-15','2026-12-19',1,350.00,6,172),(218,'2026-12-20','2026-12-22',1,600.00,13,173),(219,'2026-12-20','2026-12-22',1,550.00,12,173),(220,'2026-12-25','2026-12-28',2,1400.00,20,174),(221,'2026-12-30','2027-01-03',2,550.00,27,175),(222,'2026-11-21','2026-11-24',1,350.00,11,176),(223,'2026-11-21','2026-11-24',3,1400.00,10,176),(224,'2026-11-24','2026-11-27',2,600.00,18,177),(225,'2026-11-27','2026-11-30',2,1400.00,25,178);
/*!40000 ALTER TABLE `reservations_reservation_chambre` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_resch_bi` BEFORE INSERT ON `reservations_reservation_chambre` FOR EACH ROW BEGIN
    DECLARE v_statut VARCHAR(20);
    DECLARE v_capacite INT;
    DECLARE v_etat VARCHAR(20);
    IF NEW.date_depart_prevue <= NEW.date_arrivee_prevue THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Le depart doit etre posterieur a la date darrivee.';
    END IF;
    IF NEW.nb_occupants < 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Le nombre doccupants doit etre superieur a zero.';
    END IF;
    SELECT statut_reservation INTO v_statut FROM reservations_reservation
        WHERE id_reservation = NEW.id_reservation;
    IF v_statut IN ('ANNULEE','TERMINEE') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Impossible de modifier les chambres dune reservation annulee ou terminee.';
    END IF;
    SELECT cat.capacite, c.etat_physique INTO v_capacite, v_etat
        FROM chambres_chambre c
        JOIN chambres_categoriechambre cat ON cat.id_categorie = c.categorie_id
        WHERE c.id_chambre = NEW.id_chambre;
    IF v_etat = 'hors_service' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cette chambre est hors service.';
    END IF;
    IF NEW.nb_occupants > v_capacite THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Le nombre doccupants depasse la capacite de la chambre.';
    END IF;
    IF EXISTS (
        SELECT 1 FROM reservations_reservation_chambre rc
        JOIN reservations_reservation r ON r.id_reservation = rc.id_reservation
        WHERE rc.id_chambre = NEW.id_chambre
          AND rc.id_reservation <> NEW.id_reservation
          AND r.statut_reservation IN ('EN_ATTENTE','CONFIRMEE')
          AND rc.date_arrivee_prevue < NEW.date_depart_prevue
          AND rc.date_depart_prevue > NEW.date_arrivee_prevue
    ) AND (SELECT statut_reservation FROM reservations_reservation
           WHERE id_reservation = NEW.id_reservation) IN ('EN_ATTENTE','CONFIRMEE') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cette chambre est deja reservee sur tout ou partie de la periode.';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_resch_ai` AFTER INSERT ON `reservations_reservation_chambre` FOR EACH ROW BEGIN
    UPDATE reservations_reservation SET
        nb_personnes_total = (SELECT COALESCE(SUM(nb_occupants), 0)
                              FROM reservations_reservation_chambre WHERE id_reservation = NEW.id_reservation),
        montant_estime = (SELECT COALESCE(SUM(
                              DATEDIFF(date_depart_prevue, date_arrivee_prevue)
                              * tarif_nuit_applique), 0)
                          FROM reservations_reservation_chambre WHERE id_reservation = NEW.id_reservation)
    WHERE id_reservation = NEW.id_reservation;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_resch_bu` BEFORE UPDATE ON `reservations_reservation_chambre` FOR EACH ROW BEGIN
    DECLARE v_statut VARCHAR(20);
    DECLARE v_capacite INT;
    DECLARE v_etat VARCHAR(20);
    IF NEW.date_depart_prevue <= NEW.date_arrivee_prevue THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Le depart doit etre posterieur a la date darrivee.';
    END IF;
    IF NEW.nb_occupants < 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Le nombre doccupants doit etre superieur a zero.';
    END IF;
    SELECT cat.capacite, c.etat_physique INTO v_capacite, v_etat
        FROM chambres_chambre c
        JOIN chambres_categoriechambre cat ON cat.id_categorie = c.categorie_id
        WHERE c.id_chambre = NEW.id_chambre;
    IF v_etat = 'hors_service' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cette chambre est hors service.';
    END IF;
    IF NEW.nb_occupants > v_capacite THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Le nombre doccupants depasse la capacite de la chambre.';
    END IF;
    IF EXISTS (
        SELECT 1 FROM reservations_reservation_chambre rc
        JOIN reservations_reservation r ON r.id_reservation = rc.id_reservation
        WHERE rc.id_chambre = NEW.id_chambre
          AND rc.id <> OLD.id
          AND r.statut_reservation IN ('EN_ATTENTE','CONFIRMEE')
          AND rc.date_arrivee_prevue < NEW.date_depart_prevue
          AND rc.date_depart_prevue > NEW.date_arrivee_prevue
    ) AND (SELECT statut_reservation FROM reservations_reservation
           WHERE id_reservation = NEW.id_reservation) IN ('EN_ATTENTE','CONFIRMEE') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cette chambre est deja reservee sur tout ou partie de la periode.';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_resch_au` AFTER UPDATE ON `reservations_reservation_chambre` FOR EACH ROW BEGIN
    UPDATE reservations_reservation SET
        nb_personnes_total = (SELECT COALESCE(SUM(nb_occupants), 0)
                              FROM reservations_reservation_chambre WHERE id_reservation = NEW.id_reservation),
        montant_estime = (SELECT COALESCE(SUM(
                              DATEDIFF(date_depart_prevue, date_arrivee_prevue)
                              * tarif_nuit_applique), 0)
                          FROM reservations_reservation_chambre WHERE id_reservation = NEW.id_reservation)
    WHERE id_reservation = NEW.id_reservation;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_resch_ad` AFTER DELETE ON `reservations_reservation_chambre` FOR EACH ROW BEGIN
    UPDATE reservations_reservation SET
        nb_personnes_total = (SELECT COALESCE(SUM(nb_occupants), 0)
                              FROM reservations_reservation_chambre WHERE id_reservation = OLD.id_reservation),
        montant_estime = (SELECT COALESCE(SUM(
                              DATEDIFF(date_depart_prevue, date_arrivee_prevue)
                              * tarif_nuit_applique), 0)
                          FROM reservations_reservation_chambre WHERE id_reservation = OLD.id_reservation)
    WHERE id_reservation = OLD.id_reservation;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `sejours_sejour`
--

DROP TABLE IF EXISTS `sejours_sejour`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sejours_sejour` (
  `id_sejour` int NOT NULL AUTO_INCREMENT,
  `arrivee_reelle` datetime(6) DEFAULT NULL,
  `depart_reel` datetime(6) DEFAULT NULL,
  `statut_sejour` varchar(20) NOT NULL,
  `est_archive` tinyint(1) NOT NULL,
  `id_chambre` int NOT NULL,
  `date_archivage` datetime(6) DEFAULT NULL,
  `observations` longtext NOT NULL,
  `id_reservation` int NOT NULL,
  PRIMARY KEY (`id_sejour`),
  UNIQUE KEY `unique_sejour_reservation_chambre` (`id_reservation`,`id_chambre`),
  KEY `sejours_sejour_id_chambre_90cba134_fk_chambres_` (`id_chambre`),
  CONSTRAINT `sejours_sejour_id_chambre_90cba134_fk_chambres_` FOREIGN KEY (`id_chambre`) REFERENCES `chambres_chambre` (`id_chambre`),
  CONSTRAINT `sejours_sejour_id_reservation_a0903eaa_fk_reservati` FOREIGN KEY (`id_reservation`) REFERENCES `reservations_reservation` (`id_reservation`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sejours_sejour`
--

LOCK TABLES `sejours_sejour` WRITE;
/*!40000 ALTER TABLE `sejours_sejour` DISABLE KEYS */;
INSERT INTO `sejours_sejour` VALUES (1,'2026-09-16 19:20:38.064606','2026-09-19 19:20:38.064606','TERMINE',1,1,'2026-09-19 19:20:38.064606','',1),(2,'2026-09-21 19:20:38.064606','2026-09-26 19:20:38.064606','TERMINE',1,8,'2026-09-26 19:20:38.064606','',2),(3,'2026-09-26 19:20:38.064606','2026-09-28 19:20:38.064606','TERMINE',1,2,'2026-09-28 19:20:38.064606','',3),(4,'2026-10-01 19:20:38.064606','2026-10-08 19:20:38.064606','TERMINE',1,26,'2026-10-08 19:20:38.064606','',4),(5,'2026-10-06 19:20:38.064606','2026-10-10 19:20:38.064606','TERMINE',1,9,'2026-10-10 19:20:38.064606','',5),(6,'2026-10-11 19:20:38.064606','2026-10-14 19:20:38.064606','TERMINE',1,11,'2026-10-14 19:20:38.064606','',6),(7,'2026-10-16 19:20:38.064606','2026-10-22 19:20:38.064606','TERMINE',1,16,'2026-10-22 19:20:38.064606','',7),(8,'2026-10-21 19:20:38.064606','2026-10-23 19:20:38.064606','TERMINE',1,4,'2026-10-23 19:20:38.064606','',8),(9,'2026-10-26 19:20:38.064606','2026-10-30 19:20:38.064606','TERMINE',1,27,'2026-10-30 19:20:38.064606','',9),(10,'2026-10-31 19:20:38.064606','2026-11-03 19:20:38.064606','TERMINE',0,6,NULL,'',10),(11,'2026-11-13 19:20:38.064606',NULL,'EN_COURS',0,12,NULL,'',11),(12,'2026-11-14 19:20:38.064606',NULL,'EN_COURS',0,7,NULL,'',12),(13,'2026-11-15 19:20:38.064606',NULL,'EN_COURS',0,28,NULL,'',13),(14,'2026-11-05 19:20:38.064606','2026-11-08 19:20:38.064606','ANNULE',0,1,NULL,'',14),(15,'2026-11-10 19:20:38.064606','2026-11-12 19:20:38.064606','ANNULE',0,2,NULL,'',15),(47,'2026-09-01 14:25:00.000000','2026-09-03 11:00:00.000000','TERMINE',0,6,NULL,'Arrivée anticipée enregistrée',149),(48,'2026-09-06 14:25:00.000000','2026-09-09 11:00:00.000000','TERMINE',0,13,NULL,'Séjour effectué sans incident',150),(49,'2026-09-06 14:25:00.000000','2026-09-09 11:00:00.000000','TERMINE',0,12,NULL,'Séjour effectué sans incident',150),(50,'2026-09-11 14:25:00.000000','2026-09-15 11:00:00.000000','TERMINE',1,20,'2026-09-25 09:00:00.000000','Arrivée anticipée enregistrée',151),(51,'2026-09-16 14:25:00.000000','2026-09-18 11:00:00.000000','TERMINE',0,27,NULL,'Séjour effectué sans incident',152),(52,'2026-09-21 14:25:00.000000','2026-09-24 11:00:00.000000','TERMINE',0,11,NULL,'Séjour effectué sans incident',153),(53,'2026-09-26 14:25:00.000000','2026-09-30 11:00:00.000000','TERMINE',0,18,NULL,'Arrivée anticipée enregistrée',154),(54,'2026-09-26 14:25:00.000000','2026-09-30 11:00:00.000000','TERMINE',1,17,'2026-10-10 09:00:00.000000','Séjour effectué sans incident',154),(55,'2026-10-01 14:25:00.000000','2026-10-03 11:00:00.000000','TERMINE',0,25,NULL,'Séjour effectué sans incident',155),(56,'2026-10-06 14:25:00.000000','2026-10-09 11:00:00.000000','TERMINE',0,9,NULL,'Arrivée anticipée enregistrée',156),(57,'2026-10-11 14:25:00.000000','2026-10-15 11:00:00.000000','TERMINE',0,16,NULL,'Séjour effectué sans incident',157),(58,'2026-10-16 14:25:00.000000','2026-10-18 11:00:00.000000','TERMINE',1,23,'2026-10-28 09:00:00.000000','Séjour effectué sans incident',158),(59,'2026-10-16 14:25:00.000000','2026-10-18 11:00:00.000000','TERMINE',0,22,NULL,'Arrivée anticipée enregistrée',158),(60,'2026-10-21 14:25:00.000000','2026-10-24 11:00:00.000000','TERMINE',0,7,NULL,'Séjour effectué sans incident',159),(61,'2026-10-26 14:25:00.000000','2026-10-30 11:00:00.000000','TERMINE',0,14,NULL,'Séjour effectué sans incident',160);
/*!40000 ALTER TABLE `sejours_sejour` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services_consommation`
--

DROP TABLE IF EXISTS `services_consommation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services_consommation` (
  `id_consommation` int NOT NULL AUTO_INCREMENT,
  `date_consommation` datetime(6) NOT NULL,
  `quantite` int unsigned NOT NULL,
  `prix_applique` decimal(10,2) NOT NULL,
  `id_sejour` int NOT NULL,
  `id_service` int NOT NULL,
  PRIMARY KEY (`id_consommation`),
  KEY `services_consommatio_id_sejour_91210554_fk_sejours_s` (`id_sejour`),
  KEY `services_consommatio_id_service_87f75972_fk_services_` (`id_service`),
  CONSTRAINT `services_consommatio_id_sejour_91210554_fk_sejours_s` FOREIGN KEY (`id_sejour`) REFERENCES `sejours_sejour` (`id_sejour`),
  CONSTRAINT `services_consommatio_id_service_87f75972_fk_services_` FOREIGN KEY (`id_service`) REFERENCES `services_service` (`id_service`),
  CONSTRAINT `services_consommation_chk_1` CHECK ((`quantite` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services_consommation`
--

LOCK TABLES `services_consommation` WRITE;
/*!40000 ALTER TABLE `services_consommation` DISABLE KEYS */;
INSERT INTO `services_consommation` VALUES (1,'2026-09-18 18:20:38.064606',2,85.00,1,1),(2,'2026-09-18 02:20:38.064606',1,250.00,1,6),(3,'2026-09-22 05:20:38.064606',4,85.00,2,1),(4,'2026-09-22 21:20:38.064606',2,280.00,2,3),(5,'2026-09-23 09:20:38.064606',1,350.00,2,2),(6,'2026-09-27 06:20:38.064606',2,85.00,3,1),(7,'2026-09-28 13:20:38.064606',1,120.00,3,7),(8,'2026-10-03 09:20:38.064606',6,85.00,4,1),(9,'2026-10-02 09:20:38.064606',1,350.00,4,4),(10,'2026-10-02 20:20:38.064606',2,350.00,4,2),(11,'2026-10-08 07:20:38.064606',2,85.00,5,1),(12,'2026-10-07 19:20:38.064606',1,550.00,5,8),(13,'2026-10-11 20:20:38.064606',4,85.00,6,1),(14,'2026-10-13 11:20:38.064606',3,45.00,6,5),(15,'2026-10-17 11:20:38.064606',10,85.00,7,1),(16,'2026-10-16 23:20:38.064606',1,280.00,7,3),(17,'2026-10-23 09:20:38.064606',1,350.00,8,2),(18,'2026-10-23 01:20:38.064606',2,350.00,8,4),(19,'2026-10-27 04:20:38.064606',4,85.00,9,1),(20,'2026-10-27 13:20:38.064606',2,120.00,9,7),(61,'2026-09-01 16:00:00.000000',1,85.00,47,39),(62,'2026-09-06 16:00:00.000000',2,320.00,48,40),(63,'2026-09-06 16:00:00.000000',1,450.00,49,43),(64,'2026-09-11 16:00:00.000000',2,220.00,50,6),(65,'2026-09-16 16:00:00.000000',1,180.00,51,41),(66,'2026-09-21 16:00:00.000000',2,95.00,52,44),(67,'2026-09-26 16:00:00.000000',1,65.00,53,5),(68,'2026-09-26 16:00:00.000000',2,40.00,54,42),(69,'2026-10-01 16:00:00.000000',1,85.00,55,39),(70,'2026-10-06 16:00:00.000000',2,320.00,56,40),(71,'2026-10-11 16:00:00.000000',1,450.00,57,43),(72,'2026-10-16 16:00:00.000000',2,220.00,58,6),(73,'2026-10-16 16:00:00.000000',1,180.00,59,41),(74,'2026-10-21 16:00:00.000000',2,95.00,60,44),(75,'2026-10-26 16:00:00.000000',1,65.00,61,5),(76,'2026-09-02 16:00:00.000000',2,40.00,47,42),(77,'2026-09-07 16:00:00.000000',1,85.00,48,39),(78,'2026-09-07 16:00:00.000000',2,320.00,49,40),(79,'2026-09-12 16:00:00.000000',1,450.00,50,43),(80,'2026-09-17 16:00:00.000000',2,220.00,51,6);
/*!40000 ALTER TABLE `services_consommation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services_service`
--

DROP TABLE IF EXISTS `services_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services_service` (
  `id_service` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(150) NOT NULL,
  `type_service` varchar(30) NOT NULL,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `description` longtext NOT NULL,
  PRIMARY KEY (`id_service`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services_service`
--

LOCK TABLES `services_service` WRITE;
/*!40000 ALTER TABLE `services_service` DISABLE KEYS */;
INSERT INTO `services_service` VALUES (1,'Petit-dejeuner marocain','RESTAURATION',85.00,'Buffet de specialites marocaines : msemen, amlou, olives, fromage frais et the a la menthe.'),(2,'Diner gastronomique','RESTAURATION',350.00,'Menu degustation 5 plats : harira, pastilla, tajine, couscous royal et cornes de gazelle.'),(3,'Hammam et gommage','SPA',280.00,'Seance de hammam traditionnel avec gommage au savon beldi et masque a l\'argile.'),(4,'Massage relaxant','SPA',350.00,'Massage corps entier a l\'huile d\'argan, 60 minutes.'),(5,'Blanchisserie','BLANCHISSERIE',45.00,'Lavage, sechage et repassage par piece.'),(6,'Transfert aeroport','TRANSPORT',250.00,'Navette privee depuis/vers l\'aeroport Marrakech-Menara en vehicule climatise.'),(7,'Minibar premium','MINIBAR',120.00,'Reapprovisionnement du minibar : eau minerale, jus de fruits, dattes et biscuits.'),(8,'Excursion desert','AUTRE',550.00,'Excursion d\'une journee aux dunes d\'Agafay en 4x4 avec dejeuner berbere.'),(39,'Petit-déjeuner','RESTAURATION',85.00,'Buffet petit-déjeuner'),(40,'Spa traditionnel','SPA',320.00,'Hammam et soin'),(41,'Dîner marocain','RESTAURATION',180.00,'Menu marocain'),(42,'Parking','AUTRE',40.00,'Parking par nuit'),(43,'Excursion guidée','AUTRE',450.00,'Visite culturelle guidée'),(44,'Service en chambre','RESTAURATION',95.00,'Collation en chambre');
/*!40000 ALTER TABLE `services_service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'hotel_management'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-16 16:57:37
