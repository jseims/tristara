from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
import random
import localsettings

def static(request, template):
    return render_to_response(template, {}, context_instance=RequestContext(request))
    
def fun_pics(request):
    channel = request.GET.get('channel', None)
    if channel == None:
        channel = random.randint(1, 2147483648)
    return render_to_response("fun_pics.html", {"channel" : channel}, context_instance=RequestContext(request))

def reddit_blaster(request):
    subreddits = request.GET.get('srl', 'default')
    subreddit = request.GET.get('sr', 'all')
    subreddit_info = localsettings.get_subreddit_info(subreddits)
    return render_to_response("reddit_blaster.html", {"subreddit_info" : subreddit_info, "start_subreddit" : subreddit}, context_instance=RequestContext(request))
    