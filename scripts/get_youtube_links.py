#!/usr/bin/env python

import urllib2, string, time, sys
import simplejson as json
import db

def crawl_page(url_base, start, file, entries):
    url = url_base + str(start)
    print "now crawling " + url

    u = urllib2.urlopen(url)
    data = json.load(u)
    u.close()
    for content in data["feed"]["entry"]:
        if content.has_key("content"):
            entry = {"title" : content["title"]['$t'], "url" : content["link"][0]["href"], "id" : content["media$group"]["yt$videoid"]['$t']}
            entries.append(entry)
            link = content["content"]["src"]
            file.write("%s\n" % (link))
    
def main():
    """
        Downloads YouTube data through their Feed API, and saves two files:
    
        a .txt file that lists links to the videos, to be used by the youtube-dl script
        a .json file that has "title" of the video, "url" to the YouTube page to watch this video, and "id" of the video
        
        If you pass an argument, it will perform a search on this term (i.e. "./get_youtube_links.py animals" will download "animal" links.
        
        If you don't pass an argument, it will download most viewed videos.
        
        In all cases, it won't download more than 999 links, as the YouTube API enforces that limit.
    """
        
    link_filename = "allvideos_links.txt"
    json_filename = "allvideos.json"
    url_base = "http://gdata.youtube.com/feeds/api/videos?orderby=viewCount&safeSearch=none&max-results=50&v=2&alt=json&start-index="
    if len(sys.argv) == 2:
        query = sys.argv[1];
        link_filename = '%s_links.txt' % (query)
        json_filename = '%s.json' % (query)
        url_base = "http://gdata.youtube.com/feeds/api/videos?orderby=viewCount&safeSearch=none&max-results=50&v=2&alt=json&q=%s&start-index=" % (query)

    linkfile = open(link_filename, 'w')
    jsonfile = open(json_filename, 'w')
    start = 1
    entries = []
    # now download links (999 limit)
    while start < 950:
        crawl_page(url_base, start, linkfile, entries)
        start += 50
        
    json_text = json.dumps(entries)
    jsonfile.write(json_text)
    
    print "saved links to %s, json to %s" % (link_filename, json_filename)
        
if __name__ == "__main__":
    main()

