package Delaval.info;

import Delaval.Model.Xlat;
import Delaval.Model.Xlat.Data;
import Delaval.Model.Xlat.Data.TextEntity;
import Delaval.VMSController.DataObject.DateTime;
import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import Delaval.VMSController.VMSDataTransport.Http.HttpApplication;
import Delaval.VMSController.VMSDataTransport.Http.HttpResponse;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map.Entry;

/**
 *
 * @author jrp
 */
public class ExportLanguage implements HttpApplication {

	@Override
	public void perform(HttpAction httpAction) {
		java.text.SimpleDateFormat sdfTime = new java.text.SimpleDateFormat("yyyy-MM-dd");
		String data = httpAction.body.getFormData("languageCode").getContent();
		try {
			String languageCode = URLDecoder.decode(data, "UTF-8");
			if (languageCode==null ||languageCode.isEmpty()) {
				httpAction.response.setStatusCode(HttpResponse.HTTP_STATUS_CODE_400_BadRequest);
				return;
			}
			Data texts = Xlat.getAll();
			int i=-1, ii=-1;
			while( (++i < texts.languages.length) && !texts.languages[i].languageCode.equals(languageCode)) {}
			if(i == texts.languages.length) {
				httpAction.response.setStatusCode(HttpResponse.HTTP_STATUS_CODE_400_BadRequest);
				return;
			}
			HashMap<String, Data.TextEntity> all = texts.allText;
			ArrayList<String> allStrings = new ArrayList<String>();
			for (Entry<String, TextEntity> o : all.entrySet()) {
				String value = o.getValue().languageValues[i];
				allStrings.add(o.getKey()+'='+(value == null ? "" : value)+"\r\n");
			}
			Collections.sort(allStrings);
			StringBuilder response = new StringBuilder(100000);
			for(String s : allStrings)
				response.append(s);
			//Set file properties as header attributes to tell browser this is a download.
			httpAction.response.setContentTypeFromResourceName(".txt");
			httpAction.response.setContentDisposition("attachment;filename=" + "Language" + sdfTime.format(DateTime.GetCalendar(null).getTime()) + '_' + data + ".txt");

			//add content
			httpAction.response.addBody(response.toString());
		} catch (UnsupportedEncodingException ex) {
		}
	}
	
}
