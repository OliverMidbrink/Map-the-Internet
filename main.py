import tools
import sqlite3
import managedb
import crawl
import crawl_async
import proto
import server
import urllib
import ssl

conn = managedb.create_connection('database.db')
managedb.create_tables(conn)

url1 = 'http://www.stackoverflow.com/questions/13880786/python-sqlite3-string-variable-in-execute'
url2 = 'https://www.wikipedia.org/'
url3 = 'https://github.com/hjnilsson/country-flags'

# managedb.get_number_of_websites(conn)
# links = crawl.find_links(20000, url4)
# managedb.insert_links(conn, links)


#managedb.print_rows(managedb.get_specific_tuples(conn, '''SELECT destinationNAME,
#                                                   destinationURL,
#                                                  COUNT(destinationNAME) AS frequency FROM links GROUP BY destinationNAME ORDER BY frequency DESC'''))
# managedb.print_rows(managedb.get_specific(conn, 'SELECT COUNT(*) FROM links'))
#proto.return_many()

#tools.print_array(crawl_async.find_links(50, url2))
#managedb.insert_links(conn, links)

server.start_server(conn)

#tools.replace_names_in_db(conn)
#managedb.print_rows(managedb.get_specific_values(conn, '''SELECT destinationNAME FROM links'''))
#proto.get_extensions()

conn.close()
