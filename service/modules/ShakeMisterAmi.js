/* eslint-disable no-undef */
function requestChart (stockCode, documentIndex, sheetIndex, filePath) {
  AB = new ActiveXObject('Broker.Application');
  ABDocs = AB.Documents;
  AD = ABDocs.Item(documentIndex);
  ADWindows = AD.Windows;
  AW = ADWindows.Item(sheetIndex);
  AW.Activate();
  AD.Name = stockCode;
  AW.SelectedTab = sheetIndex;
  AW.ExportImage(filePath + stockCode + '.png', 1500, 780);
}

var stockCodeArgs = WScript.arguments(0);
var documentIndexArgs = WScript.arguments(1);
var sheetIndexArgs = WScript.arguments(2);
var filePathArgs = WScript.arguments(3);

requestChart(stockCodeArgs, documentIndexArgs, sheetIndexArgs, filePathArgs);
