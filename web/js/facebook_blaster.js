var facebook_blaster = facebook_blaster || {};

var $title;
var $img;
var $img_target;
var $lightbox;
var $blastBtnDiv;
var $loadingInfo;
var $playBtnDiv;
var $playBtn;
var $posterDiv;
var $commentsDiv;

var my_name;
var my_id;
var friend_list;
var friend_chunk_size = 20;
var last_friend_index = 0;
var friends_loaded = 0;

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
            $loadingInfo.text("loading photos...");
            my_name = response.name;
            my_id = response.id;
            FB.api('/me/photos', { limit: 1000 }, function(response) {
                //console.log(response);
                facebook_blaster.extractPhotos(response.data, my_name);
            });
            FB.api('/me/friends', function(response) {
                //console.log(response);
                friend_list = facebook_blaster.shuffle(response.data);
                facebook_blaster.handleLoadingFriends();
            });
        });
    } else {
        console.log('User cancelled login or did not fully authorize.');
    }   
}

facebook_blaster.handleLoadingFriends = function() {
    for(var i = last_friend_index; i < friend_list.length && i < last_friend_index + friend_chunk_size; i++) {
        var id = friend_list[i].id;
        var name = friend_list[i].name;
        
        FB.api('/' + id + '/photos', { limit: 1000 }, facebook_blaster.makeClickCallback(name, id));  
    }
    last_friend_index += friend_chunk_size;
}

facebook_blaster.makeClickCallback = function(name, id) {
    return function(response) { 
        facebook_blaster.extractPhotos(response.data, name, id);
    };
}

facebook_blaster.extractPhotos = function(array, name, id) { 
    array = facebook_blaster.shuffle(array);
    //console.log("found " + array.length + " photos for " + name);
    $loadingInfo.text("loading photos of " + name + "...");
    for(var i = 0; i < array.length; i++) {
        if (img_array.length > max_photos) {
            break;
        }

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
            photo.title = array[i].name;
            photo.id = array[i].id;
            photo.created = array[i].created_time;
            photo.comments = array[i].comments;
            photo.author_id = id;
            img_array.push(photo);            
        }
    }
    //console.log("got photos from " + name + " now have " + img_array.length + " photos");
    
    friends_loaded++;
    if (friends_loaded == friend_chunk_size && img_array.length <= max_photos) {
        //console.log("loaded " + friends_loaded + " friends, now loading more");
        friends_loaded = 0;
        facebook_blaster.handleLoadingFriends();
    }
    
    if (img_array.length > min_photos) {
        $blastBtnDiv.hide();
        $playBtnDiv.show();
        media_flow.start("facebook_blaster");    
    }
}


facebook_blaster.shuffle = function(o){ 
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

facebook_blaster.getData = function() {
    cur_index = Math.floor(Math.random() * img_array.length);
    var image = img_array[cur_index];
    return image;
}

facebook_blaster.render = function(image) {
    var url = image.thumb;
    return "<div style='text-align: center; width: 180px;'><div><img style='max-height: 160px;' src=" + url + "></div><div style='margin-top: 5px'>" + image.name + "</div></div>";
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

    $img.attr('src', image.source);    
    $("<img/>").attr('src', $img.attr("src")).load(function() {
        var scale = Math.min(target_width / this.width, 1.0);
        $img.width(this.width * scale);
        $img_target.attr("href", "http://www.facebook.com/photo.php?fbid=" + image.id)
        

        if (typeof image.title != 'undefined') {
            $title.text(image.title);
        } else {
            $title.text("");
        }
        
        //Posted by Jane Cha on jan d1 2007 (see photo on FaceBook)
        var date = new Date(image.created);
        var poster = "Posted by <a href='http://www.facebook.com/profile.php?id=" + image.author_id + "' target='new'>" + image.name + "</a> on " + date.toDateString() + 
            "<a href='http://www.facebook.com/photo.php?fbid=" + image.id + "' target='new'> (see photo on FaceBook)</a>";
        $posterDiv.html(poster);

            //<div style="border-bottom-width:2px; border-bottom-style:solid; border-bottom-color:#eaeaea; padding-top: 10px; padding-bottom: 10px; ">
            //  jane says "wow, that's awesome"
            //</div>
            
        var comments = "";
        if (typeof image.comments != 'undefined') {
            comments = "<div style='padding-bottom: 5px;padding-top: 5px;padding-left: 10px;background-color: #C4C4C4;'>Comments:</div>";
            for(var i = 0; i < image.comments.data.length; i++) {
                var comment_name = image.comments.data[i].from.name;
                var comment = image.comments.data[i].message;
                comments += "<div style='border-bottom-width:2px; border-bottom-style:solid; border-bottom-color:#eaeaea; padding-top: 10px; padding-bottom: 10px; '>" +
                    comment_name + " says " + "\"" + comment + "\"</div>";
            }
        }
        $commentsDiv.html(comments);
        
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
    $title = $('#photo_title');
    $img = $('#facebook_img');
    $img_target = $('#facebook_img_target');
    $lightbox = $("#bigImageInfo");
    $blastBtnDiv = $("#blastBtnDiv");
    $loadingInfo = $("#loadingInfo");
    $playBtnDiv = $("#playBtnDiv");
    $playBtn = $("#playBtn");
    $posterDiv = $("#posterDiv");
    $commentsDiv = $("#commentsDiv");
    
    $playBtn.click(facebook_blaster.togglePlayPause);
    //media_flow.setDimensions = function(rows, cols, width, height, padding, clipWidth, clipHeight, offsetLeft, offsetTop) {

    media_flow.setDimensions(3, 6, 180, 180, 10, 920, 600, 20, 10);
    media_flow.onGetData(facebook_blaster.getData);
    media_flow.onRender(facebook_blaster.render);
    media_flow.onClick(facebook_blaster.onClick);
    media_flow.onIdle(facebook_blaster.onIdle);
});