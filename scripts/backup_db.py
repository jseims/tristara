#!/usr/bin/env python

from datetime import date, timedelta
import subprocess, tarfile, os
import boto
from boto.s3.key import Key


DATABASE_HOST = 'localhost'
DATABASE_USER = ''
DATABASE_PASSWORD = ''
DATABASE_NAME = ''

#S3
AWS_ACCESS_KEY_ID = "{AWS_ACCESS_KEY_ID}"
AWS_SECRET_ACCESS_KEY = "{AWS_SECRET_ACCESS_KEY}"
AWS_BUCKET_NAME = "{BUCKET NAME}"

try:
  from localsettings import *
except:
  print "Error reading localsettings"

#path name, leave empty if not required
FOLDER = "mysql-backup/"
mysql_dump = "mysqldump"
 
#number days worth of backups to keep
KEEP = 5
 
#Output
output_dir = "/tmp/"
output_file = "db-" + str(date.today()) + ".sql"
 
print "start mysqldump..."
 
subprocess.call( mysql_dump + " --user " + DATABASE_USER + " --password=" + DATABASE_PASSWORD + " --add-locks --flush-privileges --add-drop-table --complete-insert --extended-insert --single-transaction --database " + DATABASE_NAME + " > " + output_dir + output_file, shell=True )
 
print "compressing " + output_file + "..."
 
tar_file = output_file + ".tar.gz"
 
tar = tarfile.open( output_dir + tar_file , "w|gz")
tar.add(output_dir + output_file)
tar.close()
 
tar_data = open( output_dir + tar_file , "rb").read()
 
print "uploading to S3..."
 
conn = boto.connect_s3(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
bucket = conn.get_bucket(AWS_BUCKET_NAME)

# store full version without transcoding
name = '%s-b.jpg' % id
k = Key(bucket)
k.key = FOLDER + tar_file
k.set_contents_from_string(tar_data)
 
# delete old versions
oldest_backup = "db-" + str( date.today() - timedelta(days=KEEP) ) + ".sql.tar.gz"
bucket.delete_key(oldest_backup)
 
print "deleting temporary files..."
 
os.remove(output_dir + output_file)
os.remove(output_dir + tar_file)
 
print "complete"