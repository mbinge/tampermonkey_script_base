let tampermonkey_script_base_format=function(data){
	let ci_map={};
	let objs=[]
		data.split("\n").forEach(function(line,index){
			let lines={}
			line.split(",").forEach(function(column, ci){
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

let tampermonkey_script_base_batch=function(data, run){
	let total=data.length
		for(let index=0;index<data.length;index++){
			let o=data[index]
				if(o.progressDone!=true) {
					let ret=run(o, index, data)
						if(ret==false){
							break
						}
				} else {
					total--
				}
		}
	if(total==0){
		GM_setValue("yp_cp_batch_do",0)
			$('#yp_terminal').append("<div>done<div>")
	}
}
let tampermonkey_script_base_init=function(cb) {
	if(GM_getValue("yp_cp_batch_do")==0) {
		let input_box='<div id="yp_ipt_box" style="position: absolute; top: 200px; left: 5px; height: 300px; background-color: rgb(255, 255, 255); '
			input_box+='z-index: 9999; border: 10px solid rgb(0, 0, 0); border-radius: 10px; width: 400px; overflow: hidden;">'
			input_box+='<textarea id="yp_ipt_area" style="width: 380px; margin-top: 5px; height: 240px; margin-bottom: 0px;font-size: 12px"></textarea>'
			input_box+='<input type="button" id="yp_submit" style="width:380px;height: 25px;background-color:green;color: #fff;" value="START">'
			input_box+='</div>'

			$('body').append(input_box);
		setTimeout(function(){
			$('#yp_ipt_box').hide()
		},5000)
		$('#yp_submit').click(function(){
			GM_setValue("yp_cp_batch_do", 1)
				let data = tampermonkey_script_base_format($('#yp_ipt_area').val())
				GM_setValue('data', data);
			tampermonkey_script_base_batch(data, cb)
		});
	} else {
		let input_box='<div id="yp_ipt_box" style="position: absolute; top: 200px; left: 5px; height: 300px; background-color: #000; '
			input_box+='z-index: 9999; border: 10px solid rgb(0, 0, 0); border-radius: 10px; width: 400px; overflow: hidden;">'
			input_box+='<div id="yp_terminal" style="width:380px; margin:5px 0; height: 280px;font-size:12px; color:#fff;text-align:left;overflow: auto"></div>'
			input_box+='</div>'
			$('body').append(input_box);
		$('#yp_terminal').append("<div>doing...<div>")
			let data=GM_getValue('data');
		let logs=[]
			data.forEach(function(o){
				if(o.progressDone && o.progressDone==true) {
					logs.push("<div>"+JSON.stringify(o)+"</div>")
				}
			})
		$('#yp_terminal').append(logs.join())
			tampermonkey_script_base_batch(data, cb)
	}
}
