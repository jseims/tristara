import wordpress

def posts(request):
    # update list of recent posts from cache
    posts = wordpress.get_recent_posts()
    
    return {'posts' : posts}