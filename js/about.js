
(function(){
	var _d = JSON.parse(atob('eyJJU19JQURNSU4iOmZhbHNlLCJDVVNUT01fSU1BR0VfV0lEVEgiOjE2MDAsIklTX01PQklMRSI6ZmFsc2UsIklTX0lFIjpmYWxzZSwiSVNfU1VQUE9SVF9DU1MzIjp0cnVlLCJVUExPQURfVVJMIjoiL3VwbG9hZC8iLCJDRE5fVVBMT0FEX1VSTCI6Ii9pbWFnZXMvdXBsb2FkLyIsIkNETl9PUFRJTUlaRURfVVJMIjoiL2ltYWdlcy91cGxvYWQvIiwiSVNfTUFJTiI6ZmFsc2UsIkNVUlJFTlRfVVJMIjoiTDBGaWIzVjAiLCJDVVJSRU5UX0RPTUFJTiI6IiIsIlRIVU1CTkFJTF9VUkwiOiIvdGh1bWJuYWlsLyIsIkNETl9USFVNQk5BSUxfVVJMIjoiL2ltYWdlcy90aHVtYm5haWwvIiwiU0lURV9DT0RFIjoiUzIwMjUxMTI0NWEyODI4NDdhNDlkNCIsIlVOSVRfQ09ERSI6InUyMDI1MTEyNDY5MjNlMjdmNWE4N2QiLCJNQUlOX0RPTUFJTiI6IiIsIlZFTkRPUl9ET01BSU4iOiIvdmVuZG9yIiwiR09PR0xFX0FQSV9LRVkiOiJBSXphU3lBOENDZXhmOVhUSmNIMDltU3RyLUhSVzRuaW40azhKN3ciLCJGUk9BTEFfVkVSU0lPTiI6MzExLCJGUk9BTEFfS0VZIjoiNkxGNWcxQjNEM0YzQzZDM0UyRi0xMVNMSkNLSFhPU0xNYzFZR1NHYjFaWEhTZTFDZ0I1QTRENEMzRTNDMkExM0ExOUI3QjI9PSIsIklTX0FORFJPSURfQVBQIjoiTiIsIklTX0lPU19BUFAiOiJOIiwiQVBQX1ZFUlNJT04iOiIwIiwiSUVfVkVSU0lPTiI6MTEsIlRFU1RfU0VSVkVSIjpmYWxzZSwiTUVOVV9TTlNfSU5JVF9EQVRBIjp7Il9tYWluX3VybCI6IiIsIl9zaXRlX25hbWUiOiIo7KO8KeuPmeydvOuDieyepSIsIl9zdWJqZWN0Ijoi7ZqM7IKs7IaM6rCcIiwiX2JvZHkiOiLtmozsgqzshozqsJwiLCJfcG9zdF91cmwiOiIvIiwiX2ltZyI6Ii9pbWFnZXMvdXBsb2FkL1MyMDI1MTEyNDVhMjgyODQ3YTQ5ZDQvMzA1YWVlZDFmYzQ0OS5wbmciLCJfc2VjdXJpdHlfcG9zdF91cmwiOiIvIn0sIkxJTUlUX0FQSV9MSVNUIjpbImtha2FvX2xpbmsiLCJrYWthb3N0b3J5X2xpbmsiXSwiTk9fSU1BR0VfVVJMIjoiL2ltZy90cmFuc3BhcmVuY3kucG5nIiwiU0lURV9DT1VOVFJZX0NPREUiOiJrciIsIktPUkVBX0NPVU5UUllfQ09ERSI6ImtyIiwiTEFOR19DT0RFIjoiS1IiLCJJU19HVUVTVCI6dHJ1ZSwiTUVNQkVSX1VJRCI6IiIsIk1FTUJFUl9IQVNIIjoiIiwiVVNFX1NIT1BfSU5fU0hPUCI6ZmFsc2UsIkNIRUNLX09GRklDRSI6ZmFsc2UsIlNES19KV1QiOiIiLCJWSUVXRVJfQ09VTlRSWSI6IktSIiwiQUREUkVTU19NT0RFIjoiZGF1bSJ9'));
	for (var k in _d) {
		window[k] = _d[k];
	}
	var IS_APP = _d.IS_ANDROID_APP == "Y" || _d.IS_IOS_APP == "Y";
	window.IS_APP = IS_APP;
	window.USE_OMS = true;
})();

		$(function(){
			var more_menu_w20251222c172d789f1299 = new HEADER_MORE_MENU();
			more_menu_w20251222c172d789f1299.init($('#w20251222c172d789f1299 ._inline_menu_container'),false);
			more_menu_w20251222c172d789f1299.setWidgetCode('w20251222c172d789f1299');
			$('#w20251222c172d789f1299 ._inline_menu_container').data('header_more_menu',more_menu_w20251222c172d789f1299);
		});
	

		$(function(){
			$('#w20251222c172d789f1299').find("li.dropdown").each(function(index){
				$(this).find("li.dropdown-submenu").each(function(index){
					if(!$(this).hasClass('pulldown-hide')){
						if($(this).find(".dropdown-menu > li").length > 0) $(this).addClass("sub-active");
					}else{
						$(this).find('ul').removeClass('dropdown-menu');
						$(this).find('ul li').hide();
					}
				});
			});
			$('#w20251222c172d789f1299').find('._header_dropdown').dropdownHover();
		});
	

  ;(() => {
    if (![isSafari(), isIos()].some(Boolean)) return;

    const $menuLinks = Array.from(document.querySelectorAll('._mobile_nav a'));
    $menuLinks.forEach($menuLink => {
      if (!$menuLink.hash) return;

      $menuLink.addEventListener('click', () => setCookie('menu_link_hash', $menuLink.hash, 1));
    });

    const hash = getCookie('menu_link_hash');
    if (!hash) return;

    window.addEventListener('load', () => {
      const $section = document.querySelector(hash);
      scrollWindowToElement($section).then(() => deleteCookie('menu_link_hash'));
    });
  })();

		var $obj = $('#w20251222d83d9331fe41d a[data-toggle="tooltip"]');
	if($obj.length > 0){
		var obj_offset = $obj.offset();
		var position_auto = $obj.attr('data-placement') == 'auto';
		if(obj_offset.top < $obj.outerHeight() && position_auto){
			$obj.attr('data-placement', 'bottom');
		}
	}
	
	$('#w20251222d83d9331fe41d a[data-toggle="tooltip"]').tooltip();

		$(function(){
			var header_center_colgroup_s20251222f8ef0c5d8eb8e = new HEADER_CENTER_COLGROUP();
			header_center_colgroup_s20251222f8ef0c5d8eb8e.init('s20251222f8ef0c5d8eb8e', {"top_bottom_margin":"0","col_margin":"15","design_setting_margin":"N","border_width":"1","border_style":"solid","border_color":"#e7e7e7","vertical-align":"middle","scroll_fixed":"N","overlay_type_data":{"top_bottom_margin":"0","col_margin":"10","design_setting_margin":"Y","border_width":"0","border_style":"solid","border_color":"rgba(255, 255, 255, 0.2)","vertical-align":"middle","scroll_fixed":"N","background_repeat":"","background_position":"","color":"","background_image":"","background_color":""},"left_width":"258","center_width":"894","right_width":"258","height":"91","background_repeat":"","background_position":"","color":"","left_right_margin":"15","left_right_margin_mobile":"0","background_image":"","extend":"N","background_color":"#fff","hover_section_bg":"N"})});
	
$(function(){HEADER_FIXED_MENU.init();});
$(function(){HEADER_OVERLAY.init();});

		$(function(){
			var more_menu_w202511244d3ed87a28400 = new HEADER_MORE_MENU();
			more_menu_w202511244d3ed87a28400.init($('#w202511244d3ed87a28400 ._inline_menu_container'),false);
			more_menu_w202511244d3ed87a28400.setWidgetCode('w202511244d3ed87a28400');
			$('#w202511244d3ed87a28400 ._inline_menu_container').data('header_more_menu',more_menu_w202511244d3ed87a28400);
		});
	

		$(function(){
			$('#w202511244d3ed87a28400').find("li.dropdown").each(function(index){
				$(this).find("li.dropdown-submenu").each(function(index){
					if(!$(this).hasClass('pulldown-hide')){
						if($(this).find(".dropdown-menu > li").length > 0) $(this).addClass("sub-active");
					}else{
						$(this).find('ul').removeClass('dropdown-menu');
						$(this).find('ul li').hide();
					}
				});
			});
			$('#w202511244d3ed87a28400').find('._header_dropdown').dropdownHover();
		});
	

  ;(() => {
    if (![isSafari(), isIos()].some(Boolean)) return;

    const $menuLinks = Array.from(document.querySelectorAll('._mobile_nav a'));
    $menuLinks.forEach($menuLink => {
      if (!$menuLink.hash) return;

      $menuLink.addEventListener('click', () => setCookie('menu_link_hash', $menuLink.hash, 1));
    });

    const hash = getCookie('menu_link_hash');
    if (!hash) return;

    window.addEventListener('load', () => {
      const $section = document.querySelector(hash);
      scrollWindowToElement($section).then(() => deleteCookie('menu_link_hash'));
    });
  })();

		var $obj = $('#w20251125f0c4a915c6fab a[data-toggle="tooltip"]');
	if($obj.length > 0){
		var obj_offset = $obj.offset();
		var position_auto = $obj.attr('data-placement') == 'auto';
		if(obj_offset.top < $obj.outerHeight() && position_auto){
			$obj.attr('data-placement', 'bottom');
		}
	}
	
	$('#w20251125f0c4a915c6fab a[data-toggle="tooltip"]').tooltip();

		$(function(){
			var header_center_colgroup_s20251124cb7027ae1ac33 = new HEADER_CENTER_COLGROUP();
			header_center_colgroup_s20251124cb7027ae1ac33.init('s20251124cb7027ae1ac33', {"top_bottom_margin":"0","col_margin":"15","design_setting_margin":"N","border_width":"1","border_style":"solid","border_color":"#e7e7e7","vertical-align":"middle","scroll_fixed":"N","overlay_type_data":{"top_bottom_margin":"0","col_margin":"10","design_setting_margin":"Y","border_width":"0","border_style":"solid","border_color":"rgba(255, 255, 255, 0.2)","vertical-align":"middle","scroll_fixed":"N","background_repeat":"","background_position":"","color":"","background_image":"","background_color":""},"left_width":"258","center_width":"894","right_width":"258","height":"91","background_repeat":"","background_position":"","color":"","left_right_margin":"15","left_right_margin_mobile":"0","background_image":"","extend":"N","background_color":"#fff","hover_section_bg":"N"})});
	
$(function(){HEADER_OVERLAY.init();});
$(function(){SITE.firstScrollFixed('inline_header_mobile');});
$(function(){$("#s202511247cb24f58a51ef").scrollToFixed({ marginTop: ""});$("#s202511247cb24f58a51ef").toggleClass("_fixed_header_section", true);});

		$(function(){
			var header_center_colgroup_s202511247cb24f58a51ef = new HEADER_CENTER_COLGROUP();
			header_center_colgroup_s202511247cb24f58a51ef.init('s202511247cb24f58a51ef', {"top_bottom_margin":"8","col_margin":"10","design_setting_margin":"N","border_width":"1","border_style":"solid","border_color":"rgba(48, 48, 48, 0.05)","vertical-align":"middle","scroll_fixed":"Y","overlay_type_data":{"top_bottom_margin":"0","col_margin":"10","design_setting_margin":"Y","border_width":"0","border_style":"solid","border_color":"rgba(255, 255, 255, 0.15)","vertical-align":"middle","scroll_fixed":"N","background_repeat":"","background_position":"","color":"","background_image":""},"left_width":"178","center_width":"","right_width":"177","height":"63","background_repeat":"","background_position":"","color":"","left_right_margin":"15","left_right_margin_mobile":"10","background_image":"","background_color":"#ffffff","extend":"N","hover_section_bg":"N"})});
	
$("#text_w202512088b4d228cf6c94").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w202512087e56a77d1edbb").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w202512098709edd6d14ee").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w20251209ae4dc59d07fcf").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w202512083b0e2dd7ea73a").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w2025120834c2fa46e5110").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w202512086d989c2a10a3e").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w20251208a6f2f4fab9f02").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));

        (function($) {
            // 콤마 찍는 함수
            function comma(str) {
                str = String(str);
                return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
            }

            // 콤마 푸는 함수
            function uncomma(str) {
                str = String(str);
                return str.replace(/[^\d]+/g, '');
            }

            $(window).scroll(function() {
                // 화면에 있는 모든 .counter-value 요소를 검사
                $('.counter-value').each(function() {
                    var $this = $(this);

                    // 이미 애니메이션이 끝난 요소는 건너뜀 (중복 실행 방지)
                    if ($this.hasClass('animated')) return;

                    var oTop = $this.offset().top - window.innerHeight;

                    // 해당 숫자가 화면에 보이면 애니메이션 시작
                    if ($(window).scrollTop() > oTop) {
                        $this.addClass('animated'); // 실행됨 표시
                        
                        var countTo = $this.attr('data-count'); // 목표 숫자

                        $({ countNum: uncomma($this.text()) }).animate({
                            countNum: countTo
                        },
                        {
                            duration: 2000, 
                            easing: 'swing',
                            step: function() {
                                $this.text(comma(Math.floor(this.countNum)));
                            },
                            complete: function() {
                                $this.text(comma(this.countNum));
                            }
                        });
                    }
                });
            });

            // 로딩 시 바로 보이는 경우를 위해 강제 실행
            $(document).ready(function(){
                $(window).trigger('scroll');
            });

        })(jQuery);
    
$("#text_w20251208036e33a0a641d").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));

function toggleActiveClassOnInView() {
    const activeClass = 'active';
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const targetElement = entry.target;
            if (entry.isIntersecting) {
                targetElement.classList.add(activeClass);
            } else {
                targetElement.classList.remove(activeClass);
            }
        });
    });
    const targetElements = document.querySelectorAll('.underline-heading');
    targetElements.forEach(targetElement => observer.observe(targetElement));
}

toggleActiveClassOnInView()

$("#text_w20251208a1df5dca9402d").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w20251208e6e749427b13c").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));

	$(function(){
		var img_w20251208183bb83fa935d = new IMAGE_RESIZE();
		img_w20251208183bb83fa935d.init('w20251208183bb83fa935d', {"img_width":730,"img_height":560,"img_ratio":"0.767123287671","img_init":"N","url":"S202511245a282847a49d4\/643750ecdd76a.jpg","description":"","hover_description":"","text_position":"bottom","hover_text_position":"same","overlay_color":"rgba(0, 0, 0, 0)","hover_overlay_color":"rgba(0, 0, 0, 0)","text_color":"#fff","hover_text_color":"#fff","text_size":"14","hover_text_size":"14","show_over":"N","link":"","link_code":"","use_link_code":"N","new_window":"N","circle":"N","lightbox":"N","org_size":"Y","use_hd":"N","grayscale":"N","hover_grayscale":"N","image_rendering":"Y","border_radius":"Y","hide_default_img":"N","border_radius_value":"20","text_align":"0 50%","hover_text_align":"0 50%","ani_type":"none","ani_duration":"0.7","ani_delay":"0","idx":"144278719","member":"","code":"f202512161e556534818c4","site_code":"S202511245a282847a49d4","tmp_idx":"","target_code":"w20251208183bb83fa935d","target":"image_widget","name":"643750ecdd76a.jpg","org_name":"img_\uc9c0\ub3c4.jpg","down_cnt":"0","type":"image\/jpeg","size":"124040","version_data":"","wtime":"","mtime":"","error":"","doz_img":"N","is_image_edit":"N","thumb_url":"/images/4acde8886ced9.jpg","hover_thumb_url":"/images/4acde8886ced9.jpg","hover_img_url":"S202511245a282847a49d4\/643750ecdd76a.jpg","alt_text":""});
		$('#img_w20251208183bb83fa935d').data('image_resize',img_w20251208183bb83fa935d);
	});

$("#text_w202512089877cadfd53f7").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w2025120878a80dae77564").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w20251208fdcaeb4c12cf1").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w202512085441fec2ef133").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w20251208040e901c28dad").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w202512083b6f093e749a5").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w20251208d041cee843837").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w20251208143561c5b924c").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w2025121639c012e7542a6").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w20251216694b7e25883c1").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w202512166b4ecc3540494").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w20251216e9737a955c600").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w20251216e89f9c65418c4").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w20251216223ec7ddbbad9").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w20251125ac8edeb900e12").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w2025112589dab9af35c96").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w20251128eb5d0d3ecc40e").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w20251128227830c87c332").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w2025112894c09bdbacb07").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));
$("#text_w2025112818bac3938ed8b").find("._table_responsive").addClass("table").wrap($("<div />").addClass("table-responsive"));

	$(function(){
		//첫방문 flag
		var first_visit_menu = false;
		//로컬 스토리지에서 방문한 메뉴 코드를 가져오기
		var visited_menu_codes = localStorage.getItem('visited_menu_codes');
		//방문한 메뉴 코드가 없다면 빈 배열로 초기화
		var visited_menu_code_list = JSON.parse(visited_menu_codes) || [];
		//현재 메뉴 코드를 처음 방문이미 로컬스토리지에 저장
		if ( visited_menu_code_list.indexOf('m20251124f102ee270817b') === -1 ) {
			visited_menu_code_list.push('m20251124f102ee270817b');
			localStorage.setItem('visited_menu_codes', JSON.stringify(visited_menu_code_list));
			//최초 접속 flag 변경
			first_visit_menu = true;
		}
		SITE_VISIT_LOG.addVisitLog(document.referrer,'4ZkbYEVPWh2nrqzGlw1dp5WUXR5+IQMaQt4+d+HFBNwErD+k7HAvSq2pjqL7Fjqtf2+Y5QLwveWt1DdLn5dgq0GlDFhGVy8ooMkTa+aoBCYS5lXHhicfr+2kwNTTgTdU', '6518','m20251124f102ee270817b', first_visit_menu);
	});
