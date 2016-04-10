package Delaval.info;

import Delaval.Model.AppSession;
import Delaval.Model.Xlat;
import Delaval.VMSController.WebBase.WebPage;

/**
 *
 * @author rappjo
 */
public class nopermission extends WebPage{

	public enum PageText {
		lab_back("Back to previous page"),
		lab_permission("Sorry, you have no permission for this..."),
		lab_login("Login");
		private PageText(String def){defaultString=def;}public String defaultString;
	}

	public @Override void Initiate() {
		super.Initiate();
	}
	@Override
	public void OnPreRender() {
		AppSession session = AppSession.getSession(getHttpAction(), null);
		Xlat.createPageText(this, webPageNamePath(), PageText.class.getName(), session == null ? 0 : session.languageIndex);
		super.OnPreRender();
	}

}
