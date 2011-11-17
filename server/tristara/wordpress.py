from django.db import connection, transaction, IntegrityError
from django.core.cache import cache

def get_recent_posts(limit = 5, timeout = 300):
    cachedPosts = cache.get('posts-' + str(limit))
    if cachedPosts != None:
        return cachedPosts
        
    # if we get here, we need to read posts, cache them, and return them
    cursor = connection.cursor()
    sql = "SELECT post_title, guid FROM wp_posts WHERE post_type = 'post' AND post_status = 'publish' ORDER BY post_date DESC LIMIT %s";
    args = [limit]

        
    #print sql % args
    cursor.execute(sql, args)
    rows = cursor.fetchall()

    posts = []
    for row in rows:
        post = {}
        post['title'] = row[0]
        post['url'] = row[1]
        posts.append(post)

    cache.set('posts-' + str(limit), posts, timeout)
    
    return posts
