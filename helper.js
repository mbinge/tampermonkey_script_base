let tampermonkey_script_base_format=function(data){
	let ci_map={};
	let objs=[]
	data.split("\n").forEach(function(line,index){
        let lines={}
        line.trim().split(",").forEach(function(column, ci){
            if(index==0) {
                ci_map[ci]=column
            } else {
                lines[ci_map[ci]]=column
            }
        })
        if(index>0) {
            objs.push(lines)
        }
	})
	return objs
}
let tampermonkey_script_base_do=function(data, batch, before, after){
	//before
    let batch_step=GM_getValue("yp_cp_batch_do")
    if(batch_step!=1) {
        let before_ret = 1
        if(before){
            let ret=before(data);
            batch_step=ret[0]?1:2
            data = ret[1]
        }
        GM_setValue('data', data);

        if(batch_step!=0) {
            GM_setValue("yp_cp_batch_do", batch_step)
            if(batch_step!=1)return
        }
    }
    //batch
    let total=data.length
	for(let index=0;index<data.length;index++){
		if(!data[index].progressDone) {
			let rets=batch(index, data)
            data=rets[1]
            data[index].progressDone=true;
			if(rets[0]==false){
                GM_setValue('data', data);
				return
			} else {
                total--
            }
		} else {
			total--
		}
	}
    //after
	if(total==0){
		GM_setValue("yp_cp_batch_do",0)
		$('#yp_terminal').append("<div>done<div>")
        if(after)after(data)
        GM_deleteValue("yp_cp_batch_do")
        GM_deleteValue("data")
	}
}
let tampermonkey_script_base_init=function(batch, before, after) {
    let data=GM_getValue('data');
    let doing=GM_getValue("yp_cp_batch_do")
	if(doing==0||!data) {
		let input_box='<div id="yp_ipt_box" style="position:fixed;top:200px;z-index:9999;left:-408px">'
            input_box+='<div id="yp_ipt_tool" style="width:1.8em;height:7.5em;float:right;margin-top:100px;';
            input_box+='background-color:green;color:#fff;text-align:center;padding:1em 5px;cursor: pointer;">批量工具</div>'
            input_box+='<div style="margin-left:5px;height:300px;background-color:#fff;border:10px solid #000;border-radius:10px;width:400px;overflow:hidden;">'
			input_box+='<textarea id="yp_ipt_area" style="width: 380px; margin-top: 5px; height: 245px; margin-bottom: 0px;font-size: 12px"></textarea>'
			input_box+='<input type="button" id="yp_submit" style="width:380px;height: 25px;background-color:green;color: #fff;" value="START">'
			input_box+='</div></div>'

		$('body').append(input_box);
		$('#yp_submit').click(function(){
			let data = tampermonkey_script_base_format($('#yp_ipt_area').val())
			tampermonkey_script_base_do(data, batch, before, after)
		});
        $('#yp_ipt_tool').click(function(){
            let left=$('#yp_ipt_box').css('left')
            if(left=="0px") {
                $('#yp_ipt_box').css('left','-408px')
            } else {
                $('#yp_ipt_box').css('left','0px')
            }
        })
	} else {
		let input_box='<div id="yp_ipt_box" style="position: absolute; top: 200px; left: 5px; height: 300px; background-color: #000; '
			input_box+='z-index: 9999; border: 10px solid rgb(0, 0, 0); border-radius: 10px; width: 400px; overflow: hidden;">'
			input_box+='<div id="yp_terminal" style="width:380px; margin:5px 0; height: 240px;font-size:12px; color:#fff;text-align:left;overflow: auto"></div>'
            input_box+='<input type="button" id="yp_reset" style="width:380px;height: 25px;background-color:green;color: #fff;" value="RESET">'
			input_box+='</div>'
		$('body').append(input_box);
        $('#yp_reset').click(function(){
            GM_deleteValue("yp_cp_batch_do")
            GM_deleteValue("data")
            GM_deleteValue("yp_cp_before_helper")
            location.reload();
        })
		$('#yp_terminal').append("<div>doing...<div>")
		let data=GM_getValue('data');
        let logs=[]
		data.forEach(function(o, i){
			if(o.progressDone && o.progressDone==true) {
				logs.push("<div>="+i+" done=</div>")
			}
		})
		$('#yp_terminal').append(logs.join(""))
		tampermonkey_script_base_do(data, batch, before, after)
	}
}
