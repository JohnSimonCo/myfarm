package Delaval.info;

import Delaval.Model.Xlat;
import Delaval.Model.Xlat.Data;
import Delaval.Logs.Log;
import Delaval.VMSController.Logger.Log.Level;
import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import Delaval.VMSController.VMSDataTransport.Http.HttpApplication;
import Delaval.VMSController.VMSDataTransport.Http.HttpResponse;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.HashMap;

/**
 *
 * @author blomda
 */
public class ImportLanguage implements HttpApplication {

	@Override
	public void perform(HttpAction httpAction) {
		java.text.SimpleDateFormat sdfTime = new java.text.SimpleDateFormat("yyyy-MM-dd");
		try {
			String languageCode = URLDecoder.decode(httpAction.body.getFormData("languageCode").getContent(), "UTF-8");
			int languageIndex = Xlat.getLcidIndex(languageCode);
			String importFile = httpAction.body.getFormData("file").getContent();
//			importFile = URLDecoder.decode(fileContent, "UTF-8");
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
			String error = "";
			int j = 0;
			for (String line : importFile.split("\r\n")) {
				if(line.contains("\r") || line.contains("\n") || !line.contains("=")) {
					error = "alert('File contains error! " + j + " translations imported.');";
					Log.log(Level.Alert, "AppServer", 0, "Translation file (" + languageCode + ") contains error! " + j + " translations imported.", importFile);
					break;
				}
				String[] v = line.split("=");
				if(all.containsKey(v[0])){
					Xlat.update(v[0], v[1], languageIndex);
					j++;
				}
			}
			httpAction.response.setStatusCode(HttpResponse.HTTP_STATUS_CODE_200_OK);
			httpAction.response.addBody("<HTML><HEAD></HEAD><BODY onload=\"" + error + "window.history.back();\"></BODY></HTML>");
		} catch (UnsupportedEncodingException ex) {
			String err = Log.getStackTrace(ex);
			err = null;
		}
	}
	
}
