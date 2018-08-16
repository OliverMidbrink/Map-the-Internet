import sqlite3
from sqlite3 import Error
import tools

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
    create_crawl_tables(conn)


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


# ====================== General =========================

def print_rows(all_rows):
    count = 1
    if len(all_rows) == 0:
        print('No rows to print')
    for row in all_rows:
        count += 1
        print(count,': ',row)


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


# ===================== Experimental ================


def create_crawl_tables(conn):
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS crawled(
                                        ID INTEGER PRIMARY KEY AUTOINCREMENT,
                                        crawledURL VARCHAR(500) UNIQUE,
                                        crawledNAME VARCHAR(30)
                                        );''')

    cursor.execute('''CREATE TABLE IF NOT EXISTS queue(
                                        ID INTEGER PRIMARY KEY AUTOINCREMENT,
                                        queueURL VARCHAR(500) UNIQUE,
                                        queueNAME VARCHAR(30)
                                        );''')

    cursor.execute('''CREATE TABLE IF NOT EXISTS banned(
                                            ID INTEGER PRIMARY KEY AUTOINCREMENT,
                                            siteNAME VARCHAR(500) UNIQUE
                                            );''')
    cursor.close()
    conn.commit()


def ban_site(conn, name):
    cursor = conn.cursor()
    cursor.execute('''INSERT OR IGNORE INTO banned(siteNAME) VALUES (?)''', (name,))
    conn.commit()


def is_banned(conn, name):
    if name == None:
        return True
    if get_specific_values(conn, '''SELECT COUNT(*) from banned WHERE siteNAME="{}"'''.format(name.replace('"','')))[0] > 0:
        return True
    return False


def add_to_queue(conn, urls):
    cursor = conn.cursor()
    rows = []
    for url in urls:
        rows.append([url, tools.get_domain_name(url)])
    cursor.executemany('''INSERT or IGNORE INTO queue(queueURL, queueNAME) VALUES (?,?)''', rows)
    conn.commit()


def add_to_crawled(conn, urls):
    cursor = conn.cursor()
    rows = []
    for url in urls:
        rows.append([url, tools.get_domain_name(url)])
    cursor.executemany('''INSERT or IGNORE INTO crawled(crawledURL, crawledNAME) VALUES (?,?)''', rows)
    conn.commit()

def is_crawled(conn, url_to_check):
    if get_specific_values(conn, '''SELECT COUNT(*) from crawled WHERE crawledURL="{}"'''.format(url_to_check.replace('"','')))[0] > 0:
        return True
    return False


def get_batch(conn, batch_size):
    cursor = conn.cursor()
    queue_batch = set()

    iteration_id = 1
    iteration_size = 1000
    queue_length = get_specific_values(conn, '''SELECT COUNT(*) from queue''')[0]

    urls_iterated = 0

    while len(queue_batch) < batch_size:
        urls = get_specific_values(conn, '''SELECT queueURL from queue LIMIT {}, {}'''.format(iteration_id, iteration_size))
        for url in urls:
            urls_iterated += 1
            if len(queue_batch) > batch_size:
                break
            if url == None:
                url = ''
            if is_crawled(conn, url) == False and is_banned(conn, tools.get_domain_name(url)) == False:
                    queue_batch.add(url)
            else:
                cursor.execute('''DELETE from queue WHERE queueURL="{}"'''.format(url.replace('"','')))

        if queue_length < iteration_id + iteration_size:
            break
        iteration_id += iteration_size
    cursor.close()
    conn.commit()

    print('Queue urls found: {}  Links requested: {}  Percentage of urls iterated that were actually added to batch: {}'.format(len(queue_batch), batch_size, 100 * len(queue_batch) / urls_iterated ))
    return queue_batch


def get_number_of_links(conn):
    return get_specific_values(conn, '''SELECT COUNT(*) FROM links''')[0]

def clean_queue(conn): # Remove crawling of all banned sites and remove sites from crawled that exists in the queue
    cursor = conn.cursor()
    cursor.execute('''SELECT * FROM crawled LEFT JOIN queue''')
    cursor.close()
    conn.commit()


