/**
 * First import the excel and seperate the sheets
 * Separate the DEBIT and CREDIT transactions
 * Further in DEBIT transaction, seperate UPI, Wallet and Bank Account transactions
 * then print everything in a table and export to excel with separate sheets
 * for DEBIT and CREDIT transactions
 *
 * Debit Transaction Fields:
 *  - Date
 *  - Time
 *  - Transaction ID
 *  - Type (DEBIT/CREDIT)
 *  - Amount
 *  - Paid To
 *  - Paid By
 *  - UTR No.
 *
 * Credit Transaction Fields:
 *  - Date
 *  - Time
 *  - Transaction ID
 *  - Type (DEBIT/CREDIT)
 *  - Amount
 *  - Recieved From
 *  - Credited To
 *  - UTR No.
 */

const XLSX = require("xlsx");

const PAID_BY = Object.freeze({
	UPI_LITE: "UPI Lite",
	PHONEPE_WALLET: "PhonePe Wallet",
	BANK_ACCOUNT: "Bank Account",
});

const excelFileName = "PhonePe_Statement_Jan2026_Jan2026.xls";

const paidToExpression = new RegExp(/(Paid to|Paid by):\s*(.+)/i);
const masterTransactionsData = [];
let debitTransactions = [];
const creditTransactions = [];
const workbook = XLSX.readFile(excelFileName);

workbook.SheetNames.forEach(processSheet);
masterTransactionsData.push(...debitTransactions, ...creditTransactions);
debitTransactions = debitTransactions.filter(
	(row) => row.Transaction !== "Top-up Wallet",
);
// if (process.argv.slice(2).includes("--export")) { // TODO: Enable export flag via cli
exportToExcel();
// }

console.log(`\nTotal Sheets Processed: ${workbook.SheetNames.length}\n`);
console.log(`\nTotal Debit transaction Processed: ${debitTransactions.length}`);
console.log(
	`\nTotal Credit transaction Processed: ${creditTransactions.length}`,
);

// We need to export the combined data into a new excel file with separate sheets for DEBIT and CREDIT
function exportToExcel() {
	const newWorkbook = XLSX.utils.book_new();
	// Create DEBIT sheet
	const wsDebit = XLSX.utils.json_to_sheet(debitTransactions);
	XLSX.utils.book_append_sheet(newWorkbook, wsDebit, "DEBIT");

	// Create CREDIT sheet
	const wsCredit = XLSX.utils.json_to_sheet(creditTransactions);
	XLSX.utils.book_append_sheet(newWorkbook, wsCredit, "CREDIT");

	XLSX.writeFile(newWorkbook, "./transactions_export.xlsx");
	console.log("\nExported transactions_export_v2.xlsx successfully!");
}

function processSheet(sheetName, index) {
	// if (index > 0) return; // Process only the first sheet for now
	console.log(`Processing sheet: ${sheetName}`);
	const sheet = workbook.Sheets[sheetName];
	const sheetData = XLSX.utils.sheet_to_json(sheet);
	sheetData.pop();
	sheetData.pop();

	let rowIndex = 0;
	while (rowIndex < sheetData.length) {
		const row = sheetData[rowIndex];
		if (row.Type === "DEBIT" || row.Type === "CREDIT") {
			if (row.Type === "DEBIT") {
				const { Type, Transaction, Amount } = row;
				const debittransaction = {
					Type,
					Transaction,
					Amount: removeRupeeSymbol(Amount),
				};

				/**
				 * From this  point we loop throught the next row till we find another DEBIT or CREDIT
				 * or we reach the end of the sheet
				 * In this loop we will find the following details
				 * also have to find out Paid by field
				 */
				let lookAheadIndex = rowIndex + 1;
				while (lookAheadIndex < sheetData.length) {
					const lookAheadRow = sheetData[lookAheadIndex];
					if (
						lookAheadRow.Type === "DEBIT" ||
						lookAheadRow.Type === "CREDIT"
					) {
						break; // Stop if we reach another main transaction
					}
					if (
						lookAheadRow.Transaction &&
						lookAheadRow.Transaction.includes("Transaction ID")
					) {
						debittransaction.TransactionID =
							lookAheadRow.Transaction.replace(
								"Transaction ID",
								"",
							).trim();
					} else if (
						lookAheadRow.Transaction &&
						lookAheadRow.Transaction.includes("UTR No.")
					) {
						debittransaction.UTRNo =
							lookAheadRow.Transaction.replace(
								"UTR No.",
								"",
							).trim();
					} else if (
						lookAheadRow.Transaction &&
						paidToExpression.test(lookAheadRow.Transaction)
					) {
						const match =
							lookAheadRow.Transaction.match(paidToExpression);
						if (match && match.length === 3) {
							debittransaction.PaidTo = match[2].trim();
						}
					} else if (
						lookAheadRow.Transaction &&
						lookAheadRow.Transaction.includes("Paid by")
					) {
						const match =
							lookAheadRow.Transaction.match(paidToExpression);
						if (match && match.length === 3) {
							// TODO: Paid By is still empty
							const paidByValue = match[2].trim();
							if (paidByValue.includes(PAID_BY.UPI_LITE)) {
								debittransaction.PaidBy = PAID_BY.UPI_LITE;
							} else if (
								paidByValue.includes(PAID_BY.PHONEPE_WALLET)
							) {
								debittransaction.PaidBy =
									PAID_BY.PHONEPE_WALLET;
							} else if (
								paidByValue.includes(PAID_BY.BANK_ACCOUNT)
							) {
								debittransaction.PaidBy = PAID_BY.BANK_ACCOUNT;
							}
						}
					}
					lookAheadIndex++;
				}

				debitTransactions.push(debittransaction);
			} else if (row.Type === "CREDIT") {
				const { Type, Transaction, Amount } = row;
				const creditTransaction = {
					Type,
					Transaction,
					Amount: removeRupeeSymbol(Amount),
				};

				/**
				 * Further in point we loop throught the next row till we find another DEBIT or CREDIT
				 * or we reach the end of the sheet
				 * In this loop we will find the following details
				 */
				let lookAheadIndex = rowIndex + 1;
				while (lookAheadIndex < sheetData.length) {
					const lookAheadRow = sheetData[lookAheadIndex];
					if (
						lookAheadRow.Type === "DEBIT" ||
						lookAheadRow.Type === "CREDIT"
					) {
						break; // Stop if we reach another main transaction
					}
					if (
						lookAheadRow.Transaction &&
						lookAheadRow.Transaction.includes("Transaction ID")
					) {
						creditTransaction.TransactionID =
							lookAheadRow.Transaction.replace(
								"Transaction ID",
								"",
							).trim();
					} else if (
						lookAheadRow.Transaction &&
						lookAheadRow.Transaction.includes("UTR No.")
					) {
						creditTransaction.UTRNo =
							lookAheadRow.Transaction.replace(
								"UTR No.",
								"",
							).trim();
					} else if (
						lookAheadRow.Transaction &&
						paidToExpression.test(lookAheadRow.Transaction)
					) {
						const match =
							lookAheadRow.Transaction.match(paidToExpression);
						// TODO: Recieved by is still empty
						if (match && match.length === 3) {
							creditTransaction.ReceivedFrom = match[2].trim();
						}
					}
					lookAheadIndex++;
				}

				creditTransactions.push(creditTransaction);
			}
		}
		rowIndex++;
	}
}

function removeRupeeSymbol(amountStr) {
	return Number(amountStr.replace("₹", "").replace(",", "").trim());
}
