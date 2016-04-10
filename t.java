package Delaval.info;


import Delaval.AppDB.AppCommon;
import Delaval.AppDB.AppServerFkn.Command;
import Delaval.AppDB.World;
import Delaval.AppDB.World.Domain;
import Delaval.Model.Cache;
import Delaval.Model.Vc;
import Delaval.VMSController.Logger.SerializeData;
import Delaval.VMSController.Logger.SerializeDelimiter;
import Delaval.VMSController.WebBase.WebPage;
import Delaval.VMSController.WebControls.JsList;
import Delaval.VMSController.WebControls.JsListColumn;
import Delaval.VMSController.WebControlsAsp.Button;
import Delaval.VMSController.WebControlsAsp.Literal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 *
 * @author rappjo
 */
public class t extends WebPage
{
	public Button btnUpdate;
	public Literal litUpdated, litLastUpdated, litInfo, litEmpty, litLabel;
	public JsList lstVC, lstDataType, lstUpdates, lstDetails;
	private static final java.text.SimpleDateFormat dateFormat_UTCFormat = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

	public @Override void Initiate() {
		String ajax = RequestData("ajax");
		if (ajax != null) {
			Vc vc = Cache.allVc.get(ajax);
			if (vc != null) {
				Domain d = World.getDomain(vc.vcGUID);
				if (d != null) {
					vc = new Vc(ajax);
					List<Integer> sizes = new ArrayList<Integer>();
					List<Date> updateTime = new ArrayList<Date>();
					List<Command> commands = new ArrayList<Command>();
//					vc.readFromFile(sizes, updateTime, commands);
					SerializeData tot = new SerializeData();
					SerializeDelimiter sd = new SerializeDelimiter('@');
					sd.Serialize(
							ajax, 4,
							vc.vc.animalGroups.info.containerName,vc.vc.animalGroups.info.containerName, vc.vc.animalGroups.data.size(), vc.vc.animalGroups.info.fieldNamesHashValue,
							vc.vc.animals.infoAnimal.containerName, vc.vc.animals.infoAnimal.containerName, vc.vc.animals.animals.size(), vc.vc.animals.infoAnimal.fieldNamesHashValue,
							vc.vc.trafficAreas.info.containerName, vc.vc.trafficAreas.info.containerName, vc.vc.trafficAreas.data.size(), vc.vc.trafficAreas.info.fieldNamesHashValue,
							vc.vc.vms.info.containerName, vc.vc.vms.info.containerName, vc.vc.vms.data.size(), vc.vc.vms.info.fieldNamesHashValue);
					tot.Serialize(sd.toString());
					sd.clear();
					sd.Serialize(ajax, sizes.size());
					int i = -1;
					while (++i < sizes.size())
						sd.Serialize(i, i, dateFormat_UTCFormat.format(updateTime.get(i)), commands.get(i).toString(), sizes.get(i));
					tot.Serialize(sd.toString());
					Write(tot.toString());
				}
			}
			execute = false;
			return;
		}
		super.Initiate();
	}

	public @Override void Load()
	{
		if (!IsPostback()) {
			lstVC.Clear();
			lstVC.AddColumn(JsListColumn.TypeImageClickAll, null,
				"select.gif\tVisa", false, false, null, null, null, null, null, null, "jsChoose($id$,$unique$)", null);
			lstVC.AddColumn(JsListColumn.TypeLabel, "vc", "vc", true, false);
			lstVC.AddColumn(JsListColumn.TypeLabel, "cached", "cached", true, false);
			lstVC.AddColumn(JsListColumn.TypeLabel, "updateCnt", "update count", false, false);
			lstVC.AddColumn(JsListColumn.TypeLabel, "lastAccessed", "Last Accessed", false, false);
			lstVC.AddColumn(JsListColumn.TypeLabel, "fileSize", "File size", false, false);
			lstVC.groupMessage = "#";
			lstVC.groupNotMessage = "Gruppera ej";
			for (Vc vc : Cache.allVc.values()){
				Domain d = World.getDomain(vc.vcGUID);
				if (d != null) {
					try {
						lstVC.AddRow(vc.vcGUID, d.getFullName(), vc.vc == null ? "no" : "yes", Integer.toString(vc.vc.updateCount), vc.vcLastEventFromVc == null ? '-' : dateFormat_UTCFormat.format(vc.vcLastEventFromVc), -1);
					} catch (Exception e) {
					}
				}
			}
			lstDataType.Clear();
			lstDataType.AddColumn(JsListColumn.TypeImageClickAll, null,
				"select.gif\tVisa", false, false, null, null, null, null, null, null, "jsAct($id$,$unique$)", null);
			lstDataType.AddColumn(JsListColumn.TypeLabel, "data", "Data type", true, false);
			lstDataType.AddColumn(JsListColumn.TypeLabel, "rows", "Nr rows", false, false);
			lstDataType.AddColumn(JsListColumn.TypeLabel, "hash", "Hash value", true, false);
			lstDataType.groupMessage = "#";
			lstDataType.groupNotMessage = "Gruppera ej";
			lstDataType.AddRow("1", "Choose vc below", "", "");
			lstUpdates.Clear();
			lstUpdates.AddColumn(JsListColumn.TypeImageClickAll, null,
				"select.gif\tVisa", false, false, null, null, null, null, null, null, "jsUpdate($id$,$unique$)", null);
			lstUpdates.AddColumn(JsListColumn.TypeLabel, "index","Nr", true, false);
			lstUpdates.AddColumn(JsListColumn.TypeLabel, "date","Vc Time", true, false);
			lstUpdates.AddColumn(JsListColumn.TypeLabel, "info", "Info", false, false);
			lstUpdates.AddColumn(JsListColumn.TypeLabel, "size", "Size", false, false);
			lstUpdates.groupMessage = "#";
			lstUpdates.groupNotMessage = "Gruppera ej";
			lstUpdates.AddRow("1", "0", "Choose vc below", "", "");
		}
	}

	private String elapsed(Date tim, long now) {
		return tim == null ? "" : AppCommon.elapsed(now - tim.getTime());
	}
	@Override
	public void OnPreRender() {
		super.OnPreRender();
		RegisterStartupScript("hide", "<script language='JavaScript' type='text/javascript'>document.getElementById('lstDataType$').style.visibility=\"hidden\";document.getElementById('lstUpdates$').style.visibility=\"hidden\";</script>");
	}
	public @Override void Render(StringBuilder output)
	{
		super.Render(output);
	}
}
