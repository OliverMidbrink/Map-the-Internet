import asyncio
import time
import aiohttp
import urllib
from bs4 import BeautifulSoup
import tools
import ssl
import managedb

urls = ['https://hobbyking.com/',
        'https://cn.nytimes.com/',
        'https://google.com/',
        'https://youtube.com',
        'https://vimeo.com',
        'https://facebook.com',
        'https://pythonprogramming.net',
        'https://thenewboston.com',
        'https://wix.com',
        'https://www.linkedin.com/',
        'https://wikipedia.org',
        'https://en.wikipedia.org/wiki/Altered_state_of_consciousness',
        'https://en.wikipedia.org/wiki/Altered_state_of_consciousness2345',
        'https://en.wikipedia.org/wiki/Altered_state_of_consciousness647',
        ]


def return_many():
    t0 = time.time()

    htmls = []

    async def get_html(url):
        async with aiohttp.ClientSession() as session:
            async with session.get(url, ssl = ssl._create_unverified_context(), headers={'User-Agent': 'Mozilla/5.0'}) as response:
                try:
                    print('{} has started...'.format(url))

                    html = await response.text()
                    return html

                    print('{} done.'.format(url))
                except UnicodeDecodeError:
                    print('url run sync: {}'.format(url))
                    res = urllib.request.urlopen(urllib.request.Request(url, ssl = ssl._create_unverified_context(), headers={'User-Agent': 'Mozilla/5.0'})).read()
                    return res
        return ''

    async def get_urls():
        tasks = []
        for url in urls:
            tasks.append(asyncio.ensure_future(get_html(url)))
        await asyncio.wait(tasks)

    loop = asyncio.get_event_loop()
    loop.run_until_complete(get_urls())

    print('Took {} seconds async'.format(time.time()-t0))

    t0 = time.time()
    for url in urls:
        try:
            print('opening: {}'.format(url))
            r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read()
        except Exception as e:
            print('Error opening: ', url)
            print(e)

    print('Took {} seconds sync'.format(time.time()-t0))



def test(conn):
    pass
