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
    localisation_fournisseur VARCHAR(100) ,
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
    ville_addresse VARCHAR(255) NOT NULL,
    code_postal_addresse VARCHAR(255),
    addresse_rue VARCHAR(255),
    complement_addresse VARCHAR(255),
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

INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(1, "Salade", 1, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(2, "Carotte", 1, "poids");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(3, "Tomate", 4, "poids");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(4, "Poulet léger", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(5, "Poulet lourd", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(6, "Pintade", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(7, "Lapin", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(8, "Oeuf palette(20)", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(9, "Caille", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(10, "Gigot Agneau", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(11, "Boeuf Morceau", 2, "pièce");
INSERT INTO PRODUIT(id_produit, nom_produit, id_categorie, type_vendu) VALUES(12, "Cote de Porc", 2, "pièce");



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