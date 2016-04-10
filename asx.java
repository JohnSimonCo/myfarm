package Delaval.info;

import Delaval.AppDB.World;
import Delaval.Logs.Log;
import Delaval.Model.AppSession;
import static Delaval.Model.AppSession.cookieName;
import Delaval.VMSController.DataObject.DateTime;
import Delaval.VMSController.Logger.Log.Level;
import Delaval.VMSController.Logger.SerializeData;
import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import Delaval.VMSController.VMSDataTransport.Http.HttpApplication;
import Delaval.mvc.Pages;
import Delaval.mvc.Pages.SessionCookie;
import static Delaval.mvc.Pages.cookieValidDays;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 *
 * @author Joran
 */
public class asx implements HttpApplication
{
	private static String escape(String s) {
		if (s != null) {
			StringBuilder sz = new StringBuilder();
			int i = -1;
			int c;
			while (++i < s.length()) {
				c = s.charAt(i);
				if ((c=='$') || (c >= '0' && c <= '9') || (c >= '@' && c <= 'Z') || (c >= 'a' && c <= 'z'))
					sz.append((char)c);
				else
					sz.append('%').append(String.format("%02X", c));
			}
			return sz.toString();
		}
		return "";
	}
	private static void set(HttpAction httpAction, SessionCookie cookie) {
		SerializeData sd = new SerializeData();
		try {
			sd.Serialize(cookie.sessionId, cookie.languageCode, cookie.emailAddress, cookie.pwd, cookie.isApp, cookie.farm, escape(cookie.profile));
			httpAction.response.addCookie(AppSession.cookieName, sd.toString(), new Date(System.currentTimeMillis() + DateTime.MilliSecPerDay * cookieValidDays));
		} catch (Exception ex) {
			Log.log(Level.Alert, "Session", "Could not set cookie " + sd.toString() + Log.getStackTrace(ex));
		}
	}
	public static boolean autologonIfAsterix(HttpAction httpAction) {
		if (httpAction.remoteIpAddress.startsWith("10.") || httpAction.remoteIpAddress.startsWith("192.168.") || httpAction.remoteIpAddress.equals("0:0:0:0:0:0:0:1") || httpAction.remoteIpAddress.equals("127.0.0.1")) {
			String _cookie = httpAction.header.getCookie(cookieName);
			SessionCookie cookie = new Pages.SessionCookie(_cookie);
			if (httpAction.command.getQueryParameter("lang") != null)
				cookie.languageCode = httpAction.command.getQueryParameter("lang");
			if (httpAction.command.getQueryParameter("profile") != null)
				cookie.profile = httpAction.command.getQueryParameter("profile");
			World.User user = World.getUserFromEmail("DeLaval");
			cookie.emailAddress = user.email;
			cookie.pwd = user.password;
			set(httpAction, cookie);
			String hasTextInput = httpAction.command.getQueryParameter("has-text-input");
			httpAction.response.addCookie("has-text-input", hasTextInput == null ? "true" : hasTextInput, new Date(System.currentTimeMillis() + DateTime.MilliSecPerDay * cookieValidDays));
			return true;
		}
		return false;
	}

	@Override
	public void perform(HttpAction httpAction) {
		if (autologonIfAsterix(httpAction)) {
			String page =  httpAction.command.getQueryParameter("page");
			String groupKeys = httpAction.command.getQueryParameter("groupKey");
			String profile = httpAction.command.getQueryParameter("profile");
			String alarmIp = httpAction.command.getQueryParameter("alarmIp");
			String language = httpAction.command.getQueryParameter("language");
			
			HashMap<String, String> query = new HashMap<>();
			if (groupKeys != null) { query.put("groupKeys", groupKeys); }
			if (profile != null) { query.put("profile", profile); }
			if (alarmIp != null) { query.put("alarmIp", alarmIp); }
			if (language != null) { query.put("language", language); }
			
			String url = "jr-myfarm/index-embedded.html#/";
			url += page == null ? "cowq" : page;
			url += buildUrlQuery(query);
			
			httpAction.response.addBody(htmlRedirect.redirect(httpAction, url, null));
			//httpAction.response.addBody(htmlRedirect.redirect(httpAction, "jr-myfarm/index-embedded.html#/" + (page == null ? "cowq" : page), ""));
		}
	}
		
	public String buildUrlQuery(HashMap<String, String> pairs) {
		String query = "";
		
		Iterator it = pairs.entrySet().iterator();
		for (int i = 0; it.hasNext(); i++) {
			Map.Entry pair = (Map.Entry) it.next();
			query += i == 0 ? "?" : "&";
			query += pair.getKey() + "=" + pair.getValue();
		}
		
		return query;
	}
}
