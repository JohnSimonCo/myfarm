package Delaval.info;

import Delaval.AppDB.MilkingDB;
import Delaval.AppDB.World;
import Delaval.AppDB.World.Domain;
import Delaval.Logs.Log;
import Delaval.VMSController.Logger.Log.Level;
import Delaval.VMSController.VMSDataTransport.Http.HttpAction;
import Delaval.VMSController.VMSDataTransport.Http.HttpApplication;
import Delaval.mvc.Pages;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;

/**
 *
 * @author rappjo
 */
public class GetWeekMilkings implements HttpApplication {
	public static class ByteBufferBackedInputStream extends InputStream {
		ByteBuffer buf;
		public ByteBufferBackedInputStream(ByteBuffer buf) {
			this.buf = buf;
			this.buf.rewind();
		}
		@Override
		public int read() throws IOException {
			if (!buf.hasRemaining()) {
				return -1;
			}
			return buf.get() & 0xFF;
		}
		@Override
		public int read(byte[] bytes, int off, int len)	throws IOException {
			if (!buf.hasRemaining())
				return -1;
			len = Math.min(len, buf.remaining());
			buf.get(bytes, off, len);
			return len;
		}
	}
	@Override
	public void perform(HttpAction httpAction) {
		String vcId = null, _index;
		int index = -1;
		try {
			long timeStamp = System.currentTimeMillis();
			Pages.SessionCookie cookie = Pages.SessionCookie.get(httpAction);
			World.User u = World.getUserFromEmail(cookie.emailAddress);
			vcId = httpAction.command.getQueryParameter("vcId");
			_index = httpAction.command.getQueryParameter("index");
			if (vcId == null)
				_index = httpAction.body.getFormData("index").getContent();
			index = Integer.parseInt(_index);
//			u = World.getUserFromEmail("joran.rapp@delaval.com");
//			if (true || (cookie.pwd != null) && (u.password != null) && (u.password == (int)cookie.pwd)) {
			if ((cookie.pwd != null) && (u.password != null) && (u.password == (int)cookie.pwd)) {
				boolean isFromAnalyze = httpAction.command.getQueryParameter("a") != null;
				if (vcId == null && httpAction.body.getFormData("vcId") != null)
					vcId = httpAction.body.getFormData("vcId").getContent();
				if (vcId == null)
					vcId = cookie.farm;
				Domain targetDomain = World.hasAccessRightToTarget(vcId, World.Permission.bitMask.SeeFarm.mask, u.id);
				if (targetDomain != null) {
					u.pageAccess((isFromAnalyze ? "MilkingDB " : "FetchMilkings ") + targetDomain.getPresentation(3), timeStamp);
					ByteBuffer buffer = MilkingDB.getWeekMilkings(vcId, index);
					ByteBufferBackedInputStream stream = new ByteBufferBackedInputStream(buffer);
					httpAction.response.addCustomHeader("Content-Length", ""+buffer.capacity());
					httpAction.response.addBodyStream(stream);
					httpAction.response.setContentType("application/octet-stream");
					Log.log(Level.Debug, "WeekMilkings", 0, targetDomain.getShortName() + ", " + u.getUsername(0) + ": fetched " + String.format("%,d", buffer.capacity()) + " bytes from index " + index + " in " + (System.currentTimeMillis() - timeStamp) + " ms");
				}
			}
		} catch (Exception e) {
			Log.log(Level.Alarm, "WeekMilkings", 0, "GetWeekMilkings failed for index " + index + " in " + vcId, Log.getStackTrace(e));
		}
	}
}
