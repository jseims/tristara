<?php
/**
 * The Sidebar containing the main widget area.
 *
 * @package WordPress
 * @subpackage Twenty_Eleven
 * @since Twenty Eleven 1.0
 */

$options = twentyeleven_get_theme_options();
$current_layout = $options['theme_layout'];

if ( 'content' != $current_layout ) :
?>
		<div id="sidebar">
			<?php if ( ! dynamic_sidebar( 'sidebar-1' ) ) : ?>

				<h3>About Me</h3>
					<div style="float:left; margin-bottom: 25px; margin-right: 20px;"><img src="http://www.tristara.com/images/josh-100x150.png" width=100></div>
					<div style="line-height: 1.4em;">
						<p>My name is Joshua Seims, and this is my site.
						<p>I'm a hacker, entrepreneur, angel investor.
                        
<a href="https://twitter.com/jseims" class="twitter-follow-button" data-show-count="false" data-lang="en">Follow @jseims</a>
<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>                        
					</div>
				
				
				<h3>
				Recent Posts 
					<!-- AddToAny BEGIN -->
					<a class="a2a_dd" href="http://www.addtoany.com/subscribe?linkurl=http%3A%2F%2Fwww.tristara.com%2Fblog%2F%3Ffeed%3Drss2&amp;linkname="><img src="http://static.addtoany.com/buttons/subscribe_106_16.gif" width="106" height="16" border="0" alt="Subscribe"/></a>
					<script type="text/javascript">
					var a2a_config = a2a_config || {};
					a2a_config.linkurl = "http://www.tristara.com/blog/?feed=rss2";
					</script>
					<script type="text/javascript" src="http://static.addtoany.com/menu/feed.js"></script>
					<!-- AddToAny END -->
				</h3>
				<div class="navcontainer">
				<ul>
					<?php wp_get_archives('title_li=&type=postbypost&limit=10'); ?>
				</ul>
				</div>			
			
			<?php endif; // end sidebar widget area ?>
		</div><!-- #secondary .widget-area -->
<?php endif; ?>
