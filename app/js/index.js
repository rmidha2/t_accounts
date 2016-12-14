var FY_Begin = new Date()
var FY_End = new Date()

function beginFY(year,month,day){
	FY_Begin = new Date(year,month,day)
	// console.log(FY_Begin)
}

function endFY(year,month,day){
	FY_End = new Date(year,month,day)
	// console.log(FY_End)
}

beginFY(2010,0,1)
endFY(2011,11,31)

var accounts = []
var transactions_log = []

function Account(name,balanceType,openingBalance) {
	this.name = name
	this.balance = {
		balanceType: balanceType,
		balance: 0
	}

	if (balanceType == 'DEBIT_BALANCE' && openingBalance > 0) {
		this.debits = [openingBalance]
		this.credits = []
	}
	else if (balanceType == 'CREDIT_BALANCE' && openingBalance > 0) {
		this.credits = [openingBalance]
		this.debits = []
	}
	else {
		this.credits = []
		this.debits = []
	}

	this.balance = function(){
		var debits = 0
		var credits = 0
		for (var i = 0; i < this.debits.length; i++) {
			debits += this.debits[i]
		}
		for (var i = 0; i < this.credits.length; i++) {
			credits += this.credits[i]
		}
		if (debits > credits) {
			this.balance.balanceType = "DEBIT_BALANCE"
			this.balance.balance = debits - credits 
		}
		else if (credits > debits) {
			this.balance.balanceType = "CREDIT_BALANCE"
			this.balance.balance = credits - debits
		}
		else if (credits == debits){
			this.balance.balance = 0 
		}
		return 	console.log(this.name+" : "+this.balance.balanceType+" : "+this.balance.balance)
	}
	this.debit = function(amount){
		this.debits.push(amount)
		this.balance()
		transactions_log.push({
			type: 'DEBIT',
			account: this.name,
			amount: amount
		})
		return
	}

	this.credit = function(amount){
		this.credits.push(amount)
		this.balance()
		transactions_log.push({
			type: 'CREDIT',
			account: this.name,
			amount: amount
		})
		return
	}
	this.balance()
}

// SubClasses

function Asset(name,openingBalance,ContraBalance) {
	this.inheritFrom = Account;
	this.inheritFrom(name,"DEBIT_BALANCE",openingBalance)
	this.contraAsset = [ContraBalance]

	this.bookValue = function() {
		var bookValue = this.balance.balance
		for (var i = 1; i < this.debits.length; i++) {
			bookValue += this.debits[i]
		}
		for (var i = 0; i < this.contraAsset.length; i++) {
			bookValue -= this.contraAsset[i]
		}
		return bookValue
	}

	this.depreciateStraightLine = function(residualValue,usefulLife,year,month,day){
		var residualValue = residualValue
		var usefulLife = usefulLife
		var period = timeToEndFY(year,month,day)
		
		var dep = (((this.debits[0] - residualValue)/usefulLife) * (period/12))
		dep = Math.round(dep * 100) / 100
		
		if (this.bookValue() - dep < residualValue) {
			depreciate(this.bookValue() - residualValue)
		}
		else {
			depreciate(dep,this)
		}
	}
	this.depreciateUnits = function(residualValue,totalUnits,usedUnits){
		var residualValue = residualValue
		var totalUnits = totalUnits
		var usedUnits = usedUnits
		
		var dep = (((this.debits[0] - residualValue)/totalUnits) * usedUnits)
		dep = Math.round(dep * 100) / 100
		
		if (this.bookValue() - dep < residualValue) {
			depreciate(this.bookValue() - residualValue)
		}
		else {
			depreciate(dep,this)
		}
	}
	this.depreciateDiminishing = function(residualValue,aVal,usefulLife,year,month,day){
		var residualValue = residualValue
		var aVal = aVal
		var usefulLife = usefulLife
		var period = timeToEndFY(year,month,day)
		
		var dep = (((this.bookValue())/usefulLife) * aVal * period/12)
		dep = Math.round(dep * 100) / 100
		
		if (this.bookValue() - dep < residualValue) {
			depreciate(this.bookValue() - residualValue)
		}
		else {
			depreciate(dep,this)
		}
	}
	return name
}

function Expense(name,openingBalance){
	this.inheritFrom = Account;
	this.inheritFrom(name,"DEBIT_BALANCE",openingBalance)
}

function Revenue(name,openingBalance){
	this.inheritFrom = Account;
	this.inheritFrom(name,"CREDIT_BALANCE",openingBalance)
}

function Liability(name,openingBalance){
	this.inheritFrom = Account;
	this.inheritFrom(name,"CREDIT_BALANCE",openingBalance)
}

// Transaction Functions

function transaction(debAccount,credAccount,amount) {
	debAccount.debit(amount)
	credAccount.credit(amount)
}

function salesDiscount(debAccount,total,amountPrcnt,discountPrcnt) {
	amount = total - total * (amountPrcnt/100)
	discount = amount * (discountPrcnt/100)
	transaction(debAccount,SALES_REVENUE,total)
	transaction(SALES_DISCOUNT_ALLOWANCE,debAccount,discount)
	return
}

function depreciate(dep,account){
	DEPRECIATION_EXPENSE.debit(dep)
	account.contraAsset.push(dep)
	transactions_log.push({
		type: 'CREDIT',
		account: account.name+' '+'A/D',
		amount: dep
	})
}

function writeOff(total,writeOffPrcnt) {
	if (writeOffPrcnt > 0) {
		var cash = (writeOffPrcnt/100)*total
		var writeOff = total - cash
		ACCOUNTS_RECEIVABLE.credit(total)
		ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS.debit(writeOff)
		CASH.debit(cash)
	}
	else {
		transaction(ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS,ACCOUNTS_RECEIVABLE,total)
	}
}

function noteConversion(total,interest,days) {
	var interest = total*(interest/100)*(90/360)

	ACCOUNTS_RECEIVABLE.debit(total + interest)
	NOTES_RECEIVABLE.credit(total)
	INTEREST_REVENUE.credit(interest)
}

function paymentOfAccountWithPrepayment(total,prepayment) {
	CASH.debit(total)
	ACCOUNTS_RECEIVABLE.credit(total - prepayment)
	UNEARNED_REVENUE.credit(prepayment)
}

function findRemainingAR(totalCashCollections) {
	var recordedCollections = findAllCashCollections()
	
	CASH.debit(totalCashCollections - recordedCollections)
	ACCOUNTS_RECEIVABLE.credit(totalCashCollections - recordedCollections)
}

function badDebtExpense(EBprcnt){
	var endingBalance = (EBprcnt/100)*ACCOUNTS_RECEIVABLE.balance.balance

	if (ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS.balance.balanceType == 'DEBIT_BALANCE') {
		ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS.credit(ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS.balance.balance + endingBalance)
		BAD_DEBT_EXPENSE.debit(ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS.balance.balance + endingBalance)
	}
	else {
		ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS.credit(ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS.balance.balance - endingBalance)
		BAD_DEBT_EXPENSE.debit(ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS.balance.balance - endingBalance)
	}
}

function netRealizableValue() {
	var AR_Balance = ACCOUNTS_RECEIVABLE.balance.balance
	var A4DA = ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS.balance.balance
	return AR_Balance - A4DA
}

function inventoryChecklist(shippingTerms,dateShipped,dateReceived,cost,dutyPrcnt,freight,discountPrcnt,returnCost,returnDuty,returnFreight) {
	if (shippingTerms == 'SHIPPING' && checkInFY(dateShipped.year,dateShipped.month,dateShipped.day) != true) {
		return false
	}
	if (shippingTerms == 'DESTINATION' && checkInFY(dateReceived.year,dateReceived.month,dateReceived.day) != true) {
		return false
	}
	var dutyCost = (dutyPrcnt/100)*cost
	var discount = (discountPrcnt/100)*cost
	var returnDuty = (dutyPrcnt/100)*returnCost
	var returnFreight = (dutyPrcnt/100)*returnCost
	var inventoryItem = {
		invoicePrice: cost,
		dutyCost: dutyCost,
		freightCost: freight,
		discount: discount,
		returnCost: returnCost,
		returnDuty: returnDuty,
		returnFreight: returnFreight,
	}
	var sum = cost + dutyCost + freight - discount - returnCost + returnDuty
	INVENTORY.debit()
}

// Utility Functions
function timeToEndFY(year,month,day) {
	var date = new Date(year,month,day)
	console.log(date)
	var halfMonth = 0
	if ( 7 < date.getDate() && date.getDate() < 23) {
		halfMonth = .5
	}
	else if (date.getDate() < 8){
		halfMonth = 1
	}
	difference = (FY_End.getMonth() - date.getMonth() + halfMonth)
	return difference
}

function checkInFY(year,month,day) {
	var date = new Date(year,month,day)
	return date > FY_Begin && date < FY_End
}

function findAllCashCollections(){
	var collections = []
	var disbursements = []
	sum = 0
	for (var i = 0; i < transactions_log.length; i++) {
		var debit_transaction = transactions_log[i]
		var credit_transaction = transactions_log[i+1]
		if (debit_transaction.account == 'CASH' && debit_transaction.type == 'DEBIT' && credit_transaction.account == 'ACCOUNTS_RECEIVABLE' && credit_transaction.type == 'CREDIT') {
			collections.push(debit_transaction.amount)
		}
	}
	for (var i = 0; i < transactions_log.length; i++) {
		var debit_transaction = transactions_log[i]
		var credit_transaction = transactions_log[i+1]
		if (debit_transaction.account == 'ACCOUNTS_RECEIVABLE' && debit_transaction.type == 'DEBIT' && credit_transaction.account == 'CASH' && credit_transaction.type == 'CREDIT') {
			disbursements.push(debit_transaction.amount)
		}
	}
	for (var i = 0; i < collections.length; i++) {
		sum += collections[i]
	}
	for (var i = 0; i < disbursements.length; i++) {
		sum -= disbursements[i]
	}
	return sum
}


// var VAN = new Asset('VAN',500,100)
// // var CASH = new Asset('CASH',10000)
// var INVENTORY = new Asset('INVENTORY',1000)
// var ACCOUNTS_RECEIVABLE = new Asset('ACCOUNTS_RECEIVABLE',42300)
// // var NOTES_RECEIVABLE = new Asset('NOTES_RECEIVABLE',0)
// var ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS = new Asset('ALLOWANCE_FOR_DOUBTFUL_ACCOUNTS',309)


// // var DEPRECIATION_EXPENSE = new Expense('DEPRECIATION_EXPENSE',0)
// var BAD_DEBT_EXPENSE = new Expense('BAD_DEBT_EXPENSE',0)

// var INTEREST_REVENUE = new Revenue('INTEREST_REVENUE',0)

// var UNEARNED_REVENUE = new Liability('UNEARNED_REVENUE',0)

// transaction(CASH,ACCOUNTS_RECEIVABLE,100)
// transaction(CASH,ACCOUNTS_RECEIVABLE,30)
// transaction(ACCOUNTS_RECEIVABLE,CASH,30)
// transaction(VAN,ACCOUNTS_RECEIVABLE,109)
// transaction(CASH,ACCOUNTS_RECEIVABLE,50)

