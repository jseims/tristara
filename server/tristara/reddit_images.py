from django.db import connection, transaction, IntegrityError
from django.core.cache import cache
import random, db_utils

def get_images(limit = 1000, timeout = 900):
    cachedImages = cache.get('images-' + str(limit))
    if cachedImages != None:
        return cachedImages
        
    # first get max sequence
    cursor = connection.cursor()
    cursor.execute("select max(sequence) from reddit")
    maxNum = int (cursor.fetchone()[0])
        
    # now choose a random starting point
    startNum = random.randint(0, (maxNum - limit))
    
    sql = "SELECT permalink, url, title, score, subreddit FROM reddit WHERE sequence > %s AND score > 50 AND updated=1 LIMIT %s";
    #args = [startNum, limit]
    args = [0, limit]
    
    #print sql % args
    cursor.execute(sql, args)
    rows = db_utils.dictfetchall(cursor)

    cache.set('images-' + str(limit), rows, timeout)
    
    return rows
