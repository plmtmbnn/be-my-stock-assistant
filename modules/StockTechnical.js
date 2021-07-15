const { default: axios } = require('axios');
const moment = require('moment');
const { execFile } = require("child_process");
const StockPick = require('./StockPick');
const StockTechnical = {
    thousandSeparatorPure(number) {
        try {
            let newNumber = number.toString();
            let postFix = '';
            let removeAfter = 0;
            if (newNumber.length > 12) {
                postFix = ' T';
                removeAfter = newNumber.length - 12;
            } else if (newNumber.length > 9) {
                postFix = ' miliar';
                removeAfter = newNumber.length - 9;
            } else if (newNumber.length > 6) {
                postFix = ' juta';
                removeAfter = newNumber.length - 6;
            } else {
            }
            if (removeAfter !== 0) {
                newNumber = '';
            }
            for (let index = 0; index < removeAfter; index++) {
                newNumber = newNumber + number.toString()[index];
            }
            return newNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + `${removeAfter === 0 ? '' : "." + number.toString()[removeAfter] + number.toString()[removeAfter + 1]}` + postFix;
        } catch (e) {
            return null;
        }
    },

    async getWatchlistData() {
        let result = null;
        try {
            let URL = `https://api.stockbit.com/v2.4/watchlist/company/1159544`;
            const response = await axios({
                method: 'GET',
                url: URL,
                headers: { authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MjQ2MDQyNzIsImp0aSI6IlVLaFFNVHd3YlFHRTZvWXV1RkRMcGc9PSIsImlzcyI6IlNUT0NLQklUIiwibmJmIjoxNjI0NjA0MjcyLCJleHAiOjE2MjY0MTg2NzIsImRhdGEiOnsidXNlIjoibjN5Z2J1IiwiZW1hIjoicG9sbWFlYmVuZWplckBnbWFpbC5jb20iLCJmdWwiOiJQb2xtYSBUYW1idW5hbiIsInNlcyI6IkgxUTlGUW9VNHlQMTRZUjciLCJkdmMiOiIifX0.bSPt9UBNLgMLBxPagCdMIUWYi-Qsv5OzI-lhJysCHNE' }
            });
            if (response.data &&
                Object.keys(response.data).length > 0 &&
                response.data.message === 'Retrieved your saved watchlist') {
                    result = response.data.data;
            }
        } catch (error) {
            console.log('ERROR CALL AXIOS', error);
        } finally {
            return result;
        }
    },

    async responseWatchlistBot(ctx, isShowOrderBook) {
        let message = `...`;
        let watchlistMessage = '';
        try {
            const data = await StockTechnical.getWatchlistData();
            if (data) {
                
                for (const stock of data.result) {
                    watchlistMessage = `${watchlistMessage}\n===${stock.symbol}===`;
                    watchlistMessage = `${watchlistMessage}\nMax Buy: ${StockPick[stock.symbol].maxBuyAt}`;
                    watchlistMessage = `${watchlistMessage}\nLast Price: ${stock.last} (${
                        ((stock.last / StockPick[stock.symbol].maxBuyAt - 1) * 100).toFixed(2)
                    } %)`;
                    watchlistMessage = `${watchlistMessage}\nCL: ${StockPick[stock.symbol].cutLoss}`;
                    watchlistMessage = `${watchlistMessage}\n`;
                }
                message = watchlistMessage;
            }
        } catch (error) {
            message = 'Beli saat merah, jual di lebih merah.';
            console.log('ERROR [responseBot]', error);
        } finally {
            ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
        }
    },

    async getorderbookData(stockCode) {
        let result = null;
        try {
            let URL = `https://api.stockbit.com/v2.4/orderbook/preview/${stockCode}`;
            const response = await axios({
                method: 'GET',
                url: URL,
                headers: { authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MjQ2MDQyNzIsImp0aSI6IlVLaFFNVHd3YlFHRTZvWXV1RkRMcGc9PSIsImlzcyI6IlNUT0NLQklUIiwibmJmIjoxNjI0NjA0MjcyLCJleHAiOjE2MjY0MTg2NzIsImRhdGEiOnsidXNlIjoibjN5Z2J1IiwiZW1hIjoicG9sbWFlYmVuZWplckBnbWFpbC5jb20iLCJmdWwiOiJQb2xtYSBUYW1idW5hbiIsInNlcyI6IkgxUTlGUW9VNHlQMTRZUjciLCJkdmMiOiIifX0.bSPt9UBNLgMLBxPagCdMIUWYi-Qsv5OzI-lhJysCHNE' }
            });
            if (response.data &&
                Object.keys(response.data).length > 0 &&
                response.data.message === 'Successfully retrieved company orderbook data') {
                result = response.data.data;
            }
        } catch (error) {
            console.log('ERROR CALL AXIOS', error);
        } finally {
            return result;
        }
    },

    async responseOrderBookBot(ctx, isShowOrderBook) {
        console.log(ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
        const stockCode = ctx.match[1].toUpperCase();
        let message = `...`;
        let orderbookMessage = '';
        try {
            const data = await StockTechnical.getorderbookData(stockCode);
            if (data) {
                let total_bid = 0;
                Object.keys(data.bid).map((x) => {
                    if (x.includes('price')) {
                        total_bid++;
                    }
                });
                let total_offer = 0;
                Object.keys(data.offer).map((x) => {
                    if (x.includes('price')) {
                        total_offer++;
                    }
                });

                if (isShowOrderBook) {
                    orderbookMessage = `\n\n===BID ORDER===\n[  Price  ||  BLot  ||  Freq  ]`;
                    totalBidVolume = 0;
                    totalOfferVolume = 0;

                    for (let index = total_bid; index >= 1; index--) {
                        orderbookMessage = orderbookMessage + '\n| ' + data.bid[`price${index}`] + ' || ' + StockTechnical.thousandSeparatorPure(parseFloat(data.bid[`volume${index}`]) / 100) + ' || ' + data.bid[`que_num${index}`] + ' |';
                        totalBidVolume += parseFloat(data.bid[`volume${index}`]);
                    }
                    if (total_bid === 0) {
                        orderbookMessage = orderbookMessage + '\n--------- ARB ---------'
                    }
                    orderbookMessage = orderbookMessage + '\nTotal: ' + StockTechnical.thousandSeparatorPure(totalBidVolume / 100) + " lot";

                    orderbookMessage = orderbookMessage + `\n\n===OFFER ORDER===\n[  Price  ||  SLot  ||  Freq  ]`;
                    for (let index = 1; index <= total_offer; index++) {
                        orderbookMessage = orderbookMessage + '\n| ' + data.offer[`price${index}`] + ' || ' + StockTechnical.thousandSeparatorPure(parseFloat(data.offer[`volume${index}`]) / 100) + ' || ' + data.offer[`que_num${index}`] + ' |';
                        totalOfferVolume += parseFloat(data.offer[`volume${index}`]);
                    }
                    if (total_offer === 0) {
                        orderbookMessage = orderbookMessage + '\n--------- ARA ---------';
                    }
                    orderbookMessage = orderbookMessage + '\nTotal: ' + StockTechnical.thousandSeparatorPure(totalOfferVolume / 100) + " lot";
                    orderbookMessage = orderbookMessage + `\n\nBuyers (${((totalBidVolume / (totalBidVolume + totalOfferVolume)) * 100).toFixed(0)}%) vs Sellers (${((totalOfferVolume / (totalBidVolume + totalOfferVolume)) * 100).toFixed(0)}%)`;

                    const buyingPowerPercentage = ((totalBidVolume / (totalBidVolume + totalOfferVolume)) * 100);
                    if (buyingPowerPercentage > 70) {
                        orderbookMessage = orderbookMessage + `\nPasukan beli sudah mendominasi.`;
                    } else if (buyingPowerPercentage > 60 && buyingPowerPercentage < 70) {
                        orderbookMessage = orderbookMessage + `\nDominasi pasukan beli cukup kuat.`;
                    } else if (buyingPowerPercentage > 40 && buyingPowerPercentage < 60) {
                        orderbookMessage = orderbookMessage + `\nDaya beli dan tekanan jual berimbang.`;
                    } else {
                        orderbookMessage = orderbookMessage + `\nSedang dalam tekanan jual yang cukup besar.`;
                    }
                }

                message = `$${data.symbol} - ${data.name}\n========================`;
                let emoji_change = '';
                if (data.percentage_change < -4) {
                    emoji_change = '🆘';
                } else if (data.percentage_change > 0 && data.percentage_change <= 6) {
                    emoji_change = '⬆️';
                } else if (data.percentage_change > 6) {
                    emoji_change = '🚀';
                } else if (data.percentage_change >= -2 && data.percentage_change < 0) {
                    emoji_change = '⬇️';
                } else if (data.percentage_change >= -4 && data.percentage_change < -2) {
                    emoji_change = '⚠️';
                } else {
                    emoji_change = '😴';
                }

                message = message + `\nHarga Terakhir\t: ${data.close} (${data.change > 0 ? `+${data.change}` : data.change})`;
                message = message + `\nPerubahan\t: ${data.percentage_change}% ${emoji_change}`;
                message = message + `\nHarga Sebelum\t: ${data.previous}`;
                message = message + `\nHigh\t: ${data.high}`;
                message = message + `\nLow\t: ${data.low}`;
                if (data.tradeable === 1) {
                    message = message + `\n\nTotal Volume: ${StockTechnical.thousandSeparatorPure(data.volume / 100)} lot`;
                    message = message + `\nTotal Transaksi: Rp ${StockTechnical.thousandSeparatorPure(data.value)} `;
                    message = message + `\n\nDomestik ${data.domestic === '-' ? 0 : data.domestic}% vs Asing ${data.foreign === '-' ? 0 : data.foreign}%`;
                    if (data.fnet !== 0) {
                        message = message + `\n${data.fnet > 0 ? 'Yuhuu, asing belanja' : 'Ops, asing jualan'} Rp ${StockTechnical.thousandSeparatorPure(Math.abs(data.fnet))} ${data.fnet > 0 ? '😍' : '😕'}`;
                    }
                    message = message + `\n${orderbookMessage}`;
                } else {
                    message = message + `\n=========SEDANG DALAM SUSPENSI=========`;
                }
            }
        } catch (error) {
            message = 'Beli saat merah, jual di lebih merah.';
            console.log('ERROR [responseBot]', error);
        } finally {
            ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
        }
    },

    async getStockNews(stockCode) {
        let result = null;
        try {
            let URL = `https://api.stockbit.com/v2.4/stream/symbol/${stockCode}?category=news&beforelastpost=0&lastpost=0&keyword=&from=&to=&clean=0&limit=10`;
            const response = await axios({
                method: 'GET',
                url: URL,
                headers: { authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MjQ2MDQyNzIsImp0aSI6IlVLaFFNVHd3YlFHRTZvWXV1RkRMcGc9PSIsImlzcyI6IlNUT0NLQklUIiwibmJmIjoxNjI0NjA0MjcyLCJleHAiOjE2MjY0MTg2NzIsImRhdGEiOnsidXNlIjoibjN5Z2J1IiwiZW1hIjoicG9sbWFlYmVuZWplckBnbWFpbC5jb20iLCJmdWwiOiJQb2xtYSBUYW1idW5hbiIsInNlcyI6IkgxUTlGUW9VNHlQMTRZUjciLCJkdmMiOiIifX0.bSPt9UBNLgMLBxPagCdMIUWYi-Qsv5OzI-lhJysCHNE' }
            });
            if (response.data && response.data.data && response.data.data.length > 0) {
                result = response.data.data;
            }
        } catch (error) {
            console.log('ERROR CALL AXIOS', error);
        } finally {
            return result;
        }
    },

    async responseStockNews(ctx) {
        console.log(ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
        const stockCode = ctx.match[1].toUpperCase();
        let message = `...`;
        try {
            const data = await StockTechnical.getStockNews(stockCode);
            if (data) {
                message = '10 berita terbaru seputar $' + stockCode + ':\n';
                for (const news of data) {
                    message = message + `\n${news.title}`;
                    message = message + `\n${news.titleurl}`;
                    // message = message + `\n${news.content}`;
                    message = message + '\n';
                }
            }
        } catch (error) {
            message = 'Beli saat merah, jual di lebih merah.';
            console.log('ERROR [responseBot]', error);
        } finally {
            ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
        }
    },

    async getStockValuation(stockCode) {
        let result = null;
        try {
            let URL = `https://pasardana.id/api/StockService/StockValuation?stockCode=${stockCode}&period=36`;
            const response = await axios({
                url: URL,
                method: 'GET',
                headers: {
                    'Accept-Encoding': 'identity',
                    'Content-Type': 'application/json, text/plain, */*'
                }
            });
            if (response.data) {
                result = response.data;
            }
        } catch (error) {
            console.log('ERROR CALL AXIOS', error);
        } finally {
            return result;
        }
    },

    async responseStockValuation(ctx) {
        console.log(ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
        const stockCode = ctx.match[1].toUpperCase();
        let message = `...`;
        try {
            const data = await StockTechnical.getStockValuation(stockCode);
            if (data) {
                message = `$${data.Stock.Code} - ${data.Stock.Name}\n\n`;
                message = message + `=====PBV:\n`;
                message = message + `Forecasting Price Neutral: ${(data.PbvPlotLines.ForecastingPriceNeutral).toFixed(0)}\n`;
                message = message + `Forecasting Price Optimistic: ${(data.PbvPlotLines.ForecastingPriceOptimistic).toFixed(0)}\n`;
                message = message + `Forecasting Price Pesimistic: ${(data.PbvPlotLines.ForecastingPricePesimistic).toFixed(0)}\n`;
                message = message + `Potential Upside/Downside Neutral: ${(data.PbvPlotLines.PotentialNeutral * 100).toFixed(1)}%\n`;
                message = message + `Potential Upside/Downside Optimistic: ${(data.PbvPlotLines.PotentialOptimistic * 100).toFixed(1)}%\n`;
                message = message + `Potential Upside/Downside Pesimistic: ${(data.PbvPlotLines.PotentialPesimistic * 100).toFixed(1)}%\n\n`;
                message = message + `=====PER:\n`;
                message = message + `Forecasting Price Neutral: ${(data.PerPlotLines.ForecastingPriceNeutral).toFixed(0)}\n`;
                message = message + `Forecasting Price Optimistic: ${(data.PerPlotLines.ForecastingPriceOptimistic).toFixed(0)}\n`;
                message = message + `Forecasting Price Pesimistic: ${(data.PerPlotLines.ForecastingPricePesimistic).toFixed(0)}\n`;
                message = message + `Potential Upside/Downside Neutral: ${(data.PerPlotLines.PotentialNeutral * 100).toFixed(1)}%\n`;
                message = message + `Potential Upside/Downside Optimistic: ${(data.PerPlotLines.PotentialOptimistic * 100).toFixed(1)}%\n`;
                message = message + `Potential Upside/Downside Pesimistic: ${(data.PerPlotLines.PotentialPesimistic * 100).toFixed(1)}%\n\n`;
                message = message + `=====Price:\n`;
                message = message + `Forecasting Price Neutral: ${(data.PricePlotLines.ForecastingPriceNeutral).toFixed(0)}\n`;
                message = message + `Forecasting Price Optimistic: ${(data.PricePlotLines.ForecastingPriceOptimistic).toFixed(0)}\n`;
                message = message + `Forecasting Price Pesimistic: ${(data.PricePlotLines.ForecastingPricePesimistic).toFixed(0)}\n`;
                message = message + `Potential Upside/Downside Neutral: ${(data.PricePlotLines.PotentialNeutral * 100).toFixed(1)}%\n`;
                message = message + `Potential Upside/Downside Optimistic: ${(data.PricePlotLines.PotentialOptimistic * 100).toFixed(1)}%\n`;
                message = message + `Potential Upside/Downside Pesimistic: ${(data.PricePlotLines.PotentialPesimistic * 100).toFixed(1)}%\n\n`;
            }
        } catch (error) {
            message = 'Beli saat merah, jual di lebih merah.';
            console.log('ERROR [responseBot]', error);
        } finally {
            ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
        }
    },

    async getStockValuationSameSector(stockCode) {
        let result = null;
        try {
            let URL = `https://pasardana.id/api/StockService/StockValuationVsROE?stockCode=${stockCode}`;
            const response = await axios({
                url: URL,
                method: 'GET',
                headers: {
                    'Accept-Encoding': 'identity',
                    'Content-Type': 'application/json, text/plain, */*'
                }
            });
            if (response.data) {
                result = response.data;
            }
        } catch (error) {
            console.log('ERROR CALL AXIOS', error);
        } finally {
            return result;
        }
    },

    async responseStockValuationSameSector(ctx) {
        console.log(ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
        const stockCode = ctx.match[1].toUpperCase();
        let message = `...`;
        try {
            const data = await StockTechnical.getStockValuationSameSector(stockCode);
            if (data) {
                message = `Valuasi Emiten satu sektor dengan $${data.Stock.Code}:\n\n`;
                for (const stock of data.PerPbvs) {
                    message = message + `$${stock.Code}:\n`;
                    message = message + `Harga Closing: ${stock.ClosingPrice}\n`;
                    message = message + `+PBV : ${(stock.Pbv || 0).toFixed(3)}\n`;
                    message = message + `+PER : ${(stock.Per || 0).toFixed(3)}\n`;
                    message = message + `+ROE : ${(stock.Roe || 0).toFixed(3)}\n\n`;
                }
                message = message + `\nTips:`;
                message = message + `\n1. Semakin rendah PBV dan PER dibanding emiten sejenis, artinya undervalued.`;
                message = message + `\n2. Semakin tinggi ROE, berarti perusahaan semakin bagus karena dapat mengelola modal untuk menghasilkan modal bersih.`;
                message = message + `\n3. ROE dan PER yang minus berarti perusahaan merugi, hindari untuk investasi.`;
            }
        } catch (error) {
            message = 'Beli saat merah, jual di lebih merah.';
            console.log('ERROR [responseBot]', error);
        } finally {
            ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
        }
    },

    async responseStockValuationStock(ctx) {
        console.log(ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
        const stockCode = ctx.match[1].toUpperCase();
        let message = `...`;
        try {
            const data = await StockTechnical.getStockValuationSameSector(stockCode);
            if (data) {
                message = `Valuasi $${data.Stock.Code}:\n\n`;
                for (const stock of data.PerPbvs) {
                    if (stockCode === stock.Code) {
                        message = message + `Harga Closing: ${stock.ClosingPrice}\n`;
                        message = message + `+PBV : ${(stock.Pbv || 0).toFixed(3)}\n`;
                        message = message + `+PER : ${(stock.Per || 0).toFixed(3)}\n`;
                        message = message + `+ROE : ${(stock.Roe || 0).toFixed(3)}\n`;
                    }
                }
                message = message + `\nTips:`;
                message = message + `\n1. Semakin rendah PBV dan PER dibanding emiten sejenis, artinya undervalued.`;
                message = message + `\n2. Semakin tinggi ROE, berarti perusahaan semakin bagus karena dapat mengelola modal untuk menghasilkan modal bersih.`;
                message = message + `\n3. ROE dan PER yang minus berarti perusahaan merugi, hindari untuk investasi.`;
            }
        } catch (error) {
            message = 'Beli saat merah, jual di lebih merah.';
            console.log('ERROR [responseBot]', error);
        } finally {
            ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
        }
    },

    async getStockDevidend(stockCode) {
        let result = null;
        try {
            let URL = `https://pasardana.id/api/Stock/GetByCode?code=${stockCode}&username=anonymous`;
            let response = await axios({
                url: URL,
                method: 'GET',
                headers: {
                    'Accept-Encoding': 'identity',
                    'Content-Type': 'application/json, text/plain, */*'
                }
            });
            if (response.data) {
                result = response.data;
            }
            let stockId = result.Id;
            URL = `https://pasardana.id/api/StockData/GetStockDividendActions?Id=${stockId}`;
            response = await axios({
                url: URL,
                method: 'GET',
                headers: {
                    'Accept-Encoding': 'identity',
                    'Content-Type': 'application/json, text/plain, */*'
                }
            });
            if (response.data) {
                result = { ...result, dividendList: response.data };
            }
        } catch (error) {
            console.log('ERROR CALL AXIOS', error);
        } finally {
            return result;
        }
    },

    async responseStockDeviden(ctx) {
        console.log(ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
        const stockCode = ctx.match[1].toUpperCase();
        let message = `...`;
        try {
            const data = await StockTechnical.getStockDevidend(stockCode);
            if (data) {
                message = `${data.Code} - ${data.Name}\n\n`;
                message = message + `History devidend:\n`;
                for (let index = data.dividendList.length - 1; index >= 0; index--) {
                    message = message + `${index + 1}. ${data.dividendList[index].Year} - Rp ${data.dividendList[index].ProceedInstrument}/lembar\n`;
                    message = message + `Cum Date: ${data.dividendList[index].CumDate ? moment(data.dividendList[index].CumDate, 'YYYY-MM-DD').format('DD/MM/YYYY') : '-'}\n\n`;
                }
            }
        } catch (error) {
            message = 'Beli saat merah, jual di lebih merah.';
            console.log('ERROR [responseBot]', error);
        } finally {
            ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
        }
    },

    async getCompositeUpdate() {
        let result = null;
        try {
            let URL = `https://api.stockbit.com/v2.4/orderbook/preview/IHSG`;
            const response = await axios({
                method: 'GET',
                url: URL,
                headers: { authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MjQ2MDQyNzIsImp0aSI6IlVLaFFNVHd3YlFHRTZvWXV1RkRMcGc9PSIsImlzcyI6IlNUT0NLQklUIiwibmJmIjoxNjI0NjA0MjcyLCJleHAiOjE2MjY0MTg2NzIsImRhdGEiOnsidXNlIjoibjN5Z2J1IiwiZW1hIjoicG9sbWFlYmVuZWplckBnbWFpbC5jb20iLCJmdWwiOiJQb2xtYSBUYW1idW5hbiIsInNlcyI6IkgxUTlGUW9VNHlQMTRZUjciLCJkdmMiOiIifX0.bSPt9UBNLgMLBxPagCdMIUWYi-Qsv5OzI-lhJysCHNE' }
            });
            if (response.data &&
                Object.keys(response.data).length > 0 &&
                response.data.message === 'Successfully retrieved company orderbook data') {
                result = response.data.data;
            }
        } catch (error) {
            console.log('ERROR CALL AXIOS', error);
        } finally {
            return result;
        }
    },

    async responseCompositeUpdate(bot) {
        let message = `...`;
        try {
            const data = await StockTechnical.getCompositeUpdate();
            if (data) {
                message = `IHSG Summary ${moment().locale('ind').format('DD MMMM YYYY')}:\n`;
                let emoji_change = '';
                if (data.percentage_change < -2) {
                    emoji_change = '🆘';
                } else if (data.percentage_change > 0 && data.percentage_change <= 1) {
                    emoji_change = '⬆️';
                } else if (data.percentage_change > 1) {
                    emoji_change = '🚀';
                } else if (data.percentage_change >= -0.9 && data.percentage_change < 0) {
                    emoji_change = '⬇️';
                } else if (data.percentage_change >= -2 && data.percentage_change < -0.9) {
                    emoji_change = '⚠️';
                } else {
                    emoji_change = '😴';
                }
                message = message + `\nHarga Terakhir: ${data.close} (${data.change > 0 ? `+${data.change}` : data.change})`;
                message = message + `\nHarga Sebelum: ${data.previous}`;
                message = message + `\nPerubahan: ${data.percentage_change}%  ${emoji_change}`;
                message = message + `\n\nTotal Volume: ${StockTechnical.thousandSeparatorPure(data.volume / 100)} lot`;
                message = message + `\nTotal Transaksi: Rp ${StockTechnical.thousandSeparatorPure(data.value)} `;
                message = message + `\nDomestik ${data.domestic === '-' ? 0 : data.domestic}% vs Asing ${data.foreign === '-' ? 0 : data.foreign}%\n`;
                message = message + `\nFBuy: Rp ${StockTechnical.thousandSeparatorPure(data.fbuy)}\nFSell: Rp ${StockTechnical.thousandSeparatorPure(data.fsell)}`;
                message = message + `\nAsing${data.fnet > 0 ? ' belanja sebanyak Rp ' + StockTechnical.thousandSeparatorPure(Math.abs(data.fnet)) + ' di IHSG hari ini.' : ' membawa kabur duit Rp ' + StockTechnical.thousandSeparatorPure(Math.abs(data.fnet)) + ' dari IHSG hari ini.'}`;
            }
        } catch (error) {
            message = 'Beli saat merah, jual di lebih merah.';
            console.log('ERROR [responseBot]', error);
        } finally {
            bot.telegram.sendMessage('-1001476739751', message);
            bot.telegram.sendMessage('885632184', message);
        }
    },

    async getCalenderUpdate() {
        let result = null;
        try {
            let URL = `https://api.stockbit.com/v2.4/calendar`;
            const response = await axios({
                method: 'GET',
                url: URL,
                headers: { authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2MjQ2MDQyNzIsImp0aSI6IlVLaFFNVHd3YlFHRTZvWXV1RkRMcGc9PSIsImlzcyI6IlNUT0NLQklUIiwibmJmIjoxNjI0NjA0MjcyLCJleHAiOjE2MjY0MTg2NzIsImRhdGEiOnsidXNlIjoibjN5Z2J1IiwiZW1hIjoicG9sbWFlYmVuZWplckBnbWFpbC5jb20iLCJmdWwiOiJQb2xtYSBUYW1idW5hbiIsInNlcyI6IkgxUTlGUW9VNHlQMTRZUjciLCJkdmMiOiIifX0.bSPt9UBNLgMLBxPagCdMIUWYi-Qsv5OzI-lhJysCHNE' }
            });
            if (response.data &&
                Object.keys(response.data).length > 0 &&
                response.data.message === 'Successfully retrieved corporate action events for today') {
                result = response.data.data;
            }
        } catch (error) {
            console.log('ERROR CALL AXIOS', error);
        } finally {
            return result;
        }
    },

    async responseCalenderUpdate(bot) {
        let message = `...`;
        try {
            const data = await StockTechnical.getCalenderUpdate();
            if (data) {
                message = `Good morning kak,\n\nBerikut agenda emiten pada IHSG hari ini:\n`;
                for (const symbol of Object.keys(data)) {
                    if (
                        symbol !== 'timezone' &&
                        symbol !== 'today' &&
                        data[symbol].length > 0) {
                        message = message + `\n${symbol.toUpperCase()}:\n`;
                        let emitens = '';
                        for (const emiten of data[symbol]) {
                            switch (symbol) {
                                case 'economic':
                                    if (emiten === '') {
                                        emitens = `-${emiten.econcal_item}:\n`;
                                        emitens = emitens + `  Sebelumnya: ${emiten.econcal_previous}\n`;
                                        emitens = emitens + `  Forecast: ${emiten.econcal_forecast}\n`;
                                        emitens = emitens + `  Aktual: ${emiten.econcal_actual}\n`;
                                    } else {
                                        emitens = emitens + `-${emiten.econcal_item}\n`;
                                        emitens = emitens + `  Sebelumnya: ${emiten.econcal_previous}\n`;
                                        emitens = emitens + `  Forecast: ${emiten.econcal_forecast}\n`;
                                        emitens = emitens + `  Aktual: ${emiten.econcal_actual}\n`;
                                    }
                                    break;
                                case 'ipo':
                                    if (emitens === '') {
                                        emitens = `-${emiten.company_name}`;
                                    } else {
                                        emitens = emitens + `, ${emiten.company_name}`;
                                    }
                                    break;
                                case 'dividend':
                                    emitens = emitens + `-$${emiten.company_symbol}\n`;
                                    emitens = emitens + `   value: Rp ${emiten.dividend_value} / lembar saham\n`;
                                    emitens = emitens + `   cumdate: ${emiten.dividend_cumdate}\n`;
                                    emitens = emitens + `   exdate: ${emiten.dividend_exdate}\n`;
                                    emitens = emitens + `   paydate: ${emiten.dividend_paydate}\n`;
                                    break;
                                case 'rups':
                                    if (emitens === '') {
                                        emitens = `-$${emiten.company_symbol}`;
                                    } else {
                                        emitens = emitens + `, $${emiten.company_symbol}`;
                                    }
                                    break;
                                // emitens = emitens + `-$${emiten.company_symbol}\n`;
                                // emitens = emitens + `${emiten.rups_iqp_agenda}\n`;
                                // break;
                                case 'rightissue':
                                    emitens = emitens + `-$${emiten.company_symbol}\n`;
                                    emitens = emitens + `   rasio: [${emiten.rightissue_new} : ${emiten.rightissue_old}] [new:old]\n`;
                                    break;
                                default:
                                    if (emitens === '') {
                                        emitens = `-$${emiten.company_symbol}`;
                                    } else {
                                        emitens = emitens + `, $${emiten.company_symbol}`;
                                    }
                                    break;
                            }
                        }
                        message = message + emitens;
                    }
                }
                message = message + '\n';
            }
        } catch (error) {
            message = 'Beli saat merah, jual di lebih merah.';
            console.log('ERROR [responseBot]', error);
        } finally {
            bot.telegram.sendMessage('-1001476739751', message);
            // bot.telegram.sendMessage('885632184', message);
        }
    },

    async responseStockChart(ctx) {
        console.log(ctx.message.message_id, '>', ctx.message.from.first_name, '-', ctx.message.text, '-', ctx.message.from.id);
        const command = ctx.match.input.split(" ")[0];
        let documentIndex = 0, sheetIndex = 0;
        switch (command) {
            case '/snr':
                documentIndex = 0;
                sheetIndex = 0;
                break;
            case '/momentum':
                documentIndex = 0;
                sheetIndex = 1;
                break;
            case '/tf':
                documentIndex = 0;
                sheetIndex = 2;
                break;
            case '/fibo':
                documentIndex = 0;
                sheetIndex = 3;
                break;
            case '/zigzag':
                documentIndex = 0;
                sheetIndex = 4;
                break;
            case '/darvas':
                documentIndex = 0;
                sheetIndex = 5;
                break;
            case '/complex':
                documentIndex = 0;
                sheetIndex = 6;
                break;
            case '/ma':
                documentIndex = 0;
                sheetIndex = 7;
                break;
            case '/t':
                documentIndex = 1;
                sheetIndex = 0;
                break;
            case '/percent':
                documentIndex = 1;
                sheetIndex = 1;
                break;
            case '/selendang':
                documentIndex = 1;
                sheetIndex = 2;
                break;

            default:
                break;
        }
        try {
            const stockCode = ctx.match[1].toUpperCase();
               await execFile('cscript', [__dirname + '\\' + 'ShakeMisterAmi.js', stockCode, documentIndex, sheetIndex], (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        ctx.reply('GAGAL', { reply_to_message_id: ctx.message.message_id });
                        return;
                    }
                    if (stderr) {
                        ctx.reply('GAGAL', { reply_to_message_id: ctx.message.message_id });
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    ctx.replyWithPhoto({ source: "C:\\\Project\\ami-result\\" + stockCode + ".png" }, { reply_to_message_id: ctx.message.message_id });                    
                });
        } catch (error) {
            console.log('error?', error);
            ctx.reply('GAGAL', { reply_to_message_id: ctx.message.message_id });
        }
    },

}

module.exports = StockTechnical;

