package Delaval.info;

import Delaval.AppServer.CommandServer;
import Delaval.AppServer.CommandServer.CommandKeys;
import Delaval.VMSController.Logger.SerializeData;
import Delaval.Logs.Log;
import Delaval.VMSController.Logger.Log.Level;
import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import Delaval.VMSController.VMSDataTransport.Http.HttpApplication;

/**
 *
 * @author rappjo
 */
public class Xport699 implements HttpApplication {
	private static final java.text.SimpleDateFormat threadDate = new java.text.SimpleDateFormat("dd HH:mm:ss.SSS");
	@Override
	public void perform(HttpAction httpAction) {
		perform(httpAction, -1);
	}
	public void perform(HttpAction httpAction, int transNrFromPlayer) {
		long beforeCall = System.currentTimeMillis();
		String q = httpAction.command.getQueryParameter("q");
		SerializeData sd = new SerializeData(q == null ? httpAction.body.toString() : q);
		try {
			CommandKeys command = CommandKeys.valueOf(sd.getString());
			CommandKeys param = command == CommandKeys.list ? null : CommandKeys.valueOf(sd.getString());
			String vcId = param == CommandKeys.vc ? sd.getString() : null;
			httpAction.response.addBody(command == CommandKeys.list ? CommandServer.list() : CommandServer.get(param, vcId));
			Log.log(Level.Debug, "eXport", sd.getInputString() + " took " + (Long.toString(System.currentTimeMillis()-beforeCall)) + " ms");
		} catch (Exception e) {
			Log.log(Level.Alarm, "eXport", 0, sd.getInputString() + " exception " + (Long.toString(System.currentTimeMillis()-beforeCall)) + " ms", Log.getStackTrace(e));
		}
	}
}