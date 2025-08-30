import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
from flask import g

load_dotenv()

def get_db_connection():
    if 'db_conn' not in g or not g.get('db_conn') or not g.db_conn.is_connected():
        try:
            print("🔄 Database connecting...")
            g.db_conn = mysql.connector.connect(
                host=os.getenv('HOST'),
                user=os.getenv('DB_USER'),
                password=os.getenv('PASSWORD'),
                database=os.getenv('DB'),
                port=int(os.getenv('PORT')),
                raise_on_warnings=True
            )
            print("Db connected")
        except Error as e:
            print(f"❌ Error connecting to MySQL: {e}")
            return None
    return g.db_conn


def close_db_connection(exception=None):
    db_conn = g.pop('db_conn', None)
    if db_conn is not None and db_conn.is_connected():
        db_conn.close()
        print("🔒 DB connection closed.")


def init_app(app):
    app.teardown_appcontext(close_db_connection)
