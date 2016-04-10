package Delaval.info;

import static Delaval.AppDB.AppServerFkn.dbFilePath;
import Delaval.AppDB.World;
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
 * @author rappjo
 */
public class ExportRecording implements HttpApplication {

	@Override
	public void perform(HttpAction httpAction) {
		AppSession session = AppSession.getSession(httpAction, null);
		boolean accessOk = false;
		if (session.user.roles != null)
			for (World.RolesAtDomain r : session.user.roles)
				if ((accessOk = (r.accessRightMask & World.Permission.bitMask.AdminDatabase.mask) != 0))
					break;
		if (accessOk) {
			String file = ZipDir.ZipDir(dbFilePath + File.separator + "Recording", false, true, null);
			if (file == null) {
				httpAction.response.setStatusCode(HttpResponse.HTTP_STATUS_CODE_400_BadRequest);
				httpAction.response.addBody("<HTML><BODY>Failed to zip file!</BODY></HTML>");
			}
			else {
				int i = dbFilePath.length();
				while ((--i > 0) && (dbFilePath.charAt(i) != File.separator.charAt(0))) {}
				File fm = new File(dbFilePath.substring(0, i) + file.substring(dbFilePath.length()));
				new File(file).renameTo(fm);
				file = fm.getPath();
				try {
					InputStream s = new FileInputStream(new File(file));
					httpAction.response.addBodyStream(s);
					httpAction.response.setContentType("application/octet-stream");
					i = file.length();
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
