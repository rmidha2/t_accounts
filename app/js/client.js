var case_name;
var fyb_month;
var fyb_day;
var fyb_year;
var fye_month;
var fye_day;
var fye_year;
var fyb;
var fye;

toastr.options.preventDuplicates = true;

// Submit Fiscal Year 

$('#submit_fy').click(function(){
	case_name = $('#case_name').val();
	fyb_month = $('#fyb_month option:selected').text();
	fyb_day = $('#fyb_day').val();
	fyb_year = $('#fyb_year').val();
	fye_month = $('#fye_month option:selected').text();
	fye_day = $('#fye_day').val();
	fye_year = $('#fye_year').val();

	fyb = new Date(fyb_year,$('#fyb_month option:selected').val(),fyb_day)
	fye = new Date(fye_year,$('#fyb_month option:selected').val(),fye_day)

	var month_difference = $('#fye_month option:selected').val() - $('#fyb_month option:selected').val()
	var day_difference = fye_day - fyb_day

	// console.log(month_difference)
	// console.log(day_difference)
	var invalid_Flag = false;

	toastr.clear();

	if (case_name.length < 1) {
		toastr.error('You forgot to enter the name of the case');
		invalid_Flag = true;
	}
	else if (fyb_year.length != 4) {
		toastr.error('Invalid Fiscal Year Beginning');
		invalid_Flag = true;
	}
	else if (isNaN(parseInt(fyb_year)) == true) {
		toastr.error('Invalid Fiscal Year Beginning');
		invalid_Flag = true;
	}
	else if (fye_year.length != 4) {
		toastr.error('Invalid Fiscal Year End');
		invalid_Flag = true;
	}
	else if (isNaN(parseInt(fye_year)) == true) {
		toastr.error('Invalid Fiscal Year End');
		invalid_Flag = true;
	}
	else if ((fye_year - fyb_year > 1) || ((fyb_year - fye_year > 0))) {
		toastr.error('Invalid Fiscal Year');
		invalid_Flag = true;
	}
	else if (fye_year == fyb_year && fyb_month == fye_month) {
		toastr.error('Invalid Fiscal Year');
		invalid_Flag = true;
	}
	else if (month_difference == 11 && day_difference < 27) {
		toastr.error('Invalid Fiscal Year');
		invalid_Flag = true;
	}
	else if (invalid_Flag == false && (month_difference == 0 || month_difference == 11) && (day_difference == 0 || day_difference > 26)){
		$('#title').hide()
		$('#fy_inputs').hide();
		$('#print_case_name').text(case_name);
		$('#print_fy').text(fyb_month+', '+fyb_day+', '+fyb_year+' - '+fye_month+', '+fye_day+', '+fye_year);	
		$('#task_menu').show();
	}
	else {
		toastr.error('Invalid Fiscal Year');
	};
});

// Edit Fiscal Year

$('#fy_print_inputs').click(function(){
	$('#task_menu').hide();
	$('#title').show();
	$('#fy_inputs').show();
});



// Enter opening balances

var posted = false;

$('#post').click(function(){
	$('#task_menu').find('table').each(function(){
		var account = {}
		var create_Flag = false
		var accountName = $(this).find('th').find('input').val().toString()
		var ID = $(this).find('th').find('input').attr('id')
		account.name = accountName.toUpperCase()

		if (accountName.length > 0) {
			$(this).find('td').find('input').each(function(){
				var input = $(this).val();

				if (Math.floor(input) == input && $.isNumeric(input)) {
					var openingBalance = parseInt(input);
					account.openingBalance = openingBalance
					$(this).replaceWith(input);
					create_Flag = true;
				}
				else if (input.toLowerCase() == 'o/b') {
					$(this).replaceWith(input);
				}
				else {
					toastr.error('Opening balances must be whole numbers');
				};
			})
			if (create_Flag == true) {
				var accountType = $(this).closest('.account').find('h7').text();
				var name = account.name;

				var exists_Flag = false;

				for (var i = 0; i < accounts.length; i++) {
					if (accounts[i].name.toString() == ID.toString()) {
						exists_Flag = true;
						var exists_index = i
					}
				}
				if (exists_Flag == true) {
					accounts[exists_index].name = name
					accounts[exists_index].balance.balance = account.openingBalance
				}
				else {
					if (accountType == 'Assets') {
						var name = new Asset(name,account.openingBalance);
					}
					else if (accountType == 'Liabilities') {
						var name = new Liability(name,account.openingBalance);
					}
					else if (accountType == 'Expenses') {
						var name = new Expense(name,account.openingBalance);	
					}
					else if (accountType == 'Revenue') {
						var name = new Revenue(name,account.openingBalance);
					}
					accounts.push(name);
				}
			};
			$(this).find('th').find('input').replaceWith(accountName);
		}
		else {
			$(this).remove();
		};
	})
	posted = true;
});

// Edit opening balances

$('th').click(function(){
	if (posted == true) {

		$('#task_menu').find('th').each(function(){
			var input = $(this).text().toUpperCase();
			$(this).closest('table').find('.transaction').find('td').each(function(){
				var value = $(this).text()
				$(this).text('')
				if (value != '') {
					$(this).append("<input value="+value+" type='text' name='opening_balance'>")
				}	
				
			})
			$(this).text('')
			$(this).append("<input id="+input+" value="+input+" type='text' name='account_name'>");
		});

		posted = false
	}
})















