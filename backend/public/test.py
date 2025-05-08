import mysql.connector

 
# importing required libraries
import mysql.connector
  
dataBase = mysql.connector.connect(
  host ="db4free.net",
  user ="komodoadmin87",
  passwd ="VcDsK1Yfcm4z6Nhb",
  database ="logibackkomododb"
)
 
# preparing a cursor object
cursorObject = dataBase.cursor()
 
# creating database
#cursorObject.execute("SELECT  HUB.localisation_dmd, PRODUIT.nom_produit FROM HUB INNER JOIN CONTENANCE ON HUB.id_dmd = CONTENANCE.id_dmd INNER JOIN PRODUIT ON CONTENANCE.id_produit = PRODUIT.id_produit")
cursorObject.execute("SELECT * FROM HUB ")
for x in cursorObject:
    print(x)  

dataBase.close()
