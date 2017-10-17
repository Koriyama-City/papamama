var gulp = require('gulp');
var browserSync = require("browser-sync");
var shapefile = require('shapefile');
var fs = require('fs');
var inside = require('point-in-polygon');
var runSequence = require('run-sequence');
var csv = require('csv');
var iconv = require('iconv-lite');
var sutil = require('line-stream-util')
var GeoJSON = require('geojson');

// ローカルサーバ起動
gulp.task("serve", () => {
  browserSync({
    server: {
      baseDir: "."
    }
  });

  // 監視対象ファイル一覧
  gulp.watch(["css/**/*", "data/**/*", "image/**/*", "js/**/*", "index.html"], () => {
    browserSync.reload();
  });
});

// 全データ更新
gulp.task("updatedata", (cb) => {
  runSequence(['data-wards', 'data-middleSchool', 'data-elementary', 'data-school'], 'data-station', 'data-nursery', cb);
});

// 行政区域のデータ更新
gulp.task("data-wards", (cb) => {
  shapefile.read('data_org/N03-17_07_170101.shp', {encoding: 'shift_jis'}, (err, json) => {
    if(err) {
      console.log(err);
    } else {
      json.features = json.features.filter((feature) => {
        var cityCode = feature.properties.N03_007;
        return cityCode && cityCode.indexOf('07203') === 0;
      });
      fs.writeFileSync( 'data/wards.geojson', JSON.stringify(json) );
    }
    cb();
  });
});

// 中学校区域のデータ更新
gulp.task("data-middleSchool", (cb) => {
  shapefile.read('data_org/A32-16_07.shp', {encoding: 'shift_jis'}, (err, json) => {
    if(err) {
      console.log(err);
    } else {
      json.features = json.features.filter((feature) => {
        var cityCode = feature.properties.A32_001;
        return cityCode && cityCode.indexOf('07203') === 0;
      });
      fs.writeFileSync( 'data/MiddleSchool.geojson', JSON.stringify(json) );
    }
    cb();
  });
});

// 小学校区域のデータ更新
gulp.task("data-elementary", (cb) => {
  shapefile.read('data_org/A27-16_07.shp', {encoding: 'shift_jis'}, (err, json) => {
    if(err) {
      console.log(err);
    } else {
      json.features = json.features.filter((feature) => {
        var cityCode = feature.properties.A27_005;
        return cityCode && cityCode.indexOf('07203') === 0;
      });
      fs.writeFileSync( 'data/Elementary.geojson', JSON.stringify(json) );
    }
    cb();
  });
});

// 学校のデータ作成
gulp.task("data-school", (cb) => {
  shapefile.read('data_org/p29-13_07.shp', {encoding: 'shift_jis'}, (err, json) => {
    if(err) {
      console.log(err);
    } else {
      var features = json.features.filter((feature) => {
        var cityCode = feature.properties.P29_001;
        feature.properties.label = feature.properties.P29_005.replace(/学校$/, '');
        return cityCode && cityCode.indexOf('07203') === 0;
      });
      // 小学校
      json.features = features.filter((feature) => {
        return feature.properties.P29_004 === '16001';
      });
      fs.writeFileSync( 'data/Elementary_loc.geojson', JSON.stringify(json) );
      // 中学校
      json.features = features.filter((feature) => {
        return feature.properties.P29_004 === '16002' || feature.properties.P29_004 === '16003';
      });
      fs.writeFileSync( 'data/MiddleSchool_loc.geojson', JSON.stringify(json) );
    }
    cb();
  });
});

// 駅のデータ更新
gulp.task("data-station", (cb) => {
  shapefile.read('data_org/N02-16_Station.shp', {encoding: 'shift_jis'}, (err, json) => {
    if(err) {
      console.log(err);
    } else {
      var wardsJson = JSON.parse(fs.readFileSync('data/wards.geojson', 'utf8'));
      json.features = json.features.filter((feature) => {
        var ward = wardsJson.features.find((wardFeature) => {
          return inside(feature.geometry.coordinates[0], wardFeature.geometry.coordinates[0]);
        });
        return !!(ward);
      });

      json.features = json.features.map((feature) => {
        var data = {type: "Feature", properties: {}, geometry: {type: "Point", coordinates:[]}};
        data.properties.line = feature.properties.N02_003;
        data.properties.station_name = feature.properties.N02_005;
        data.properties.shubetsu = feature.properties.N02_004;
        data.properties.lon = (feature.geometry.coordinates[0][0] + feature.geometry.coordinates[1][0]) / 2;
        data.properties.lat = (feature.geometry.coordinates[0][1] + feature.geometry.coordinates[1][1]) / 2;

        data.geometry.coordinates[0] = data.properties.lon;
        data.geometry.coordinates[1] = data.properties.lat;
        return data;
      });
      fs.writeFileSync( 'data/station.geojson', JSON.stringify(json) );
    }
    cb();
  });
});

// 保育園等のデータ更新(国土数値情報　ダウンロードサービスベース)
gulp.task("data-nursery-bk", (cb) => {
  shapefile.read('data_org/P14-15_07.shp', {encoding: 'shift_jis'}, (err, json) => {
    if(err) {
      console.log(err);
    } else {
      json.features = json.features.filter((feature) => {
        var code = feature.properties.P14_006;

        var cityName = feature.properties.P14_002;
        return cityName.indexOf('郡山市') === 0
          //&& (code === '801' || code === '802' || code === '803' || code === '804' || code === '805');
          && (code === '804');
      });

      json.features.forEach((feature) => {
        feature.properties.Name = feature.properties.P14_007;
        feature.properties.Label = feature.properties.P14_007;
        feature.properties.Add1 = feature.properties.P14_002;
        feature.properties.Add2 = feature.properties.P14_003;
        var code = feature.properties.P14_006;

        switch (code) {
          case '801':
          feature.properties.Type = '認可保育所'
          break;
          case '802':
          feature.properties.Type = '認可保育所'
          break;
          case '803':
          feature.properties.Type = '認可外'
          break;
          case '804':
          feature.properties.Type = '幼稚園'
          break;
          case '805':
          feature.properties.Type = '認可保育所'
          break;
        }
      });
      fs.writeFileSync( 'data/nurseryFacilities_temp.geojson', JSON.stringify(json) );
    }
    cb();
  });
});

// 保育園等のデータ更新(データCSV)
gulp.task("data-nursery", (cb) => {
  var fileName = 'data_org/nurseryData.csv';
  fs.createReadStream(fileName)
    .pipe(sutil.head(1)) // get head lines
    .pipe(sutil.split())
    .setEncoding('utf8')
    .pipe(csv.parse())
    .on('data', function(headers){

      var dataList = [];
      fs.createReadStream(fileName)
      .pipe(iconv.decodeStream('shift_jis'))
      .pipe(csv.parse())
      .pipe(csv.transform(function(record){
        var json = {};
        record.forEach(function(data, index) {
          json[headers[index]] = data ? data : null;
        });
        return json;
      }))
      .on('data', function(data) {
        dataList.push(data)
      }).on('end', function(){
        fs.writeFileSync( 'data/nurseryFacilities.geojson', JSON.stringify(GeoJSON.parse(dataList.slice(1), {Point: ['Y', 'X']})) );
        cb();
      });
    });
});
