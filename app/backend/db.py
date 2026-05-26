import pymysql

def get_db():
    conn = pymysql.connect(
        host='localhost',
        port=3306,
        user='root',
        password='',        # XAMPP default is no password
        database='hr_erp',
        cursorclass=pymysql.cursors.DictCursor  # returns rows as dicts instead of tuples
    )
    return conn