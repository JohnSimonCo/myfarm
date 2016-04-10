/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package Delaval.info;

import Delaval.AppDB.AppServerFkn;
import Delaval.AppDB.World;
import Delaval.AppDB.World.Phone;
import Delaval.AppDB.World.User;
import Delaval.Model.AppSession;
import Delaval.Logs.Log;
import Delaval.VMSController.Logger.Log.Level;
import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import Delaval.VMSController.VMSDataTransport.Http.HttpApplication;
import Delaval.VMSController.VMSDataTransport.Http.HttpResponse;
import Delaval.mvc.Pages;
import Delaval.util.SendNotification;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

/**
 *
 * @author blomda
 * This page/file is obsolete when new app is released (2015-07-09) // rappjo
 */
public class RegisterGCM implements HttpApplication  {

	private static String d (String s) {
		if(s == null) {
			return null;
		}
		try {
			return URLDecoder.decode(s, "UTF-8");
		} catch (UnsupportedEncodingException ex) {
			return s;
		}
	}
	
	@Override
	public void perform(HttpAction action) {
		String gcm, manufacturer, model, systemVersion, appVersion;
		gcm = d(action.command.getQueryParameter("gcm"));
		if(gcm == null || gcm.length() < 1) {
			gcm = action.body.getFormData("gcm").getContent();			
			manufacturer = action.body.getFormData("manufacturer").getContent();
			model = action.body.getFormData("model").getContent();
			systemVersion = action.body.getFormData("system_version").getContent();
			appVersion = action.body.getFormData("app_version").getContent();
		} else {
			// Be backwards compatible against phones running app < 0.8.6
			manufacturer = d(action.command.getQueryParameter("manufacturer"));
			model = d(action.command.getQueryParameter("model"));
			systemVersion = d(action.command.getQueryParameter("system_version"));
			appVersion = d(action.command.getQueryParameter("app_version"));
		}
		Phone phone = World.getPhone(gcm);
		if (phone == null) {
			Pages.SessionCookie cookie = Pages.SessionCookie.get(action);
			Log.log(Level.Debug, "Phones", 0, "RegisterGCM cookie", action.header.getCookie(AppSession.cookieName));
			if (gcm == null) {
				Log.log(Level.Alert, "Phones", 0, "RegisterGCM", "no gcm!");
				action.response.setStatusCode(HttpResponse.HTTP_STATUS_CODE_400_BadRequest);
				action.response.addBody("<HTML><BODY>Got no GCM!</BODY></HTML>");
			} else if(cookie == null) {
				Log.log(Level.Alert, "Phones", 0, "RegisterGCM", "no cookie!");
				action.response.setStatusCode(HttpResponse.HTTP_STATUS_CODE_403_Forbidden);
				action.response.addBody("<HTML><BODY>Not logged in!</BODY></HTML>");
			} else {
				Log.log(Level.Debug, "Phones", 0, "RegisterGCM", "email = "+cookie.emailAddress+"\ngcm = "+gcm+"\nmanufacturer = "+manufacturer+"\nmodel = "+model+"\nsystem = "+systemVersion+"\napp = "+appVersion);
				User u = World.getUserFromEmail(cookie.emailAddress);
				AppSession session = AppSession.getSession(action, null);
				if (!cookie.isApp) {
					if (session != null)
						session.isApp = true;
				}
				if(World.addPhone(manufacturer + " " + model, SendNotification.PushNotificationDevice.Type.android.ordinal(), gcm, u.id, systemVersion, appVersion)) {
					phone = World.getPhone(gcm);
					AppServerFkn.contactDB.phoneContact(phone.deviceUniqueId);
					if (session != null)
						session.phoneId = phone.deviceUniqueId;
					action.response.setStatusCode(HttpResponse.HTTP_STATUS_CODE_200_OK);
					action.response.addBody(phone.deviceUniqueId);
				} else {
					action.response.setStatusCode(HttpResponse.HTTP_STATUS_CODE_200_OK);
					action.response.addBody("<HTML><BODY>Failed to save phone!</BODY></HTML>");
				}
			}
		} else {
			AppSession session = AppSession.getSession(action, null);
			Log.log(Level.Debug, "Phones", 0, "ReRegisterGCM", "email = "+session.user.email+"\ngcm = "+gcm+"\nmanufacturer = "+manufacturer+"\nmodel = "+model+"\nsystem = "+systemVersion+"\napp = "+appVersion);
			if (World.setPhoneVersion(phone.deviceUniqueId, appVersion, systemVersion, manufacturer + " " + model) && World.setPhoneUserId(session.user.id, phone.deviceUniqueId)) {
				AppServerFkn.contactDB.phoneContact(phone.deviceUniqueId);
				session.phoneId = phone.deviceUniqueId;
			}
			action.response.setStatusCode(HttpResponse.HTTP_STATUS_CODE_200_OK);
			action.response.addBody(phone.deviceUniqueId);
		}
	}
}
