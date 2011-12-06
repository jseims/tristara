#!/usr/bin/env python

import urllib2, json, string, time
import db
from mysolr import Solr

    
def main():
    solr = Solr('http://10.242.75.153:8983/solr/')

    offset = 0
    limit = 10000
    
    while True:
        links = db.query("""select sequence, author, subreddit, thumbnail, permalink, url, title, score, num_comments, over_18 from reddit where updated = 1 LIMIT %s OFFSET %s""", (limit, offset))

        if len(links) == 0:
            break
    
        solr.update(links, 'json', commit=False)
        solr.commit()
        
        print "indexed %s links" % (len(links))
        offset += limit


    
if __name__ == "__main__":
    main()

