import mysql.connector
import json

  
dataBase = mysql.connector.connect(
  host ="db4free.net",
  user ="komodoadmin87",
  passwd ="VcDsK1Yfcm4z6Nhb",
  database ="logibackkomododb"
)
 
cursorObject = dataBase.cursor()

print("Bienvenue Dans le console de debbug de la database")
print("Accès: Root (ou lalala)")
print("v.0.0.3")
print("[👌] Connexion à la base de données réussie")
print("\n")

while True:
  sql_commande = input("$") 
  try:
    print("______________________________________")
    print("\n")
    print("Commande: ", sql_commande)
    print("\n")
    #cursorObject.execute("SELECT  HUB.localisation_dmd, PRODUIT.nom_produit FROM HUB INNER JOIN CONTENANCE ON HUB.id_dmd = CONTENANCE.id_dmd INNER JOIN PRODUIT ON CONTENANCE.id_produit = PRODUIT.id_produit")
    #cursorObject.execute("INSERT INTO HUB(id_dmd, nom_dmd, desc_dmd, localisation_dmd, date_fin, id_client) VALUES ('6820d2695a262', 'testcommande2', 'Description dune commande','9.250705111191822;2.2698522359132767', '2025-05-21 00:00:00', 1) ")
    #cursorObject.execute("SELECT * FROM PRODUIT")
    #cursorObject.execute("INSERT INTO `COURSIER` (`id_coursier`, `nom_coursier`, `prenom_coursier`, `email_coursier`, `telephone_coursier`, `mdp_coursier`, `est_occupe`, `localisation_coursier`) VALUES (2, 's', 'f', 'd', 'te', '1234', 0, '3.4;4.5')");
    #cursorObject.execute("INSERT INTO `COURSIER` (`id_coursier`, `nom_coursier`, `prenom_coursier`, `email_coursier`, `telephone_coursier`, `mdp_coursier`, `est_occupe`, `localisation_coursier`) VALUES (3, 's', 'f', 'd', 'te', '1234', 0, '3.4;4.5')");
    #cursorObject.execute("INSERT INTO `COURSIER` (`id_coursier`, `nom_coursier`, `prenom_coursier`, `email_coursier`, `telephone_coursier`, `mdp_coursier`, `est_occupe`, `localisation_coursier`) VALUES (4, 's', 'f', 'd', 'te', '1234', 0, '3.4;4.5')");
    #
    #cursorObject.execute("INSERT INTO `FOURNISSEUR` (`id_fournisseur`, `nom_fournisseur`, `prenom_fournisseur`, `email_fournisseur`, `telephone_fournisseur`, `mdp_fournisseur`,  `localisation_fournisseur`) VALUES(2, 'testN', 'testP', 'test@gmail.com', '0698453689', '123456', '3.8;4.9');")
    #cursorObject.execute("INSERT INTO `FOURNIR` (`id_fournisseur`, `id_produit`, `prix_produit_fourni`) VALUES(2, 9, 0.00);")
    #cursorObject.execute("SELECT * FROM COMMANDE")
    #cursorObject.execute("UPDATE COURSIER SET est_occupe = true WHERE est_occupe IS FALSE")
    if sql_commande == "exit":
      break

    if sql_commande == "multiple" or sql_commande == "m":
      comm = ""
      while sql_commande != "/":
        comm += sql_commande + "\n"
        sql_commande = input("(multiple ligne /) $")
      cursorObject.execute(comm)

    cursorObject.execute(sql_commande)
    
    for x in cursorObject:
        print(x)  
  except Exception as e:
    print(e)

dataBase.close()
