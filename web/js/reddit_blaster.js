var reddit_blaster = reddit_blaster || {};

var $reddit_blaster;
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
    if (subreddit == "all") { 
        subreddit = null; 
    }
    subreddit_filter = subreddit;
    reddit_blaster.loadImages();
}

reddit_blaster.setOver18 = function(val) {
    over_18_filter = val;
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
            $reddit_blaster.media_flow('start');
            first_time = false;
        } else {
            $reddit_blaster.media_flow('clear');
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
    if (image) {
        var url = image.url;
        url = url.substring(0, url.length - 4) + "b" + url.substring(url.length - 4);
        return "<img src=" + url + ">";
    } else {
        return "";
    }
}

reddit_blaster.onIdle = function() {
    paused = true;
    $playBtn.text("PLAY");
}

reddit_blaster.onClose = function() {
    if (!paused) {
        $reddit_blaster.media_flow('resume');
    }
}

reddit_blaster.togglePlayPause = function() {
    if (paused) {
        $reddit_blaster.media_flow('resume');
        $playBtn.text("PAUSE");
        paused = false;
    } else {
        $reddit_blaster.media_flow('pause');
        $playBtn.text("PLAY");
        paused = true;    
    }
}


reddit_blaster.onClick = function(image) {
    $reddit_blaster.media_flow('pause');
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
    reddit_blaster.setSubredditFilter(val);
}
    
$(function() {
    $reddit_blaster = $('#reddit_blaster');
    $title = $('#reddit_title');
    $img = $('#reddit_img');
    $img_target = $('#reddit_img_target');
    $lightbox = $("#bigImageInfo");
    $playBtn = $("#playBtn");
    $subreddit = $("#subreddit");
    $resultCount = $("#resultCount");
    
    $playBtn.click(reddit_blaster.togglePlayPause);
    $subreddit.change(reddit_blaster.subredditChange)


    var flowOpts = {
        layout : "grid",
        padding : 10,
        offsetLeft : 20,
        speed: 3,
        rows : 4,
        cols : 7,
        width : 160,
        height : 160,
        clipWidth : 920,
        clipHeight : 700,
        getData : reddit_blaster.getData,
        render : reddit_blaster.render,
        onClick : reddit_blaster.onClick,
        idle : reddit_blaster.onIdle,
        name : "#reddit_blaster",
        useTranslate3d : true,
    };            
    
    $reddit_blaster.media_flow(flowOpts);
    
    reddit_blaster.loadImages();
});