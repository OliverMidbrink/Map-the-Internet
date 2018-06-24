from bs4 import BeautifulSoup
import urllib.request
import urllib.parse
import re
import requests
from PIL import Image
from io import BytesIO
import time
import managedb

def get_base_url(input_url):
    base_url = input_url
    # Return if the url is none
    if (input_url == None):
        return ''
        print('Url is None')
    base_urls = re.findall(r'\w{1,7}://[^(/|?|:)]*', input_url)
    if (len(base_urls) > 0):
        return base_urls[0]
    print("No base url found for: ", input_url)
    return ''


def get_image_urls(url):
    base_url = ''
    # Get the html using the url
    r = ''
    try:
        r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read()
    except:
        print('Error opening: ', url)

    soup = BeautifulSoup(r, "lxml")
    sources = []

    for src in soup.find_all('img'):
        img_url = src.get('src')
        if (img_url == None):  # remove urls that are "None"
            continue

        if (img_url[:1] == '/'):  # if the url is local, then add the base url in front of it
            if (base_url is ''):
                base_url = get_base_url(url)
            img_url = base_url + img_url
        sources.append(img_url)

    return sources


def is_bad_image(img):
    extrema = img.convert("L").getextrema()
    if (extrema == (0, 0) or extrema == (255, 255)):
        return True
    else:
        return False
    return True


def get_file_type(fileName):
    result = re.findall(r'\.\w{1,6}$', fileName)
    if len(result) > 0:
        return result[0]
    print(fileName, " ", result)
    return None


def get_file_name(full_path, addFileTypeIfNone=False):
    result = re.findall(r'/[^/]+\.\w{1,6}$', full_path)
    result2 = re.findall(r'/[^/]+$', full_path)
    file_name = None
    if len(result) > 0:
        file_name = result[0]
    elif len(result2) > 0:
        if addFileTypeIfNone:
            file_name = result2[0] + ".png"
        else:
            file_name = result2[0]
        print
    file_name = re.sub(r'[^\w\.]', '', file_name)
    return file_name


def get_links(url):
    base_url = ''
    r = ''
    try:
        print("fetching...")
        r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=5).read()
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
                base_url = get_base_url(url)

            links.append(base_url + link_url)
            # print('Appending: ', base_url+link_url)

        elif (link_url[:1] == 'h'):
            links.append(link_url)
            # print('Appending: ', link_url)

        else:
            pass
            #print('Url not processed: ', link_url)

    return links


def filter_images(url, imageDirectory):
    for img_url in get_image_urls(url):
        try:
            url_response = requests.get(img_url)
            img = Image.open(BytesIO(url_response.content))
            img_name = get_file_name(img_url, True)
            print(img_url, '\t', img_name)

            # Check if the image is all black, all white or all transparent. If so, then remove it.
            if img_name == None:
                continue
            elif is_bad_image(img):  # If the image is bad, remove it from the loop
                continue
            else:  # If the image is good
                img.save(imageDirectory + img_name)
        except Exception as e:
            print(e)


def get_websites(url):
    r = ''
    try:
        r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})).read()
    except Exception as e:
        print(e)
    soup = BeautifulSoup(r, 'lxml')
    links = []
    names = []

    for link in soup.find_all('a'):
        link_url = link.get('href')

        if (link_url == '#' or link_url is None or link_url == ''):
            continue
        elif (link_url[:1] == '/'):
            continue
        if (link_url[:1] == 'h' and link_url):
            links.append(get_base_url(link_url))
            names.append(get_domain_name(link_url))
        else:
            # print('Url not processed: '.format(link_url))
            pass
    return links, names


dns_suffix = ['bn','jm','world','pw','gov','guide','casa','zm','sale','hk','nz','mba','blue','pub','baby','com','kg','diy','er','network','pet','gd','aaa','bl','tube','dad','www','sic','mm','nu','ca','city','bh','you','tel','cern','safe','uk','live','eco','sk','pid','fi','arte','th','soy','ski','pf','ck','surf','one','save','land','gdn','ng','ye','camp','vip','mw','test','like','mo','luxe','men','kh','call','geo','co','eu','tax','name','ci','kz','ml','uno','tg','hn','ve','md','ma','mv','dog','web','club','mint','kn','ph','gift','tk','bb','cafe','moda','scot','love','no','wang','wine','navy','cool','ac','gn','free','ooo','uy','kr','sy','law','de','cab','ec','menu','am','read','shop','cl','fire','cd','data','ceo','cat','ms','boo','rip','life','farm','bj','game','meet','bf','pl','taxi','diet','fk','run','eat','post','case','kids','wed','ky','re','room','rio','zw','hot','book','ro','show','cu','vn','vi','eus','um','foo','gent','wiki','dot','hu','ice','tr','bi','bet','how','zone','ie','pay','ps','zero','al','cw','tc','lc','mil','tips','mu','meme','biz','nrw','mf','ee','army','gg','hiv','auto','link','bw','asia','hr','voto','open','td','ist','bar','map','mc','dev','ong','vote','ki','bom','ag','by','va','bd','info','aeg','ke','sd','gs','help','as','cv','sl','gp','mh','mx','bzh','es','abb','lgbt','deal','lr','vg','nyc','haus','sr','tech','ne','mail','rsvp','tf','xyz','ngo','lu','fun','pr','reit','cash','mp','art','skin','work','vu','site','sa','dz','pin','ug','new','win','cfd','mov','bz','gb','fm','ws','onl','ua','plus','yoga','cf','mom','eng','na','cg','bot','tj','hm','desi','esq','tl','eg','be','town','cx','si','dj','bv','edu','sx','docs','je','arab','lv','jo','tt','ax','aws','cr','id','fish','ink','it','gf','aq','rs','kid','py','tn','om','is','pa','aw','bs','chat','moe','cm','st','pk','sz','app','nato','loan','pt','mg','se','gi','do','fans','sn','sc','box','porn','ls','nf','beer','spot','ch','yt','az','jobs','tz','ly','org','cz','krd','ad','ao','mobi','qa','bq','wien','gop','dm','afl','duck','arpa','qpon','ga','lat','my','nc','kp','fund','ads','talk','bid','ruhr','sex','gt','us','fo','date','bt','at','ru','bank','fj','af','coop','fly','lt','ir','guru','blog','fr','here','km','sm','cars','an','mk','now','gl','gh','immo','ba','ae','fit','gy','golf','pink','doha','sexy','io','nr','car','ing','la','np','ni','joy','film','buzz','br','hair','song','sarl','mr','in','bio','prof','lk','ge','au','gr','sky','sj','aig','toys','top','cn','pm','nl','cam','uz','dk','sh','bg','fail','tm','mz','host','bo','eh','pg','gmbh','gu','il','care','buy','bcn','ht','tw','rest','food','fyi','lol','day','aero','gw','sv','kw','me','bike','team','rw','li','vet','bm','et','gold','net','abc','jp','ss','page','best','xxx','im','mt','pn','za','news','kim','int','su','ar','silk','cy','ltda','ren','wtf','tp','rich','pics','pro','off','iq','limo','kiwi','med','fast','frl','wf','sg','cc','lb','fan','to','pe','wow','tv','mq','sb','vc','gm','band','gq','rent','mn','moi','so','gal','ai']

def get_domain_name(url):
    base_url = get_base_url(url)
    components = re.findall(r'[^(\.|\/)]+', base_url)
    if len(components) > 0:
        for component in reversed(components):
            if component not in dns_suffix:
                if component == 'https:' or component == 'http:':
                    return 'unknown'
                return component
    else:
        print('no results')

    return None


def print_array(arr):
    i = 0
    for item in arr:
        print('{} : {}'.format(i, item))
        i += 1

def replace_names_in_db(conn):
    rows = managedb.get_specific_tuples(conn, 'SELECT * from links')
    managedb.print_rows(rows)

    new_origin_names = []
    new_destination_names = []
    new_rows = []

    for row in rows:
        origin_url = row[3]
        destination_url = row[4]

        new_origin_name = get_domain_name(origin_url)
        new_destination_name = get_domain_name(destination_url)

        new_origin_names.append(new_origin_name)
        new_destination_names.append(new_origin_name)

        new_row = (new_origin_name, new_destination_name, origin_url, destination_url)
        new_rows.append(new_row)

    if len(new_origin_names) != len(new_destination_names):
        print("error")
    else:
        print('no error')

    cursor = conn.cursor()
    cursor.execute('''DELETE FROM links''')
    cursor.executemany('''INSERT or IGNORE INTO links(originNAME, destinationNAME, originURL, destinationURL) 
                VALUES (?,?,?,?)''', new_rows)
    conn.commit()


def get_extensions():
    url = 'https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains'
    res = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=3).read()
    soup = BeautifulSoup(res, 'lxml')

    extensions = set()
    for table in soup.find_all('td'):
        for link in table.find_all('a'):
            if link.text[:1] == '.':
                if len(link.text) <= 10:
                    if len(link.text) == len(link.text.encode()):
                        extensions.add(link.text)



    for e in extensions:
        print("'{}',".format(e[1:]), end='')