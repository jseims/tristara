var facebook_blaster = facebook_blaster || {};

var $facebook_blaster;
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
var $friendFilter;
var $setFriendFilterDiv;
var $removeFriendFilterDiv;


var my_name;
var my_id;
var friend_list;
var friend_chunk_size = 20;
var last_friend_index = 0;
var friends_loaded = 0;

var friend_filter = null;
var cur_friend_id;
var friend_index = 0;
var friend_map = new Array();

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
    facebook_blaster.shuffle(array);
    //console.log("found " + array.length + " photos for " + name);
    $loadingInfo.text("loading photos of " + name + "...");
    
    var list = new Array();
    friend_map[id] = list;
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
            
            // add to global list of all photos
            img_array.push(photo);
            
            // add to this friend's list
            list.push(photo);
        }
    }
    //console.log("got photos from " + name + " now have " + img_array.length + " photos");
    
    // sort list from oldest to newest
    
    friends_loaded++;
    if (friends_loaded == friend_chunk_size && img_array.length <= max_photos) {
        //console.log("loaded " + friends_loaded + " friends, now loading more");
        friends_loaded = 0;
        facebook_blaster.handleLoadingFriends();
    }
    
    if (img_array.length > min_photos) {
        $blastBtnDiv.hide();
        $playBtnDiv.show();
        $facebook_blaster.media_flow('start');
    }
}


facebook_blaster.shuffle = function(o){ 
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

facebook_blaster.getData = function() {
    var image;
    
    if (friend_filter == null) {
        cur_index = Math.floor(Math.random() * img_array.length);
        image = img_array[cur_index];
    } else {
        var list = friend_map[cur_friend_id];
        image = list[cur_friend_index];
        if (cur_friend_index < list.length - 1) {
            cur_friend_index++;
        } else {
            cur_friend_index = 0;
        }
    }
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
        $facebook_blaster.media_flow('resume');
    }
}

facebook_blaster.togglePlayPause = function() {
    if (paused) {
        $facebook_blaster.media_flow('resume');
        $playBtn.text("PAUSE");
        paused = false;
    } else {
        $facebook_blaster.media_flow('pause');
        $playBtn.text("PLAY");
        paused = true;    
    }
}

// to handle date format for older browsers
Date.fromISOString = (function(){
  function fastDateParse(y, m, d, h, i, s, ms){
    return new Date(y, m - 1, d, h || 0, i || 0, s || 0, ms || 0);
  }

  // result function
  return function(isoDateString){
    return fastDateParse.apply(null, isoDateString.split(/\D/));
  }
})();

facebook_blaster.onClick = function(image) {
    $facebook_blaster.media_flow('pause');

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
        
        // poster and date
        var date = new Date.fromISOString(image.created);
        var poster = "Posted by <a href='http://www.facebook.com/profile.php?id=" + image.author_id + "' target='new'>" + image.name + "</a> on " + date.toDateString() + 
            "<a href='http://www.facebook.com/photo.php?fbid=" + image.id + "' target='new'> (see photo on FaceBook)</a>";
        $posterDiv.html(poster);

        // friend filter
        cur_friend_id = image.author_id;
        $friendFilter.text(facebook_blaster.friendFilterText(image.author_id, image.name));

        // comments
        var comments = "";
        if (typeof image.comments != 'undefined') {
            comments = "<div style='padding-bottom: 5px;padding-top: 5px;padding-left: 10px;background-color: #C4C4C4;'>Comments:</div>";
            for(var i = 0; i < image.comments.data.length; i++) {
                var comment_name = image.comments.data[i].from.name;
                var comment = image.comments.data[i].message;
                comments += "<div style='border-bottom-width:2px; border-bottom-style:solid; border-bottom-color:#eaeaea; padding-top: 10px; padding-bottom: 10px; '><em>" +
                    comment_name + "</em> says " + "\"" + comment + "\"</div>";
            }
        }
        $commentsDiv.html(comments);
        
        $lightbox.lightbox_me({centered: true, onClose : facebook_blaster.onClose});
    });
}

facebook_blaster.friendFilterText = function(id, name) {
    var str;
    if (friend_filter == null) {
        var list = friend_map[id];
        str = "View " + name + "'s " + list.length + " Photos";
    } else {
        str = "Return to All Photos";
    }
    return str;
}

facebook_blaster.handleFriendFilter = function() {
    if (friend_filter == null) {
        friend_filter = cur_friend_id;
        cur_friend_index = 0;
        $setFriendFilterDiv.hide();
        $removeFriendFilterDiv.show();
    } else {
        friend_filter = null;
        $setFriendFilterDiv.show();
        $removeFriendFilterDiv.hide();
    }
    $facebook_blaster.media_flow('clear');
    $lightbox.trigger('close');
}

    
$(function() {
    $facebook_blaster = $('#facebook_blaster');
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
    $friendFilter = $("#friendFilter");
    $setFriendFilterDiv = $("#setFriendFilterDiv");
    $removeFriendFilterDiv = $("#removeFriendFilterDiv");
    
    
    $playBtn.click(facebook_blaster.togglePlayPause);
    
    var flowOpts = {
        layout : "grid",
        padding : 10,
        offsetLeft : 20,
        offsetTop : 10,
        speed: 3,
        rows : 4,
        cols : 6,
        width : 180,
        height : 180,
        clipWidth : 920,
        clipHeight : 600,
        getData : facebook_blaster.getData,
        render : facebook_blaster.render,
        onClick : facebook_blaster.onClick,
        idle : facebook_blaster.onIdle,
        name : "#facebook_blaster",
        useTranslate3d : true,
    };            
    
    $facebook_blaster.media_flow(flowOpts);
});