var mouseBox = {
	dlg:		null,
	innerDiv:	null,
	isActive:	false,
	rs:			false,
	show:	function(div,className,rightShift){
		mouseBox.rs=rightShift;
		if(mouseBox.dlg)
			while(mouseBox.dlg.childNodes.length)
				mouseBox.dlg.removeChild(mouseBox.dlg.childNodes[0]);
		if (!mouseBox.dlg)
			mouseBox.dlg=jr.ec('div',{parentNode:document.body, className:className,style:{'z-index':999,position:'absolute',cursor:'pointer'},children:div});
		else
			mouseBox.dlg.appendChild(div);
	},
	move:	function(){
		if(mouseBox.dlg){
			var stl = mouseBox.dlg.style;
			var tbl = mouseBox.dlg.childNodes[0];
			var y = 23+window.event.clientY+window.pageYOffset;
			var x = window.event.clientX-(mouseBox.rs?0:tbl.clientWidth/2);
			if(y-window.scrollY+tbl.clientHeight>window.innerHeight){
				y=window.event.clientY-tbl.clientHeight-10+window.scrollY;
				if(y<0){
					y=window.scrollY;
					x=window.event.clientX+5;
				}
			}
			if(x+tbl.clientWidth>window.innerWidth-3)x=window.innerWidth-tbl.clientWidth-3;
			if(x<0)x=0;
			stl.left = ""+x+"px";
			stl.top = ""+y+"px";
		}
	},
	asMenu:	function(mouseX,mouseY){
		if(mouseBox.dlg){
			var stl = mouseBox.dlg.style;
			var tbl = mouseBox.dlg.childNodes[0];
			if(!mouseY){
				mouseY=window.event.clientY+window.pageYOffset-10;
				mouseX=window.event.clientX-8;
			}
			if(mouseX+tbl.clientWidth>window.innerWidth-3)x=window.innerWidth-tbl.clientWidth-3;
			if(mouseX<0)mouseX=0;
			stl.left = ""+mouseX+"px";
			stl.top = ""+mouseY+"px";
		}
	},
	hide:	function(){
		if(mouseBox.dlg){
			document.body.removeChild(mouseBox.dlg);
			mouseBox.dlg=null;
		}
	}
};

