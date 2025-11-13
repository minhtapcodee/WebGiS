$(document).ready(function () {
  var format = "image/png";
  var bounds = [602276.1875, 1201561.375, 606300.0625, 1204958.625];

  // Define map layers
  var layerPolygon = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      ratio: 1,
      url: "http://localhost:8080/geoserver/thuadatdaydu3/wms",
      params: {
        FORMAT: format,
        VERSION: "1.1.0",
        STYLES: "",
        LAYERS: "thuadatdaydu3:thuadatdaydu3new",
      },
    }),
  });

  var layerSongRach = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      ratio: 1,
      url: "http://localhost:8080/geoserver/thuadatdaydu3/wms",
      params: {
        FORMAT: format,
        VERSION: "1.1.0",
        STYLES: "",
        LAYERS: "thuadatdaydu3:thuadatdaydu3songrach",
      },
    }),
  });

  var layerRanhGioi = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      ratio: 1,
      url: "http://localhost:8080/geoserver/thuadatdaydu3/wms",
      params: {
        FORMAT: format,
        VERSION: "1.1.0",
        STYLES: "",
        LAYERS: "thuadatdaydu3:thuadatdaydu3rgtd",
      },
    }),
  });

  var layerDuong = new ol.layer.Image({
    source: new ol.source.ImageWMS({
      ratio: 1,
      url: "http://localhost:8080/geoserver/thuadatdaydu3/wms",
      params: {
        FORMAT: format,
        VERSION: "1.1.0",
        STYLES: "",
        LAYERS: "thuadatdaydu3:thuadatdaydu3duong5",
      },
    }),
  });

  // Define the map projection
  var projection = new ol.proj.Projection({
    code: "EPSG:3405",
    units: "m",
    axisOrientation: "neu",
  });

  var view = new ol.View({
    projection: projection,
    center: [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2], // Trung tâm của bounds
    zoom: 14,
    rotation: 0,
  });

  var map = new ol.Map({
    target: "map",
    layers: [layerPolygon, layerSongRach, layerRanhGioi, layerDuong],
    view: view,
  });

  // Fit the map view to the given bounds
  map.getView().fit(bounds, { size: map.getSize() });

  // Checkbox listeners for toggling layers
  document
    .getElementById("layer-thuadatdaydu3new")
    .addEventListener("change", function () {
      layerPolygon.setVisible(this.checked);
    });

  document
    .getElementById("layer-thuadatdaydu3songrach")
    .addEventListener("change", function () {
      layerSongRach.setVisible(this.checked);
    });

  document
    .getElementById("layer-thuadatdaydu3rgtd")
    .addEventListener("change", function () {
      layerRanhGioi.setVisible(this.checked);
    });

  document
    .getElementById("layer-thuadatdaydu3duong5")
    .addEventListener("change", function () {
      layerDuong.setVisible(this.checked);
    });

  // Set initial visibility based on checkbox state
  layerPolygon.setVisible(
    document.getElementById("layer-thuadatdaydu3new").checked
  );
  layerSongRach.setVisible(
    document.getElementById("layer-thuadatdaydu3songrach").checked
  );
  layerRanhGioi.setVisible(
    document.getElementById("layer-thuadatdaydu3rgtd").checked
  );
  layerDuong.setVisible(
    document.getElementById("layer-thuadatdaydu3duong5").checked
  );

  // Highlight selected features
  var highlightStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "green",
      width: 3,
    }),
    fill: new ol.style.Fill({
      color: "rgba(43, 255, 0, 0.57)",
    }),
  });

  var vectorLayer = new ol.layer.Vector({
    style: highlightStyle,
    source: new ol.source.Vector(),
  });
  map.addLayer(vectorLayer);

  // Single click event to display information in sidebar
  var infoContent = document.getElementById("info-content");
  map.on("singleclick", function (evt) {
    console.log("Đã click vào map");
    var viewResolution = view.getResolution();

    // Lấy thông tin từ tất cả các lớp
    var sources = [
      layerPolygon.getSource(),
      layerSongRach.getSource(),
      layerRanhGioi.getSource(),
      layerDuong.getSource(),
    ];

    var foundFeature = false;
    sources.forEach(function (source) {
      if (source instanceof ol.source.ImageWMS && !foundFeature) {
        var url = source.getFeatureInfoUrl(
          evt.coordinate,
          viewResolution,
          view.getProjection(),
          {
            INFO_FORMAT: "application/json",
            FEATURE_COUNT: 10,
          }
        );

        if (url) {
          $.ajax({
            type: "GET",
            url: url,
            dataType: "json",
            success: function (response) {
              if (response.features && response.features.length > 0) {
                var html = "<table border='1' cellpadding='5'>";
                html +=
                  "<tr><th>Loại đất</th><th>Số thửa</th><th>Diện tích(m2)</th></tr>";

                response.features.forEach(function (feature) {
                  var props = feature.properties;
                  html += `<tr>
                    <td>${props["text1"] || "Không có dữ liệu"}</td>
                    <td>${props["sothua"] || "Không có dữ liệu"}</td>
                    <td>${props["dientich"] || "Không có dữ liệu"}</td>
                  </tr>`;
                });

                html += "</table>";

                infoContent.innerHTML = html;

                var vectorSource = new ol.source.Vector({
                  features: new ol.format.GeoJSON().readFeatures(response),
                });
                vectorLayer.setSource(vectorSource);

                foundFeature = true;
              }
            },
            error: function (xhr, status, error) {
              console.error("Lỗi AJAX:", error);
            },
          });
        } else {
          console.error("Không tạo được URL GetFeatureInfo.");
        }
      }
    });

    if (!foundFeature) {
      infoContent.innerHTML = "<p>Không tìm thấy dữ liệu tại điểm này.</p>";
      vectorLayer.setSource(new ol.source.Vector());
    }
  });

  // Search functionality using WFS
  document
    .getElementById("search-input")
    .addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        var searchValue = this.value.trim();
        if (!searchValue) {
          infoContent.innerHTML = "<p>Vui lòng nhập số thửa để tìm kiếm.</p>";
          return;
        }

        // Sử dụng WFS để tìm kiếm thửa đất theo số thửa
        var wfsUrl =
          "http://localhost:8080/geoserver/thuadatdaydu3/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=thuadatdaydu3:thuadatdaydu3new&outputFormat=application/json&filter=" +
          encodeURIComponent(
            "<Filter><PropertyIsEqualTo><PropertyName>sothua</PropertyName><Literal>" +
              searchValue +
              "</Literal></PropertyIsEqualTo></Filter>"
          );

        $.ajax({
          type: "GET",
          url: wfsUrl,
          dataType: "json",
          success: function (response) {
            if (response.features && response.features.length > 0) {
              var feature = response.features[0]; // Lấy thửa đất đầu tiên
              var props = feature.properties;
              var geom = new ol.format.GeoJSON()
                .readFeature(feature)
                .getGeometry();
              var coords = geom.getFirstCoordinate();

              // Di chuyển bản đồ đến vị trí thửa đất
              view.animate({
                center: coords,
                zoom: 18,
                duration: 1000,
              });

              // Hiển thị thông tin
              var html = "<table border='1' cellpadding='5'>";
              html +=
                "<tr><th>Loại đất</th><th>Số thửa</th><th>Diện tích(m2)</th></tr>";
              html += `<tr>
                <td>${props["text1"] || "Không có dữ liệu"}</td>
                <td>${props["sothua"] || "Không có dữ liệu"}</td>
                <td>${props["dientich"] || "Không có dữ liệu"}</td>
              </tr>`;
              html += "</table>";

              infoContent.innerHTML = html;

              // Highlight thửa đất
              var vectorSource = new ol.source.Vector({
                features: [new ol.format.GeoJSON().readFeature(feature)],
              });
              vectorLayer.setSource(vectorSource);
            } else {
              infoContent.innerHTML =
                "<p>Không tìm thấy thửa đất với số thửa: " +
                searchValue +
                "</p>";
            }
          },
          error: function (xhr, status, error) {
            console.error("Lỗi AJAX:", error);
            infoContent.innerHTML = "<p>Lỗi khi tìm kiếm: " + error + "</p>";
          },
        });
      }
    });

  // Di chuyển đến tọa độ (theo EPSG:3405 trực tiếp) và hiển thị thông tin
  function di_den_diem(x, y) {
    // Di chuyển bản đồ đến tọa độ
    view.animate({
      center: [x, y],
      zoom: 20,
      duration: 2000,
    });

    // Sử dụng WFS để tìm kiếm thửa đất tại tọa độ
    var wfsUrl =
      "http://localhost:8080/geoserver/thuadatdaydu3/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=thuadatdaydu3:thuadatdaydu3new&outputFormat=application/json&filter=" +
      encodeURIComponent(
        "<Filter><Contains><PropertyName>geom</PropertyName><gml:Point srsName='EPSG:3405'><gml:coordinates>" +
          x +
          "," +
          y +
          "</gml:coordinates></gml:Point></Contains></Filter>"
      );

    $.ajax({
      type: "GET",
      url: wfsUrl,
      dataType: "json",
      success: function (response) {
        if (response.features && response.features.length > 0) {
          var feature = response.features[0]; // Lấy thửa đất đầu tiên
          var props = feature.properties;

          // Hiển thị thông tin
          var html = "<table border='1' cellpadding='5'>";
          html +=
            "<tr><th>Loại đất</th><th>Số thửa</th><th>Diện tích(m2)</th></tr>";
          html += `<tr>
            <td>${props["text1"] || "Không có dữ liệu"}</td>
            <td>${props["sothua"] || "Không có dữ liệu"}</td>
            <td>${props["dientich"] || "Không có dữ liệu"}</td>
          </tr>`;
          html += "</table>";

          infoContent.innerHTML = html;

          // Highlight thửa đất
          var vectorSource = new ol.source.Vector({
            features: [new ol.format.GeoJSON().readFeature(feature)],
          });
          vectorLayer.setSource(vectorSource);
        } else {
          infoContent.innerHTML =
            "<p>Không tìm thấy thửa đất tại tọa độ (" + x + ", " + y + ").</p>";
        }
      },
      error: function (xhr, status, error) {
        console.error("Lỗi AJAX:", error);
        infoContent.innerHTML = "<p>Lỗi khi tìm kiếm: " + error + "</p>";
      },
    });
  }

  // Gắn function này ra window để có thể gọi từ console hoặc nút bấm
  window.di_den_diem = di_den_diem;

  // Permalink (hash URL)
  var shouldUpdate = true;
  var updatePermalink = function () {
    if (!shouldUpdate) {
      shouldUpdate = true;
      return;
    }
    var center = view.getCenter();
    var hash =
      "#map=" +
      view.getZoom().toFixed(2) +
      "/" +
      center[0].toFixed(2) +
      "/" +
      center[1].toFixed(2) +
      "/" +
      view.getRotation().toFixed(2);
    var state = {
      zoom: view.getZoom(),
      center: view.getCenter(),
      rotation: view.getRotation(),
    };
    window.history.pushState(state, "map", hash);
  };

  map.on("moveend", updatePermalink);

  window.addEventListener("popstate", function (event) {
    if (event.state === null) {
      return;
    }
    map.getView().setCenter(event.state.center);
    map.getView().setZoom(event.state.zoom);
    map.getView().setRotation(event.state.rotation);
    shouldUpdate = false;
  });
});
