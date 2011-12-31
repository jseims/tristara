var reddit_blaster = reddit_blaster || {};

var $title;
var $img;
var $img_target;
var $lightbox;
var $subreddit;
var $playBtn;
var $resultCount;

var img_array = null;
var cur_index = 0;
var cur_img = null;
var num_results = 0;

var paused = false;

var target_width = 900.0;
var all_min_score = 50;
var nsfw_min_score = 2;
var subreddit_min_score = 0;

var subreddit_filter = null;
var over_18_filter = 0;

var first_time = true;

reddit_blaster.setSubredditFilter = function(subreddit) {
    subreddit_filter = subreddit;
    reddit_blaster.loadImages();
}

reddit_blaster.toggleNsfw = function(chkbox) {
    over_18_filter = (chkbox.checked) ? 1 : 0;
    reddit_blaster.loadImages();
}


reddit_blaster.loadImages = function() {
    var min_score = all_min_score;
    var end_solr_filter = "";

    if (over_18_filter == 1) {
        min_score = nsfw_min_score;
    }    
    
    if (subreddit_filter != null) {
        end_solr_filter += " AND subreddit:" + subreddit_filter;
        min_score = subreddit_min_score;
    }

    var solr_filter = "score:[" + min_score + " TO *] AND over_18:" + over_18_filter + end_solr_filter;
    
    
    $.ajax({
      url: '/solr/select/?q=' + solr_filter + '&version=2.2&start=0&rows=2000&indent=off&sort=random_1234%20desc&wt=json',
      success: function( data ) {
        data = eval("(" + data + ")");
        num_results = data.response.numFound;
        $resultCount.text("results: " + num_results);
        img_array = data.response.docs;
        cur_index = Math.floor(Math.random() * img_array.length);
        if (first_time) {
            media_flow.start("reddit_blaster");
            first_time = false;
        } else {
            media_flow.clear();
        }
      }
    });
}

reddit_blaster.getData = function() {
    var image = img_array[cur_index];
    if (cur_index < img_array.length - 1) {
        cur_index++;
    } else {
        cur_index = 0;
    }
    return image;
}

reddit_blaster.render = function(image) {
    var url = image.url;
    url = url.substring(0, url.length - 4) + "b" + url.substring(url.length - 4);
    return "<img src=" + url + ">";
}

reddit_blaster.onIdle = function() {
    paused = true;
    $playBtn.text("PLAY");
}

reddit_blaster.onClose = function() {
    if (!paused) {
        media_flow.resume();
    }
}

reddit_blaster.togglePlayPause = function() {
    if (paused) {
        media_flow.resume();
        $playBtn.text("PAUSE");
        paused = false;
    } else {
        media_flow.pause();
        $playBtn.text("PLAY");
        paused = true;    
    }
}


reddit_blaster.onClick = function(image) {
    media_flow.pause();
    $img.attr('src', image.url);
    $("<img/>").attr('src', $img.attr("src")).load(function() {
        var scale = Math.min(target_width / this.width, 1.0);
        $img.width(this.width * scale);

        $title.html("<a href='http://www.reddit.com" + image.permalink + "' target='new'>" + image.title + "</a>");
        $img_target.attr("href", image.url)
        $lightbox.lightbox_me({centered: true, onClose : reddit_blaster.onClose});
    });
}

reddit_blaster.subredditChange = function() {
    var val = $subreddit.val();
    if (val == "all") { 
        val = null; 
    }
    reddit_blaster.setSubredditFilter(val);
}
    
$(function() {
    $title = $('#reddit_title');
    $img = $('#reddit_img');
    $img_target = $('#reddit_img_target');
    $lightbox = $("#bigImageInfo");
    $playBtn = $("#playBtn");
    $subreddit = $("#subreddit");
    $resultCount = $("#resultCount");
    
    $playBtn.click(reddit_blaster.togglePlayPause);
    $subreddit.change(reddit_blaster.subredditChange)
    
    media_flow.setDimensions(4, 7, 160, 160, 10, 920, 700, 20, 10);

    media_flow.onGetData(reddit_blaster.getData);
    media_flow.onRender(reddit_blaster.render);
    media_flow.onClick(reddit_blaster.onClick);
    media_flow.onIdle(reddit_blaster.onIdle);
    reddit_blaster.loadImages();
});