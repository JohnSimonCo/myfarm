package Delaval.info;

import Delaval.AppDB.AppServerFkn;
import Delaval.AppDB.VcData;
import Delaval.AppDB.World;
import Delaval.AppDB.World.DomainStatus;
import Delaval.AppDB.World.DomainType;
import Delaval.Logs.Log;
import Delaval.Model.Cache;
import Delaval.Model.DemoFarm;
import Delaval.VMSController.Logger.Log.Level;
import Delaval.Model.Vc;
import Delaval.VMSController.DataObject.Parse;
import Delaval.VMSController.Logger.SerializeData;
import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import Delaval.VMSController.VMSDataTransport.Http.HttpApplication;
import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.Map;

/**
 *
 * @author rappjo
 */
public class getData implements HttpApplication {
	@Override
	public void perform(HttpAction httpAction) {
		try {
			String usr = httpAction.command.getQueryParameter("usr");
			String pwd = httpAction.command.getQueryParameter("pwd");
			// query: world, alarm, cleaning, farmGUID
			String query = httpAction.command.getQueryParameter("query");
			long from = Parse.Long(httpAction.command.getQueryParameter("from"), 0);	// date, nr ms from 1970
			World.User user = World.getUserFromEmail(usr);
			String result = null;
			if (usr.equals("filefetcher@delaval.com") && user.id.concat(pwd).hashCode() == user.password) {
				switch (query) {
					case "world":
						Domain domains = new Domain(World.getTop());
						ArrayList<String> farmIds = new ArrayList<>();
						for (Map.Entry<String, Vc> entry : Cache.allVc.entrySet()) {
							if (DemoFarm.isDemoFarm(entry.getKey()))
								continue;
							Cache.getVc(entry.getKey());
							VcData val = entry.getValue().vc;
							if (val != null && val.animals != null && val.animals.animals != null && !val.animals.animals.isEmpty())
								farmIds.add(entry.getKey());
						}
						domains.hasConnectedVc(farmIds);
						result = new Gson().toJson(domains);
						break;
					case "alarm":
						result = new Gson().toJson(AppServerFkn.alarmDB.getAllAlarms(from));
						break;
					case "cleaning":
						break;
				}					
			}
			if (result == null) {
				Vc vc_ = Cache.getVc(query);
				VcData vc = vc_.vc;
				SerializeData sd = new SerializeData();
				if (vc != null) {
					if (from > 0)
						vc = new VcData(vc, from);
					vc.serializeForGetData(sd);
				}
				httpAction.response.addBody(sd.toString());
			}
			else {
				httpAction.response.addBody(result);
				Log.log(Level.Debug, "getData", 0, "query = " + query + (from > 0 ? "" : ""), result.length() > 10000 ? result.substring(0, 10000) + "..." : result);
				httpAction.response.setContentType("application/json; charset=UTF-8");
			}
		} catch (Exception e) {
			Log.log(Level.Alarm, "getData", 0, "getData failed", Log.getStackTrace(e));
		}
	}
	static class Domain {
		public DomainType domainType;
		public String id;
		public String name;
		public DomainStatus status;
		public ArrayList<Domain> children;
		public long createTime;
		public Domain(World.Domain d) {
			domainType = d.domainType;
			id = d.id;
			name = d.name;
			status = d.status;
			createTime = d.createTime.getTime();
			if (d.children != null && !d.children.isEmpty()) {
				children = new ArrayList<>();
				int i = -1;
				while (++i < d.children.size())
					children.add(new Domain(d.children.get(i)));
			}
		}
		public boolean hasConnectedVc(ArrayList<String> farmIds) {
			if (domainType == DomainType.Vc)
				return farmIds.contains(id);
			else if (children != null && !children.isEmpty()) {
				boolean ok = false;
				int i = -1;
				while (++i < children.size()) {
					if (children.get(i).hasConnectedVc(farmIds))
						ok = true;
					else
						children.remove(i--);
				}
				if (!ok)
					children = null;
				return ok;
			}
			else
				return false;
		}
	}
}
