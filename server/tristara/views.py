from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
import random

def static(request, template):
    return render_to_response(template, {}, context_instance=RequestContext(request))
    
def fun_pics(request):
    channel = request.GET.get('channel', None)
    if channel == None:
        channel = random.randint(1, 2147483648)
    return render_to_response("fun_pics.html", {"channel" : channel}, context_instance=RequestContext(request))
