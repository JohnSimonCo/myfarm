package Delaval.info;

import Delaval.VMSController.DataObject.DateTime;
import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import Delaval.VMSController.VMSDataTransport.Http.HttpApplication;
import Delaval.VMSController.VMSDataTransport.Http.HttpResponse;

/**
 * The response will behave as a file download (browser dependent).
 * 
 * @author rappjo
 */
public class ExportAlStat implements HttpApplication
{
	@Override
	public void perform(HttpAction httpAction)
	{
		String data = httpAction.body.getFormData("data").getContent();
		java.text.SimpleDateFormat sdfTime = new java.text.SimpleDateFormat("yyyy-MM-dd HH.mm");
		try {
			String [] arr = data.split(";");
			if (data==null ||data.isEmpty())
			{
				httpAction.response.setStatusCode(HttpResponse.HTTP_STATUS_CODE_400_BadRequest);
				return;
			}
			int i=0,nrCol=Integer.parseInt(arr[0]);
			StringBuilder response = new StringBuilder(100000);
			while(i<arr.length-1){
				int ii=-1;
				while(++ii<nrCol)
					response.append(arr[++i]).append('\t');
				response.append("\r\n");
			}
			//Set file properties as header attributes to tell browser this is a download.
			httpAction.response.setContentTypeFromResourceName(".xls");
			httpAction.response.setContentDisposition("attachment;filename=" + "AlarmStatistics " + sdfTime.format(DateTime.GetCalendar(null).getTime()) + ".xls");

			//add content
			httpAction.response.addBody(response.toString());
		} catch (Exception ex) {
		}
	}

}
