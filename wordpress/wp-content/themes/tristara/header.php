<?php
/**
 * The Header for our theme.
 *
 * Displays all of the <head> section and everything up till <div id="main">
 *
 * @package WordPress
 * @subpackage Twenty_Eleven
 * @since Twenty Eleven 1.0
 */
?><!DOCTYPE html>
<!--[if IE 6]>
<html id="ie6" <?php language_attributes(); ?>>
<![endif]-->
<!--[if IE 7]>
<html id="ie7" <?php language_attributes(); ?>>
<![endif]-->
<!--[if IE 8]>
<html id="ie8" <?php language_attributes(); ?>>
<![endif]-->
<!--[if !(IE 6) | !(IE 7) | !(IE 8)  ]><!-->
<html <?php language_attributes(); ?>>
<!--<![endif]-->
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta name="viewport" content="width=device-width" />
<title>Tristara -- Joshua Seims's Personal Site</title>
<link rel="profile" href="http://gmpg.org/xfn/11" />
<link rel="stylesheet" type="text/css" media="all" href="<?php bloginfo( 'stylesheet_url' ); ?>" />
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />
<!--[if lt IE 9]>
<script src="<?php echo get_template_directory_uri(); ?>/js/html5.js" type="text/javascript"></script>
<![endif]-->
<?php
	/* We add some JavaScript to pages with the comment form
	 * to support sites with threaded comments (when in use).
	 */
	if ( is_singular() && get_option( 'thread_comments' ) )
		wp_enqueue_script( 'comment-reply' );

	/* Always have wp_head() just before the closing </head>
	 * tag of your theme, or you will break many plugins, which
	 * generally use this hook to add elements to <head> such
	 * as styles, scripts, and meta tags.
	 */
	wp_head();
?>
<meta property="og:title" content="<?php the_title(); ?>" />
<meta property="og:type" content="blog" />
<meta property="og:url" content="<?php the_permalink(); ?>" />
<meta property="og:site_name" content="Tristara" />
<meta property="fb:app_id" content="111528055628412" />
</head>

<body>
<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=111528055628412";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>

<div id="page" class="hfeed">

<div id="header">
<div id="logo-img"><a href="/"><img src="/images/logo.png" width="220"></a></div>
<div id="logo-text">Cool stuff &#8898; Joshua Seims</div>
</div>

<ul class="dropdown"><!-- menu -->

<li><a href="/">Home</a></li>

<li><a href="/projects">Projects</a>
<ul class="sub_menu">
    <li><a href="/almost_there">I'm Almost There</a></li>
    <li><a href="/fun_pics">Reddit Image Viewer</a></li>
    <li><a href="/video_wall">Video Wall</a>
</ul>
</li>

<li><a href="/services">Services</a></li>

<li><a href="/about">About</a></li>

<li><a href="/blog/">Blog</a></li>

<li><a href="/contact">Contact</a></li>

</ul><!-- close menu -->


	<div id="main">