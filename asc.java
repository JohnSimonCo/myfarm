package Delaval.info;

import Delaval.AppDB.AppCommon;
import Delaval.AppDB.VcData;
import Delaval.AppDB.World;
import Delaval.Model.Cache;
import Delaval.Model.Vc;
import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import Delaval.VMSController.VMSDataTransport.Http.HttpApplication;
import Delaval.VMSController.VMSDataTransport.Http.HttpResponse;
import com.google.gson.Gson;
import java.util.Arrays;
import java.util.HashSet;

/**
 *
 * @author rappjo
 */
public class asc implements HttpApplication
{
	private Vc vc;
	private static boolean loggedOn = false;
	private class StatusCounters {
		int overdue;
		int milkPermission;
		int noMilkPermission;
		int neverMilked;
		int doNotMilk;
	}
	@Override
	public void perform(HttpAction httpAction) {
		if (!loggedOn)
			loggedOn = Delaval.info.asx.autologonIfAsterix(httpAction);
		if (loggedOn) {
			World.Domain vcd = World.getTop().children.get(0).children.get(0).children.get(0);
			vc = Cache.getVc(vcd.id);
			VcData vcData = vc.vc;
			String allGroups = httpAction.command.getQueryParameter("groupKey");
			HashSet<String> groups = null;
			if (allGroups != null && !allGroups.isEmpty()) {
				groups = new HashSet<>();
				groups.addAll(Arrays.asList(allGroups.split(",")));
			}
			StatusCounters rVal = new StatusCounters();
			long nowMyFarm = System.currentTimeMillis();
			long nowSec = (nowMyFarm-vcData.timeDiff) / 1000;
			for (AppCommon.Animal animal : vcData.animals.animals.values())
				if (groups == null || groups.contains(animal.animalGroupId))
					if (animal.action == 0 && (animal.lastMilkingTime != null) && (animal.lastMilkingTime != 0)) {		// Action == 0  ==>  milk
						int overdueSec = animal.overdueTime;
						if (nowSec > animal.timeToNextMilking)
							if (nowSec - animal.lastMilkingTime > overdueSec)
								rVal.overdue++;
							else
								rVal.milkPermission++;
						else
							rVal.noMilkPermission++;
					}
					else if (animal.action != 0)
						rVal.doNotMilk++;
					else
						rVal.neverMilked++;
			httpAction.response.setStatusCode(HttpResponse.HTTP_STATUS_CODE_200_OK);

			httpAction.response.addCustomHeader("Access-Control-Allow-Origin", "*");
			httpAction.response.addCustomHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");

			String rv = new Gson().toJson(rVal);
			httpAction.response.addBody(rv);
		}
	}
}
