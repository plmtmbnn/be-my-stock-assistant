function requestChart(stockCode, documentIndex, sheetIndex) {
    AB = new ActiveXObject("Broker.Application");
    ABDocs = AB.Documents;
    AD = ABDocs.Item(documentIndex);
	ADWindows = AD.Windows;
    AW = ADWindows.Item(sheetIndex);
    AW.Activate();
    AD.Name = stockCode;
    AW.SelectedTab = sheetIndex;
    AW.ExportImage("C:\\\Project\\ami-result\\" + stockCode + ".png", 1500, 780);

}

var stockCodeArgs = WScript.arguments(0);
var documentIndexArgs = WScript.arguments(1);
var sheetIndexArgs = WScript.arguments(2);

requestChart(stockCodeArgs, documentIndexArgs, sheetIndexArgs);