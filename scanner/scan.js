var XLSX = require('xlsx');

/*
    exploration result store in a CSV and scan here...
*/
scanCsv = async () => {
    const workbook = XLSX.readFile('result.xlsx');
    const sheet_name_list = workbook.SheetNames;
    const xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    let buySignalResult = {};
    let sellSignalResult = {};
    for (const data of xlData) {
        if(data['Ticker'] && data['Ticker'].length === 4){
            if(data['Sinyal'].toUpperCase() === 'BUY') {
                if (buySignalResult[data['Ticker']]) {
                    buySignalResult[data['Ticker']] = buySignalResult[data['Ticker']] + 1;
                } else {
                    buySignalResult[data['Ticker']] = 1;
                }    
            }
            if(data['Sinyal'].toUpperCase() === 'SELL') {
                if (sellSignalResult[data['Ticker']]) {
                    sellSignalResult[data['Ticker']] = sellSignalResult[data['Ticker']] + 1;
                } else {
                    sellSignalResult[data['Ticker']] = 1;
                }    
            }
        }
    }
    let sortableBuySignal = [];
    for (let Ticker in buySignalResult) {
        if (buySignalResult[Ticker] >= 6) {
            sortableBuySignal.push([Ticker, buySignalResult[Ticker]]);
        }
    }

    sortableBuySignal.sort(function (a, b) {
        return b[1] - a[1];
    });
    console.log("BUY SIGNAL",sortableBuySignal);

    console.log("================");

    let sortableSellSignal = [];
    for (let Ticker in sellSignalResult) {
        if (sellSignalResult[Ticker] >= 6) {
            sortableSellSignal.push([Ticker, sellSignalResult[Ticker]]);
        }
    }

    sortableSellSignal.sort(function (a, b) {
        return b[1] - a[1];
    });
    console.log("SELL SIGNAL",sortableSellSignal);

}

scanCsv();