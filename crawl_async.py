import asyncio
import time
import aiohttp
import urllib
from bs4 import BeautifulSoup
import tools
import ssl
import managedb

tasks_left = 0
tasks_started = 0
tasks_finished = 0

async def get_html(url):
    try:
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(verify_ssl=False, limit=60)) as session:
            async with session.get(url, headers={'User-Agent': 'Mozilla/5.0'}) as response:
                try:
                    print('\t\t{} has started...'.format(url))

                    html = await response.text()
                    print('\t\t{} done.'.format(url))
                    return html

                    print('\t\t{} done.'.format(url))
                except Exception as e:
                    """try:
                        print('url run sync: {}'.format(url))
                        res = urllib.request.urlopen(urllib.request.Request(url, ssl = ssl._create_unverified_context(), headers={'User-Agent': 'Mozilla/5.0'})).read()
                        print('\t\t{} done.'.format(url))
                        return res
                    except:
                        print("error with {}".format(url))"""
                    pass
    except Exception as e:
        tasks_finished
        print(e)
    return ''


async def crawl_site(conn, url):
    global tasks_started
    tasks_started += 1
    #print('\t\t\t{} is getting html...'.format(url))
    conn.cursor().execute('''DELETE from queue WHERE queueURL="{}"'''.format(url.replace('"', '')))
    html = await get_html(url)
    #print('\t\t\t{} done.'.format(url))
    if html == '':
        return

    current_site_name = tools.get_domain_name(url)
    discovered_links = tools.get_links_from_html(html, url)

    links_found = set()
    urls_found = set()

    for link_url in discovered_links:
        linked_site_name = tools.get_domain_name(link_url)

        if linked_site_name == current_site_name:
            continue  # Skip internal links for efficiency

        else:
            item = (current_site_name, linked_site_name, url, link_url)
            links_found.add(item)
            urls_found.add(link_url)

    print('{} external links found on {}'.format(len(links_found), url))

    managedb.insert_links(conn, links_found)
    managedb.add_to_queue(conn, urls_found)
    managedb.add_to_crawled(conn, [url])
    managedb.ban_site(conn, current_site_name)

    global tasks_finished
    tasks_finished += 1
    print('{} tasks running'.format(tasks_started - tasks_finished))


async def crawl_sites(conn, urls):
    tasks = []

    if len(urls) == 0:
        print('No urls. Aborting.')
        return

    for url in urls:
        tasks.append(asyncio.ensure_future(crawl_site(conn, url)))
    await asyncio.wait(tasks)


async def crawl_continuous(conn, links_to_find, loop):
    print('================== HERE ===============')
    number_of_links_at_start = managedb.get_number_of_links(conn)
    number_of_links_found = 0

    while number_of_links_found < links_to_find:
        global tasks_started
        global tasks_finished
        tasks_running = tasks_started - tasks_finished
        print(tasks_running)
        next_batch = managedb.get_batch(conn, 40)

        if tasks_running < 20:
            loop.create_task(crawl_sites(conn, next_batch))

        number_of_links_found = managedb.get_number_of_links(conn) - number_of_links_at_start
        print('{} links has been found'.format(number_of_links_found))

        if managedb.get_specific_values(conn, '''SELECT COUNT(*) FROM queue''')[0] == 0:
            print('Queue was emptied... Aborting.')
            break


def crawl_async(conn, links_to_find, start_array):
    loop = asyncio.get_event_loop()
    loop.run_until_complete(crawl_sites(conn, start_array))
    loop.create_task(crawl_continuous(conn, links_to_find, loop))
    loop.run_forever()


def crawl_batch(conn, number_of_sites_to_crawl):
    loop = asyncio.get_event_loop()
    next_batch = managedb.get_batch(conn, number_of_sites_to_crawl)

    loop.run_until_complete(crawl_sites(conn, next_batch))



