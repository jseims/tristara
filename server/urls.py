from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    (r'^$', 'tristara.views.static', {'template' : 'index.html'}),
    (r'^projects$', 'tristara.views.static', {'template' : 'projects.html'}),
    (r'^work$', 'tristara.views.static', {'template' : 'work.html'}),
    (r'^about$', 'tristara.views.static', {'template' : 'about.html'}),
    (r'^contact$', 'tristara.views.static', {'template' : 'contact.html'}),

)
