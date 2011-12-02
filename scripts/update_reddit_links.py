#!/usr/bin/env python

import urllib2, json, string, time
import db

NUM_LINKS = 10000 # how many links to process
MIN_AGE = 604800 # seconds in a week

def update_link(permalink, sequence):
    # record attempt
    db.query("""update reddit SET update_attempts = update_attempts + 1 WHERE sequence = %s""" % (sequence))
    success = 0
    
    # get info
    url = "<undefined>"
    try:
        url = "http://www.reddit.com%s.json" % (str(permalink))
        print "loading %s" % (url)
        u = urllib2.urlopen(url)
        data = json.load(u)
        u.close()
        data = data[0]["data"]["children"][0]["data"]
        over_18 = 0
        if data['over_18']:
            over_18 = 1
        db.query("""
            UPDATE reddit SET score = %s, created = %s, over_18 = %s, updated = 1, num_comments = %s WHERE sequence = %s""",
                         (data["score"], data["created"], over_18, data["num_comments"], sequence))
        success = 1
        
    except Exception, e:
        print "Error in loading page %s" % (url)
        
    return success

def main():
    links = db.query("""select permalink, sequence from reddit where updated = 0 AND unix_timestamp() - created > %s AND update_attempts < 3 LIMIT %s;""", [MIN_AGE, NUM_LINKS])
    success_count = 0
    for link in links:
        success_count = success_count + update_link(link["permalink"], link["sequence"])
        # sleep 2 seconds as per Reddit's crawling TOS
        time.sleep(2)
    print "successfully updated %s links out of %s" % (success_count, len(links))


    
if __name__ == "__main__":
    main()

