package Delaval.info;

import Delaval.AppDB.World;
import Delaval.Model.AppSession;
import Delaval.Model.Cache;
import Delaval.Model.Vc;
import Delaval.Model.mtime;
import Delaval.VMSController.Logger.SerializeData;
import Delaval.VMSController.WebBase.WebPage;

/**
 *
 * @author rappjo
 */
public class wtime extends WebPage {

	private AppSession sess = null;
	private Vc vc;
	private World.Domain target = null;

	public @Override void Initiate() {
		sess = AppSession.getSession(getHttpAction(), null);
		target = sess == null ? null : World.hasAccessRightToTarget(sess.cookie.farm, World.Permission.bitMask.SeeFarm.mask, sess.user.id);
		if (target != null)
			vc = Cache.getVc(target.id);
		else
			execute = false;
	}

	public @Override void OnPreRender() {
		if (vc != null) {
			SerializeData sd = new SerializeData();
			mtime mt = new mtime();
			mt.calc(vc, sd, (int)((long)vc.vc.timeZoneOffsetMinutes));
			RegisterHiddenField("q", sd.toString());
		}
	}
}
