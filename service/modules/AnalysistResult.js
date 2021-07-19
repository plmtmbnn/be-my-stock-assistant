/* eslint-disable no-undef */
/* eslint-disable quotes */
/* eslint-disable space-in-parens */
AB = new ActiveXObject( "Broker.Application" ); // creates AmiBroker object

try {
  NewA = AB.AnalysisDocs.Open( "C:\\Program Files (x86)\\AmiBroker\\Formulas\\Custom\\screening\\n3y.afl" ); // opens previously saved analysis project file
  // NewA represents the instance of New Analysis document/window

  if ( NewA ) {
    NewA.Run( 2 ); // start backtest asynchronously

    while ( NewA.IsBusy ) WScript.Sleep( 500 ); // check IsBusy every 0.5 second

    NewA.Export( "test.html" ); // export result list to HTML file

    WScript.echo( "Completed" );

    NewA.Close(); // close new Analysis
  }
} catch ( err ) {
  WScript.echo( "Exception: " + err.message ); // display error that may occur
}
