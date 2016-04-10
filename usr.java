package Delaval.info;

import Delaval.AppServer.Main;
import static Delaval.Model.AppSession.cookieName;
import Delaval.Model.Xlat;
import Delaval.VMSController.WebBase.WebPage;
import Delaval.mvc.Pages;
import Delaval.mvc.Pages.SessionCookie;

/**
 *
 * @author Joran
 */
public class usr extends WebPage
{
	public enum PageText {
		labDate("Date"),
		labTime("Time"),
		labName("Name"),
		labDomain("Domain"),
		labWeekDay("Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday"),
		lab24h("24 hour"),
		lab1month("One month"),
		lab7d("7 days"),
		labDays("#Days"),
		labToday("Today"),
		labTotal("Total"),
		lab3month("> 3 month"),
		labOnline("Online"),
		labPage("Page"),
		labUsage("App Usage");
		private PageText(String def){defaultString=def;}public String defaultString;
	}
	public @Override void OnPreRender()
	{
		String _cookie=getHttpAction().header.getCookie(cookieName);
		SessionCookie cookie = new Pages.SessionCookie(_cookie);
		Xlat.createPageText(this, webPageNamePath(), usr.PageText.class.getName(), Xlat.getLcidIndex(cookie.languageCode));
		RegisterClientScriptBlock("usr", "<script language=\"JavaScript\" src=\"/js/jr-jr1.js?ver="+Main.buildVersion+"\"></script>"+
			"<script language=\"JavaScript\" type=\"text/javascript\">jr.version="+Main.buildVersion+";jr.include(\"/users.js?ver="+Main.buildVersion+"\");</script>");
		// users.init();var u=new users.instance(document.body).show();
	}
}
