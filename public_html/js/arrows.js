/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var stroke_width=2.0;
var arrow_width = 6;

function drawArrowDash(obj,x,y,x2,y2,colorName){
	var arrow_color_name, arrow_color;
	[arrow_color, arrow_color_name] = chooseColorArrow(colorName);

	obj.append('line')
			.attr('id','back')
			.attr('x1',x)
			.attr('y1',y)
			.attr('x2',x2+arrow_width)
			.attr('y2',y)
			.attr('stroke-width',stroke_width-1)
			.attr('stroke',arrow_color)
//			.attr('stroke-dasharray',"1 4")

	obj.append('line')
			.attr('id','back')
			.attr('x1',x2+arrow_width)
			.attr('y1',y)
			.attr('x2',x2+arrow_width)
			.attr('y2',y2)
			.attr('stroke-width',stroke_width-.5)
			.attr('stroke',arrow_color)
//			.attr('stroke-dasharray',"1 4")
			.attr('marker-end',arrow_color_name);
	return x2+arrow_width;
}

function drawVertArrow(obj,lay,color,dir='down'){
	var arrcolor=0;
	var vspace = 45;
	var hspace = 10;
	lay.x += hspace;
	[color, arrcolor] = chooseColorArrow(color);
	var h = lay.rows/2;
	h = dir === 'up'? -h:h;
	obj.append('line')
			.attr('x1',lay.x)
			.attr('y1',lay.y)
			.attr('x2',lay.x)
			.attr('y2',lay.y+h)
			.attr('stroke-width',stroke_width)
			.attr('stroke',color)
			.attr('marker-end',arrcolor);
	if(dir==='up'){
		lay.y = lay.y+h-vspace;
	}else{
		lay.y = lay.y+h+vspace;
	}
	return lay;
}

function drawHorArrow(obj,x,y,color){
	var arrcolor=0;
	var hspace = 8;
	[color, arrcolor] = chooseColorArrow(color);
	obj.append('line')
			.attr('x1',x)
			.attr('y1',y)
			.attr('x2',x+arrow_width)
			.attr('y2',y)
			.attr('stroke-width',stroke_width)
			.attr('stroke',color)
			.attr('marker-end',arrcolor);
	return x+arrow_width+hspace;
}