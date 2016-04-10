package Delaval.info;

import static Delaval.AppDB.AppServerFkn.dbFilePath;
import Delaval.AppDB.World;
import Delaval.AppServer.CommandServer;
import Delaval.Model.AppSession;
import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import Delaval.VMSController.VMSDataTransport.Http.HttpApplication;
import Delaval.VMSController.VMSDataTransport.Http.HttpResponse;
import Delaval.util.ZipDir;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;

/**
 *
 * @author jrp
 */
public class ExportDatabase implements HttpApplication {

	@Override
	public void perform(HttpAction httpAction) {
		AppSession session = AppSession.getSession(httpAction, null);
		boolean accessOk = false;
		if (session.user.roles != null)
			for (World.RolesAtDomain r : session.user.roles) {
				if ((accessOk = (r.accessRightMask & World.Permission.bitMask.AdminDatabase.mask) != 0))
					break;
			}
		if (accessOk) {
			String sh = httpAction.command.getQueryParameter("all");
			String [] doNotExportDir = null;
			if (httpAction.command.getQueryParameter("super") != null)
				doNotExportDir = new String[]{"Recording","_VcFiles","_Supervise"};
			CommandServer.doCommandInitiateBackup();
			String file = ZipDir.ZipDir(dbFilePath, sh != null, doNotExportDir != null, doNotExportDir);
			CommandServer.doCommandFinalizeBackup();
			if (file == null) {
				httpAction.response.setStatusCode(HttpResponse.HTTP_STATUS_CODE_400_BadRequest);
				httpAction.response.addBody("<HTML><BODY>Failed to zip file!</BODY></HTML>");
			}
			else {
				try {
					InputStream s = new FileInputStream(new File(file));
					httpAction.response.addBodyStream(s);
					httpAction.response.setContentType("application/octet-stream");
					int i = file.length();
					while (--i > 0 && file.charAt(i) != File.pathSeparatorChar) {}
					httpAction.response.setContentDisposition("attachment; filename="+file.substring(i + 1) );
				} catch (Exception e) {
					httpAction.response.setStatusCode(HttpResponse.HTTP_STATUS_CODE_400_BadRequest);
					httpAction.response.addBody("<HTML><BODY>Failed to open zip file!</BODY></HTML>");
				}
			}
		}
		else
				httpAction.response.addBody("<HTML><BODY>No permission!</BODY></HTML>");
	}
}
