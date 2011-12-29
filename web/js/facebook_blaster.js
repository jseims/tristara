var facebook_blaster = facebook_blaster || {};

var $title;
var $img;
var $img_target;
var $lightbox;
var $subreddit;
var $playBtn;
var $resultCount;

var my_name;
var my_id;
var friend_list;

var img_array = new Array();
var min_photos = 100;
var max_photos = 2000;
var cur_index = 0;
var cur_img = null;
var num_results = 0;

var paused = false;

var target_width = 900.0;

facebook_blaster.handleLoginResponse = function(response) {
    if (response.authResponse) {
        FB.api('/me', function(response) {
              my_name = response.name;
              my_id = response.id;
              FB.api('/me/photos', { limit: 1000 }, function(response) {
                //console.log(response);
                facebook_blaster.extractPhotos(response.data, name);
                FB.api('/me/friends', function(response) {
                    //console.log(response);
                    friend_list = facebook_blaster.shuffle(response.data);
                    facebook_blaster.handleLoadingFriends();
                });
              });
              
            });
    } else {
        console.log('User cancelled login or did not fully authorize.');
    }   
}

facebook_blaster.handleLoadingFriends = function() {
    for(var i = 0; i < friend_list.length; i++) {
        var id = friend_list[i].id;
        var name = friend_list[i].name;
        
        FB.api('/' + id + '/photos', { limit: 1000 }, facebook_blaster.makeClickCallback(name));        
    }

}

facebook_blaster.makeClickCallback = function(name) {
    return function(response) { 
        facebook_blaster.extractPhotos(response.data, name);
    };
}

facebook_blaster.extractPhotos = function(array, name) { 
    array = facebook_blaster.shuffle(array);
    console.log("found " + array.length + " photos for " + name);
    for(var i = 0; i < array.length; i++) {
        var source = array[i].source;
        var thumb = null;
        for(var j = 0; j < array[i].images.length; j++) {
            var obj = array[i].images[j];
            if (obj.width == 180) {
                thumb = obj.source;
                break;
            }
        }
        if (thumb != null) {
            var photo = new Object;
            photo.name = name;
            photo.source = source;
            photo.thumb = thumb;
            
            img_array.push(photo);
            
            if (img_array.length > max_photos) {
                break;
            }
        }
    }
    console.log("got photos from " + name + " now have " + img_array.length + " photos");
    if (img_array.length > min_photos) {
        media_flow.start("facebook_blaster");    
    }
}


facebook_blaster.shuffle = function(o){ 
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

facebook_blaster.getData = function() {
    var image = img_array[cur_index];
    if (cur_index < img_array.length - 1) {
        cur_index++;
    } else {
        cur_index = 0;
    }
    return image;
}

facebook_blaster.render = function(image) {
    var url = image.thumb;
    return "<img style='clip:rect(0px,180px,100px,0px);' src=" + url + ">";
}

facebook_blaster.onIdle = function() {
    paused = true;
    $playBtn.text("PLAY");
}

facebook_blaster.onClose = function() {
    if (!paused) {
        media_flow.resume();
    }
}

facebook_blaster.togglePlayPause = function() {
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


facebook_blaster.onClick = function(image) {
    media_flow.pause();
    $img.attr('src', image.url);
    $("<img/>").attr('src', $img.attr("src")).load(function() {
        var scale = Math.min(target_width / this.width, 1.0);
        $img.width(this.width * scale);

        $title.html("<a href='http://www.reddit.com" + image.permalink + "' target='new'>" + image.title + "</a>");
        $img_target.attr("href", image.url)
        $lightbox.lightbox_me({centered: true, onClose : facebook_blaster.onClose});
    });
}

facebook_blaster.subredditChange = function() {
    var val = $subreddit.val();
    if (val == "all") { 
        val = null; 
    }
    facebook_blaster.setSubredditFilter(val);
}
    
$(function() {
    $title = $('#reddit_title');
    $img = $('#reddit_img');
    $img_target = $('#reddit_img_target');
    $lightbox = $("#bigImageInfo");
    $playBtn = $("#playBtn");
    $subreddit = $("#subreddit");
    $resultCount = $("#resultCount");
    
    $playBtn.click(facebook_blaster.togglePlayPause);
    $subreddit.change(facebook_blaster.subredditChange)
    
    media_flow.setDimensions(4, 6, 180, 180);
    media_flow.onGetData(facebook_blaster.getData);
    media_flow.onRender(facebook_blaster.render);
    media_flow.onClick(facebook_blaster.onClick);
    media_flow.onIdle(facebook_blaster.onIdle);
});