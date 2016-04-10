package Delaval.info;

import Delaval.AppDB.World;
import Delaval.AppDB.World.Domain;
import Delaval.Model.AppSession;
import Delaval.Model.Cache;
import Delaval.Model.Vc;
import Delaval.Model.Xlat;
import Delaval.VMSController.Logger.SerializeData;
import Delaval.Logs.Log;
import Delaval.VMSController.Logger.Log.Level;
import Delaval.VMSController.WebBase.WebPage;
import Delaval.mvc.SrvAnimal;
import Delaval.mvc.PollEvent;
import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.Date;

/**
 * @author rappjo
 */
public class i extends WebPage {
	private enum Command {
		animal,
	}
	private AppSession sess = null;
	private Long accessRights = null;
	private Vc vc;
	private Domain target = null;
	
	public @Override void Initiate() {
		sess = AppSession.getSession(getHttpAction(), null);
		if (sess == null) {
			Write(htmlRedirect.redirect(getHttpAction(), "/Delaval/mvc/Pages/Show/login", "i.vcx"));
			execute = false;
		}
		else {
			String id = RequestData("id");
			if (id == null) {
				ArrayList<SrvAnimal.Farm> nodes = new ArrayList<SrvAnimal.Farm>();
				Delaval.mvc.SrvAnimal.getMyfarms(sess.user.topNode, nodes, sess.user.id);
				if (sess.cookie.farm != null) {
					int i = -1;
					while ((++i < nodes.size()) && !nodes.get(i).id.equals(sess.cookie.farm)) {}
					if (i < nodes.size())
						id = sess.cookie.farm;
				}
				if (id == null)
					id = nodes.get(0).id;
			}
			target = sess == null ? null : World.hasAccessRightToTarget(id, World.Permission.bitMask.SeeFarm.mask, sess.user.id);
			if (target != null)
				vc = Cache.getVc(target.id);
			else
				execute = false;
		}
	}

	@Override
	public void OnPreRender() {
		if ((sess != null) && (vc != null)) {
			if (vc.vc.animals == null) {
				Write(htmlRedirect.redirect(this.getHttpAction(), "app.vcx", null));
				execute = false;
			}
			else {
				accessRights = target.getRolesAccessRights(sess.user.id);
				SerializeData sd = new SerializeData();
				sd.Serialize(target.id, PollEvent.Session.get(sess, World.getDomain(target.id)), "y-m-d H:M", Long.toHexString(System.currentTimeMillis() / 1000));
				sd.Serialize(target.getVcName(), sess.user.firstName, sess.user.lastName, accessRights);
				sd.Serialize(vc.vc.cellsWarning,vc.vc.cellsAlarm,vc.vc.bloodWarning,vc.vc.bloodAlarm,vc.vc.mdiWarning,vc.vc.mdiAlarm);
				Log.log(Level.Debug, "CowQueue", target.getFullName() + ", " + sess.userName + ". Profile TODO!!!"); // + (sess.user.profiles == null ? "???" : '"' + client.profile.choosenProfile + '"'));
				vc.getAnimalsAndData(sd);
//				vc.getCowQueue(sd, c.profile, true);
				RegisterClientScriptBlock("jrJsInit", "<script language=\"JavaScript\">jr.translations = " + new Gson().toJson(Xlat.getPageText(webPageNamePath(), sess == null ? null : sess.languageIndex)) + ";jr.pageName='" + this.webPageNamePath() + "';</script>");
				RegisterHiddenField("q", sd.toString());
			}
		}
		super.OnPreRender();
	}
}
