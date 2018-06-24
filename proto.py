import asyncio
import time
import aiohttp
import urllib
from bs4 import BeautifulSoup
import tools
import ssl

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
        'https://en.wikipedia.org/wiki/Altered_state_of_consciousness'
        ]


def return_many():
    t0 = time.time()

    htmls = []

    async def get_url(url):
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers={'User-Agent': 'Mozilla/5.0'}, ssl=False) as response:
                try:
                    print('{} has started...'.format(url))

                    html = await response.text()
                    htmls.append(html)

                    print('{} done.'.format(url))
                except UnicodeDecodeError:
                    print('url run sync: {}'.format(url))
                    res = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), context=ssl._create_unverified_context()).read()
                    htmls.append(res)

    async def get_urls():
        tasks = []
        for url in urls:
            tasks.append(loop.create_task(get_url(url)))
        await asyncio.wait(tasks)

    loop = asyncio.get_event_loop()
    loop.run_until_complete(get_urls())

    print('Took {} seconds async'.format(time.time()-t0))

    t0 = time.time()
    for url in urls:
        try:
            print('opening: {}'.format(url))
            r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), context=ssl._create_unverified_context()).read()
        except Exception as e:
            print('Error opening: ', url)
            print(e)

    print('Took {} seconds sync'.format(time.time()-t0))
