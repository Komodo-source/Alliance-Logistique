import mysql.connector
try:
    with mysql.connector.connect(
        user="TestDBBackend_gatherlaw",
        password="a6c2b17f904747a290e01610190981732971948e",
        host="gy1ia.h.filess.io",
        database="TestDBBackend_gatherlaw",
        port=3306,
    ) as mydb:
        with mydb.cursor() as mycursor:
            pass
except mysql.connector.Error as err:
    print(f"Database error: {err}")
    raise
except Exception as ex:
    print(f"Unexpected error in upload_document_db: {ex}")
    raise