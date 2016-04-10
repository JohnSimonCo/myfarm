package Delaval.info;

import Delaval.AppDB.AppServerFkn;
import Delaval.AppDB.World;
import Delaval.AppDB.World.User;
import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import Delaval.VMSController.VMSDataTransport.Http.HttpApplication;

/**
 *
 * @author rappjo
 */
public class getfilelist implements HttpApplication {
	@Override
	public void perform(HttpAction httpAction) {
		String usr = httpAction.command.getQueryParameter("usr");
		String pwd = httpAction.command.getQueryParameter("pwd");
		String from = httpAction.command.getQueryParameter("from");
		User user = World.getUserFromEmail(usr);
		if (usr.equals("filefetcher@delaval.com") && user.id.concat(pwd).hashCode() == user.password)
			httpAction.response.addBody(AppServerFkn.vcFileSaverDB.getFileList(Long.parseLong(from)));
	}
}
