#!/usr/bin/env python

import urllib2, json, string, time
import db

def crawl_page(url_base, after):
    url = url_base + after
    print "now crawling " + url

    u = urllib2.urlopen(url)
    data = json.load(u)
    u.close()
    after = data["data"]["after"]
    links = data["data"]["children"]
    return after, links

def write_link(v):
        url = v['url']
        # only store links to acutal images (vs. html pages framing images)
        if url.endswith(".jpg") or url.endswith(".png") or url.endswith(".gif"):
            db.query("""
                INSERT IGNORE INTO reddit (domain, subreddit, id, author, score, thumbnail, permalink, url, title)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                             (v['domain'],
                              v['subreddit'],
                              v['id'],
                              v['author'],
                              v['score'],
                              v['thumbnail'],
                              v['permalink'],
                              v['url'],
                              v['title']))
        else:
            print "ignoring url " + url
    
def main():
    start_num = db.query_value("""SELECT count(*) FROM reddit""")
    print "%s existing links, starting crawl" % (start_num)
    after = ""
    image_urlbase = "http://www.reddit.com/search.json?q=site%3A{i.imgur.com}&sort=new&restrict_sr=on&limit=100&after="
    while after != None:
        after, links = crawl_page(image_urlbase, after)
        for link in links:
            write_link(link["data"])
        # sleep 2 seconds as per Reddit's crawling TOS
        time.sleep(2)
    end_num = db.query_value("""SELECT count(*) FROM reddit""")
    print "added %s links" % (end_num - start_num)


    
if __name__ == "__main__":
    main()

