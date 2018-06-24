import sqlite3
from sqlite3 import Error


def create_connection(db_file):
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)
    return None


def create_tables(conn):
    create_link_table(conn)
    create_website_table(conn)


def create_link_table(conn):
    cursor = conn.cursor()
    cursor.execute(
            '''CREATE TABLE IF NOT EXISTS links(
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            originNAME INTEGER,
            destinationNAME INTEGER,
            originURL VARCHAR(500),
            destinationURL VARCHAR(500),
            CONSTRAINT unique_link UNIQUE (originURL, destinationURL)
            )''')
    conn.commit()


def insert_link(conn, originNAME, destinationNAME, originURL, destinationURL):
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO links(originNAME, destinationNAME, originURL, destinationURL) VALUES (?,?,?,?)''',
                   (originNAME, destinationNAME, originURL, destinationURL))
    conn.commit()


def insert_links(conn, rows):
    cursor = conn.cursor()
    cursor.executemany('''INSERT or IGNORE INTO links(originNAME, destinationNAME, originURL, destinationURL) 
            VALUES (?,?,?,?)''', rows)
    conn.commit()


def link_exists(conn, originURL, destinationURL):
    cursor = conn.cursor()
    cursor.execute('''SELECT COUNT(*) FROM links WHERE originURL=? AND destinationURL=?''', (originURL, destinationURL))
    n_rows = cursor.fetchall()[0][0]
    if (n_rows > 0):
        return True
    elif (n_rows is 0):
        return False
    return Error


def create_website_table(conn):
    cursor = conn.cursor()
    cursor.execute(
            '''CREATE TABLE IF NOT EXISTS websites (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            url VARCHAR(500),
            name VARCHAR(20) UNIQUE,
            ingoing INTEGER,
            outgoing INTEGER,
            internal INTEGER
            )''')
    conn.commit()


def add_website(conn, url, name, ingoing=0, outgoing=0, internal=0):
    cursor = conn.cursor()
    try:
        cursor.execute('''INSERT or IGNORE INTO websites(url, name, ingoing, outgoing, internal) VALUES (?,?,?,?,?)''',
                       (url, name, ingoing, outgoing, internal))
    except Error as e:
        if e != 'UNIQUE constraint failed: websites.name':
            print(e)
    conn.commit()


def add_websites(conn, rows):
    cursor = conn.cursor()
    try:
        cursor.executemany('''INSERT or IGNORE INTO websites(url, name) VALUES (?,?)''', rows)
    except Error as e:
        if e != 'UNIQUE constraint failed: websites.name':
            print(e)
    conn.commit()


def get_number_of_websites(conn):
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM websites')
    n = cursor.fetchone()[0]
    return n


def add_links():
    pass


def print_rows(all_rows):
    for row in all_rows:
        print(row)


def get_specific_tuples(conn, sql):
    cursor = conn.cursor()
    cursor.execute(sql)
    return cursor.fetchall()


def get_specific_values(conn, sql):
    cursor = conn.cursor()
    cursor.execute(sql)
    rows = cursor.fetchall()
    output = [row[0] for row in rows]
    return output


def execute(conn, sql):
    cursor = conn.cursor()
    cursor.execute(sql)


def execute_many(conn, sql):
    cursor = conn.cursor()
    cursor.execute(sql)

