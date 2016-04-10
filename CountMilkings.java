package Delaval.info;

import static Delaval.AppDB.MilkingDBCount.countAllMilkings;
import Delaval.AppDB.World;
import Delaval.VMSController.Logger.Log;
import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import Delaval.VMSController.VMSDataTransport.Http.HttpApplication;
import Delaval.mvc.Pages;

/**
 *
 * @author rappjo
 */
public class CountMilkings implements HttpApplication
{
	@Override
	public void perform(HttpAction httpAction) {
		Pages.SessionCookie cookie = Pages.SessionCookie.get(httpAction);
		World.User u = World.getUserFromEmail(cookie.emailAddress);
		if ((cookie.pwd != null) && (u.password != null) && (u.password == (int)cookie.pwd) && World.hasAccessRightToTarget(u.topNode.id, World.Permission.bitMask.SuperViewer.mask, u.id) != null) {
			try {
				StringBuilder sz = new StringBuilder();
				int nrMilkings = countAllMilkings(sz);
				httpAction.response.addBody(sz.toString());
			} catch (Exception e) {
				Log.log(Log.Level.Alarm, "CountMilkings", 0, "Cannot count milkings", Log.getStackTrace(e));
			}
		}
	}
}
