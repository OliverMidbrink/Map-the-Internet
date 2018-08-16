import tools
import sqlite3
import managedb
import crawl
import crawl_async
import proto
import server
import urllib
import ssl
import _thread

conn = managedb.create_connection('database.db')
managedb.create_tables(conn)

urls = ['https://hobbyking.com/',
        'https://cn.nytimes.com/',
        'https://google.com/',
        'https://youtube.com',
        'https://vimeo.com',
        'https://facebook.com',
        'https://reddit.com',
        'https://thenewboston.com',
        'https://wix.com',
        'https://www.linkedin.com/',
        'https://wikipedia.org',
        ]

# managedb.get_number_of_websites(conn)
# links = crawl.find_links(20000, url4)
# managedb.insert_links(conn, links)


#managedb.print_rows(managedb.get_specific_tuples(conn, '''SELECT destinationNAME,
#                                                   destinationURL,
#                                                  COUNT(destinationNAME) AS frequency FROM links GROUP BY destinationNAME ORDER BY frequency DESC'''))
# managedb.print_rows(managedb.get_specific(conn, 'SELECT COUNT(*) FROM links'))
#proto.test(conn)

#tools.print_array(managedb.get_specific_tuples(conn, 'SELECT * from queue'))

#tools.print_array(crawl_async.find_links(50, url2))
#managedb.insert_links(conn, links)

#server.start_server(conn)
#crawl_async.crawl_async(conn, 1000, urls)

server.start_server(conn)

while True:
        print('{} links in db'.format(managedb.get_number_of_links(conn)))
        print('{} links in queue'.format(managedb.get_specific_values(conn, '''SELECT COUNT(*) FROM queue''')[0]))

#crawl_async.crawl_async(conn, 1000, urls)

        crawl_async.crawl_batch(conn, 2000)

        print('DONE. ')

#tools.replace_names_in_db(conn)
#managedb.print_rows(managedb.get_specific_values(conn, '''SELECT destinationNAME FROM links'''))
#proto.get_extensions()




conn.close()
