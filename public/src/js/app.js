/*!
*
*	app
*
!*/

$(function() {
	console.log('App Ready');


	var $browseFilters = $('#filters');
	if ($browseFilters.length) {
		console.log('filters on page');

		var $toggler = $browseFilters.find('a');
		var $expando = $toggler.find('.expando');
		var $filtersBody = $browseFilters.find('.panel-body');


		$toggler.on('click', function() {
			console.log($filtersBody.is(':visible'));
			if ($filtersBody.is(':visible')) {
				$expando.find('i').addClass('fa-plus-square-o').removeClass('fa-minus-square-o');

				$filtersBody
					.find('.badge')
						.hide()
					.end()
					.slideUp(function() {
						$(this).addClass('hidden-sm').addClass('hidden-xs').show();
					});
			}
			else {
				$expando.find('i').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');

				$filtersBody
					.hide()
					.find('.badge')
						.hide()
					.end()
					.removeClass('hidden-sm')
					.removeClass('hidden-xs')
					.slideDown(function() {
						$(this)
							.find('.badge')
								.show()
								.css({display: 'inline-block'})
							.end();
					});
			}
		});
	}



	var $stats = $('#statistics');
	if ($stats.length) {
		var $statisticsNav = $('#statisticsNav');

		console.log('statistics on page');
		console.log($stats.offset());

		var scrollspyer = $('body').scrollspy({ target: '#statisticsNav' });

		console.log(scrollspyer);

		$statisticsNav.affix({
			offset: {
				top: function() {return $stats.offset().top;}
			}
		});

		$('body').on('activate.bs.scrollspy', function() {
			console.log('scrollspy');
		});



		var $codePanels = $stats.find('.codes');

		$codePanels.on('click', '.panel-heading', function(e) {
			var $panelHeading = $(this);
			var $expando = $panelHeading.find('.expando');
			var $panelBody = $panelHeading.closest('.panel').find('.panel-body');

			console.log('panel-heading clicked', $panelBody.is(':visible'), $panelBody);

			if ($panelBody.is(':visible')) {
				$expando.find('i').addClass('fa-plus-square-o').removeClass('fa-minus-square-o');
				$panelBody.slideUp();
			}
			else {
				$expando.find('i').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
				$panelBody.slideDown();
			}
		});
	}
});

