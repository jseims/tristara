use tristara;

DROP TABLE IF EXISTS reddit;
CREATE TABLE reddit (
    sequence INT AUTO_INCREMENT NOT NULL,
    domain varchar(256) DEFAULT '' NOT NULL,
    subreddit varchar(128) DEFAULT '' NOT NULL,
    id varchar(12) NOT NULL,
    author varchar(128) DEFAULT '' NOT NULL,
    score int DEFAULT 0 NOT NULL,
    thumbnail varchar(256) DEFAULT '' NOT NULL,
    permalink varchar(256) NOT NULL,
    url varchar(256) DEFAULT '' NOT NULL,
    title varchar(256) DEFAULT '' NOT NULL,
    PRIMARY KEY (sequence),
    UNIQUE KEY reddit_id (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

