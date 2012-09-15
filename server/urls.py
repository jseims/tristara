from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    (r'^$', 'tristara.views.static', {'template' : 'index.html'}),
    (r'^projects$', 'tristara.views.static', {'template' : 'projects.html'}),
    (r'^collaborate$', 'tristara.views.static', {'template' : 'work.html'}),
    (r'^about$', 'tristara.views.static', {'template' : 'about.html'}),
    (r'^contact$', 'tristara.views.static', {'template' : 'contact.html'}),
    (r'^video_wall$', 'tristara.views.static', {'template' : 'video_wall.html'}),
    (r'^html5_video$', 'tristara.views.static', {'template' : 'html5_video.html'}),
    (r'^almost_there$', 'tristara.views.static', {'template' : 'almost_there.html'}),
    (r'^fun_pics$', 'tristara.views.fun_pics'),
    (r'^reddit_blaster$', 'tristara.views.reddit_blaster'),
    (r'^facebook_blaster$', 'tristara.views.static', {'template' : 'facebook_blaster.html'}),

)
