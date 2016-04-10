package Delaval.info;

import Delaval.AppDB.MilkingDB;
import Delaval.AppDB.World;
import Delaval.AppDB.World.RegisterData;
import Delaval.Logs.Log;
import Delaval.Model.AppSession;
import Delaval.VMSController.Logger.Log.Level;
import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import Delaval.VMSController.VMSDataTransport.Http.HttpApplication;
import Delaval.VMSController.VMSDataTransport.Http.JsonResult;
import Delaval.mvc.Pages;
import static Delaval.mvc.SrvUser.loginNewCommon;
import com.google.gson.Gson;

/**
 *
 * @author rappjo
 */
public class seed implements HttpApplication {
	private static class SeedData {
		String usr;
		String id;
		String url;
		RegisterData phoneRegisterData;
	}
	@Override
	public void perform(HttpAction action) {
		SeedData data = new Gson().fromJson(action.body.toString(), SeedData.class);
		String email = data.usr;
		String pwd = data.id;
		String url = data.url;
		try {
			String referer  = action.header.getField("Referer");
			int index = referer.indexOf("//");
			if (index > 0)
				index = referer.indexOf("/", index + 3);
			referer = referer.substring(0, index);
			action.response.addCustomHeader("Access-Control-Allow-Origin", referer);
			action.response.addCustomHeader("Access-Control-Allow-Credentials", "true");
			action.response.addCustomHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
			World.User u = World.getUserFromEmail(email);
			AppSession session = AppSession.getSession(action, "seed");
			String response = u == null ? "not existent" : u.id;
			if (url != null) {
				Pages.SessionCookie cookie = Pages.SessionCookie.get(action);
				if (cookie == null)
					cookie = new Pages.SessionCookie(null);
				int iPwd = (int)Integer.parseInt(pwd);
				if (u != null && iPwd == MilkingDB.getpInd(u.id))
					iPwd = u.password;
				cookie.pwd = iPwd;
				cookie.emailAddress = email;
				cookie.set(action);
				if (session != null || (u != null && pwd != null && u.password == iPwd))
					response = new JsonResult(loginNewCommon(email, data.phoneRegisterData)).getBody();
			}
			else if (session != null || (u != null && pwd != null && (u.password == (int)Integer.parseInt(pwd) || MilkingDB.getpInd(u.id) == (int)Integer.parseInt(pwd))))
				response = "ok";
			Log.log(Level.Debug, "AppSession", "Seed for " + email + " is " + response + (url == null ? "" : ". Cookie was set"));
			action.response.addBody(response);
		} catch (Exception e) {
			Log.log(Level.Alarm, "AppSession", 0, "Seed failed for " + email, Log.getStackTrace(e));
		}
	}
}
