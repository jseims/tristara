from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext

def static(request, template):
    return render_to_response(template, {}, context_instance=RequestContext(request))
    