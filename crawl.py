import tools
import managedb
import time
import random


def find_websites(number_of_websites, starting_url, conn):
    n_sites_found = 0
    sites_found = set()
    urls_found = set()
    crawled = set()
    queue = set()
    queue.add(starting_url)

    sites_at_start = managedb.get_number_of_websites(conn)

    while n_sites_found < number_of_websites:
        next_in_queue = queue.pop()

        if next_in_queue not in crawled:
            new_urls, names = tools.get_websites(next_in_queue)
            rows = []
            for i in range(len(new_urls)):
                insert = (new_urls[i], names[i])
                rows.append(insert)
            managedb.add_websites(conn, rows)
            crawled.add(next_in_queue)

            urls_found.update(new_urls)
            sites_found.update(names)
            queue.update(new_urls)

            n_sites_found = managedb.get_number_of_websites(conn) - sites_at_start
            print('{} site(s) found and {} sites crawled and {} sites in queue'.format(n_sites_found, len(crawled),
                                                                                       len(queue)))

    return list(sites_found)


def find_links(n_links, starting_url):
    t0 = time.time()
    max_crawls_per_site = 10

    links_found = []

    queue = set() # db
    crawled = set() # db
    banned = set() # memory

    visited_sites = {} # db

    queue.add(starting_url)

    while len(links_found) < n_links:
        current_site_url = random.sample(queue, 1)[0]
        queue.remove(current_site_url)
        current_site_name = tools.get_domain_name(current_site_url)

        if current_site_url in crawled or current_site_name in banned:
            continue  # Avoid crawling the same site twice

        new_links = tools.get_links(current_site_url)
        queue.update(new_links)

        for link_url in new_links:
            linked_site_name = tools.get_domain_name(link_url)

            if linked_site_name == current_site_name:
                continue  # Skip internal links for efficiency

            else:
                item = (current_site_name, linked_site_name, current_site_url, link_url)
                links_found.append(item)

        if current_site_name not in visited_sites:
            visited_sites[current_site_name] = 1
        else:
            visited_sites[current_site_name] += 1
            if visited_sites[current_site_name] >= max_crawls_per_site:
                banned.add(current_site_name)
        print(visited_sites)
        crawled.add(current_site_url)
        print('\t {} links found {} sites crawled and {} items in queue\t\t\t\tcrawled:  {}'.format(len(links_found),
                                                                                                    len(crawled),
                                                                                                    len(queue),
                                                                                                    current_site_url))

    minutes_taken = (time.time() - t0) / 60.0
    links_per_minute = len(links_found) / minutes_taken
    print('took {} minutes and {} links found, esulting in {} links per minute'.format(minutes_taken, len(links_found),
                                                                                       links_per_minute))
    return links_found
