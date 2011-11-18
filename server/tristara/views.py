from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response
from django.template import RequestContext
import reddit_images, json

def static(request, template):
    return render_to_response(template, {}, context_instance=RequestContext(request))
    
def ajax_fun_pics(request):
    imgList = reddit_images.get_images(limit=1000)
    return HttpResponse(json.dumps(imgList, default=json_handler),
                        mimetype='application/json') 

def json_handler(obj):
    if hasattr(obj, 'isoformat'):
        return obj.isoformat()
    else:
        raise TypeError, 'Object of type %s with value of %s is not JSON serializable' % (type(Obj), repr(Obj))
    