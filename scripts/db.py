#!/usr/bin/python

import MySQLdb, re, time

DATABASE_HOST = 'localhost'
DATABASE_USER = ''
DATABASE_PASSWORD = ''
DATABASE_NAME = ''

try:
  from localsettings import *
except:
  print "Error reading localsettings"

dbc = None

def query_singular(sql, args=None, as_dict=True):
    rows = query(sql, args, as_dict)
    if rows:
        return rows[0]

def query_value(sql, args=None):
    rows = query(sql, args, False)
    if rows:
        return rows[0][0]

def query(sql, args=None, as_dict=True):
    try:
        global dbc
        if not dbc:
            dbc = MySQLdb.connect(DATABASE_HOST,
                                  DATABASE_USER,
                                  DATABASE_PASSWORD,
                                  DATABASE_NAME,
                                  charset='utf8',
                                  use_unicode=True)
            dbc.autocommit(1)
        if as_dict:
            c = dbc.cursor(MySQLdb.cursors.DictCursor)
        else:
            c = dbc.cursor()
        start_time = time.time()
        c.execute(sql, args)
        rows = c.fetchall()
        affected_rows = dbc.affected_rows()
        c.close()
        if not rows and re.match(r'^(?i)\s*(INSERT|UPDATE|REPLACE|DELETE).*', sql):
            return affected_rows
        if as_dict:
            return map(Storage, rows)
        else:
            return rows
    except MySQLdb.OperationalError, e:
        error_code, error_msg = e
        # retry if connection was dropped
        if error_code in [2006, 2013]: 
            dbc = None
            return query(sql, args, **kwargs)
        else:
            raise e
            
class Storage(dict):
    def __getattr__(self, key): 
        try:
            return self[key]
        except KeyError, k:
            raise AttributeError, k

    def __setattr__(self, key, value): 
        self[key] = value

    def __delattr__(self, key):
        try:
            del self[key]
        except KeyError, k:
            raise AttributeError, k
