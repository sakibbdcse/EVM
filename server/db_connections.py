import mysql.connector
from mysql.connector import Error
from flask import g
from contextlib import contextmanager
import config

def get_db_connection():
    """Returns a MySQL connection attached to Flask's application context (g)."""
    if 'db_conn' not in g or g.db_conn is None or not g.db_conn.is_connected():
        try:
            g.db_conn = mysql.connector.connect(
                host=config.DB_HOST,
                user=config.DB_USER,
                password=config.DB_PASSWORD,
                database=config.DB_NAME,
                port=config.DB_PORT,
                charset='utf8mb4',
                collation='utf8mb4_unicode_ci',
                autocommit=False,
                raise_on_warnings=True
            )
        except Error as e:
            print(f"❌ Error connecting to MySQL: {e}")
            return None
    return g.db_conn


def close_db_connection(exception=None):
    """Teardown handler to safely close database connection at end of request."""
    db_conn = g.pop('db_conn', None)
    if db_conn is not None and db_conn.is_connected():
        try:
            if exception is not None:
                db_conn.rollback()
            db_conn.close()
        except Exception:
            pass


@contextmanager
def get_db_cursor(dictionary=False, commit=False):
    """
    Context manager that yields a cursor and connection.
    Automatically rolls back on exception, commits on success if commit=True,
    and closes the cursor on exit.
    """
    conn = get_db_connection()
    if conn is None:
        raise ConnectionError("Failed to establish database connection")

    cursor = conn.cursor(dictionary=dictionary)
    try:
        yield conn, cursor
        if commit:
            conn.commit()
    except Exception as exc:
        conn.rollback()
        raise exc
    finally:
        try:
            cursor.close()
        except Exception:
            pass


def init_app(app):
    """Registers teardown handler with Flask app."""
    app.teardown_appcontext(close_db_connection)
