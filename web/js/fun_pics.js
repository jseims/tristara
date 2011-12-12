var fun_pics = fun_pics || {};

var $title;
var $subreddit;
var $author;
var $comments;
var $next;
var $num_results;
var $img;
var $img_target;
var $tweet;
var $loading;

var img_array = null;
var cur_index = 0;
var cur_img = null;
var num_results = 0;

var channel = null;

var target_width = 920.0;
var all_min_score = 100;
var subreddit_min_score = 20;
var nsfw_min_score = 10;
var author_min_score = 0;

var subreddit_filter = null;
var author_filter = null;
var over_18_filter = 0;

fun_pics.setSubredditFilter = function(subreddit) {
    subreddit_filter = subreddit;
    fun_pics.renderMetadata();
    img_array = null;
    fun_pics.nextImage();
}

fun_pics.setAuthorFilter = function(author) {
    author_filter = author;
    fun_pics.renderMetadata();
    img_array = null;
    fun_pics.nextImage();
}

fun_pics.toggleNsfw = function(chkbox) {
    over_18_filter = (chkbox.checked) ? 1 : 0;
    img_array = null;
}


fun_pics.loadImages = function() {
    var min_score = all_min_score;
    var end_solr_filter = "";

    if (subreddit_filter != null) {
        end_solr_filter += " AND subreddit:" + subreddit_filter;
        min_score = subreddit_min_score;
    }

    if (over_18_filter == 1) {
        min_score = nsfw_min_score;
    }    
    
    if (author_filter != null) {
        end_solr_filter += " AND author:" + author_filter;
        min_score = author_min_score;
    }

    var solr_filter = "score:[" + min_score + " TO *] AND over_18:" + over_18_filter + end_solr_filter;
    
    
    $.ajax({
      url: '/solr/select/?q=' + solr_filter + '&version=2.2&start=0&rows=1000&indent=off&sort=random_1234%20desc&wt=json',
      success: function( data ) {
        data = eval("(" + data + ")");
        img_array = data.response.docs;
        num_results = data.response.numFound;
        if (img_array != null) {
            cur_index = Math.floor(Math.random() * img_array.length);
            fun_pics.nextImage();
        }
      }
    });
}

fun_pics.nextImage = function() {
    if (img_array == null) {
        fun_pics.loadImages();
    } else {
        //var index = Math.floor(Math.random() * img_array.length);
        cur_image = img_array[cur_index];
        if (cur_index < img_array.length - 1) {
            cur_index++;
        } else {
            cur_index = 0;
        }
        window.location.hash = cur_image.sequence;
        fun_pics.displayImage();
        PUBNUB.publish({
            channel : channel,
            message : cur_image.sequence
        })
    }
};



fun_pics.loadInitialContent = function(hash) {
    if(hash != "") {
        fun_pics.loadSingleImage(hash);
    } else {
        fun_pics.loadImages();
    }
}

fun_pics.setChannel = function(theChannel) {
    channel = theChannel;
    // set up pubnub listener
    PUBNUB.subscribe({
        channel  : channel,      // CONNECT TO THIS CHANNEL.
        error    : function() {        // LOST CONNECTION (auto reconnects)
            console.log("Connection Lost. Will auto-reconnect when Online.")
        },
        callback : function(message) { // RECEIVED A MESSAGE.
            fun_pics.loadSingleImage(message);
        },
        connect  : function() {        // CONNECTION ESTABLISHED.
        }
    })
}

fun_pics.loadSingleImage = function(id) {
    solr_filter = "sequence:" + id;
    
    $.ajax({
      url: '/solr/select/?q=' + solr_filter + '&version=2.2&indent=off&wt=json',
      success: function( data ) {
        data = eval("(" + data + ")");
        var result = data.response.docs;
        if (result != null) {
            cur_image = result[0];
            fun_pics.displayImage();
        }
      }
    });
}

fun_pics.displayImage = function () {
    $loading.show();
    $img.attr('src', cur_image.url);
    $("<img/>").attr('src', $img.attr("src")).load(function() {
        $loading.hide();
        var scale = Math.min(target_width / this.width, 1.0);
        $img.width(this.width * scale);

        $title.html("<a href='http://www.reddit.com" + cur_image.permalink + "' target='new'>" + cur_image.title + "</a>");
        $img_target.attr("href", cur_image.url)
        fun_pics.renderMetadata();    

    });
}

fun_pics.renderMetadata = function() {
    if (subreddit_filter != null) {
        $subreddit.html(cur_image.subreddit + " <a href='javascript:void(0)' onClick='fun_pics.setSubredditFilter(null)'>(clear filter)</a>");
    } else {
        $subreddit.html("<a href='javascript:void(0)' onClick='fun_pics.setSubredditFilter(\"" + cur_image.subreddit + "\")'>" + cur_image.subreddit + "</a>");
    }

    if (author_filter != null) {
        $author.html(cur_image.author + " <a href='javascript:void(0)' onClick='fun_pics.setAuthorFilter(null)'>(clear filter)</a>");
    } else {
        $author.html("<a href='javascript:void(0)' onClick='fun_pics.setAuthorFilter(\"" + cur_image.author + "\")'>" + cur_image.author + "</a>");
    }
    
    $comments.html("<a href='http://www.reddit.com" + cur_image.permalink + "' target='new'>" + cur_image.num_comments + " comments</a>");
    if (num_results > 0) {
        $num_results.html("results: " + num_results);
    }
    
    // setup tweet and facebook like
    var text = '<a href=href="https://twitter.com/share" class="twitter-share-button" id="reddit_tweet" data-count="horizontal" data-url=' + document.URL + ' data-text="' + cur_image.title + '" data-via="jseims">Tweet</a>'
    $tweet.html(text);
    twttr.widgets.load();
}
    
$(function() {
    // startup commands
    $title = $('#reddit_title');
    $subreddit = $('#reddit_subreddit');
    $author = $('#reddit_author');
    $comments = $('#reddit_comments');
    $next = $('#reddit_next');
    $num_results = $('#reddit_num_results');
    $img = $('#reddit_img');
    $img_target = $('#reddit_img_target');
    $tweet = $('#reddit_tweet');
    $loading = $('#reddit_loading');
    
    $(window).bind('hashchange', function() {
        hash = window.location.hash.substring(1, window.location.hash.length);
        if (cur_image != null && cur_image.sequence != hash) {
            fun_pics.loadSingleImage(hash);
        }
    });
   
    if (window.location.hash != null && window.location.hash != '') {
        id = window.location.hash.substring(1, window.location.hash.length);
        fun_pics.loadSingleImage(id);
    } else {   
        fun_pics.loadImages();
    }
    $next.click(fun_pics.nextImage);
});