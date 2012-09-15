#!/usr/bin/env python

import urllib2, json, string, time
import db
from mysolr import Solr

    
def main():
    solr = Solr('http://localhost:8983/solr/')

    links = db.query("""select sequence, author, subreddit, thumbnail, permalink, url, title, score, num_comments, over_18 from reddit where updated = 1 AND indexed = 0 LIMIT 50000""")

    if len(links) == 0:
        print "no links to index"
    else:
        solr.update(links, 'json', commit=False)
        solr.commit()
        
        for link in links:
            db.query("""update reddit set indexed = 1 where sequence = %s""", (link["sequence"]))
        
        print "indexed %s links" % (len(links))
    
if __name__ == "__main__":
    main()

