package Delaval.info;

import Delaval.AppDB.MilkingDBProdJs.JsLastSevenDaysData;
import Delaval.AppDB.MilkingDBProduction;
import Delaval.AppDB.VcData;
import Delaval.AppDB.World;
import Delaval.Model.Cache;
import Delaval.Model.Vc;
import Delaval.Logs.Log;
import Delaval.VMSController.DataObject.Parse;
import Delaval.VMSController.Logger.Log.Level;
import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import Delaval.VMSController.VMSDataTransport.Http.HttpApplication;
import Delaval.VMSController.VMSDataTransport.Http.HttpResponse;
import Delaval.WebLog.Json;
import com.google.gson.Gson;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;

/**
 *
 * @author rappjo
 */
public class asp implements HttpApplication
{
	private long nrMsSameValue = 120000;	// 2 min
	private Vc vc;
	private static boolean loggedOn = false;

	public static class JsData {
		public float lastSeven;
		public float lastLastSeven;
		public float perAnimalLastSeven;
		public float perAnimalLastLastSeven;
		public float perMilkingsLastSeven;
		public float perMilkingsLastLastSeven;
		public float last24h;
		public float lastLast24h;
		public float perAnimalLast24h;
		public float perAnimalLastLast24h;
		public float perMilkingsLast24h;
		public float perMilkingslLastLast24h;
		public JsData(JsLastSevenDaysData source) {
			lastSeven =					source.lastSeven;
			lastLastSeven =				source.lastLastSeven;
			perAnimalLastSeven =		source.perAnimalLastSeven;
			perAnimalLastLastSeven =	source.perAnimalLastLastSeven;
			perMilkingsLastSeven =		source.perMilkingsLastSeven;
			perMilkingsLastLastSeven =	source.perMilkingsLastLastSeven;
			last24h =					source.last24h;
			lastLast24h =				source.lastLast24h;
			perAnimalLast24h =			source.perAnimalLast24h;
			perAnimalLastLast24h =		source.perAnimalLastLast24h;
			perMilkingsLast24h =		source.perMilkingsLast24h;
			perMilkingslLastLast24h =	source.perMilkingslLastLast24h;
		}
	}
	@Override
	public void perform(HttpAction httpAction) {
		httpAction.response.addCustomHeader("Access-Control-Allow-Origin", "*");
		httpAction.response.addCustomHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");

		if (!loggedOn)
			loggedOn = Delaval.info.asx.autologonIfAsterix(httpAction);
		if (loggedOn)
			try {
				String vcId = httpAction.command.getQueryParameter("id");
				if (vcId == null)
					vcId = World.getTop().children.get(0).children.get(0).children.get(0).id;
				vc = Cache.getVc(vcId);
				VcData vcData = vc.vc;
				String ipAddresses_ = httpAction.command.getQueryParameter("ip");
				HashSet<String> ipAddresses = null;
				if (ipAddresses_ != null && ipAddresses_.length() > 0) {
					ipAddresses = new HashSet<>();
					ipAddresses.addAll(Arrays.asList(ipAddresses_.split(",")));
				}
				boolean detail =			Parse.Boolean(httpAction.command.getQueryParameter("detail"));
				boolean recalc =			Parse.Boolean(httpAction.command.getQueryParameter("recalc"));
				boolean formatToVisible =	Parse.Boolean(httpAction.command.getQueryParameter("format"));
				if (recalc || vc.vc.prodData == null || (System.currentTimeMillis() - vc.vc.prodData.serverTimeForCalculation) > nrMsSameValue || (detail ^ vc.vc.prodData.jsVcMilkData.hourYield != null))
					vc.vc.prodData = new MilkingDBProduction(vcData, detail).get();
				vc.vc.prodData.msDelayFromCalculation = System.currentTimeMillis() - vc.vc.prodData.serverTimeForCalculation;

				String rv;
				if (ipAddresses == null)
					rv = new Gson().toJson(vc.vc.prodData);
				else {
					HashMap<String, JsData> rvArr = new HashMap<>();
					if (vc.vc.prodData.jsRobots != null)
						for (JsLastSevenDaysData rb : vc.vc.prodData.jsRobots)
							if (ipAddresses.contains(rb.ipAddress))
								rvArr.put(rb.ipAddress, new JsData(rb));
					rv = new Gson().toJson(rvArr);
				}
				if (formatToVisible)
					try {
						Json msg = new Json(Json.deSerialize(rv));
						rv = "JSON message:\n" + msg.serialize(true);
					} catch (Exception e) {
					}

				httpAction.response.setStatusCode(HttpResponse.HTTP_STATUS_CODE_200_OK);

				httpAction.response.addBody(rv);
				return;
			} catch (Exception e) {
				Log.log(Level.Alarm, "asp", 0, "Ask for production info failed", Log.getStackTrace(e));
			}
		httpAction.response.setStatusCode(HttpResponse.HTTP_STATUS_CODE_401_Unauthorized);
	}
}
