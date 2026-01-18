# Transactions / Expense manager

## Description

This script takes an phonePe statmenet and output the total DEBIT / CREDIT transactions in a new excel so you can keep track of expenses.

## How to install

```
# Clone this repository
git clone https://github.com/mallikarjun2000/PhonePe-transaction-extractor.git

npm install

```

## Usage

To use this application

1. Go to PhonePe > History > My Statement > Download
2. Transform the pdf to excel using PdfGear.
3. Paste the excel in the repository folder.
4. In the `transactions.js` update the `excelFileName` variable with your excel file name
5. Run npm run start.
6. You can get the transactions list in `transactions_export.xlxs` file.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Lisence

MIT License
Copyright (c) [2026] [Mallikarjun Prasada Rao Komaraju]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
