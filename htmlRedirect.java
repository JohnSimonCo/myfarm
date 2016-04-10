package Delaval.info;

import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Map.Entry;

/**
 *
 * @author rappjo
 */
public class htmlRedirect {
	public static String redirect(HttpAction action, String url, String next) {
		String host = "";
		for (Entry<String,String> e : action.header.headerFields.entrySet())
			if (e.getKey().equalsIgnoreCase("host")) {
				host = "http://"+e.getValue()+'/';
				break;
			}
		String s = null;
		try {
			s = "<html><head><meta http-equiv=\"REFRESH\" content=\"0;url="+host+url+(next==null?"":"?url="+URLEncoder.encode(host+next,"UTF-8"))+"\"></HEAD><BODY></BODY></HTML>";
		} catch (UnsupportedEncodingException ex) {
		}
		return s;
	}
}
