DROP TABLE IF EXISTS FOURNIR;
DROP TABLE IF EXISTS CONTENANCE;
DROP TABLE IF EXISTS COMMANDE;
DROP TABLE IF EXISTS FOURNISSEUR;
DROP TABLE IF EXISTS COURSIER;
DROP TABLE IF EXISTS HUB;
DROP TABLE IF EXISTS CLIENT;
DROP TABLE IF EXISTS ORGANISATION;
DROP TABLE IF EXISTS PRODUIT;
-- DROP TABLE IF EXISTS PRIX;
DROP TABLE IF EXISTS CATEGORIE;
DROP TABLE IF EXISTS ADRESSE;

-- toute les localisation sont sous la forme 
-- 24.x;2.y

CREATE TABLE PRIX(
    id_prix INT,
    prix_produit DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT pk_prix PRIMARY KEY(id_prix)
);

CREATE TABLE CATEGORIE(
    id_categorie INT,
    nom_categorie VARCHAR(255) NOT NULL,
    CONSTRAINT pk_cate PRIMARY KEY(id_categorie)
);

CREATE TABLE PRODUIT(
    id_produit INT,-
    nom_produit VARCHAR(255) NOT NULL,
    date_peremption DATE, -- a checker
    id_categorie INT,
    type_vendu VARCHAR(255) NOT NULL,
    desc_produit VARCHAR(255),
    CONSTRAINT pk_prod PRIMARY KEY(id_produit),
    CONSTRAINT fk_cate FOREIGN KEY(id_categorie) REFERENCES CATEGORIE(id_categorie)
);

CREATE TABLE FOURNISSEUR(
    id_fournisseur INT,
    nom_fournisseur VARCHAR(255) NOT NULL,
    prenom_fournisseur VARCHAR(255) NOT NULL,
    email_fournisseur VARCHAR(255) NOT NULL,
    telephone_fournisseur VARCHAR(255),
    mdp_fournisseur VARCHAR(255) NOT NULL,
    CONSTRAINT pk_fourni PRIMARY KEY(id_fournisseur)
);

CREATE TABLE COURSIER(
    id_coursier INT,
    nom_coursier VARCHAR(255) NOT NULL,
    prenom_coursier VARCHAR(255) NOT NULL,
    email_coursier VARCHAR(255) NOT NULL,
    telephone_coursier VARCHAR(255),
    mdp_coursier VARCHAR(255) NOT NULL,
    est_occupe BOOLEAN DEFAULT FALSE,
    localisation_coursier VARCHAR(100) ,
    CONSTRAINT pk_coursier PRIMARY KEY(id_coursier)
);

CREATE TABLE ORGANISATION(
    id_orga INT,
    nom_orga VARCHAR(255) NOT NULL,
    ville_organisation VARCHAR(255),
    localisation_orga VARCHAR(100),
    CONSTRAINT pk_orga PRIMARY KEY(id_orga)
);

CREATE TABLE CLIENT(
    id_client INT,
    nom_client VARCHAR(255) NOT NULL,
    prenom_client VARCHAR(255) NOT NULL,
    email_client VARCHAR(255),
    telephone_client VARCHAR(255),
    mdp_client VARCHAR(255) NOT NULL,
    id_orga INT,
    CONSTRAINT fk_orga FOREIGN KEY(id_orga) REFERENCES ORGANISATION(id_orga),
    CONSTRAINT pk_cli PRIMARY KEY(id_client)
);

CREATE TABLE HUB ( --ajouté un bon de commande --le bon de commande = bon livraison
    id_dmd VARCHAR(255),
    nom_dmd VARCHAR(200) NOT NULL,
    desc_dmd VARCHAR(500),
    localisation_dmd VARCHAR(255) NOT NULL,
    date_debut DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_fin DATETIME NOT NULL,
    est_commande BOOLEAN NOT NULL DEFAULT FALSE,
    id_client INT,
    CONSTRAINT fk_cli_commande FOREIGN KEY(id_client) REFERENCES CLIENT(id_client),
    --CONSTRAINT date_exact CHECK (date_debut < date_fin), --créer des bugs
    CONSTRAINT pk_hub PRIMARY KEY(id_dmd)
);

CREATE TABLE CONTENANCE(
    id_produit INT,
    id_dmd VARCHAR(255),
    nb_produit INT NOT NULL DEFAULT 1, --quantité de produit
    poids_piece_produit DECIMAL(10,2) DEFAULT 0.00, -- inutile  
    prix DECIMAL(10,2) NOT NULL DEFAULT 0.0, --inutile
    CONSTRAINT fk_prod FOREIGN KEY(id_produit) REFERENCES PRODUIT(id_produit),
    CONSTRAINT fk_dmd_cont FOREIGN KEY(id_dmd) REFERENCES HUB(id_dmd),
    CONSTRAINT pk_cont PRIMARY KEY(id_dmd, id_produit)
);

CREATE TABLE FOURNIR(
    id_fournisseur INT,
    id_produit INT, 
    prix_produit DECIMAL(10,2) DEFAULT 0.00,
    nb_produit_fourni INT NOT NULL DEFAULT 1, --quantité de produit
    CONSTRAINT pk_fourni_prod PRIMARY KEY(id_fournisseur, id_produit),
    CONSTRAINT fk_prod_fourni FOREIGN KEY(id_produit) REFERENCES PRODUIT(id_produit),
    CONSTRAINT fk_fourni FOREIGN KEY(id_fournisseur) REFERENCES FOURNISSEUR(id_fournisseur)
);

CREATE TABLE STATUS_COMMANDE(
    id_status INT,
    nom_status VARCHAR(255) NOT NULL, --en attente, en cours, livré
    --clé étrangère à commande
    CONSTRAINT pk_status PRIMARY KEY(id_status)
);

CREATE TABLE SESSION(
    id_key VARCHAR(255),
    key_value VARCHAR(255) NOT NULL,
    id_user INT,
    date_expiration DATE,
    CONSTRAINT pk_key PRIMARY KEY(id_key)
);

CREATE TABLE LOG_USER(
    -- Cette table nous servira a prévenir l'user pour nouvelle connexion
    id_log INT,
    date_deb_log DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_fin_log DATETIME,
    ip_log VARCHAR(255), -- hashé
    device_num_client VARCHAR(255), -- hashé 
    id_user INT,
    CONSTRAINT pk_log PRIMARY KEY(id_log)
);

CREATE TABLE COMMANDE(
    id_cmd INT,
    id_public_cmd VARCHAR(255) NOT NULL, -- BON de livraison
    id_fournisseur INT,
    id_client INT,
    id_dmd VARCHAR(255),
    id_coursier INT,
    code_echange INT, 
    id_status INT,
    est_paye BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_fourniss FOREIGN KEY(id_fournisseur) REFERENCES FOURNISSEUR(id_fournisseur),
    CONSTRAINT fk_coursier FOREIGN KEY(id_coursier) REFERENCES COURSIER(id_coursier),
    CONSTRAINT fk_dmd FOREIGN KEY(id_dmd) REFERENCES HUB(id_dmd),
    CONSTRAINT fk_cli FOREIGN KEY(id_client) REFERENCES CLIENT(id_client),
    CONSTRAINT fk_stats FOREIGN KEY(id_status) REFERENCES STATUS_COMMANDE(id_status),
    CONSTRAINT pk_cmd PRIMARY KEY(id_cmd)
);

CREATE TABLE PAYEMENT(
    id_payement INT,
    externalId VARCHAR(255) NOT NULL,
    id_cmd INT,
    amount DECIMAL(10,2) NOT NULL,
    momo_number VARCHAR(255),
    date_payement  DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cmd_pay FOREIGN KEY(id_cmd) REFERENCES COMMANDE(id_cmd)
);

CREATE TABLE COMMANDE_PRODUIT(
    id_cmd INT,
    id_produit INT,
    nb_produit INT,
    CONSTRAINT fk_cmd FOREIGN KEY(id_cmd) REFERENCES COMMANDE(id_cmd),
    CONSTRAINT fk_prod FOREIGN KEY(id_produit) REFERENCES PRODUIT(id_produit),
    CONSTRAINT pk_cmd_prod PRIMARY KEY(id_cmd, id_produit)
);

CREATE TABLE TEMP_CODE_RESET_PSSWD(
    id_code INT, 
    code_temp VARCHAR(255) NOT NULL,
    id_user INT NOT NULL,
    CONSTRAINT pk_code_temp PRIMARY KEY(id_code)    
); 

CREATE TABLE ADRESSE(
    id_addresse INT,
    ville_addresse VARCHAR(255),
    code_postal_addresse VARCHAR(255),
    addresse_rue VARCHAR(255),
    complement_addresse VARCHAR(255),
    localisation VARCHAR(255),
    CONSTRAINT pk_addresse PRIMARY KEY(id_addresse)
);

INSERT INTO ORGANISATION(id_orga, nom_orga, localisation_orga) VALUES (1, 'Orga admin', 'loca admin');

INSERT INTO CLIENT(id_client, nom_client, prenom_client, email_client, telephone_client, mdp_client, id_orga) VALUES
(1, 'Admin', 'Admin', 'admin@gmail.com', 'Admin', 'mdp', 1);

INSERT INTO HUB VALUES(
    "4cfb10a1e74d931ffdb16c4f68b7d0f94f6e67d6205f482ff3b94660bc712b5f",
    "TestCommande", "Ceci est une description d'une commande elle est à moitié courte",
    "48.520561618067134,2.3012475655486915",
    CURRENT_TIMESTAMP,
    '2025-05-15 18:30:00',
    FALSE,
    1);

    

INSERT INTO CATEGORIE(id_categorie, nom_categorie) VALUES (1, "Légume");
INSERT INTO CATEGORIE(id_categorie, nom_categorie) VALUES (2, "Viande");
INSERT INTO CATEGORIE(id_categorie, nom_categorie) VALUES (3, "Poisson");
INSERT INTO CATEGORIE(id_categorie, nom_categorie) VALUES (4, "Fruit");
INSERT INTO CATEGORIE(id_categorie, nom_categorie) VALUES (5, "Féculent");
INSERT INTO CATEGORIE(id_categorie, nom_categorie) VALUES (6, "Divers");
INSERT INTO CATEGORIE(id_categorie, nom_categorie) VALUES (7, "Epice");
INSERT INTO CATEGORIE(id_categorie, nom_categorie) VALUES (8, "Volaille");

INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(1, "Salade", 1, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(2, "Carotte", 1, "poids");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(3, "Tomate", 4, "poids");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(4, "Poulet léger", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(5, "Poulet lourd", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(6, "Pintade", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(7, "Lapin", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(8, "Oeuf palette(30)", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(9, "Caille", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(10, "Gigot Agneau", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(11, "Boeuf Morceau", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(12, "Cote de Porc", 2, "pièce");

INSERT INTO PRODUIT (id_produit, nom_produit, id_categorie, type_vendu) VALUES
(13, "Mérou", 3, "poids"),
(14, "Bar", 3, "poids"),
(15, "Carpe Grise", 3, "poids"),
(16, "Carpe Rouge", 3, "poids"),
(17, "Sol Fibo", 3, "poids"),
(18, "Brochet", 3, "poids"),
(19, "Crabe de Mer", 3, "poids"),
(20, "Crabe de Rivière", 3, "poids"),

(21, "Orange", 4, "pièce"),
(22, "Citron", 4, "pièce"),
(23, "Avocat", 4, "pièce"),
(24, "Banane", 4, "pièce"),
(25, "Pomme", 4, "pièce"),
(26, "Capoti", 4, "pièce"),
(27, "Corossol", 4, "pièce"),
(28, "Mangue", 4, "pièce"),
(29, "Papaye", 4, "pièce"),
(30, "Épinard (Gboman)", 1, "poids"),
(31, "Basilic Africain (Ch Io)", 1, "poids"),
(32, "Pomme de Terre", 1, "poids"),
(33, "Manioc", 5, "poids"),
(34, "Ignam", 5, "poids"),
(35, "Riz", 5, "poids"),
(36, "Attieke", 5, "poids"),
(37, "Oignon Blanc", 1, "poids"),
(38, "Tapioka", 5, "poids"),
(39, "Oignon Rouge", 1, "poids"),
(40, "Ail", 7, "poids"),
(41, "Gingembre", 7, "poids"),
(42, "Poivre", 7, "poids"),
(43, "Fotete", 1, "poids"),
(44, "Curcuma", 7, "poids"),
(45, "Gros Piment Vert Frais", 7, "poids"),
(46, "Clou de Girofle", 7, "poids"),
(47, "Anis Étoilé", 7, "poids"),
(48, "Goyave", 4, "pièce"),
(49, "Gombo", 1, "poids"),
(50, "Crincrin", 1, "poids"),
(51, "Telibo (Farine)", 5, "poids"),
(52, "Farine Gari", 5, "poids"),
(53, "Riz Glacé", 5, "poids"),
(54, "Riz Parfumé", 5, "poids"),
(55, "Riz Long", 5, "poids"),
(56, "Ananas", 4, "pièce"),
(57, "Banane Plantin", 4, "pièce"),
(58, "Banane Sucrée", 4, "pièce"),
(59, "Litchi", 4, "pièce"),
(60, "Carambole", 4, "pièce"),
(61, "Grenade", 4, "pièce"),

(62, "Poulet Local (Bicyclette)", 8, "poids"),
(63, "Canard", 8, "poids"),
(64, "Pigeon", 8, "pièce"),
(65, "Oeuf de Caille", 8, "pièce"),
(66, "Gézier", 8, "poids"),

(67, "Entrecôte", 2, "poids"),
(68, "Bavette Aloyau", 2, "poids"),
(69, "Coeur de Boeuf", 2, "poids"),
(70, "Viande Porc Générique", 2, "poids"),
(71, "Côte Porc Première", 2, "poids"),
(72, "Côte Porc Échine", 2, "poids"),
(73, "Pied Boeuf", 2, "poids"),
(74, "Pied Porc", 2, "poids"),
(75, "Tête Boeuf", 2, "poids"),
(76, "Tête Porc", 2, "poids"),
(77, "Langue Boeuf", 2, "poids"),
(78, "Langue Porc", 2, "poids"),
(79, "Carpe", 3, "poids"),
(80, "Dorade", 3, "poids"),
(81, "Silivie", 3, "poids"),
(82, "Cilure Blanc", 3, "poids"),
(83, "Cilure Noir", 3, "poids"),
(84, "Capitaine", 3, "poids"),
(85, "Crevette", 3, "poids"),
(86, "Gambas", 3, "poids"),
(87, "Langouste", 3, "poids"),
(88, "Langoustine", 3, "poids"),
(89, "Petite Crevette", 3, "poids"),
(90, "Calamar", 3, "poids"),
(91, "Poivron", 1, "poids"),
(92, "Aubergine", 1, "poids"),
(93, "Betterave", 1, "poids"),
(94, "Navet", 1, "poids"),
(95, "Mais frais", 1, "poids"),
(96, "agouti", 2, "poids"),
(97, "Poulet cher", 8, "poids"),



INSERT INTO `CONTENANCE` (`id_produit`, `id_dmd`, `nb_produit`, `poids_piece_produit`, `prix`) VALUES
(1, '4cfb10a1e74d931ffdb16c4f68b7d0f94f6e67d6205f482ff3b94660bc712b5f', 15, 200.00, 0.00);

INSERT INTO `COURSIER` (`id_coursier`, `nom_coursier`, `prenom_coursier`, `email_coursier`, `telephone_coursier`, `mdp_coursier`, `est_occupe`, `localisation_coursier`) VALUES
(1, 's', 'f', 'd', 'te', '1234', 0, '3.4;4.5');

INSERT INTO `FOURNISSEUR` (`id_fournisseur`, `nom_fournisseur`, `prenom_fournisseur`, `email_fournisseur`, `telephone_fournisseur`, `mdp_fournisseur`,  `localisation_fournisseur`) VALUES
(1, 'testN', 'testP', 'test@gmail.com', '0698453689', '123456', '3.8;4.9');

INSERT INTO `FOURNIR` (`id_fournisseur`, `id_produit`, `prix_produit_fourni`) VALUES
(1, 1, 0.00);

INSERT INTO STATUS_COMMANDE VALUES(1, 'En préparation');
INSERT INTO STATUS_COMMANDE VALUES(2, 'En cours de livraison');
INSERT INTO STATUS_COMMANDE VALUES(3, 'Livré');
INSERT INTO STATUS_COMMANDE VALUES(4, 'Annulé');

INSERT INTO SESSION VALUES ('774f2d2b1124697dc3fcded0850d76be4a78a89fb996ca672ae1cb111651fffc', 'temp_key', 231920, DATE("2026-06-15 09:34:21"))