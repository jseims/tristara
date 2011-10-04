# .bashrc

# Source global definitions
if [ -f /etc/bashrc ]; then
	. /etc/bashrc
fi

export PYTHONPATH=/data/tristara/config

# User specific aliases and functions

alias refresh='touch /data/tristara/server/apache/django.wsgi'
alias log='tail -f /var/log/httpd/error_log'
alias cdt='cd /data/tristara/'
alias mys='mysql -p -u webserver'
