package Delaval.info;

import Delaval.AppDB.AppCommon.Animal;
import Delaval.AppDB.AppCommon.Animals;
import Delaval.AppDB.AppCommon.Container;
import Delaval.AppDB.AppCommon.ContainerData;
import Delaval.AppDB.AppCommon.ContainerInfo;
import Delaval.AppDB.AppCommon.Milking;
import Delaval.Model.Cache;
import Delaval.Model.Vc;
import Delaval.VMSController.WebBase.WebPage;
import Delaval.VMSController.WebControls.JsList;
import Delaval.VMSController.WebControlsAsp.Label;
import Delaval.VMSController.WebControlsAsp.Static;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map.Entry;

/**
 *
 * @author Joran
 */
public class td extends WebPage
{
	public Label lblInfo;
	public JsList lstDetails;
	public Static staContent;

	public @Override void Load()
	{
		String [] id = RequestData("ID").split(",");
		String guid = id[0];
		String container = id[1];
		Vc vc = Cache.allVc.get(guid);
		vc = new Vc(guid);
		if (vc != null)
		{
			Vc vcPrev = new Vc(guid);
			int count = Integer.parseInt(container);
			vcPrev.readFromFile(count-1);
			staContent.text = vc.readFromFile(count);
			int animalNumberIndex = vc.vc.animals.infoAnimal.getFieldNameIndex("Number");
			StringBuilder sz = new StringBuilder();
			checkContainer(vc.vc.animalGroups, vcPrev.vc.animalGroups, sz);
			checkContainer(vc.vc.trafficAreas, vcPrev.vc.trafficAreas, sz);
			checkContainer(vc.vc.vc, vcPrev.vc.vc, sz);
			checkContainer(vc.vc.vms, vcPrev.vc.vms, sz);
			for (Entry<String,Animal> ad : vcPrev.vc.animals.animals.entrySet())
				if (!vc.vc.animals.animals.containsKey(ad.getKey()))
					sz.append("<br/><br/>").append("Animal ").append(ad.getValue().animal.fieldValues[animalNumberIndex]).append(" with primary key:").append(ad.getKey()).append(" is deleted");
			for (Entry<String,Animal> aa : vc.vc.animals.animals.entrySet()) {
				Animal o = vcPrev.vc.animals.animals.get(aa.getKey());
				Animal a = aa.getValue();
				String animalNr = a.animal.fieldValues[animalNumberIndex];
				if (o == null)
					sz.append("<br/><br/> Animal ").append(animalNr).append(" is new");
				else {
					StringBuilder szz = new StringBuilder();
					ContainerDataFlag aaa = new ContainerDataFlag(a.animal);
					ContainerDataFlag ooo = new ContainerDataFlag(o.animal);
					aaa.checkDifferent(ooo, vc.vc.animals.infoAnimal, szz);
					if (a.inAreaSince == null) a.inAreaSince = 0L; if (o.inAreaSince == null) o.inAreaSince = 0L;
					if (a.lastMilkingTime == null) a.lastMilkingTime = 0L; if (o.lastMilkingTime == null) o.lastMilkingTime = 0L;
					if (a.timeToNextMilking == null) a.timeToNextMilking = 0L; if (o.timeToNextMilking == null) o.timeToNextMilking = 0L;
try {
					if ((a.areaGUID != null) && !a.areaGUID.equals(o.areaGUID))
						szz.append("<br/>areaGuid changed from ").append(o.areaGUID).append(" to ").append(a.areaGUID);
					if (a.inAreaSince.longValue() != o.inAreaSince.longValue())
						szz.append("<br/>inAreaSince changed from ").append(new Date(o.inAreaSince*1000).toString()).append(" to ").append(new Date(a.inAreaSince*1000).toString());
					if (a.lastMilkingTime.longValue() != o.lastMilkingTime.longValue())
						szz.append("<br/>lastMilkingTime changed from ").append(new Date(o.lastMilkingTime*1000).toString()).append(" to ").append(new Date(a.lastMilkingTime*1000).toString());
					if (a.timeToNextMilking.longValue() != o.timeToNextMilking.longValue())
						szz.append("<br/>timeToNextMilking changed from ").append(new Date(o.timeToNextMilking*1000).toString()).append(" to ").append(new Date(a.timeToNextMilking*1000).toString());
					if (szz.length() > 0)
						sz.append("<br/><br/> Animal ").append(animalNr).append(":").append(szz);
					int len = szz.length();
					szz.setLength(0);
					checkMilkings(a, o.milkings, vc.vc.animals, szz);
					if (szz.length() > 0) {
						if (len == 0)
							sz.append("<br/><br/> Animal ").append(animalNr);
						sz.append(" milkings:").append(szz);
					}

} catch (Exception e) {
	int rr=0;
	rr++;
}
				}
			}
			staContent.text += sz.length() == 0 ? "<br/><br/>No change in data" : sz.toString();
		}
	}
	public static class ContainerDataFlag {
		public boolean isUsed = false;
		public boolean isDifferent = false;
		public ContainerData d;
		ContainerDataFlag() {}
		public ContainerDataFlag(ContainerData d) {
			this.d = d;
		}
		void checkDifferent(ContainerDataFlag other, ContainerInfo info, StringBuilder sz) {
			int i = -1;
			isUsed = other.isUsed = true;
			if (!(isDifferent = d.hashCode != other.d.hashCode))
				while (++i < d.fieldValues.length)
					if (isDifferent = d.fieldValues[i] == null ? other.d.fieldValues[i] != null : !d.fieldValues[i].equals(other.d.fieldValues[i]))
						break;
			if (isDifferent)
				td.checkDifferent(d, other.d, sz, info);
		}
	}
	private static void checkDifferent(ContainerData curr, ContainerData other, StringBuilder sz, ContainerInfo info) {
		sz.append("<br/><br/>").append(info.containerName).append(" primary key:").append(curr.fieldValues[info.primaryKeyIndex]).append("is different");
		if (curr.hashCode != other.hashCode)
			sz.append(" hash=").append(curr.hashCode).append(" from ").append(other.hashCode);
		int i = -1;
		while (++i < curr.fieldValues.length)
			if (curr.fieldValues[i] == null ? other.fieldValues[i] != null : !curr.fieldValues[i].equals(other.fieldValues[i]))
				sz.append("<br/>").append(info.fieldNames[i]).append("=").append(curr.fieldValues[i]).append(" from ").append(other.fieldValues[i]);
	}
	private void checkContainer(Container _old, Container _curr, StringBuilder sz) {
		HashMap<String, ContainerDataFlag> old = new HashMap<String, ContainerDataFlag>();
		HashMap<String, ContainerDataFlag> curr = new HashMap<String, ContainerDataFlag>();
		for (Entry<String,ContainerData> d : _old.data.entrySet())
			old.put(d.getKey(), new ContainerDataFlag(d.getValue()));
		for (Entry<String,ContainerData> d : _curr.data.entrySet())
			curr.put(d.getKey(), new ContainerDataFlag(d.getValue()));
		for (Entry<String, ContainerDataFlag> d : curr.entrySet()) {
			ContainerDataFlag p = old.get(d.getKey());
			if (p == null)
				sz.append("<br/>").append(_curr.info.containerName).append(" primary key:").append(d.getKey()).append(" is new");
			else
				p.checkDifferent(d.getValue(), _curr.info, sz);
			old.remove(d.getKey());
		}
		for (Entry<String, ContainerDataFlag> d : old.entrySet())
			sz.append("<br/>").append(_curr.info.containerName).append(" primary key:").append(d.getKey()).append(" is deleted");
	}
	private void checkMilkings(Animal a, List<Milking> _old, Animals animals, StringBuilder sz) {
		HashMap<String, ContainerDataFlag> old = new HashMap<String, ContainerDataFlag>();
		HashMap<String, ContainerDataFlag> curr = new HashMap<String, ContainerDataFlag>();
		int primaryIndex = animals.infoMilking.primaryKeyIndex;
		int endTimeIndex =  animals.infoMilking.getFieldNameIndex("EndTime");
		for (Milking m : a.milkings)
			curr.put(m.milking.fieldValues[primaryIndex], new ContainerDataFlag(m.milking));
		for (Milking m :_old)
			old.put(m.milking.fieldValues[primaryIndex], new ContainerDataFlag(m.milking));

		for (Entry<String, ContainerDataFlag> d : curr.entrySet()) {
			ContainerDataFlag p = old.get(d.getKey());
			if (p == null)
				sz.append("<br/>").append(d.getValue().d.fieldValues[endTimeIndex]).append(" primary key: ").append(d.getKey()).append(" is new");
			else
				d.getValue().checkDifferent(p, animals.infoMilking, sz);
			old.remove(d.getKey());
		}
		for (Entry<String, ContainerDataFlag> d : old.entrySet())
			sz.append("<br/><br/>").append(animals.infoMilking.containerName).append(" EndTime=").append(d.getValue().d.fieldValues[endTimeIndex]).append(", primary key:").append(d.getKey()).append(" is deleted");
	}
	public @Override void Render(StringBuilder output)
	{
		super.Render(output);
	}
//			Container cnt = null;
//			if (container.equals(AppCommon.TRAFFIC_AREA))
//				cnt = vc.vc.trafficAreas;
//			else if (container.equals(AppCommon.VC))
//				cnt = vc.vc.vc;
//			else if (container.equals(AppCommon.VMS))
//				cnt = vc.vc.vms;
//			else if (container.equals(AppCommon.ANIMAL_GROUP))
//				cnt = vc.vc.animalGroups;
//			if (cnt != null) {
//				lstDetails.Clear();
//				lstDetails.AddColumn(JsListColumn.TypeLabel, "field", "Field", true, false);
//				lstDetails.AddColumn(JsListColumn.TypeLabel, "value", "Value", true, false);
//				lstDetails.groupMessage = "#";
//				lstDetails.groupNotMessage = "Gruppera ej";
//				
//			}
			
}
