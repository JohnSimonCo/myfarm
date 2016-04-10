package Delaval.info;

import Delaval.AppServer.Main;
import Delaval.VC.VCCommand;
import Delaval.VMSController.DataObject.Parse;
import Delaval.VMSController.WebBase.WebPage;
import Delaval.VMSController.WebControls.JsList;
import Delaval.VMSController.WebControls.JsListColumn;
import Delaval.VMSController.WebControlsAsp.Button;
import Delaval.VMSController.WebControlsAsp.Literal;
import java.io.*;
import java.util.ArrayList;

/**
 *
 * @author Joran
 */
public class ta extends WebPage
{
	public Literal litTitle;
	public JsList lstDetails;
	public Literal context;
	public Literal toLine;
	public Button btnAlarm;
	public ArrayList<String> fileLines = new ArrayList<String>();
	public int index = 0, lineSelected = 0;

	public @Override void Load()
	{
		readFile();
		if (IsPostback())
			index = Integer.parseInt(context.text);
		else
		{
			context.text = "0";
			lstDetails.AddColumn(JsListColumn.TypeLabelClickable, "Key", "Rad", false, false, null, null, null, null, null, null, "jsAct($id$,$unique$)", null);
			lstDetails.AddColumn(JsListColumn.TypeLabelClickable, "Value", "Värde", false, false, null, null, null, null, null, null, "-", null);
			int i = -1;
			while (++i < fileLines.size())
				lstDetails.AddRow(Integer.toString(i), String.format("%03d",i), fileLines.get(i));
			lstDetails.sortCol = "Key";
			toLine.text = "Hejsan";
		}
	}
	private void readFile() {
		String fName, data;
		File curFile = new File(fName=Parse.getVCFolder()+File.separator+"testtrans.txt");
		InputStream inStream;
		try {
			inStream = new FileInputStream(curFile);
			BufferedReader in = new BufferedReader(new InputStreamReader(inStream, "UTF8"));
			while ((data=in.readLine()) != null)
				fileLines.add(data);
			
		}
		catch(Exception ex){
		}
		
	}
	public void SendNext(Button btn) {
		lineSelected = Integer.parseInt(lstDetails.lineSelected);
		int sendToLine = Parse.Integer(FormData("SendToLine"), index);
		while (index <= sendToLine) {
			VCCommand cmd = new VCCommand();
			cmd.perform(VCCommand.createHttpAction(fileLines.get(index),"127.0.0.1"), -1);
System.out.println("Sending " + Integer.toString(index) + ": " + fileLines.get(index));
			try {
				if(index != sendToLine)
					Thread.sleep(100);
			} catch (Exception e) {
			}
			index++;
		}
		context.text = Integer.toString(index);
	}

	public @Override void OnPreRender()
	{
		lstDetails.lineSelected = Integer.toString(index);
		RegisterHiddenField("SendToLine", "");
		super.OnPreRender();
	}
	public @Override void Render(StringBuilder output)
	{
		super.Render(output);
	}
}
