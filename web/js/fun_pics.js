var fun_pics = fun_pics || {};

$(function() {
    var $title = $('#reddit_title');
    var $subreddit = $('#reddit_subreddit');
    var $score = $('#reddit_score');
    var $next = $('#reddit_next');
    var $img = $('#reddit_img');
    var img_array;

    console.log("title = " + $title);
    
    $.ajax({
      url: '/ajax_fun_pics',
      success: function( data ) {
        img_array = data;
        nextImage();
      }
    });

    var nextImage = function() {
        index = Math.floor(Math.random() * img_array.length);

        console.log("index = " + index + " title = " + img_array[index].title);
        
        $title.text(img_array[index].title);
        $score.html(img_array[index].score);
        $subreddit.html(img_array[index].subreddit);
        $img.attr('src', img_array[index].url);
    };
    
    $next.click(nextImage);
    
});