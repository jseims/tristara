from django.db import connection, transaction, IntegrityError
from django.core.cache import cache
import db_utils

def get_recent_posts(limit = 10, timeout = 300):
    cachedPosts = cache.get('posts-' + str(limit))
    if cachedPosts != None:
        return cachedPosts
        
    # if we get here, we need to read posts, cache them, and return them
    cursor = connection.cursor()
    sql = "SELECT post_title, guid FROM wp_posts WHERE post_type = 'post' AND post_status = 'publish' ORDER BY post_date DESC LIMIT %s";
    args = [limit]

        
    #print sql % args
    cursor.execute(sql, args)
    rows = db_utils.dictfetchall(cursor)

    cache.set('posts-' + str(limit), rows, timeout)
    
    return rows
