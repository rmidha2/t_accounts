function createAccount (parentAccount,name,debit,credit) {

	account = {
		name: name,
		opening_balance: 0,
		debits: [debit],
		credits: [credit],
		balance: 0,
		ending_balance: 0
	}

	if (parentAccount == 'ASSET') {
		account.AD = []
	}
	else if (parentAccount == 'LIABILITIES') {

	}
	else if (parentAccount == 'EQUITY') {

	}
	else if (parentAccount == 'REVENUES') {

	}
	var flag = false
	for (var i = 0; i < Accounts.length; i++) {
		for (var j = 0; j < Accounts[i].accounts.length; j++) {
			if (name == Accounts[i].accounts[j].name  ) {
				flag = true
			}
		}
		if (flag == false && Accounts[i].name == parentAccount) {
			Accounts[i].accounts.push(account)
			return
		}
		else {
			console.log('exists')
			return
		}
	}
	return
}

function debit (accountName,amount) {
	var account = searchAccount(accountName)
	account.debits.push(amount)
	balance(accountName)
	console.log(account)
	return
}

function credit (accountName,amount) {
	var account = searchAccount(accountName)
	account.credits.push(amount)
	balance(accountName)
	console.log(account)
	return
}

function transaction (debAccount,credAccount,amount) {
	debit(debAccount,amount)
	credit(credAccount,amount)
	return
}

function discount (debAccount,total,amountPrcnt,discountPrcnt) {
	amount = total - total * (amountPrcnt/100)
	discount = amount * (discountPrcnt/100)
	transaction(debAccount,'SALES REVENUE',total)
	transaction(debAccount,'SALES DISCOUNT ALLOWANCE',discount)
	return
}

function depStraight (asset,histCost,residValue,useLife,months) {
	dep = ((histCost - residValue)/useLife) * (months/12)
	depreciate(asset,dep,residValue)
	return
}

function depUnits (asset,histCost,residValue,totalUnits,unitsUsed) {
	dep = ((histCost - residValue)/totalUnits) * unitsUsed
	depreciate(asset,dep,residValue)
	return
}

function depDiminishing (asset,histCost,aVal,useLife,months) {
	AD = sumAD(asset)
	dep = ((histCost - AD)/useLife) * (months/12)
	depreciate(asset,dep,residValue)
	return
}

function depreciate (asset,dep,residValue) {
	var account = searchAccount(asset)
	var depVal = dep

	if (bookValue(asset) - dep < residValue) {
		depVal = bookValue(asset) - residValue
	}

	account.AD.push(depVal)
	debit('DEPRECIATION EXPENSE',depVal)
	return
}

function searchAccount (accountName) {
	for (var i = 0; i < Accounts.length; i++) {
		for (var j = 0; j < Accounts[i].accounts.length; j++) {
			if (accountName == Accounts[i].accounts[j].name) {
				return Accounts[i].accounts[j]
			}
			else if (Accounts[i].accounts[j].name == 'LONG-LIVED ASSETS') {
				for (var z = 0; z <  Accounts[i].accounts[j].accounts.length; z++) {
					if (accountName == Accounts[i].accounts[j].accounts[z].name) {
						return Accounts[i].accounts[j].accounts[z]
					}
				}
			}
		}
	}
	return
}

function balance(accountName){
	var account = searchAccount(accountName)
	var debits = sumDebits(accountName)
	var credits = sumCredits(accountName)
	account.balance = debits - credits
	return
}

function bookValue (asset) {
	var HC = searchAccount(asset).balance
	var AD = sumAD(asset)
	var BV =  HC - AD
	return BV
}

function sumAD (asset) {
	var sum = 0
	account = searchAccount(asset)
	for (var i = 0; i < account.AD.length; i++) {
		sum += account.AD[i]
	}
	return sum
}

function sumDebits (accountName) {
	var account = searchAccount(accountName)
	var debits = account.debits
	var sum = 0
	if (debits.length > 0) {
		for (var i = 0; i < debits.length; i++) {
			sum += debits[i]
		}
	}
	return sum
}

function sumCredits (accountName) {
	var account = searchAccount(accountName)
	var credits = account.credits
	var sum = 0
	if (credits.length) {
		for (var i = 0; i < credits.length; i++) {
			sum += credits[i]
		}
	}
	return sum
}

// Standard Transactions

// Cash Sale

// Account Data

Accounts = [

	{ 
		name: 'ASSETS',
		accounts:
			[
				{ 	name: 'CASH',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0 },
				{ 	name: 'ACCOUNTS RECIEVABLE',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0,
					ending_balance: 0 },
				{ 	name: 'ALLOWANCE FOR DOUBTFUL ACCOUNTS',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0,
					ending_balance: 0 },
				{ 	name: 'INVENTORY',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0,
					ending_balance: 0 },
				{
					name: 'LONG-LIVED ASSETS',
					accounts:
						[
							{ 	name: 'VAN',
								opening_balance: 0,
								debits: [],
								credits: [],
								AD: 
									{
										debits: [],
										credits: []	
									},
								balance: 0,
								ending_balance: 0 }
						]
				}
			] 
	},

	{
		name: 'LIABILITIES',
		accounts: 
			[
				{ 	name: 'UNEARNED REVENUE',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0 },
				{ 	name: 'ACCOUNTS PAYABLE',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0 }
			]
	},

	{
		name: 'EQUITY',
		accounts: 
			[
				{ 	name: 'COMMON STOCK',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0 },
				{ 	name: 'RETAINED EARNINGS',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0 }	
			]
	},

	{
		name: 'EXPENSES',
		accounts:
			[
				{ 	name: 'DEPRECIATION EXPENSE',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0 },
				{ 	name: 'BAD DEBT EXPENSE',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0 },
				{ 	name: 'COGS EXPENSE',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0 },
				{ 	name: 'INTEREST EXPENSE',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0 }
			]
	},

	{
		name: 'REVENUES',
		accounts: 
			[
				{ 	name: 'SALES REVENUE',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0 },
				{ 	name: 'INTEREST REVENUE',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0 },
				{ 	name: 'SALES DISCOUNT ALLOWANCE',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0 },
				{ 	name: 'SALES RETURNS AND ALLOWANCES',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0 },
				{ 	name: 'INCOME SUMMARY',
					opening_balance: 0,
					debits: [],
					credits: [],
					balance: 0 }
			]
	}
]



	



		