package Delaval.info;

import Delaval.AppDB.World;
import Delaval.AppDB.World.User;
import Delaval.AppServer.Main;
import static Delaval.Model.AppSession.cookieName;
import Delaval.VMSController.WebBase.WebPage;
import Delaval.mvc.Pages;
import Delaval.mvc.Pages.SessionCookie;

/**
 *
 * @author Joran
 */
public class LoginDirect extends WebPage
{
	public Delaval.VMSController.WebControlsAsp.TextBox txt;
	private SessionCookie cookie = null;
			
	public @Override void Load() {
		super.Load();
		if (Main.allowLoginDirect && (txt.text != null) && (txt.text.trim().length() > 0)) {
			String ep = txt.text.trim();
			txt.text = ep;
			String _cookie=getHttpAction().header.getCookie(cookieName);
			cookie = new Pages.SessionCookie(_cookie);
			User current = World.getUserFromEmail(cookie.emailAddress);
			if ((current.topNode == World.getTop()) && World.hasAccessRightSomewere(current, World.Permission.bitMask.AdminStatistics.mask)) {
				User u = World.getUserFromEmail(ep);
				if (u == null && !ep.contains("@") && !"delaval".equals(ep)) {
					ep += "@delaval.com";
					u = World.getUserFromEmail(ep);
				}
				if (u != null) {
					cookie.sessionId = null;
					cookie.emailAddress = ep;
					cookie.pwd = u.password;
					cookie.profile = u.profiles;
				}
				else 
					cookie = null;
			}
		}
	}
	public @Override void OnPreRender() {
		if (cookie != null) {
			String s = getHttpAction().header.getField("Origin");
			if (s.charAt(s.length() - 1) != '/')
				s += '/';
			s = "<html><head><meta http-equiv=\"REFRESH\" content=\"0;url=" + s + "Delaval/mvc/Pages/Show/FarmSmall\"></HEAD><BODY></BODY></HTML>";
			cookie.set(this.getHttpAction());
			Write(s);
		}
	}
}
