package Delaval.info;

import Delaval.AppDB.AppServerFkn;
import Delaval.AppDB.World;
import Delaval.VMSController.Logger.Log;
import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import Delaval.VMSController.VMSDataTransport.Http.HttpApplication;
import java.io.BufferedReader;
import java.io.FileReader;
import java.net.URLDecoder;

/**
 *
 * @author rappjo
 */
public class getfile implements HttpApplication {
	@Override
	public void perform(HttpAction httpAction) {
		try {
			String usr = httpAction.command.getQueryParameter("usr");
			String pwd = httpAction.command.getQueryParameter("pwd");
			String from = httpAction.command.getQueryParameter("farm");
			String name = URLDecoder.decode(httpAction.command.getQueryParameter("name"), "UTF-8");
			String delete = httpAction.command.getQueryParameter("delete");
			World.User user = World.getUserFromEmail(usr);
			if (usr.equals("filefetcher@delaval.com") && user.id.concat(pwd).hashCode() == user.password) {
				String filePath = AppServerFkn.vcFileSaverDB.getFilePath(from, name, delete != null && Integer.parseInt(delete) > 0);
				Log.log(Log.Level.Debug, "VcFileSaverDB", 0, "getfile from " + from + " file " + name + ". delete = " + (delete != null && Integer.parseInt(delete) > 0), filePath);
				StringBuilder sb = new StringBuilder();
				try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
					String line;
					while ((line = br.readLine()) != null)
						sb.append(line);
					br.close();
				} catch (Exception e) {
					Log.log(Log.Level.Alarm, "VcFileSaverDB", 0, String.format("Reader failed on: %s", filePath), Log.getStackTrace(e));
				}
				httpAction.response.addBody(sb.toString());
			}
		} catch (Exception e) {
			Log.log(Log.Level.Alarm, "VcFileSaverDB", 0, "getfile failed", Log.getStackTrace(e));
		}
	}
}
