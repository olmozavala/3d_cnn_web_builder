/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var deconv_color = "#84A432";
var maxpool_color = deconv_color;
var def_color = "#003F58";
var full_layer_color = "#FFB500";
var concat_color1 = "#D0D0D0";
var concat_color2 = "#707070";
var concat_color3 = "#A0A0A0";
var concat_color4 = "#D0D0D0";
var concat_color = "#F0D0D0";
var bn_color= '#FBEE76';
var dropout_color= '#3BE2F8';
var low_risk= '#27AA53';
var moderate_risk = '#EABC46';
var high_risk = '#E08C42';
var ex_risk = '#C50A14';

var arrow_color_names  = ['def','k','r','g','y','b','o','d','d1','d2','d3','d4','ba','drop','c1','c2','c3','c4'];
var arrow_colors = [def_color,'black','red','green',concat_color,'blue','orange',deconv_color,
						concat_color1, concat_color2, concat_color3, concat_color4, bn_color,dropout_color,
						low_risk, moderate_risk, high_risk, ex_risk];

function addDefs(obj){
	var ascale = scale;
	for(var i = 0; i < arrow_color_names.length; i++){
		obj.append('defs')
				.append('marker')
				.attr('id',arrow_color_names[i]+'arrowhead')
				.attr('markerWidth', 10*ascale)
				.attr('markerHeight', 7*ascale)
				.attr('refX',0)
				.attr('refY',3.5*ascale)
				.attr('orient','auto')
				.attr('stroke',arrow_colors[i])
				.attr('fill',arrow_colors[i])
					.append('polygon')
					.attr('points',"0 0, "+5*ascale+" "+3.5*ascale+", "+0*ascale+" "+7*ascale);
	}
}

function chooseColorArrow(color){
	var arrcolor='NOTFOUND';
	
	for(var i = 0; i < arrow_colors.length; i++){
		if(color===arrow_colors[i]){
			var color = arrow_colors[i];
			arrcolor = 'url(#'+arrow_color_names[i]+'arrowhead)';
			break;
		}
	}
	return [color, arrcolor];
}