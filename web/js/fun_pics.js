var fun_pics = fun_pics || {};

$(function() {
    var $title = $('#reddit_title');
    var $subreddit = $('#reddit_subreddit');
    var $comments = $('#reddit_comments');
    var $next = $('#reddit_next');
    var $img = $('#reddit_img');
    var img_array = null;
    var cur_img;
    
    var target_width = 900.0;
    var min_score = 100;
    
    var subreddit_filter = null;
    var over_18_filter = 0;

    fun_pics.setSubredditFilter = function(subreddit) {
        subreddit_filter = subreddit;
        renderMetadata();
        img_array = null;
    }

    fun_pics.toggleNsfw = function(chkbox) {
        over_18_filter = (chkbox.checked) ? 1 : 0;
        img_array = null;
    }
    
    var loadImages = function() {
        solr_filter = "score:[" + min_score + " TO *] AND over_18:" + over_18_filter;
        
        if (subreddit_filter != null) {
            solr_filter += " AND subreddit:" + subreddit_filter;
        }
    
        $.ajax({
          url: '/solr/select/?q=' + solr_filter + '&version=2.2&start=0&rows=1000&indent=off&sort=random_1234%20desc&wt=json',
          success: function( data ) {
            data = eval("(" + data + ")");
            img_array = data.response.docs;
            if (img_array != null) {
                nextImage();
            }
          }
        });
    }
    
    var nextImage = function() {
        if (img_array == null) {
            loadImages();
        } else {
            var index = Math.floor(Math.random() * img_array.length);
            cur_image = img_array[index];
            
            $img.attr('src', cur_image.url);
            $("<img/>").attr('src', $img.attr("src")).load(function() {
                var scale = Math.min(target_width / this.width, 1.0);
                $img.width(this.width * scale);
                $img.height(this.height * scale);
            });
            
            
            
            $title.text(cur_image.title);
            renderMetadata();
        }
    };

    var renderMetadata = function() {
        if (subreddit_filter != null) {
            $subreddit.html(cur_image.subreddit + " <a href='#' onClick='fun_pics.setSubredditFilter(null)'>(clear filter)</a>");
        } else {
            $subreddit.html("<a href='#' onClick='fun_pics.setSubredditFilter(\"" + cur_image.subreddit + "\")'>" + cur_image.subreddit + "</a>");
        }
        
        $comments.html("<a href='http://www.reddit.com" + cur_image.permalink + "' target='new'>" + cur_image.num_comments + " comments</a>");
    }
    
    loadImages();
    $next.click(nextImage);
    
});