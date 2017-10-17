/**
 * 保育所背景リスト
 * @type {Object}
 */
var featureStyleList = {
	'default': { color: 'rgba(153, 153, 153, 1)', img: 'image/018.png'},
	'認可外保育所': { color: '#0362A0', img: 'image/019.png'},
	'幼稚園': { color: '#FF5C24', img: 'image/029.png'},
	'認可保育所': { color: '#6EE100', img: 'image/018.png'},
	'認定保育所': { color: '#6EE100', img: 'image/018.png'},
	'認可保育所（分園）': { color: '#6EE100', img: 'image/018.png'},
	'小規模保育事業Ａ型': { color: '#6EE100', img: 'image/018.png'},
	'事業所内保育事業（定員20人以上）': { color: '#6EE100', img: 'image/018.png'},
	'幼保連携型認定こども園': { color: '#6EE100', img: 'image/018.png'},
	'認定こども園': { color: '#6EE100', img: 'image/018.png'}
};

/**
 * 認可保育所向けスタイル
 * @param  {[type]} feature    [description]
 * @param  {[type]} resolution [description]
 * @return {[type]}            [description]
 */
var ninkaStyleFunction = function(feature, resolution)
{
	var facilityTypeName = feature.get('種別') ? feature.get('種別') : feature.get('Type');
	var style = [];
	if(facilityTypeName === "認可保育所" || 
	   facilityTypeName === "認定保育所" || 
	   facilityTypeName === "認可保育所（分園）" || 
	   facilityTypeName === "小規模保育事業Ａ型" || 
	   facilityTypeName === "事業所内保育事業（定員20人以上）" || 
	   facilityTypeName === "幼保連携型認定こども園" || 
	   facilityTypeName === "認定こども園") {
		featureStyle = featureStyleList[facilityTypeName];
		style        = nurseryStyleFunction(feature, resolution, featureStyle);
		//console.log("認可保育所:" + feature.get('Label'));
	}
	return style;
};

/**
 * 認可外保育所向けスタイル
 * @param  {[type]} feature    [description]
 * @param  {[type]} resolution [description]
 * @return {[type]}            [description]
 */
var ninkagaiStyleFunction = function(feature, resolution)
{
	var facilityTypeName = feature.get('種別') ? feature.get('種別') : feature.get('Type');
	var style = [];
	if(facilityTypeName === "認可外保育所") {
		featureStyle = featureStyleList[facilityTypeName];
		style        = nurseryStyleFunction(feature, resolution, featureStyle);
		//console.log("認可外保育所:" + feature.get('Label'));
	}
	return style;
};

/**
 * 幼稚園向けスタイル
 * @param  {[type]} feature    [description]
 * @param  {[type]} resolution [description]
 * @return {[type]}            [description]
 */
var kindergartenStyleFunction = function(feature, resolution)
{
	var facilityTypeName = feature.get('種別') ? feature.get('種別') : feature.get('Type');
	var style = [];
	if(facilityTypeName === "幼稚園") {
		featureStyle = featureStyleList[facilityTypeName];
		style        = nurseryStyleFunction(feature, resolution, featureStyle);
		//console.log("幼稚園:" + feature.get('Label'));
	}
	return style;
};

/**
 * 保育施設共通のスタイル定義
 * @param  {[type]} feature      [description]
 * @param  {[type]} resolution   [description]
 * @param  {[type]} featureStyle [description]
 * @return {[type]}              [description]
 */
var nurseryStyleFunction = function(feature, resolution, featureStyle) {
	var radius = 15;
	var background = new ol.style.Circle({
		radius: radius,
		fill: new ol.style.Fill({
			color: featureStyle.color
		}),
		stroke: new ol.style.Stroke({color: 'white', width: 3})
	});
	var image = new ol.style.Icon({
		anchor: [0.5, 0.5],
		anchorXUnits: 'fraction',
		anchorYUnits: 'fraction',
		src: featureStyle.img,
		scale: 0.5
	});

	resolution = Math.floor(resolution * 1000);
	var _type = "";
	var label = feature.get('ラベル') ? feature.get('ラベル') : feature.get('Label')
	//console.log(label);
	var text = resolution < 10000 ? label : '';
	var style = [];
	style = [
		new ol.style.Style({image: background}),
		new ol.style.Style({image: image}),
	];

	if (text !== "") {
		style.push(
			new ol.style.Style({
				text: new ol.style.Text({
					offsetY: -20.0,
					text: text,
					font: '14px sans-serif',
					fill: new ol.style.Fill({
						color: '#000'
					}),
					stroke: new ol.style.Stroke({
						color: '#FFF',
						width: 3
					})
				})
			})
		);
	}
	return style;
};

/**
 * ベースの校区スタイルを戻す関数
 * @param  {[type]} mojicolor [description]
 * @param  {[type]} fillcolor [description]
 * @return {[type]}           [description]
 */
function baseSchoolStyle(mojicolor, fillcolor) {
	return function(feature, resolution) {
		var image = new ol.style.Icon({
			anchor: [0.5, 0.5],
			anchorXUnits: 'fraction',
			anchorYUnits: 'fraction',
			src: 'image/school.png',
			// scale: 0.5
		});

		var background = new ol.style.Circle({
			radius: 15,
			fill: new ol.style.Fill({
				color: mojicolor
			}),
			stroke: new ol.style.Stroke({color: 'white', width: 3})
		});

		var style = [
			new ol.style.Style({image: background}),
			new ol.style.Style({image: image}),
			new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: mojicolor,
					width: 3
				}),
				fill: new ol.style.Fill({
					color: fillcolor
				})
			})
		];

		resolution = Math.floor(resolution * 1000);
		var text = "";
		if(feature.get('label') !== null) {
			text = resolution < 12000 ? feature.get('label') : '';
		}
		if (text !== "") {
			style.push(
					new ol.style.Style({
						text: new ol.style.Text({
							offsetY: -25.0,
							text: text,
							font: '13px sans-serif',
							fill: new ol.style.Fill({
								color: mojicolor
							}),
							stroke: new ol.style.Stroke({
								color: '#FFF',
								width: 3
							})
						})
					})
				);
		}
		return style;
	};
}

// 中学校区スタイル
var middleSchoolStyleFunction = baseSchoolStyle(
	'#7379AE', 'rgba(115, 121, 174, 0.1)'
	);

// 小学校区スタイル
var elementaryStyleFunction = baseSchoolStyle(
	'#1BA466', 'rgba(27, 164, 102, 0.1)'
	);

// 距離計測用同心円の色設定
var circleStyleFunction = function(feature, resolution) {
	resolution = Math.floor(resolution * 1000);
	var text = "";
	if(feature.get('name') !== null) {
		text = resolution < 100000 ? feature.get('name') : '';
	}
	var style = [new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: 'rgba(238, 149, 44, 0.30)',
			width: 3
		}),
		fill: new ol.style.Fill({
			color: 'rgba(238, 149, 44, 0.30)'
		}),
		text: new ol.style.Text({
			offsetY: -40.0,
			text: text,
			font: '20px sans-serif',
			fill: new ol.style.Fill({
				color: 'rgba(255, 0, 0, 0.4)'
			}),
			stroke: new ol.style.Stroke({
				color: '#FFF',
				width: 3
			})
		})
	})];
	return style;
};
