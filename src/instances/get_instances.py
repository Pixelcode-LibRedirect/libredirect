# Note: Run this script from the root of the repo

import requests
import json
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import re
from colorama import Fore, Back, Style
from urllib.parse import urlparse
import socket
import subprocess

mightyList = {}


def filterLastSlash(urlList):
    tmp = []
    for i in urlList:
        if i.endswith('/'):
            tmp.append(i[:-1])
            print(Fore.YELLOW + "Fixed " + Style.RESET_ALL + i)
        else:
            tmp.append(i)
    return tmp


def ip2bin(ip): return "".join(
    map(
        str,
        [
            "{0:08b}".format(int(x)) for x in ip.split(".")
        ]
    )
)


def get_cloudflare_ips():
    r = requests.get('https://www.cloudflare.com/ips-v4')
    return r.text.split('\n')


cloudflare_ips = get_cloudflare_ips()


def is_cloudflare(url):
    instance_ip = None
    try:
        instance_ip = socket.gethostbyname(urlparse(url).hostname)
        if instance_ip is None:
            return False
    except:
        return False
    instance_bin = ip2bin(instance_ip)

    for cloudflare_ip_mask in cloudflare_ips:
        cloudflare_ip = cloudflare_ip_mask.split('/')[0]
        cloudflare_bin = ip2bin(cloudflare_ip)

        mask = int(cloudflare_ip_mask.split('/')[1])

        cloudflare_bin_masked = cloudflare_bin[:mask]
        instance_bin_masked = instance_bin[:mask]

        if cloudflare_bin_masked == instance_bin_masked:
            print(url + ' is ' + Fore.RED + 'cloudflare' + Style.RESET_ALL)
            return True
    return False


def is_authenticate(url):
    try:
        r = requests.get(url, timeout=5)
        if 'www-authenticate' in r.headers:
            return True
    except:
        return False
    return False


def invidious():
    r = requests.get('https://api.invidious.io/instances.json')
    rJson = json.loads(r.text)
    invidiousList = {}
    invidiousList['normal'] = []
    invidiousList['tor'] = []
    for instance in rJson:
        if instance[1]['type'] == 'https':
            invidiousList['normal'].append(instance[1]['uri'])
        elif instance[1]['type'] == 'onion':
            invidiousList['tor'].append(instance[1]['uri'])
    mightyList['invidious'] = invidiousList
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'Invidious')


def piped():
    json_object = json.dumps(mightyList, ensure_ascii=False, indent=2)
    with open('./src/instances/piped.json') as file:
        mightyList['piped'] = json.load(file)
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'Piped')


def proxitok():
    r = requests.get(
        'https://raw.githubusercontent.com/wiki/pablouser1/ProxiTok/Public-instances.md')

    tmp = re.findall(
        r"\| \[.*\]\(([-a-zA-Z0-9@:%_\+.~#?&//=]{2,}\.[a-z]{2,}\b(?:\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?)\)*\|*[A-Z]{0,}.*\|.*\|", r.text)
    proxiTokList = {}
    proxiTokList['normal'] = []
    proxiTokList['tor'] = []
    for item in tmp:
        proxiTokList['normal'].append(item)
    mightyList['proxiTok'] = proxiTokList
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'ProxiTok')


def send():
    r = requests.get(
        'https://gitlab.com/timvisee/send-instances/-/raw/master/README.md')
    tmp = re.findall(
        r"- ([-a-zA-Z0-9@:%_\+.~#?&//=]{2,}\.[a-z0-9]{2,}\b(?:\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?)\)*\|*[A-Z]{0,}", r.text)
    sendList = {}
    sendList['normal'] = []
    sendList['tor'] = []
    for item in tmp:
        sendList['normal'].append(item)
    mightyList['send'] = sendList
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'Send')


def nitter():
    r = requests.get('https://github.com/zedeus/nitter/wiki/Instances')
    soup = BeautifulSoup(r.text, 'html.parser')
    markdownBody = soup.find(class_='markdown-body')
    tables = markdownBody.find_all('table')
    tables.pop(3)
    tables.pop(3)
    nitterList = {}
    nitterList['normal'] = []
    nitterList['tor'] = []
    for table in tables:
        tbody = table.find('tbody')
        trs = tbody.find_all('tr')
        for tr in trs:
            td = tr.find('td')
            a = td.find('a')
            url = a.contents[0]
            if url.endswith('.onion'):
                url = 'http://' + url
                nitterList['tor'].append(url)
            else:
                url = 'https://' + url
                nitterList['normal'].append(url)
    mightyList['nitter'] = nitterList
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'Nitter')


def bibliogram():
    r = requests.get('https://bibliogram.pussthecat.org/api/instances')
    rJson = json.loads(r.text)
    bibliogramList = {}
    bibliogramList['normal'] = []
    bibliogramList['tor'] = []
    for item in rJson['data']:
        bibliogramList['normal'].append(item['address'])
    mightyList['bibliogram'] = bibliogramList
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'Bibliogram')


def libreddit():
    r = requests.get(
        'https://raw.githubusercontent.com/spikecodes/libreddit/master/README.md')
    libredditList = {}
    libredditList['normal'] = []
    libredditList['tor'] = []

    tmp = re.findall(
        r"\| \[.*\]\(([-a-zA-Z0-9@:%_\+.~#?&//=]{2,}\.[a-z]{2,}\b(?:\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?)\)*\|*[A-Z]{0,}.*\|.*\|", r.text)

    tmp = filterLastSlash(tmp)

    for item in tmp:
        if item.endswith('.onion'):
            libredditList['tor'].append(item)
        else:
            libredditList['normal'].append(item)
    mightyList['libreddit'] = libredditList
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'LibReddit')


def teddit():
    r = requests.get(
        'https://codeberg.org/teddit/teddit/raw/branch/main/instances.json')
    rJson = json.loads(r.text)
    tedditList = {}
    tedditList['normal'] = []
    tedditList['tor'] = []
    for item in rJson:
        url = item['url']
        if url != '':
            tedditList['normal'].append(url)
        if 'onion' in item:
            onion = item['onion']
            if onion != '':
                tedditList['tor'].append(onion)

    mightyList['teddit'] = tedditList
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'Teddit')


def wikiless():
    r = requests.get('https://wikiless.org/instances.json')
    rJson = json.loads(r.text)
    wikilessList = {}
    wikilessList['normal'] = []
    wikilessList['tor'] = []
    wikilessList['i2p'] = []
    for item in rJson:
        if item.endswith('.onion'):
            wikilessList['tor'].append('http://' + item)
        elif item.endswith('.i2p'):
            wikilessList['i2p'].append('http://' + item)
        else:
            wikilessList['normal'].append('https://' + item)
    mightyList['wikiless'] = wikilessList
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'Wikiless')


def scribe():
    r = requests.get(
        'https://git.sr.ht/~edwardloveall/scribe/blob/main/docs/instances.json')
    rJson = json.loads(r.text)
    scribeList = {}
    scribeList['normal'] = []
    scribeList['tor'] = []
    for item in rJson:
        scribeList['normal'].append(item)
    mightyList['scribe'] = scribeList
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'Scribe')


def simplytranslate():
    r = requests.get('https://simple-web.org/instances/simplytranslate')
    simplyTranslateList = {}
    simplyTranslateList['normal'] = []
    for item in r.text.strip().split('\n'):
        simplyTranslateList['normal'].append('https://' + item)

    r = requests.get('https://simple-web.org/instances/simplytranslate_onion')
    simplyTranslateList['tor'] = []
    for item in r.text.strip().split('\n'):
        simplyTranslateList['tor'].append('http://' + item)

    mightyList['simplyTranslate'] = simplyTranslateList
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'SimplyTranslate')


def linvgatranslate():
    r = requests.get(
        'https://raw.githubusercontent.com/TheDavidDelta/lingva-translate/main/instances.json')
    rJson = json.loads(r.text)
    lingvaList = {}
    lingvaList['normal'] = []
    lingvaList['tor'] = []
    for item in rJson:
        lingvaList['normal'].append(item)
    mightyList['lingva'] = lingvaList
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'LinvgaTranslate')


def searx_searxng():
    r = requests.get('https://searx.space/data/instances.json')
    rJson = json.loads(r.text)
    searxList = {}
    searxList['tor'] = []
    searxList['i2p'] = []
    searxList['normal'] = []
    searxngList = {}
    searxngList['tor'] = []
    searxngList['i2p'] = []
    searxngList['normal'] = []
    for item in rJson['instances']:
        if item[:-1].endswith('.onion'):
            if (rJson['instances'][item].get('generator') == 'searxng'):
                searxngList['tor'].append(item[:-1])
            else:
                searxList['tor'].append(item[:-1])
        elif item[:-1].endswith('.i2p'):
            if (rJson['instances'][item].get('generator') == 'searxng'):
                searxngList['i2p'].append(item[:-1])
            else:
                searxList['i2p'].append(item[:-1])
        else:
            if (rJson['instances'][item].get('generator') == 'searxng'):
                searxngList['normal'].append(item[:-1])
            else:
                searxList['normal'].append(item[:-1])

    mightyList['searx'] = searxList
    mightyList['searxng'] = searxngList
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'SearX, SearXNG')


def whoogle():
    r = requests.get(
        'https://raw.githubusercontent.com/benbusby/whoogle-search/main/misc/instances.txt')
    tmpList = r.text.strip().split('\n')
    whoogleList = {}
    whoogleList['normal'] = []
    whoogleList['tor'] = []
    whoogleList['i2p'] = []
    for item in tmpList:
        if item.endswith('.onion'):
            whoogleList['tor'].append(item)
        elif item.endswith('.i2p'):
            whoogleList['i2p'].append(item)
        else:
            whoogleList['normal'].append(item)
    mightyList['whoogle'] = whoogleList
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'Whoogle')


def rimgo():
    r = requests.get(
        'https://codeberg.org/video-prize-ranch/rimgo/raw/branch/main/instances.json')
    rJson = json.loads(r.text)
    rimgoList = {}
    rimgoList['normal'] = []
    rimgoList['tor'] = []
    rimgoList['i2p'] = []
    for item in rJson:
        if item.endswith('.onion'):
            rimgoList['tor'].append('http://' + item)
        elif item.endswith('.i2p'):
            rimgoList['i2p'].append('http://' + item)
        else:
            rimgoList['normal'].append('https://' + item)
    mightyList['rimgo'] = rimgoList
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'Rimgo')


def peertube():
    r = requests.get(
        'https://instances.joinpeertube.org/api/v1/instances?start=0&count=1045&sort=-createdAt')
    rJson = json.loads(r.text)

    myList = []
    for k in rJson['data']:
        myList.append('https://'+k['host'])

    mightyList['peertube'] = myList
    print(Fore.GREEN + 'Fetched ' + Style.RESET_ALL + 'PeerTube')


def isValid(url):  # This code is contributed by avanitrachhadiya2155
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False


invidious()
piped()
proxitok()
send()
nitter()
bibliogram()
libreddit()
teddit()
wikiless()
scribe()
simplytranslate()
linvgatranslate()
searx_searxng()
whoogle()
rimgo()

blocklist = []
for k1, v1 in mightyList.items():
    if type(mightyList[k1]) is dict:
        for k2, v2 in mightyList[k1].items():
            for instance in mightyList[k1][k2]:
                if (not isValid(instance)):
                    mightyList[k1][k2].pop(instance)
                    print("removed " + instance)
                else:
                    if not instance.endswith('.onion') and not instance.endswith('.i2p') and is_cloudflare(instance):
                        blocklist.append(instance)
                    if not instance.endswith('.onion') and not instance.endswith('.i2p') and is_authenticate(instance):
                        blocklist.append(instance)

peertube()


# Writing to file
json_object = json.dumps(mightyList, ensure_ascii=False, indent=2)
with open('./src/instances/data.json', 'w') as outfile:
    outfile.write(json_object)
print(Fore.BLUE + 'wrote ' + Style.RESET_ALL + 'instances/data.json')

json_object = json.dumps(blocklist, ensure_ascii=False, indent=2)
with open('./src/instances/blocklist.json', 'w') as outfile:
    outfile.write(json_object)
print(Fore.BLUE + 'wrote ' + Style.RESET_ALL + 'instances/blocklist')

# print(json_object)
