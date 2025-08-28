-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 28 août 2025 à 20:45
-- Version du serveur : 8.3.0
-- Version de PHP : 8.1.2-1ubuntu2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `logibackkomododb`
--

-- --------------------------------------------------------

--
-- Structure de la table `ADRESSE`
--

CREATE TABLE `ADRESSE` (
  `id_addresse` int NOT NULL,
  `ville_addresse` varchar(255) NOT NULL,
  `code_postal_addresse` varchar(255) DEFAULT NULL,
  `addresse_rue` varchar(255) DEFAULT NULL,
  `complement_addresse` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `CATEGORIE`
--

CREATE TABLE `CATEGORIE` (
  `id_categorie` int NOT NULL,
  `nom_categorie` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `CATEGORIE`
--

INSERT INTO `CATEGORIE` (`id_categorie`, `nom_categorie`) VALUES
(1, 'Légume'),
(2, 'Viande'),
(3, 'Poisson/Fuit de mer'),
(4, 'Fruit'),
(5, 'Féculent'),
(6, 'Divers'),
(7, 'Epice'),
(8, 'Volaille');

-- --------------------------------------------------------

--
-- Structure de la table `CLIENT`
--

CREATE TABLE `CLIENT` (
  `id_client` int NOT NULL,
  `nom_client` varchar(255) NOT NULL,
  `prenom_client` varchar(255) NOT NULL,
  `email_client` varchar(255) DEFAULT NULL,
  `telephone_client` varchar(255) DEFAULT NULL,
  `mdp_client` varchar(255) NOT NULL,
  `id_orga` int DEFAULT NULL,
  `email_unhash_client` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `tel_unhash_client` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `CLIENT`
--

INSERT INTO `CLIENT` (`id_client`, `nom_client`, `prenom_client`, `email_client`, `telephone_client`, `mdp_client`, `id_orga`, `email_unhash_client`, `tel_unhash_client`) VALUES
(1, 'Admin', 'Admin', 'admin@gmail.com', 'Admin', 'mdp', 1, '', ''),
(1355, 'Sounouvou', 'Parfait', '59380e3af0fae7fc0b7a5830c5492bd6f1d90d1c48bb4d75988f7aa2c525dee2', '74c6755699959a4402318e7a2c46133ae61e26e0e47829275107c897acd226f3', 'e951f4228fa9a8536a5db1ba9a986302f306b9c6fb1d400d4e4eed0ab381cbf9', NULL, '', ''),
(56747, 'Ayite', 'Kevin', 'a10a3cf9e21858656b7b68a8bf2ea09e0c07db29efaec6106a417a7438bc1ee1', '3657bfe5868fa342c3bca41ab48434983e858f2d126382e0f14d06bb8bf58a30', 'a7e0354123a3c9687bf96dd7bd18f5516310deae06176223e8f70ecadcc155e7', NULL, '', ''),
(106348, 'Wayne', 'Bruce', '252d0cfd8a7d5c87b16d98b775bfb0e0ddc5027857814aa23c2f9c040efab11d', '4328c395a0f0f4101e765d2738d9f0fa3fad7f09a248a870629df01e7e05ea35', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, '', ''),
(139906, 'test', 'qsdq', '00fd9aba223d2777b1ee737d9cafa778efd210f25bdd77f59f46d5bd0abd6271', 'b753e2a96a37310dbd0789eeea040ea36271be2b6a62e894ced3188a7c0fc26f', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, '', ''),
(148675, 'sqdqsqdd', 'qsaqdsqsdqsdqdq', '9c5499438e268f9e13c327a4118a423be1bec5722b2f70c5493596c33e36fe64', 'a78b53a724e30009b92d6be719fbb64e31253675a4f6db436260ef0f9dfecd3a', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, '', ''),
(166243, 'Avagbo', 'Pierre ', '0b589358a854ffa179800bbb0c57e2473ce52d44be0d185241de0b98aac27bac', '74c6755699959a4402318e7a2c46133ae61e26e0e47829275107c897acd226f3', 'f3ba330ee636fdcf0fe6c5eef3a083d1283732fdd6807772f04c018d3fb7c52e', NULL, '', ''),
(231920, 'Sounouvou', 'Parfait', '715dcf354950f718648c67f6e8017d1395d1ca92e270cc4ecca32b43191b726f', '461aa4b7c0aa9daeacf2ab6b8b142ff7b1d22f428b11c085f1b42708d680ae75', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, '', ''),
(273388, 'jkfkds', 'fdsfds', '0722d515ce718cd35323200b91f2ee68ea6466cc455211bf0fe2b654950b9f04', '880c835e00f605e70497815bb6f13c3ccd2ccb5bf4459b4e5ef65ec9f91a84f3', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, 'li@gmail.com', '053098890'),
(296281, 'world', 'hello', '53e5cc3c2d221a9e6df5941ea587d4772d2ae883d6ffc48873f0eb817880ddaa', '4159f27962f649e80d2c35ceee094f2246e50cb369aac2ecc2b59a722540eae8', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, '', ''),
(299530, 'Lord', 'Nashou', '57fc09fe9295d0e6e9835625ef3c729ffa48bb14f29d85cedbe113581f894ffc', 'ec8e3fc8fddf7de8dfc4465fc8c137c9f680ea31e08c25959f4fe2188994f8fe', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, '', ''),
(326857, 'Hounguê', 'Jonas', 'e42f26db692b08ab30c115d8efe39ef9bf6e66322ab59bd17e2be3b110c48119', '578410ebb154b2f48a8212161333fcf72590e479ca56244f1ed8d9b6dcf30c2d', 'ac180c1fc41f6411492b444114b29f751a03a52a42c95d22c7f2a72989cbeeb2', NULL, '', ''),
(443764, 'Test', 'Pi', 'a5e5a4ab2d087460e384df10d3a65d3f2dac4b2ccc33fd645cb74ce29f8a8569', 'd37f6437b8799bdbdfbb63d7dfca9faa93ba52769c9a8bed8759dda42f08ff2b', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, '', ''),
(455161, 'Ayite', 'Kevin', '2b6b888abddc1e9b4030286f3443948c75fbf65b79e08a3f3749990ea64c5a8d', '3657bfe5868fa342c3bca41ab48434983e858f2d126382e0f14d06bb8bf58a30', 'a7e0354123a3c9687bf96dd7bd18f5516310deae06176223e8f70ecadcc155e7', NULL, '', ''),
(468225, 'Sounouvou', 'Parfait', '07f0c791bda78ce1b1e8b3a32e84f92733228b2fa75f146f65ca427ce749533a', 'b283b74069caa446c76489f745071cd3a3bd0696c096a093d0203f272f8f66c0', '070487f81aa9cb3b362dc0d563706328f5938846c88b5b12e39b0e4e14c7e1b1', NULL, '', ''),
(481584, 'Doe', 'John', 'Array', 'Array', 'Array', NULL, '', ''),
(488047, 'Sankara', 'Thomas', 'b61648695c0304bfd4cc2ee2832f75064b1c2c222fab70bd4baef202fe101ba4', 'd19934fcc110aec704fa9fe595349eef50aef8e5610dfbc58844c6f9ad45b6c1', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, '', ''),
(634067, 'test', 'qsdq', '3ed82406b36ce75deb65ca62ee049cc3bee2e178af791eadfbc89e5f0a42e140', 'b753e2a96a37310dbd0789eeea040ea36271be2b6a62e894ced3188a7c0fc26f', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, '', ''),
(743842, 'Kiniffo', 'Emmanuel ', '38fdf97eb710b8c5db8cc73141d215bbb5f17f7a24d7169f6d00889be4dfbe0d', '018690695b2bd8dc8fd31b785de7fb4f46beccaee729b0fffcdc4fcafbc9542f', '962b38d20b08a0ab38ca95a05eb5b0bfa5dae2dfcf5aba5d03c272ded9162b28', NULL, '', ''),
(789104, 'sdsd', 'sdsd', '5ede08fc858684e7cdce7c5eb93bdb87d7f7f9d1dc9a26539a1f5dda9deab06c', 'dbc0a77a8af78a19c9eb42b7a19e16ef2fa4425d2d260bd9c85ebd8c81360241', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, '', ''),
(794865, 'Doe', 'John', '142d78e466cacab37c3751a6ba0d288ce40db609ce9c49617ea6b24665f1aa9c', '6e5143a5f0ae566fffa09cae85527fbcc6966dd31495c705c9b4a6f24f59b232', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, '', ''),
(898486, 'Hounguê', 'Jonas', 'b7c3dc80feafbe50488bb63715c646ce3f7f0eefd28ef31e195679149ba0c2bd', '578410ebb154b2f48a8212161333fcf72590e479ca56244f1ed8d9b6dcf30c2d', 'ac180c1fc41f6411492b444114b29f751a03a52a42c95d22c7f2a72989cbeeb2', NULL, '', ''),
(938558, 'Nago', 'Jos', 'fbc3be3ba2e036f25f7a3c59ef8080a260f03fc9bdaf29d245fee79199deebfb', '74c6755699959a4402318e7a2c46133ae61e26e0e47829275107c897acd226f3', 'd9a3c30e9ff645de943955d1ec4ecb3bbc67aaa90b7c4fae63ddebbd587104fc', NULL, '', ''),
(990282, 'Anato', 'Ingrid', 'c9d892ea01119bbc3954df9bcbe36fe74f0cdeb2e5a137d2221723d5493033af', '74c6755699959a4402318e7a2c46133ae61e26e0e47829275107c897acd226f3', 'f4004d6fe977fb5ece77045c86f110865bc098a1e330ab37a9867eef10596d2c', NULL, '', '');

-- --------------------------------------------------------

--
-- Structure de la table `COMMANDE`
--

CREATE TABLE `COMMANDE` (
  `id_cmd` int NOT NULL,
  `id_public_cmd` varchar(255) NOT NULL,
  `id_fournisseur` int DEFAULT NULL,
  `id_client` int DEFAULT NULL,
  `id_dmd` varchar(255) DEFAULT NULL,
  `id_coursier` int DEFAULT NULL,
  `code_echange` int NOT NULL,
  `id_status` int DEFAULT NULL,
  `est_paye` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `COMMANDE`
--

INSERT INTO `COMMANDE` (`id_cmd`, `id_public_cmd`, `id_fournisseur`, `id_client`, `id_dmd`, `id_coursier`, `code_echange`, `id_status`, `est_paye`) VALUES
(27419, 'CMD_6869a6827c606', 1, 231920, '68699f8eea48f', 1, 29559, 1, 0),
(51166, 'CMD_686ee0aa32f61', 1, 231920, '686ee0a8e95e7', 1, 51768, 1, 0),
(73877, 'CMD_6870545a4f8d2', 1, 231920, '68705453a85c9', 1, 73464, 1, 0),
(74408, 'CMD_6869a682e7576', 2, 231920, '68699f8eea48f', 370838, 16283, 1, 0),
(81890, 'CMD_68656ab837ad1', 1, 488047, '68655edab7038', 1, 85300, 1, 0),
(83289, 'CMD_68656ab90f248', 2, 488047, '68655edab7038', 370838, 61113, 1, 0),
(93766, 'CMD_686ee0aa9f90d', 2, 231920, '686ee0a8e95e7', 370838, 49496, 1, 0);

-- --------------------------------------------------------

--
-- Structure de la table `COMMANDE_PRODUIT`
--

CREATE TABLE `COMMANDE_PRODUIT` (
  `id_cmd` int NOT NULL,
  `id_produit` int NOT NULL,
  `nb_produit` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `COMMANDE_PRODUIT`
--

INSERT INTO `COMMANDE_PRODUIT` (`id_cmd`, `id_produit`, `nb_produit`) VALUES
(27419, 1, 5),
(51166, 1, 89),
(73877, 1, 25),
(74408, 4, 3),
(81890, 1, 3),
(83289, 4, 6),
(93766, 4, 15);

-- --------------------------------------------------------

--
-- Structure de la table `CONTENANCE`
--

CREATE TABLE `CONTENANCE` (
  `id_produit` int NOT NULL,
  `id_dmd` varchar(255) NOT NULL,
  `nb_produit` int NOT NULL DEFAULT '1',
  `poids_piece_produit` decimal(10,2) DEFAULT '0.00',
  `prix` decimal(10,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `CONTENANCE`
--

INSERT INTO `CONTENANCE` (`id_produit`, `id_dmd`, `nb_produit`, `poids_piece_produit`, `prix`) VALUES
(1, '68655edab7038', 3, 2.00, 0.00),
(4, '68655edab7038', 6, 1.00, 0.00),
(1, '68699f8eea48f', 5, 0.00, 0.00),
(4, '68699f8eea48f', 3, 0.00, 0.00),
(1, '6869a67ec1ff8', 4, 0.00, 0.00),
(4, '6869a67ec1ff8', 5, 0.00, 0.00),
(1, '686ee0a8e95e7', 89, 0.00, 0.00),
(4, '686ee0a8e95e7', 15, 0.00, 0.00),
(1, '68705453a85c9', 25, 0.00, 0.00);

-- --------------------------------------------------------

--
-- Structure de la table `COURSIER`
--

CREATE TABLE `COURSIER` (
  `id_coursier` int NOT NULL,
  `nom_coursier` varchar(255) NOT NULL,
  `prenom_coursier` varchar(255) NOT NULL,
  `email_coursier` varchar(255) NOT NULL,
  `telephone_coursier` varchar(255) DEFAULT NULL,
  `mdp_coursier` varchar(255) NOT NULL,
  `est_occupe` tinyint(1) DEFAULT '0',
  `localisation_coursier` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `COURSIER`
--

INSERT INTO `COURSIER` (`id_coursier`, `nom_coursier`, `prenom_coursier`, `email_coursier`, `telephone_coursier`, `mdp_coursier`, `est_occupe`, `localisation_coursier`) VALUES
(1, 's', 'f', 'd', 'te', '1234', 1, '3.4;4.5'),
(370838, 'test', 'test', '7e4d482ad41e078acc6af129b130d6c22a5d23a7d51d482cbb3be5515fbe38b6', 'aacd834b5cdc64a329e27649143406dd068306542988dfc250d6184745894849', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 1, '3.4;4.5'),
(555648, 't', 't', 'd7aa593ff56278f430b5a8e9c07a25c25f2b092e72ef75cc3c4bec2e9582a89f', '938db8c9f82c8cb58d3f3ef4fd250036a48d26a712753d2fde5abd03a85cabf4', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 0, '3.4;4.5');

-- --------------------------------------------------------

--
-- Structure de la table `FOURNIR`
--

CREATE TABLE `FOURNIR` (
  `id_fournisseur` int NOT NULL,
  `id_produit` int NOT NULL,
  `prix_produit` decimal(10,2) DEFAULT '0.00',
  `nb_produit_fourni` int DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `FOURNIR`
--

INSERT INTO `FOURNIR` (`id_fournisseur`, `id_produit`, `prix_produit`, `nb_produit_fourni`) VALUES
(1, 1, 300.00, 25),
(2, 1, 300.00, 18),
(217694, 11, 150.00, 200),
(999325, 2, 100.00, 100),
(999325, 6, 100.00, 25);

-- --------------------------------------------------------

--
-- Structure de la table `FOURNISSEUR`
--

CREATE TABLE `FOURNISSEUR` (
  `id_fournisseur` int NOT NULL,
  `nom_fournisseur` varchar(255) NOT NULL,
  `prenom_fournisseur` varchar(255) NOT NULL,
  `email_fournisseur` varchar(255) NOT NULL,
  `telephone_fournisseur` varchar(255) DEFAULT NULL,
  `mdp_fournisseur` varchar(255) NOT NULL,
  `localisation_fournisseur` varchar(100) DEFAULT NULL,
  `email_unhash_fournisseur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `tel_unhash_fournisseur` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `id_orga` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `FOURNISSEUR`
--

INSERT INTO `FOURNISSEUR` (`id_fournisseur`, `nom_fournisseur`, `prenom_fournisseur`, `email_fournisseur`, `telephone_fournisseur`, `mdp_fournisseur`, `localisation_fournisseur`, `email_unhash_fournisseur`, `tel_unhash_fournisseur`, `id_orga`) VALUES
(1, 'testN', 'testP', 'test@gmail.com', '0698453689', '123456', '3.8;4.9', '', '', 2),
(2, 'fourn1', 'p', 'fourni@gmail.com', 'XXX', '1234', '3.8;4.9', '', '', 2),
(40354, 'Jrjtj', 'Jrj', 'b44988bce9bf0443b0d96a91171fc59c2616385a51756aa21485bdd2bf77a186', '4a66f57ff9b0d53121d06f851dc6270516d70ed58b4fb15cdc706d0e04455d16', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, '', '', NULL),
(78959, 'test', 'qsdqsd', '2ddbfd502aacc1e06bd39519cc66a84c3e273d08eab380847ebc1351a3df574d', '0474088797402f35814cc8a1f830f94ee6d3af9960407ad5cf340833b0ee0617', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, '', '', NULL),
(98332, 'Nago', 'Josias', 'fb355daec9af9949e22cc7f0bc9648b0311d58e34aabba0a2821701c9a4cbac5', '066acba582dbcb404b45f8bfff9d02268ad1b506ec34709107543a4ae003047a', 'd9a3c30e9ff645de943955d1ec4ecb3bbc67aaa90b7c4fae63ddebbd587104fc', NULL, '', '', NULL),
(187828, 'Adjavon', 'Jean Luc', '3a8f400e2ce32b3e9ba73a6e0b464cf734bcf38b2c6136a61f3facedc287b567', '74c6755699959a4402318e7a2c46133ae61e26e0e47829275107c897acd226f3', '52845c216e5011d1badc3bd703ac0ffdf3a38a22274166c99bdf91de85a974e8', NULL, '', '', NULL),
(217694, 'test', 'qsdqsd', 'ffb4104e79a8eb5a6e49df04f41c9dd7aa4e5fe89563245aaeeaf1074c42df8b', '09f84eb75cabd08f8edfcc3f4d633bd33075d90057f622f922efabe247ad41c9', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, '', '', NULL),
(222116, 'Nago', 'Josias', 'ee5e07e1911e752209a010b24be833f8153d5ebaef4d2a89036caec847629470', '74c6755699959a4402318e7a2c46133ae61e26e0e47829275107c897acd226f3', 'd9a3c30e9ff645de943955d1ec4ecb3bbc67aaa90b7c4fae63ddebbd587104fc', NULL, '', '', NULL),
(261930, 'Nago', 'Josias', '3c26aff788bbfb5cf78b8e27bb3b45032e705b350f27086b567c1a83d9d5f610', '74c6755699959a4402318e7a2c46133ae61e26e0e47829275107c897acd226f3', 'd9a3c30e9ff645de943955d1ec4ecb3bbc67aaa90b7c4fae63ddebbd587104fc', NULL, '', '', NULL),
(372844, 'Nago', 'Josias', 'c57f7be38a36dabb40e86057734348e274424c6e9d44839a153eeacdcce747cb', '74c6755699959a4402318e7a2c46133ae61e26e0e47829275107c897acd226f3', 'd9a3c30e9ff645de943955d1ec4ecb3bbc67aaa90b7c4fae63ddebbd587104fc', NULL, '', '', NULL),
(478589, 'Nago', 'Josias', '4d1f73d67f1b8c7dd9cc5572c678dbac26b191b369422017d8af7a64849131bd', '066acba582dbcb404b45f8bfff9d02268ad1b506ec34709107543a4ae003047a', 'd9a3c30e9ff645de943955d1ec4ecb3bbc67aaa90b7c4fae63ddebbd587104fc', NULL, '', '', NULL),
(946017, 'Nago', 'Josias', '01cfeaa2f41b48b485a59faea33c23a12d96ff58e4a466ea827340c0b60797e4', '74c6755699959a4402318e7a2c46133ae61e26e0e47829275107c897acd226f3', 'd9a3c30e9ff645de943955d1ec4ecb3bbc67aaa90b7c4fae63ddebbd587104fc', NULL, '', '', NULL),
(999325, 'test', 'qsdqsd', '8db9179ba36eeeb8cd10d56eb52db7bd22a6275b20a691fa93e455151f35c52e', '0474088797402f35814cc8a1f830f94ee6d3af9960407ad5cf340833b0ee0617', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', NULL, '', '', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `HUB`
--

CREATE TABLE `HUB` (
  `id_dmd` varchar(255) NOT NULL,
  `nom_dmd` varchar(200) NOT NULL,
  `desc_dmd` varchar(500) DEFAULT NULL,
  `localisation_dmd` varchar(255) NOT NULL,
  `date_debut` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_fin` datetime NOT NULL,
  `est_commande` tinyint(1) NOT NULL DEFAULT '0',
  `id_client` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `HUB`
--

INSERT INTO `HUB` (`id_dmd`, `nom_dmd`, `desc_dmd`, `localisation_dmd`, `date_debut`, `date_fin`, `est_commande`, `id_client`) VALUES
('68655edab7038', 'sdqsddqsqsd', 'sqddqsdqs', '9.256258162972903;2.3716145753860474', '2025-07-02 16:31:22', '2025-07-02 16:30:12', 1, 488047),
('68695c2a369f4', 'test', 'desc', '37.4219983;-122.084', '2025-07-05 17:08:58', '2025-07-05 16:00:18', 1, 231920),
('68699e7df2288', 'Test', 'Desc', '37.4219983;-122.084', '2025-07-05 21:51:58', '2025-07-05 21:48:51', 1, 231920),
('68699ea1806f8', 'Test', 'Desc', '37.4219983;-122.084', '2025-07-05 21:52:35', '2025-07-05 21:48:51', 1, 231920),
('68699f8eea48f', 'Test', 'Desc', '37.4219983;-122.084', '2025-07-05 21:56:32', '2025-07-05 21:48:51', 1, 231920),
('6869a63607456', 'Test', 'desc', '9.392813463000232;2.2793586552143097', '2025-07-05 22:24:54', '2025-07-05 22:23:14', 1, 231920),
('6869a67ec1ff8', 'Test', 'desc', '9.392813463000232;2.2793586552143097', '2025-07-05 22:26:07', '2025-07-05 22:23:14', 1, 231920),
('686ee0a8e95e7', 'Adjavon', '', '48.514869068673725;2.293272039852319', '2025-07-09 21:35:37', '2025-07-09 23:32:19', 1, 231920),
('68705453a85c9', 'Test', 'Jxjdj', '48.5204732;2.3012938', '2025-07-11 00:01:24', '2025-07-11 02:00:49', 1, 231920);

-- --------------------------------------------------------

--
-- Structure de la table `LOG_USER`
--

CREATE TABLE `LOG_USER` (
  `id_log` int NOT NULL,
  `date_deb_log` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_fin_log` datetime DEFAULT NULL,
  `ip_log` varchar(255) DEFAULT NULL,
  `device_num_client` varchar(255) DEFAULT NULL,
  `id_user` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `ORGANISATION`
--

CREATE TABLE `ORGANISATION` (
  `id_orga` int NOT NULL,
  `nom_orga` varchar(255) NOT NULL,
  `localisation_orga` varchar(100) DEFAULT NULL,
  `ville_organisation` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `ORGANISATION`
--

INSERT INTO `ORGANISATION` (`id_orga`, `nom_orga`, `localisation_orga`, `ville_organisation`) VALUES
(1, 'Orga admin', 'loca admin', NULL),
(2, 'Ferme végé', '9.153231;2.141878', 'Abéokouta');

-- --------------------------------------------------------

--
-- Structure de la table `PAYEMENT`
--

CREATE TABLE `PAYEMENT` (
  `id_payement` int DEFAULT NULL,
  `externalId` varchar(255) NOT NULL,
  `id_cmd` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `momo_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `date_payement` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `PRIX`
--

CREATE TABLE `PRIX` (
  `id_prix` int NOT NULL,
  `prix_produit` decimal(10,2) NOT NULL DEFAULT '0.00'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `PRIX`
--

INSERT INTO `PRIX` (`id_prix`, `prix_produit`) VALUES
(1, 300.00);

-- --------------------------------------------------------

--
-- Structure de la table `PRODUIT`
--

CREATE TABLE `PRODUIT` (
  `id_produit` int NOT NULL,
  `nom_produit` varchar(255) NOT NULL,
  `date_peremption` date DEFAULT NULL,
  `id_categorie` int DEFAULT NULL,
  `type_vendu` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `PRODUIT`
--

INSERT INTO `PRODUIT` (`id_produit`, `nom_produit`, `date_peremption`, `id_categorie`, `type_vendu`) VALUES
(1, 'Salade', NULL, 1, 'pièce'),
(2, 'Carotte', NULL, 1, 'poids'),
(3, 'Tomate', NULL, 4, 'poids'),
(4, 'Poulet léger', NULL, 2, 'pièce'),
(5, 'Poulet lourd', NULL, 2, 'pièce'),
(6, 'Pintade', NULL, 2, 'pièce'),
(7, 'Lapin', NULL, 2, 'pièce'),
(8, 'Oeuf palette(30)', NULL, 2, 'pièce'),
(9, 'Caille', NULL, 2, 'pièce'),
(10, 'Gigot Agneau', NULL, 2, 'pièce'),
(11, 'Boeuf Morceau', NULL, 2, 'pièce'),
(12, 'Cote de Porc', NULL, 2, 'pièce'),
(13, 'Mérou', NULL, 3, 'poids'),
(14, 'Bar', NULL, 3, 'poids'),
(15, 'Carpe Grise', NULL, 3, 'poids'),
(16, 'Carpe Rouge', NULL, 3, 'poids'),
(17, 'Sol Fibo', NULL, 3, 'poids'),
(18, 'Brochet', NULL, 3, 'poids'),
(19, 'Crabe de Mer', NULL, 3, 'poids'),
(20, 'Crabe de Rivière', NULL, 3, 'poids'),
(21, 'Orange', NULL, 4, 'pièce'),
(22, 'Citron', NULL, 4, 'pièce'),
(23, 'Avocat', NULL, 4, 'pièce'),
(24, 'Banane', NULL, 4, 'pièce'),
(25, 'Pomme', NULL, 4, 'pièce'),
(26, 'Capoti', NULL, 4, 'pièce'),
(27, 'Corossol', NULL, 4, 'pièce'),
(28, 'Mangue', NULL, 4, 'pièce'),
(29, 'Papaye', NULL, 4, 'pièce'),
(30, 'Épinard (Gboman)', NULL, 1, 'poids'),
(31, 'Basilic Africain (Ch Io)', NULL, 1, 'poids'),
(32, 'Pomme de Terre', NULL, 1, 'poids'),
(33, 'Manioc', NULL, 5, 'poids'),
(34, 'Ignam', NULL, 5, 'poids'),
(35, 'Riz', NULL, 5, 'poids'),
(36, 'Attieke', NULL, 5, 'poids'),
(37, 'Oignon Blanc', NULL, 1, 'poids'),
(38, 'Tapioka', NULL, 5, 'poids'),
(39, 'Oignon Rouge', NULL, 1, 'poids'),
(40, 'Ail', NULL, 7, 'poids'),
(41, 'Gingembre', NULL, 7, 'poids'),
(42, 'Poivre', NULL, 7, 'poids'),
(43, 'Fotete', NULL, 1, 'poids'),
(44, 'Curcuma', NULL, 7, 'poids'),
(45, 'Gros Piment Vert Frais', NULL, 7, 'poids'),
(46, 'Clou de Girofle', NULL, 7, 'poids'),
(47, 'Anis Étoilé', NULL, 7, 'poids'),
(48, 'Goyave', NULL, 4, 'pièce'),
(49, 'Gombo', NULL, 1, 'poids'),
(50, 'Crincrin', NULL, 1, 'poids'),
(51, 'Telibo (Farine)', NULL, 5, 'poids'),
(52, 'Farine Gari', NULL, 5, 'poids'),
(53, 'Riz Glacé', NULL, 5, 'poids'),
(54, 'Riz Parfumé', NULL, 5, 'poids'),
(55, 'Riz Long', NULL, 5, 'poids'),
(56, 'Ananas', NULL, 4, 'pièce'),
(57, 'Banane Plantin', NULL, 4, 'pièce'),
(58, 'Banane Sucrée', NULL, 4, 'pièce'),
(59, 'Litchi', NULL, 4, 'pièce'),
(60, 'Carambole', NULL, 4, 'pièce'),
(61, 'Grenade', NULL, 4, 'pièce'),
(62, 'Poulet Local (Bicyclette)', NULL, 8, 'poids'),
(63, 'Canard', NULL, 8, 'poids'),
(64, 'Pigeon', NULL, 8, 'pièce'),
(65, 'Oeuf de Caille', NULL, 8, 'pièce'),
(66, 'Gézier', NULL, 8, 'poids'),
(67, 'Entrecôte', NULL, 2, 'poids'),
(68, 'Bavette Aloyau', NULL, 2, 'poids'),
(69, 'Coeur de Boeuf', NULL, 2, 'poids'),
(70, 'Viande Porc Générique', NULL, 2, 'poids'),
(71, 'Côte Porc Première', NULL, 2, 'poids'),
(72, 'Côte Porc Échine', NULL, 2, 'poids'),
(73, 'Pied Boeuf', NULL, 2, 'poids'),
(74, 'Pied Porc', NULL, 2, 'poids'),
(75, 'Tête Boeuf', NULL, 2, 'poids'),
(76, 'Tête Porc', NULL, 2, 'poids'),
(77, 'Langue Boeuf', NULL, 2, 'poids'),
(78, 'Langue Porc', NULL, 2, 'poids'),
(79, 'Carpe', NULL, 3, 'poids'),
(80, 'Dorade', NULL, 3, 'poids'),
(81, 'Silivie', NULL, 3, 'poids'),
(82, 'Cilure Blanc', NULL, 3, 'poids'),
(83, 'Cilure Noir', NULL, 3, 'poids'),
(84, 'Capitaine', NULL, 3, 'poids'),
(85, 'Crevette', NULL, 3, 'poids'),
(86, 'Gambas', NULL, 3, 'poids'),
(87, 'Langouste', NULL, 3, 'poids'),
(88, 'Langoustine', NULL, 3, 'poids'),
(89, 'Petite Crevette', NULL, 3, 'poids'),
(90, 'Calamar', NULL, 3, 'poids'),
(91, 'Poivron', NULL, 1, 'poids'),
(92, 'Aubergine', NULL, 1, 'poids'),
(93, 'Betterave', NULL, 1, 'poids'),
(94, 'Navet', NULL, 1, 'poids'),
(95, 'Mais frais', NULL, 1, 'poids'),
(96, 'agouti', NULL, 2, 'poids'),
(97, 'Poulet cher', NULL, 8, 'poids');

-- --------------------------------------------------------

--
-- Structure de la table `SESSION`
--

CREATE TABLE `SESSION` (
  `id_key` varchar(255) NOT NULL,
  `key_value` varchar(255) NOT NULL,
  `id_user` int DEFAULT NULL,
  `date_expiration` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `SESSION`
--

INSERT INTO `SESSION` (`id_key`, `key_value`, `id_user`, `date_expiration`) VALUES
('01a8f1bdc595d6b520ae34578c9390cb66299941587d2bd8da8d26607251c2ea', 'temp_key', 231920, '2026-06-15'),
('0215284e0d8e0991a2e49d95fab8723a8a47f91ad35e792738310351925debc2', 'temp_key', 231920, '2026-06-15'),
('02c099e8c55a9e33eb4d429220964e594727a0c406e4fa8d26116ea43643e2a2', 'temp_key', 658002, '2026-06-15'),
('04b242fc727c166efbf4b4c7ecc6e003815dc91bf3eb0a4600ac70a5fdd23f56', 'temp_key', 1355, '2026-06-15'),
('08cf2f7ed7447835826e592708ffc8fec2266d2807cc493f94019f3dad0d99f3', 'temp_key', 231920, '2026-06-15'),
('092dfec7d85f35b5d0831ab4146739a02b357b0719a909954964bb561395f80f', 'temp_key', 231920, '2026-06-15'),
('09a737a36d9a499e5163ff527f68d677b600a40e984a97d1ca28a5558765af8d', 'temp_key', 231920, '2026-06-15'),
('1c3bdcdf5800a9b165b7b12e8519420349bb9bed48610a433ea9e026c2e9a6a2', 'temp_key', 273388, '2026-06-15'),
('2332ffe96d2ed54bab1d7c94763445c5f6518ff8fe264b4f7c4a2ee866ff8264', 'temp_key', 231920, '2026-06-15'),
('28ef0d62488c635db948db422a80fdba16ad6b62c76e3568cae84e0a5682eb80', 'temp_key', 231920, '2026-06-15'),
('2a8b82375f0e02c8afa5e4f77623c689034b555c6f6f0cf0e8da5d391ead5715', 'temp_key', 231920, '2026-06-15'),
('2aea340abbfb11eb9bba092be7b7fc6ac201dc1922d9b5b05952143ad00dc771', 'temp_key', 148675, '2026-06-15'),
('2b59e6fd2eaa70604756e72a5827319e413041d88f3db04bffa76fa6728801f1', 'temp_key', 231920, '2026-06-15'),
('2d73e2267ce04b1a669bf4cd8500b8a493329de31e3a24ae3be6ec069bb7a313', 'temp_key', 231920, '2026-06-15'),
('34a6d4100630bbb372ceda36cb72bf8fc61048b12231c98794ed6a820d5b997f', 'temp_key', 231920, '2026-06-15'),
('37524a164772d34d63fe3df7905d8526cb1de29557bed7146ee17d5b67e1b57f', 'temp_key', 455161, '2026-06-15'),
('3b1a3d5fcbf01d3e6e27276a999fbd5b050df73bf321f23b7e458d6d8976ca08', 'temp_key', 231920, '2026-06-15'),
('3b39a9ba9d286177a31c6c4fc7fb58232162498923b818bce82faeedbb80e9db', 'temp_key', 231920, '2026-06-15'),
('4101c3bfc7085543250162de24414f6bafcde0d6ef71b502ed5dcff51b3b33ab', 'temp_key', 231920, '2026-06-15'),
('42029bf74dc2a6424d30520f6b6603806f4bd4a55ea9af86dc3b69fc8c8c0705', 'temp_key', 231920, '2026-06-15'),
('464d598ebb50f82b40c44cf18b2acabd9b5ddbe90b418dd01386cd4aaf80b161', 'temp_key', 231920, '2026-06-15'),
('48141f78dca97513432697ca12db7fc1086201154d97c9b53916832ef3ea0bc2', 'temp_key', 443764, '2026-06-15'),
('4b0059d64fb6738e75677a33d7c69fa42301996222d6f3b4489fe8dfbe9167ed', 'temp_key', 231920, '2026-06-15'),
('4c16a12f820c0adc8489e8101b3db7eee5075b21fed6529fd5d5a15326e741bd', 'temp_key', 40354, '2026-06-15'),
('4cb71ade544eac07fa98c327c010b93f28920d4259ba17e705bf5aeb62c47761', 'temp_key', 231920, '2026-06-15'),
('53552739fb9e9fd0bbc85a870fe0b5c137b48e49f92b8d63015ae418ad1041f1', 'temp_key', 56747, '2026-06-15'),
('5a4b989c11b5098b24d1fcec2af65893b88f6070011380240aa0a13da44edf9c', 'temp_key', 1355, '2026-06-15'),
('60362e9167d871e2ad63e0d910f3b366a9f63e5c1dddbe5cc5e81e6dd2b7f259', 'temp_key', 946017, '2026-06-15'),
('6398d139b34805662625c2f914bc806e0ff27d23bcca02f43d12191f3f8d5c74', 'temp_key', 231920, '2026-06-15'),
('6773111c7be16322168388a09b3ff4eb60ccba53288ee9d70bd8656cc876e606', 'temp_key', 222116, '2026-06-15'),
('686258086e3f99e36cd20f0902822b8fb7302809e94e0ef08294ca99232bf8ad', 'temp_key', 231920, '2026-06-15'),
('68f5d6b3335d774c1482308def4d429c6bddba3fd72b81d2f6bbb5f86996d5be', 'temp_key', 231920, '2026-06-15'),
('6ab03a4d50afdc2a4149b895283ea9a1b91e7429aaeef4a7861dd36ada4fbdb7', 'temp_key', 231920, '2026-06-15'),
('6e9f509d6303a28c4488fa2d66e3888a9acdefe228590547055f2a5619a1a835', 'temp_key', 231920, '2026-06-15'),
('715e2b51c22e09faf0f3e299f8d1ed9ec7ba75255f38e231208cfc3234985c44', 'temp_key', 231920, '2026-06-15'),
('7370a9a2def0ba301d0725ebd89443a836e3b4b1d187b28717187fd33634f6ef', 'temp_key', 231920, '2026-06-15'),
('7600c8d5563d943993d8576d04001800245ac648a0424dd77a7d6a22cb540a6c', 'temp_key', 789104, '2026-06-15'),
('7637972fc85de08d3b6577cf797f26746f3fdf03974e060cd9bac5e1d0f4b8b6', 'temp_key', 231920, '2026-06-15'),
('7693e6e55c03fb978bed5c4de3ceb0c48e954c3d2eb6cb0bb7ad4f11f5b31577', 'temp_key', 231920, '2026-06-15'),
('77e2c887b3848fa221b8a906cc98d775d60ba181b365fa4ac613c408f659df14', 'temp_key', 231920, '2026-06-15'),
('7eac57e8fe4782e46a303f550803d85ad68b41d3b95677df1ac2168c90f80975', 'temp_key', 372844, '2026-06-15'),
('7ec1036c3406845bd22ae1b635aee23183cc7af5ab7a1e7c0d81a236936865bb', 'temp_key', 231920, '2026-06-15'),
('7f432bce2978591f7590bacff1808de954872c55103ed8c0f2034b64f6475aea', 'temp_key', 231920, '2026-06-15'),
('827e44e4e72a9064f6fd4569da4e19fc27477b7c75fa550a4099eb780f023293', 'temp_key', 231920, '2026-06-15'),
('82ea45185c798b5d6af27ce17f0efeaf7f9406e5d70eed8985d7c1b3f694ad7c', 'temp_key', 231920, '2026-06-15'),
('84be00d0f92585029a3d549ebbfad72d56133bbb3ddb4da185d53556036b658b', 'temp_key', 231920, '2026-06-15'),
('87ea151193e406c008e8e3c1107b401f41b8a7a56cf932f2bc357c117f5c5c58', 'temp_key', 231920, '2026-06-15'),
('89387663222a3eda169649313b9a7def8d686179abc1d3425ac17d37aaaf1348', 'temp_key', 231920, '2026-06-15'),
('89c95da0c3634bc1b6b1120d69135295fbccffb72d1edac7b808b2eaa8da3a49', 'temp_key', 231920, '2026-06-15'),
('8daf7176116e6134f41061df4c6c975d9fcfdaaa00bdf4f8fea620dd8064fc67', 'temp_key', 898486, '2026-06-15'),
('8ecfc4db9a5e57240f60333556051a81a8b629fc5c43a436212e34d6281343cf', 'temp_key', 231920, '2026-06-15'),
('8f3d74514887084bc541fbb5258d53262aed7bb564f644b861532c5fc215242b', 'temp_key', 98332, '2026-06-15'),
('9378ceaad76cefa32472eaa1ee02e7fc38cfb4ca412c7d1d464ffbb5a177a873', 'temp_key', 231920, '2026-06-15'),
('9c16987013e5b8c7450f9092b701891af6a1aa45142b08313d7ae1e99b6b83a3', 'temp_key', 743842, '2026-06-15'),
('9f2d87661aaa42e222bb5a4576b699e20c046cf4ec8904b04c666ce63fd597cd', 'temp_key', 231920, '2026-06-15'),
('a00d6372cc129faaed8889081e68e19fc9f3cd88d5e8acb1bbb868a1e46bcf7c', 'temp_key', 166243, '2026-06-15'),
('a3057e03c3225d53e9fa5e4a1ec1d7530192ecea1d5c5810a6a666e66546b05f', 'temp_key', 231920, '2026-06-15'),
('a38ad55bdd785e0f97e9b21d2239baef43dec3691a2ab3f4729843768926a380', 'temp_key', 231920, '2026-06-15'),
('a6bc110e09b02dcd1c2ae0bfdd6a12e72cf4a7cc3b9ad4b9ae26b9bacb736056', 'temp_key', 231920, '2026-06-15'),
('b271c766168cf73a76ecad9596921c07f6e7e82ae01fd1e6907013d886304fed', 'temp_key', 634067, '2026-06-15'),
('bfe67d0f15b336da818f91b702c1c0c54fe8a5c647e16f6edc14655f444e9fe5', 'temp_key', 231920, '2026-06-15'),
('c00739da79413911e46b289d333bff66dd4fc324fcea7a4b91b0ae54286e54bd', 'temp_key', 231920, '2026-06-15'),
('c04331fb53087097071b3c7a5ec6555fbfcb873f891859ad3f4964ed2de5d3a6', 'temp_key', 296281, '2026-06-15'),
('c0c565f16082e5c74d77b31b6448ddea1c95338b12f288b1e7addcfd6e681b1b', 'temp_key', 231920, '2026-06-15'),
('c157a3d98f18a76efe185c8ea73d1712a434e5ebc1b5583d6ce81f290677e029', 'temp_key', 273388, '2026-06-15'),
('c183cb171d7a2e635342c3cc53fdc0ec292c34e7d4e60f99dccfd80ea37f03ce', 'temp_key', 187828, '2026-06-15'),
('c2da3f69438f2e986fcbad161b0a5a395a2ee99d0e11d809edf8591fcf3f39e3', 'temp_key', 231920, '2026-06-15'),
('c84640f218de4d3120ba7f17dcb89e7ad62e2c865bf7fca05db402808d22078c', 'temp_key', 789104, '2026-06-15'),
('c87989eda945818d4f9423026bd90448babf4adddb079c40fa1e26e05ff36a50', 'temp_key', 231920, '2026-06-15'),
('c957a41fc068b5d9a6c6b5427a1f380d543c9aba67d12176cc01a7d9563ae323', 'temp_key', 231920, '2026-06-15'),
('cd16d2e31077feba95d256947d731fc2f77f2886bc6778daaf1ede33f3e99d29', 'temp_key', 139906, '2026-06-15'),
('cef29405b9bd9dce2b18646d1dc296d629f532d359becc2393ad8796b6fd2b9a', 'temp_key', 231920, '2026-06-15'),
('d18ab8670cebcd25dd6f59a298b60cc3e44c269c59aff1bb80e0dd49d7b1e168', 'temp_key', 231920, '2026-06-15'),
('d223b9526fd800802392ed5395f2d40cc29caf88e2eca57bc4e7ba5e606923f0', 'temp_key', 231920, '2026-06-15'),
('d61884d19f03aa78479c095975d95ae17fce23cde6f6c308a2897f63ba9a5f4d', 'temp_key', 231920, '2026-06-15'),
('d78aebcd57c267888eddb1c303366cb3e14f07ff36fbd13f285a66553849f386', 'temp_key', 326857, '2026-06-15'),
('df716cb19c0069c91a8961c98adabfec8dec05f21dd9ebf983135885e22c0b87', 'temp_key', 938558, '2026-06-15'),
('ea53032352a16d9173201fbff2ad164ad0440bc95d95d739e1ec8344d44646b1', 'temp_key', 217694, '2026-06-15'),
('f3c171936ad1ed5ae0e5b4c13d85788d04103c94585d0a62064911e623831959', 'temp_key', 231920, '2026-06-15'),
('f4e114c68184256817e989cdb334435d3400fa389a51a004d335957b5d256583', 'temp_key', 478589, '2026-06-15'),
('f60524d8fb4c88567c67c943fe3185e54cbd35e1a372b8c1eef8cc2dc70bb958', 'temp_key', 261930, '2026-06-15'),
('fe2b6c98879de1e3763e91e4ca863095916fd285d833874aa2a5895f7a8e3a9a', 'temp_key', 231920, '2026-06-15');

-- --------------------------------------------------------

--
-- Structure de la table `STATUS_COMMANDE`
--

CREATE TABLE `STATUS_COMMANDE` (
  `id_status` int NOT NULL,
  `nom_status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `STATUS_COMMANDE`
--

INSERT INTO `STATUS_COMMANDE` (`id_status`, `nom_status`) VALUES
(1, 'Livraison en cours'),
(2, 'Livré'),
(3, 'En cours de préparation');

-- --------------------------------------------------------

--
-- Structure de la table `TEMP_CODE_RESET_PSSWD`
--

CREATE TABLE `TEMP_CODE_RESET_PSSWD` (
  `id_code` int NOT NULL,
  `code_temp` varchar(255) NOT NULL,
  `id_user` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `USER_KEY`
--

CREATE TABLE `USER_KEY` (
  `id_key` varchar(255) DEFAULT NULL,
  `id_user` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `ADRESSE`
--
ALTER TABLE `ADRESSE`
  ADD PRIMARY KEY (`id_addresse`);

--
-- Index pour la table `CATEGORIE`
--
ALTER TABLE `CATEGORIE`
  ADD PRIMARY KEY (`id_categorie`);

--
-- Index pour la table `CLIENT`
--
ALTER TABLE `CLIENT`
  ADD PRIMARY KEY (`id_client`),
  ADD KEY `fk_orga` (`id_orga`);

--
-- Index pour la table `COMMANDE`
--
ALTER TABLE `COMMANDE`
  ADD PRIMARY KEY (`id_cmd`),
  ADD KEY `fk_fourniss` (`id_fournisseur`),
  ADD KEY `fk_coursier` (`id_coursier`),
  ADD KEY `fk_dmd` (`id_dmd`),
  ADD KEY `fk_cli` (`id_client`),
  ADD KEY `fk_status` (`id_status`);

--
-- Index pour la table `COMMANDE_PRODUIT`
--
ALTER TABLE `COMMANDE_PRODUIT`
  ADD PRIMARY KEY (`id_cmd`,`id_produit`),
  ADD KEY `fk_prod_cp` (`id_produit`);

--
-- Index pour la table `CONTENANCE`
--
ALTER TABLE `CONTENANCE`
  ADD PRIMARY KEY (`id_dmd`,`id_produit`),
  ADD KEY `fk_prod` (`id_produit`);

--
-- Index pour la table `COURSIER`
--
ALTER TABLE `COURSIER`
  ADD PRIMARY KEY (`id_coursier`);

--
-- Index pour la table `FOURNIR`
--
ALTER TABLE `FOURNIR`
  ADD PRIMARY KEY (`id_fournisseur`,`id_produit`),
  ADD KEY `fk_prod_fourni` (`id_produit`);

--
-- Index pour la table `FOURNISSEUR`
--
ALTER TABLE `FOURNISSEUR`
  ADD PRIMARY KEY (`id_fournisseur`);

--
-- Index pour la table `HUB`
--
ALTER TABLE `HUB`
  ADD PRIMARY KEY (`id_dmd`),
  ADD KEY `fk_cli_commande` (`id_client`);

--
-- Index pour la table `LOG_USER`
--
ALTER TABLE `LOG_USER`
  ADD PRIMARY KEY (`id_log`);

--
-- Index pour la table `ORGANISATION`
--
ALTER TABLE `ORGANISATION`
  ADD PRIMARY KEY (`id_orga`);

--
-- Index pour la table `PAYEMENT`
--
ALTER TABLE `PAYEMENT`
  ADD KEY `fk_cmd_pay` (`id_cmd`);

--
-- Index pour la table `PRIX`
--
ALTER TABLE `PRIX`
  ADD PRIMARY KEY (`id_prix`);

--
-- Index pour la table `PRODUIT`
--
ALTER TABLE `PRODUIT`
  ADD PRIMARY KEY (`id_produit`),
  ADD KEY `fk_cate` (`id_categorie`);

--
-- Index pour la table `SESSION`
--
ALTER TABLE `SESSION`
  ADD PRIMARY KEY (`id_key`);

--
-- Index pour la table `STATUS_COMMANDE`
--
ALTER TABLE `STATUS_COMMANDE`
  ADD PRIMARY KEY (`id_status`);

--
-- Index pour la table `TEMP_CODE_RESET_PSSWD`
--
ALTER TABLE `TEMP_CODE_RESET_PSSWD`
  ADD PRIMARY KEY (`id_code`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `CLIENT`
--
ALTER TABLE `CLIENT`
  ADD CONSTRAINT `fk_orga` FOREIGN KEY (`id_orga`) REFERENCES `ORGANISATION` (`id_orga`);

--
-- Contraintes pour la table `COMMANDE`
--
ALTER TABLE `COMMANDE`
  ADD CONSTRAINT `fk_cli` FOREIGN KEY (`id_client`) REFERENCES `CLIENT` (`id_client`),
  ADD CONSTRAINT `fk_coursier` FOREIGN KEY (`id_coursier`) REFERENCES `COURSIER` (`id_coursier`),
  ADD CONSTRAINT `fk_dmd` FOREIGN KEY (`id_dmd`) REFERENCES `HUB` (`id_dmd`),
  ADD CONSTRAINT `fk_fourniss` FOREIGN KEY (`id_fournisseur`) REFERENCES `FOURNISSEUR` (`id_fournisseur`),
  ADD CONSTRAINT `fk_status` FOREIGN KEY (`id_status`) REFERENCES `STATUS_COMMANDE` (`id_status`);

--
-- Contraintes pour la table `COMMANDE_PRODUIT`
--
ALTER TABLE `COMMANDE_PRODUIT`
  ADD CONSTRAINT `fk_cmd` FOREIGN KEY (`id_cmd`) REFERENCES `COMMANDE` (`id_cmd`),
  ADD CONSTRAINT `fk_prod_cp` FOREIGN KEY (`id_produit`) REFERENCES `PRODUIT` (`id_produit`);

--
-- Contraintes pour la table `CONTENANCE`
--
ALTER TABLE `CONTENANCE`
  ADD CONSTRAINT `fk_dmd_cont` FOREIGN KEY (`id_dmd`) REFERENCES `HUB` (`id_dmd`),
  ADD CONSTRAINT `fk_prod` FOREIGN KEY (`id_produit`) REFERENCES `PRODUIT` (`id_produit`);

--
-- Contraintes pour la table `FOURNIR`
--
ALTER TABLE `FOURNIR`
  ADD CONSTRAINT `fk_fourni` FOREIGN KEY (`id_fournisseur`) REFERENCES `FOURNISSEUR` (`id_fournisseur`),
  ADD CONSTRAINT `fk_prod_fourni` FOREIGN KEY (`id_produit`) REFERENCES `PRODUIT` (`id_produit`);

--
-- Contraintes pour la table `HUB`
--
ALTER TABLE `HUB`
  ADD CONSTRAINT `fk_cli_commande` FOREIGN KEY (`id_client`) REFERENCES `CLIENT` (`id_client`);

--
-- Contraintes pour la table `PAYEMENT`
--
ALTER TABLE `PAYEMENT`
  ADD CONSTRAINT `fk_cmd_pay` FOREIGN KEY (`id_cmd`) REFERENCES `COMMANDE` (`id_cmd`);

--
-- Contraintes pour la table `PRODUIT`
--
ALTER TABLE `PRODUIT`
  ADD CONSTRAINT `fk_cate` FOREIGN KEY (`id_categorie`) REFERENCES `CATEGORIE` (`id_categorie`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
