import aiohttp
import asyncio
import time
import random
import re
from bs4 import BeautifulSoup
import urllib


async def get_domain_name(url):
    base = await get_base_url(url)
    name = re.findall(r'[\w|\-]+', base)
    output = ''
    len_name = len(name)

    if len_name > 0:  # if there are any results
        if name[len_name-1] == 'uk':
            output = name[len_name-3]
        else:
            output = name[len_name-2]
    return output


async def get_base_url(input_url):
    base_url = input_url
    # Return if the url is none
    if (input_url == None):
        return ''
        print('Url is None')
    base_urls = re.findall(r'\w{1,7}://[^/]*', input_url)
    if (len(base_urls) > 0):
        return base_urls[0]
    print("No base url found for: ", input_url)
    return ''


async def get_links(url):
    base_url = ''
    r = ''
    try:
        print("fetching...")
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers={'User-Agent': 'Mozilla/5.0'}) as response:
                r = await response.text()
        print("done.")
    except Exception as e:
        print(e)
    soup = BeautifulSoup(r, 'lxml')

    links = []

    for link in soup.find_all('a'):
        link_url = link.get('href')

        if (link_url == '#' or link_url == None or link_url == ''):
            continue
        elif (link_url[:1] == '/'):
            if (base_url == ''):
                base_url = await get_base_url(url)

            links.append(base_url + link_url)
            # print('Appending: ', base_url+link_url)

        elif (link_url[:1] == 'h'):
            links.append(link_url)
            # print('Appending: ', link_url)

        else:
            pass
            #print('Url not processed: ', link_url)

    return links


# ==================================================================================

def find_links(number_of_links, starting_url):

    t0 = time.time()

    queue = set()
    crawled = set()
    banned = set()

    max_visits_per_site = 10
    visited_sites = {}
    links_found = []

    queue.add(starting_url)

    async def crawl():
        while len(links_found) < number_of_links:
            current_site_url = random.sample(queue, 1)[0]
            queue.remove(current_site_url)
            current_site_name = await get_domain_name(current_site_url)

            if current_site_url in crawled or current_site_name in banned:
                continue  # Avoid crawling the same site twice

            new_links = await get_links(current_site_url)
            queue.update(new_links)

            for link_url in new_links:
                linked_site_name = get_domain_name(link_url)

                if linked_site_name == current_site_name:
                    continue  # Skip internal links for efficiency

                else:
                    item = (current_site_name, linked_site_name, current_site_url, link_url)
                    links_found.append(item)

            if current_site_name not in visited_sites:
                visited_sites[current_site_name] = 1
            else:
                visited_sites[current_site_name] += 1
                if visited_sites[current_site_name] >= max_visits_per_site:
                    banned.add(current_site_name)
            print(visited_sites)
            crawled.add(current_site_url)
            print(
                '\t {} links found {} sites crawled and {} items in queue\t\t\t\tcrawled:  {}'.format(len(links_found),
                                                                                                      len(crawled),
                                                                                                      len(queue),
                                                                                                      current_site_url))

    loop = asyncio.get_event_loop()
    loop.run_until_complete(crawl())
    loop.close()

    minutes_taken = (time.time() - t0) / 60.0
    links_per_minute = len(links_found) / minutes_taken
    print('took {} minutes and {} links found, esulting in {} links per minute'.format(minutes_taken, len(links_found),
                                                                                      links_per_minute))

    return links_found



    async def fetch(session, url):
        async with session.get(url) as response:
            return await response.text()


    async def main():
        async with aiohttp.ClientSession() as session:
            html = await fetch(session, 'http://python.org')
            print("html retrieved")


    print("Running until complete")
    loop.run_until_complete(main())
    print("done")