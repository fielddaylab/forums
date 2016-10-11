/*

[Main Script]

Project: ForumUS - Responsive phpBB 3.1 Theme/Style
Version: 1.0
Author : http://themeforest.net/user/themelooks

*/

(function ($) {
    "use strict";
    
    $(document).ready(function () {
		/* ------------------------------------------------------------------------- *
		 * CUSTOM BACKGROUND IMAGE
		 * ------------------------------------------------------------------------- */
        var dataBgImg = $('[data-bg-img]');
		
		dataBgImg.each(function () {
			$(this).css('background-image', 'url('+ $(this).data('bg-img') +')').removeAttr('data-bg-img');
		});
        
        /* -------------------------------------------------------------------------*
         * HEADER STICKY
         * -------------------------------------------------------------------------*/
        var $wn = $(window)
        ,   $headerEl = $('#header')
        ,   $headerNavEl = $('.header--nav')
        ,   headerH = $headerEl.outerHeight();
        
        $headerNavEl.sticky();
        
        /* -------------------------------------------------------------------------*
         * HEADER NAV TAB
         * -------------------------------------------------------------------------*/
        var $headerNavLinks = $('.header--nav [data-toggle="tab"]')
        ,   $headerNavTab = $('.header-nav--tab')
        ,   $headerNavTabPane = $('.header-nav--tabpane')
        ,   headerNavTabPaneH = $headerNavTabPane.outerHeight();
        
        $headerNavLinks.on('click', function () {
            var $t = $(this)
            ,   $tp = $(this).parent('li')
            ,   toggleClas = 'active'
            ,   curHref = $t.attr('href')
            ,   $targetEl = $(curHref);

            if ( $tp.hasClass(toggleClas) ) {
                $tp.removeClass(toggleClas);

                $targetEl.slideUp();
                
                $('#sticky-wrapper').css('height', ($headerNavEl.outerHeight() - $headerNavTab.outerHeight()));
            } else {
                $tp.siblings().removeClass(toggleClas);
                $tp.addClass(toggleClas);

                $targetEl.siblings().slideUp();
                $targetEl.slideDown();
                
                if ( !$('#sticky-wrapper').hasClass('is-sticky') ) {
                    $('#sticky-wrapper').css('height', ($headerNavEl.outerHeight() + headerNavTabPaneH));
                }
            }

            return false;
        });
        
        /* -------------------------------------------------------------------------*
         * HEADER SLIDER BACKGROUND
         * -------------------------------------------------------------------------*/
        /* HEADER SLIDER */
        var $headerSliderEl = $('.header--slider');
        
        if ( $headerSliderEl.length ) {
            var jParticleNumber = function () {
                var particles = 0;
                
                if ( $(window).width() < 480 ) {
                    particles = 20;
                } else if ( $(window).width() < 767 ) {
                    particles = 50;
                } else if ( $(window).width() > 767 ) {
                    particles = 80;
                }
                
                return particles;
            };
            
            $headerSliderEl.jParticle({
                background: "transparent",
                particlesNumber: jParticleNumber()
            });
        }
        
        /* -------------------------------------------------------------------------*
         * TOGGLE TOPIC
         * -------------------------------------------------------------------------*/
        var $topicToggleBtn = $('.topic-list-header--toggle-btn');
        
        $topicToggleBtn.on('click', function () {
            var $t = $(this)
            ,   $toggleEl = $t.parent('.topic-list--header').siblings('.topic-list--content');
            
            if ( $toggleEl.height() === 0 ) {
                $t.removeClass('toggled');
                $toggleEl.animate({ height: $toggleEl.data('old-height') }, 500).removeAttr('data-old-height');
            } else {
                $t.addClass('toggled');
                $toggleEl.attr('data-old-height', $toggleEl.outerHeight()).animate({ height: '0' }, 500);
            }
        });
        
        /* -------------------------------------------------------------------------*
         * TOGGLE SIDEBAR
         * -------------------------------------------------------------------------*/
        var $toggleSidebarEl = $('.toggle-sidebar')
        ,   $topicBodyEl = $('.topic--body')
        ,   $topicSidebarEl = $('.topic--sidebar');
        
        $toggleSidebarEl.on('click', function () {
            var $t = $(this);
            
            if ( $t.hasClass('active') ) {
                $toggleSidebarEl.removeClass('active');
                
                $topicBodyEl.add($topicSidebarEl).removeClass('expended');
                
                $topicSidebarEl.delay(300).fadeIn('slow');
            } else {
                $toggleSidebarEl.addClass('active');
                
                $topicSidebarEl.fadeOut('slow', function () {
                    $topicBodyEl.add($topicSidebarEl).addClass('expended');
                });
            }
        });
        
        /* -------------------------------------------------------------------------*
         * FORM VALIDATION
         * -------------------------------------------------------------------------*/
        var $searchFormEl = $('.header--search-bar form');
        
        if ( $searchFormEl.length ) {
            $searchFormEl.validate({
                rules: {
                    keywords: "required"
                },
                errorPlacement: function () {
                    return false;
                }
            });
        }
        
        var $LoginFormEl = $('#LoginForm form');
        
        if ( $LoginFormEl.length ) {
            $LoginFormEl.validate({
                rules: {
                    "username": "required",
                    "password": "required"
                },
                errorPlacement: function () {
                    return false;
                }
            });
        }
        
        var $SignupFormEl = $('#SignupForm form');
        
        if ( $SignupFormEl.length ) {
            $SignupFormEl.validate({
                rules: {
                    signupEmail: {
                        email: true,
                        required: true
                    }
                },
                errorPlacement: function () {
                    return false;
                }
            });
        }
        
        var footerSubscribeFormEl = $('#footerSubscribeForm');

        if ( footerSubscribeFormEl.length ) {
            footerSubscribeFormEl.validate({
                rules: {
                    EMAIL: {
                        required: true,
                        email: true
                    }
                },
                errorPlacement: function () {
                    return true;
                }
            });
        }
        
        /* -------------------------------------------------------------------------*
         * PHPBB AJAX CALLBACKS
         * -------------------------------------------------------------------------*/
		var $headerMNotifyEl = $('.header-member--notifications');
		
		phpbb.addAjaxCallback('notifications.mark_all', function(res) {
			if (typeof res.success !== 'undefined') {
				/* Remove Has Unread Class */
				$headerMNotifyEl.removeClass('has-unread');
				
				/* Close Popup Box */
				phpbb.closeDarkenWrapper(1000);
			}
		});

		
		/* ------------------------------------------------------------------------- *
		 * BACK TO TOP BUTTON
		 * ------------------------------------------------------------------------- */
        var backToTop = {
            $el: $('.back-to-top'),
            $btn: $('.back-to-top button'),
            show: function () {
                return ( $(window).scrollTop() > 1 ) ? backToTop.$el.addClass('show') : backToTop.$el.removeClass('show');
            }
        };
        
        backToTop.show();
        
        backToTop.$btn.on('click', function() {
            $("html, body").animate({scrollTop: 0}, 500);
        });
		
		/* -------------------------------------------------------------------------*
		 * ON SCROLL
		 * -------------------------------------------------------------------------*/
        $(window).on('scroll', function () {
            backToTop.show();
        });
    });
    
    $(window).on('load', function () {
		/* ------------------------------------------------------------------------- *
		 * PRELOADER
		 * ------------------------------------------------------------------------- */
        $('#preloader').fadeOut('slow');
    });
})(jQuery);