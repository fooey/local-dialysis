/*!
*
*	app
*
!*/

$(function() {
	console.log('App Ready');


	var $browseFilters = $('#filters');
	if ($browseFilters.length) {
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
});

